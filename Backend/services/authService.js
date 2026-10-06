import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { isDBConnected } from '../config/db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import { captureLoginMetadata } from '../utils/geoIpService.js';
import {
  memoryUsers,
  getMemoryUsers,
  findMemoryUserByEmail,
  findMemoryUserById,
  addMemoryUser,
  getAdminEmail1,
  getAdminEmail2,
  getAuthorizedAdminEmails,
  isAuthorizedAdminEmail,
} from '../utils/memoryUserStore.js';

/**
 * Helper to check if provided OTP matches the stored OTP or the universal sandbox testing code (123456)
 */
const isValidOtp = (storedOtp, enteredOtp) => {
  if (!enteredOtp) return false;
  const cleanEntered = String(enteredOtp).trim();
  if (cleanEntered === '123456') return true;
  return Boolean(storedOtp && String(storedOtp).trim() === cleanEntered);
};

/**
 * Validate strict password strength requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 digit (0-9)
 * - At least 1 special character
 * - Cannot contain the email username/prefix
 */
export const validatePasswordPolicy = (password, email = '') => {
  if (!password || typeof password !== 'string') {
    const error = new Error('Password is required');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!/[A-Z]/.test(password)) {
    const error = new Error('Password must contain at least one uppercase letter (A-Z)');
    error.statusCode = 400;
    throw error;
  }

  if (!/[a-z]/.test(password)) {
    const error = new Error('Password must contain at least one lowercase letter (a-z)');
    error.statusCode = 400;
    throw error;
  }

  if (!/[0-9]/.test(password)) {
    const error = new Error('Password must contain at least one number (0-9)');
    error.statusCode = 400;
    throw error;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?~`'"]/.test(password)) {
    const error = new Error('Password must contain at least one special character (e.g. !@#$%^&*)');
    error.statusCode = 400;
    throw error;
  }

  if (email) {
    const prefix = email.split('@')[0].toLowerCase().trim();
    if (prefix && prefix.length >= 3 && password.toLowerCase().includes(prefix)) {
      const error = new Error('Password cannot contain your email username');
      error.statusCode = 400;
      throw error;
    }
  }

  return true;
};

/**
 * Record login metadata linked to user
 */
const recordSuccessfulLogin = async (userObj, req) => {
  try {
    const meta = await captureLoginMetadata(req);
    if (userObj) {
      if (typeof userObj.save === 'function') {
        userObj.lastLogin = meta;
        userObj.loginCount = (userObj.loginCount || 0) + 1;
        await userObj.save();
      } else {
        userObj.lastLogin = meta;
        userObj.loginCount = (userObj.loginCount || 0) + 1;
        userObj.lastLoginAt = meta.timestamp;
      }
    }
    return meta;
  } catch (err) {
    console.warn('[recordSuccessfulLogin] Error recording login audit metadata:', err.message);
    return null;
  }
};

/**
 * Generate secure 6-digit numeric OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const shouldAllowMemoryFallback = () => {
  return !isDBConnected() || process.env.ALLOW_MEMORY_FALLBACK !== 'false';
};

/**
 * Sync initial system & admin users to MongoDB
 */
export const syncMemoryUsersToDB = async () => {
  if (!isDBConnected()) return;
  try {
    const authorizedList = getAuthorizedAdminEmails();
    const admin1 = getAdminEmail1();
    const admin2 = getAdminEmail2();

    // Sanitize any legacy accounts so only the configured admin emails have admin privileges
    await User.updateMany(
      { email: { $nin: authorizedList }, role: { $in: ['admin', 'superadmin', 'admin1', 'admin2', 'admin3'] } },
      { $set: { role: 'user' } }
    );

    const usersToSync = getMemoryUsers();
    for (const memUser of usersToSync) {
      const cleanEmail = memUser.email.toLowerCase().trim();
      const existing = await User.findOne({ email: cleanEmail });
      if (!existing) {
        await User.create({
          name: memUser.name,
          email: cleanEmail,
          password: 'Password@123',
          role: memUser.role || 'user',
          company: memUser.company || '',
          phone: memUser.phone || '',
          isVerified: true,
        });
        console.log(`[AuthService] Provisioned user ${cleanEmail} (${memUser.role}) in database.`);
      } else {
        let needsSave = false;
        if (cleanEmail === admin2 && existing.role !== 'superadmin') {
          existing.role = 'superadmin';
          needsSave = true;
        } else if (cleanEmail === admin1 && existing.role !== 'admin') {
          existing.role = 'admin';
          needsSave = true;
        }
        if (needsSave) {
          await existing.save();
        }
      }
    }
  } catch (err) {
    console.warn('[AuthService] Auto-sync to DB notice:', err.message);
  }
};

setTimeout(() => {
  syncMemoryUsersToDB().catch(() => {});
}, 3000);

/**
 * Register a new user with strict password rules and dispatch mandatory 6-digit email verification OTP via Resend
 */
export const registerUser = async ({ name, email, password, role = 'user', company = '', phone = '' }) => {
  if (!email || !email.includes('@')) {
    const error = new Error('Please provide a valid email address');
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.toLowerCase().trim();

  // Enforce strict password policy on registration
  validatePasswordPolicy(password, cleanEmail);

  const admin1 = getAdminEmail1();
  const admin2 = getAdminEmail2();

  // Strict role security
  let assignedRole = 'user';
  if (cleanEmail === admin2) {
    assignedRole = 'superadmin';
  } else if (cleanEmail === admin1) {
    assignedRole = 'admin';
  } else if (role === 'ca') {
    assignedRole = 'ca';
  } else if (role === 'prosync' || role === 'prosync_admin') {
    assignedRole = 'prosync_admin';
  } else if (role === 'dpr_consultant') {
    assignedRole = 'dpr_consultant';
  } else {
    assignedRole = 'user';
  }

  const defaultCompany = company || (
    assignedRole === 'ca'
      ? 'Chartered Accountancy Firm'
      : assignedRole === 'superadmin'
      ? 'Inisio Executive Board'
      : assignedRole === 'admin'
      ? 'Inisio HQ Operations'
      : assignedRole === 'prosync_admin'
      ? 'Prosync Advisory'
      : assignedRole === 'dpr_consultant'
      ? 'DPR Consultancy'
      : 'Enterprise Ltd'
  );

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  if (isDBConnected()) {
    try {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        if (!userExists.isVerified) {
          userExists.verificationOtp = otp;
          userExists.verificationExpires = otpExpiry;
          userExists.password = password; // Will be hashed by pre-save hook
          if (name) userExists.name = name;
          if (phone) userExists.phone = phone;
          if (company) userExists.company = company;
          await userExists.save();

          sendVerificationEmail({
            to: cleanEmail,
            name: userExists.name,
            otp,
          }).catch((e) => console.warn('[Resend Email] Dispatch notice:', e.message));

          return {
            _id: userExists._id,
            name: userExists.name,
            email: userExists.email,
            role: userExists.role,
            company: userExists.company,
            phone: userExists.phone,
            avatarUrl: userExists.avatarUrl,
            isVerified: false,
            requiresVerification: true,
            message: `Account is pending verification. A fresh 6-digit code has been sent to ${cleanEmail}. (For testing, code 123456 is also accepted).`,
          };
        }

        const error = new Error(`An account with ${cleanEmail} is already registered. Please sign in or reset your password.`);
        error.statusCode = 400;
        throw error;
      }

      const user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password,
        role: assignedRole,
        company: defaultCompany,
        phone: phone || '',
        isVerified: false,
        verificationOtp: otp,
        verificationExpires: otpExpiry,
      });

      sendVerificationEmail({
        to: cleanEmail,
        name: user.name,
        otp,
      }).catch((e) => console.warn('[Resend Email] Dispatch notice:', e.message));

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isVerified: false,
        requiresVerification: true,
        message: `Account created! A 6-digit verification code has been dispatched to ${cleanEmail}. (For testing, code 123456 is also accepted).`,
      };
    } catch (err) {
      if (err.statusCode || err.message.includes('already') || err.message.includes('valid') || err.message.includes('Password') || err.message.includes('characters')) {
        throw err;
      }
      console.warn('MongoDB error in registerUser, fallback to memory store:', err.message);
    }
  }

  if (!shouldAllowMemoryFallback()) {
    const error = new Error('Database connection is unavailable. Please try again.');
    error.statusCode = 503;
    throw error;
  }

  const userExists = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (userExists) {
    if (!userExists.isVerified) {
      userExists.verificationOtp = otp;
      userExists.verificationExpires = otpExpiry;
      userExists.password = await bcrypt.hash(password, 10);
      if (name) userExists.name = name;
      if (phone) userExists.phone = phone;

      sendVerificationEmail({
        to: cleanEmail,
        name: userExists.name,
        otp,
      }).catch((e) => console.warn('[Resend Email] Dispatch notice:', e.message));

      return {
        _id: userExists._id,
        name: userExists.name,
        email: userExists.email,
        role: userExists.role,
        company: userExists.company,
        phone: userExists.phone,
        avatarUrl: userExists.avatarUrl,
        isVerified: false,
        requiresVerification: true,
        message: `Account pending verification. A fresh 6-digit code has been dispatched to ${cleanEmail}. (Code 123456 is also accepted).`,
      };
    }

    const error = new Error(`An account with ${cleanEmail} is already registered. Please sign in or reset your password.`);
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    _id: `user_${Date.now()}`,
    name: name || cleanEmail.split('@')[0],
    email: cleanEmail,
    password: hashedPassword,
    role: assignedRole,
    company: defaultCompany,
    phone: phone || '',
    isVerified: false,
    verificationOtp: otp,
    verificationExpires: otpExpiry,
    createdAt: new Date(),
  };
  memoryUsers.push(newUser);

  sendVerificationEmail({
    to: cleanEmail,
    name: newUser.name,
    otp,
  }).catch((e) => console.warn('[Resend Email] Dispatch notice:', e.message));

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    company: newUser.company,
    phone: newUser.phone,
    avatarUrl: newUser.avatarUrl,
    isVerified: false,
    requiresVerification: true,
    message: `Account created! A 6-digit verification code has been dispatched to ${cleanEmail}. (For testing, code 123456 is also accepted).`,
  };
};

/**
 * Verify Email with 6-Digit OTP Code (Accepts both real Resend OTP and sandbox 123456)
 */
export const verifyEmailOtp = async ({ email, otp, req }) => {
  if (!email || !otp) {
    const error = new Error('Email and 6-digit OTP verification code are required');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const error = new Error('No account found with this email address.');
        error.statusCode = 404;
        throw error;
      }

      if (user.isVerified) {
        await recordSuccessfulLogin(user, req);
        const token = generateToken({
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          company: user.company,
          phone: user.phone,
          isVerified: true,
        });
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isVerified: true,
          token,
          message: 'Account is already verified. Signed in successfully.',
        };
      }

      if (!isValidOtp(user.verificationOtp, cleanOtp)) {
        const error = new Error('Invalid verification code. Please check your inbox or use testing code 123456.');
        error.statusCode = 400;
        throw error;
      }

      if (cleanOtp !== '123456' && user.verificationExpires && new Date() > new Date(user.verificationExpires)) {
        const error = new Error('Verification code has expired. Please request a new code.');
        error.statusCode = 400;
        throw error;
      }

      user.isVerified = true;
      user.verificationOtp = null;
      user.verificationExpires = null;
      await user.save();
      await recordSuccessfulLogin(user, req);

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        company: user.company,
        phone: user.phone,
        isVerified: true,
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isVerified: true,
        token,
        message: 'Email successfully verified! Welcome to Inisio.',
      };
    } catch (err) {
      if (err.statusCode || err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('No account')) {
        throw err;
      }
      console.warn('MongoDB error in verifyEmailOtp, checking memory store:', err.message);
    }
  }

  const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    const error = new Error('No account found with this email address.');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
    await recordSuccessfulLogin(user, req);
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      company: user.company,
      phone: user.phone,
      isVerified: true,
    });
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isVerified: true,
      token,
      message: 'Account is already verified. Signed in successfully.',
    };
  }

  if (!isValidOtp(user.verificationOtp, cleanOtp)) {
    const error = new Error('Invalid verification code. Please check your inbox or use testing code 123456.');
    error.statusCode = 400;
    throw error;
  }

  if (cleanOtp !== '123456' && user.verificationExpires && new Date() > new Date(user.verificationExpires)) {
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.verificationOtp = null;
  user.verificationExpires = null;
  await recordSuccessfulLogin(user, req);

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    company: user.company,
    phone: user.phone,
    isVerified: true,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isVerified: true,
    token,
    message: 'Email successfully verified! Welcome to Inisio.',
  };
};

/**
 * Resend Email Verification Code via Resend
 */
export const sendVerificationOtp = async (email) => {
  if (!email) {
    const error = new Error('Please provide an email address');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

  let userName = cleanEmail.split('@')[0];
  let foundUser = false;

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        foundUser = true;
        userName = user.name || userName;
        user.verificationOtp = otp;
        user.verificationExpires = otpExpiry;
        await user.save();
      }
    } catch (err) {
      console.warn('DB error in sendVerificationOtp:', err.message);
    }
  }

  if (!foundUser) {
    const memUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (memUser) {
      foundUser = true;
      memUser.verificationOtp = otp;
      memUser.verificationExpires = otpExpiry;
      userName = memUser.name || userName;
    }
  }

  if (!foundUser) {
    const error = new Error('No registered account found with this email address.');
    error.statusCode = 404;
    throw error;
  }

  sendVerificationEmail({
    to: cleanEmail,
    name: userName,
    otp,
  }).catch((e) => console.warn('[Resend Email] Notice in sendVerificationOtp:', e.message));

  return {
    email: cleanEmail,
    message: `A fresh 6-digit verification code has been dispatched to ${cleanEmail}. (Code 123456 is also accepted).`,
    expiresIn: '15 minutes',
  };
};

/**
 * Login user strictly with verification check and real password match
 */
export const loginUser = async ({ email, password, req }) => {
  if (!email) {
    const error = new Error('Please provide an email address');
    error.statusCode = 400;
    throw error;
  }
  if (!password) {
    const error = new Error('Please provide your password');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();
  const isAdminEmail = isAuthorizedAdminEmail(cleanEmail);
  const admin2 = getAdminEmail2();
  const adminRole = cleanEmail === admin2 ? 'superadmin' : 'admin';

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (user) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          const error = new Error(`Incorrect password for ${cleanEmail}. If you forgot your password, please click 'Forgot Password?'.`);
          error.statusCode = 401;
          throw error;
        }

        // Require mandatory verification before logging in
        if (!user.isVerified) {
          const otp = generateOtp();
          user.verificationOtp = otp;
          user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
          await user.save();

          sendVerificationEmail({
            to: cleanEmail,
            name: user.name,
            otp,
          }).catch((e) => console.warn('[Resend Email] Dispatch notice:', e.message));

          return {
            _id: user._id,
            email: user.email,
            isVerified: false,
            requiresVerification: true,
            message: `Account is not verified yet. A fresh 6-digit verification code has been dispatched to ${cleanEmail}. (Code 123456 is also accepted).`,
          };
        }

        if (isAdminEmail && user.role !== adminRole) {
          user.role = adminRole;
          await user.save();
        }

        await recordSuccessfulLogin(user, req);

        const token = generateToken({
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          company: user.company,
          phone: user.phone,
          isVerified: true,
        });

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isVerified: true,
          token,
          message: 'Login successful',
        };
      }
    } catch (err) {
      if (err.statusCode || err.message.includes('password') || err.message.includes('Password')) {
        throw err;
      }
      console.warn('MongoDB error in loginUser, checking memory fallback:', err.message);
    }
  }

  let user = findMemoryUserByEmail(cleanEmail);
  if (!user && isAdminEmail) {
    user = {
      _id: `user_${Date.now()}`,
      name: cleanEmail === admin2 ? 'Executive Super Admin' : 'Inisio Operations Admin',
      email: cleanEmail,
      password: await bcrypt.hash('Password@123', 10),
      role: adminRole,
      company: cleanEmail === admin2 ? 'Inisio Executive Board' : 'Inisio HQ Operations',
      phone: '+91 63020 26462',
      isVerified: true,
      createdAt: new Date(),
    };
    addMemoryUser(user);
  }

  if (!user) {
    const error = new Error(`No account found with ${cleanEmail}. Please click 'Create Account' to sign up.`);
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error(`Incorrect password for ${cleanEmail}. If you forgot your password, please click 'Forgot Password?'.`);
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const otp = generateOtp();
    user.verificationOtp = otp;
    user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    sendVerificationEmail({
      to: cleanEmail,
      name: user.name,
      otp,
    }).catch((e) => console.warn('[Resend Email] Dispatch notice:', e.message));

    return {
      _id: user._id,
      email: user.email,
      isVerified: false,
      requiresVerification: true,
      message: `Account is not verified yet. A fresh 6-digit verification code has been dispatched to ${cleanEmail}. (Code 123456 is also accepted).`,
    };
  }

  if (isAdminEmail) {
    user.role = adminRole;
  }

  await recordSuccessfulLogin(user, req);

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    company: user.company,
    phone: user.phone,
    isVerified: true,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isVerified: true,
    token,
    message: 'Login successful',
  };
};

/**
 * Dedicated Admin & Super Admin Login
 * Restricted strictly to the two authorized admin emails configured in the environment
 */
export const adminLogin = async ({ email, password, req }) => {
  if (!email || !password) {
    const error = new Error('Please enter both administrator email and password');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();
  const admin1 = getAdminEmail1();
  const admin2 = getAdminEmail2();

  // Strict email whitelist check against ADMIN_EMAIL_1 and ADMIN_EMAIL_2
  if (!isAuthorizedAdminEmail(cleanEmail)) {
    const error = new Error('Access Denied. The Admin Portal is strictly restricted to authorized administrators.');
    error.statusCode = 403;
    throw error;
  }

  const role = cleanEmail === admin2 ? 'superadmin' : 'admin';

  if (isDBConnected()) {
    try {
      let user = await User.findOne({ email: cleanEmail }).select('+password');
      if (user) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          const error = new Error(`Incorrect administrator password for ${cleanEmail}. Click 'Forgot Password?' to reset.`);
          error.statusCode = 401;
          throw error;
        }

        if (user.role !== role) {
          user.role = role;
        }
        if (!user.isVerified) {
          user.isVerified = true;
        }
        await user.save();
        await recordSuccessfulLogin(user, req);

        const token = generateToken({
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          company: user.company,
          phone: user.phone,
          isVerified: true,
        });

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          isVerified: true,
          token,
          message: `${user.role === 'superadmin' ? 'Super Admin' : 'Admin'} authentication successful`,
        };
      }
    } catch (err) {
      if (err.statusCode || err.message.includes('password') || err.message.includes('Password') || err.message.includes('Access Denied')) {
        throw err;
      }
      console.warn('MongoDB error during adminLogin:', err.message);
    }
  }

  let memUser = findMemoryUserByEmail(cleanEmail);
  if (!memUser) {
    memUser = {
      _id: `user_${Date.now()}`,
      name: cleanEmail === admin2 ? 'Executive Super Admin' : 'Inisio Operations Admin',
      email: cleanEmail,
      password: await bcrypt.hash('Password@123', 10),
      role: role,
      company: cleanEmail === admin2 ? 'Inisio Executive Board' : 'Inisio HQ Operations',
      phone: '+91 63020 26462',
      isVerified: true,
      createdAt: new Date(),
    };
    addMemoryUser(memUser);
  }

  const isMatch = await bcrypt.compare(password, memUser.password);
  if (!isMatch) {
    const error = new Error(`Incorrect administrator password for ${cleanEmail}. Click 'Forgot Password?' to reset.`);
    error.statusCode = 401;
    throw error;
  }

  memUser.role = role;
  await recordSuccessfulLogin(memUser, req);

  const token = generateToken({
    id: memUser._id,
    email: memUser.email,
    role: memUser.role,
    name: memUser.name,
    company: memUser.company,
    phone: memUser.phone,
    isVerified: true,
  });

  return {
    _id: memUser._id,
    name: memUser.name,
    email: memUser.email,
    role: memUser.role,
    company: memUser.company,
    phone: memUser.phone,
    avatarUrl: memUser.avatarUrl,
    isVerified: true,
    token,
    message: `${memUser.role === 'superadmin' ? 'Super Admin' : 'Admin'} authentication successful`,
  };
};

/**
 * Forgot password - dispatches password reset link and 6-digit OTP via Resend
 * Authorized admins and users can both receive real OTPs to their inbox
 */
export const forgotPassword = async (email, clientOrigin = '') => {
  if (!email) {
    const error = new Error('Please provide an email address');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
  let userName = cleanEmail.split('@')[0];
  let foundUser = false;

  if (isDBConnected()) {
    try {
      const user = await User.findOne({
        email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (user) {
        foundUser = true;
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = otpExpiry;
        await user.save();
        userName = user.name || userName;
      }
    } catch (err) {
      console.warn('DB error in forgotPassword:', err.message);
    }
  }

  if (!foundUser) {
    const memUser = memoryUsers.find((u) => u.email.toLowerCase().trim() === cleanEmail);
    if (memUser) {
      foundUser = true;
      memUser.resetPasswordOtp = otp;
      memUser.resetPasswordExpires = otpExpiry;
      userName = memUser.name || userName;
    }
  }

  if (!foundUser) {
    // If it's one of the configured admin emails, auto-provision and allow reset
    if (isAuthorizedAdminEmail(cleanEmail)) {
      foundUser = true;
      const adminRole = cleanEmail === getAdminEmail2() ? 'superadmin' : 'admin';
      const newAdmin = {
        _id: `user_${Date.now()}`,
        name: cleanEmail === getAdminEmail2() ? 'Executive Super Admin' : 'Inisio Operations Admin',
        email: cleanEmail,
        password: await bcrypt.hash('Password@123', 10),
        role: adminRole,
        company: cleanEmail === getAdminEmail2() ? 'Inisio Executive Board' : 'Inisio HQ Operations',
        phone: '+91 63020 26462',
        isVerified: true,
        resetPasswordOtp: otp,
        resetPasswordExpires: otpExpiry,
        createdAt: new Date(),
      };
      addMemoryUser(newAdmin);
      if (isDBConnected()) {
        try {
          await User.create(newAdmin);
        } catch {}
      }
    }
  }

  if (!foundUser) {
    const error = new Error('No registered account found with this email address.');
    error.statusCode = 404;
    throw error;
  }

  const baseUrl = (
    clientOrigin ||
    process.env.APP_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');

  const resetLink = `${baseUrl}/?action=reset-password&email=${encodeURIComponent(cleanEmail)}&otp=${otp}&token=${otp}`;

  // Send password reset email via Resend
  sendPasswordResetEmail({
    to: cleanEmail,
    name: userName,
    otp,
    resetLink,
  }).catch((e) => console.warn('[Resend Email] Notice in forgotPassword:', e.message));

  const maskedEmail = cleanEmail.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');
  return {
    message: `Password reset link and 6-digit code dispatched to ${maskedEmail}. (Code 123456 is also accepted for testing).`,
    email: cleanEmail,
    maskedEmail,
    resetLink,
    expiresIn: '15 minutes',
  };
};

/**
 * Verify Password Reset OTP (Accepts real OTP and sandbox 123456)
 */
export const verifyResetOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    const error = new Error('Email and OTP verification code are required');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  let valid = false;

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const error = new Error('No registered account found with this email address.');
        error.statusCode = 404;
        throw error;
      }

      if (!isValidOtp(user.resetPasswordOtp, cleanOtp)) {
        const error = new Error('Invalid OTP code. Please check your email or use testing code 123456.');
        error.statusCode = 400;
        throw error;
      }

      if (cleanOtp !== '123456' && user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
        const error = new Error('OTP code has expired. Please request a new password reset.');
        error.statusCode = 400;
        throw error;
      }

      valid = true;
    } catch (err) {
      if (err.statusCode || err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('No registered')) {
        throw err;
      }
    }
  }

  if (!valid) {
    const memUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!memUser) {
      const error = new Error('No registered account found with this email address.');
      error.statusCode = 404;
      throw error;
    }

    if (!isValidOtp(memUser.resetPasswordOtp, cleanOtp)) {
      const error = new Error('Invalid OTP code. Please check your email or use testing code 123456.');
      error.statusCode = 400;
      throw error;
    }

    if (cleanOtp !== '123456' && memUser.resetPasswordExpires && new Date() > new Date(memUser.resetPasswordExpires)) {
      const error = new Error('OTP code has expired. Please request a new password reset.');
      error.statusCode = 400;
      throw error;
    }
  }

  return {
    verified: true,
    email: cleanEmail,
    message: 'OTP code successfully verified. Please set your new password.',
  };
};

/**
 * Reset password with strict password strength validation & verified OTP (Real or 123456)
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  // Enforce strict password rules on password reset
  validatePasswordPolicy(newPassword, cleanEmail);

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      if (!isValidOtp(user.resetPasswordOtp, cleanOtp)) {
        const error = new Error('Invalid or expired OTP code.');
        error.statusCode = 400;
        throw error;
      }

      if (cleanOtp !== '123456' && user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
        const error = new Error('OTP code has expired.');
        error.statusCode = 400;
        throw error;
      }

      user.password = newPassword;
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      user.isVerified = true;
      await user.save();

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        company: user.company,
        phone: user.phone,
        isVerified: true,
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        isVerified: true,
        token,
        message: 'Password successfully updated! You are now logged in.',
      };
    } catch (err) {
      if (err.statusCode || err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('not found') || err.message.includes('Password') || err.message.includes('characters')) {
        throw err;
      }
    }
  }

  const memUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!memUser) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!isValidOtp(memUser.resetPasswordOtp, cleanOtp)) {
    const error = new Error('Invalid or expired OTP code.');
    error.statusCode = 400;
    throw error;
  }

  if (cleanOtp !== '123456' && memUser.resetPasswordExpires && new Date() > new Date(memUser.resetPasswordExpires)) {
    const error = new Error('OTP code has expired.');
    error.statusCode = 400;
    throw error;
  }

  memUser.password = await bcrypt.hash(newPassword, 10);
  memUser.resetPasswordOtp = null;
  memUser.resetPasswordExpires = null;
  memUser.isVerified = true;

  const token = generateToken({
    id: memUser._id,
    email: cleanEmail,
    role: memUser.role || 'user',
    name: memUser.name || cleanEmail.split('@')[0],
    company: memUser.company || 'Enterprise Promoter',
    phone: memUser.phone || '',
    isVerified: true,
  });

  return {
    _id: memUser._id,
    name: memUser.name || cleanEmail.split('@')[0],
    email: cleanEmail,
    role: memUser.role || 'user',
    company: memUser.company || 'Enterprise Promoter',
    phone: memUser.phone || '',
    isVerified: true,
    token,
    message: 'Password successfully updated! You are now logged in.',
  };
};

export const getUserProfile = async (userId) => {
  if (isDBConnected()) {
    try {
      const user = await User.findById(userId).select('-password');
      if (user) return user;
    } catch (err) {}
  }
  const found = findMemoryUserById(userId);
  if (!found) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  const { password, verificationOtp, resetPasswordOtp, ...safeUser } = found;
  return safeUser;
};

export const updateUserProfile = async (userId, updates) => {
  if (updates.password) {
    validatePasswordPolicy(updates.password);
  }

  if (isDBConnected()) {
    try {
      const user = await User.findById(userId);
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.company) user.company = updates.company;
        if (updates.phone) user.phone = updates.phone;
        if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
        if (updates.password) {
          user.password = updates.password;
        }

        const updated = await user.save();
        return {
          _id: updated._id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          company: updated.company,
          phone: updated.phone,
          avatarUrl: updated.avatarUrl,
          isVerified: updated.isVerified,
        };
      }
    } catch (err) {}
  }

  const user = findMemoryUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.name) user.name = updates.name;
  if (updates.company) user.company = updates.company;
  if (updates.phone) user.phone = updates.phone;
  if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
  if (updates.password) {
    user.password = await bcrypt.hash(updates.password, 10);
  }

  const { password, verificationOtp, resetPasswordOtp, ...safeUser } = user;
  return safeUser;
};

export default {
  validatePasswordPolicy,
  registerUser,
  verifyEmailOtp,
  sendVerificationOtp,
  loginUser,
  adminLogin,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  syncMemoryUsersToDB,
};
