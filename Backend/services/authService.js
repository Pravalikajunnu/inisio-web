import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { isDBConnected } from '../config/db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import {
  memoryUsers,
  findMemoryUserByEmail,
  findMemoryUserById,
  addMemoryUser,
  updateMemoryUser,
  AUTHORIZED_ADMIN_EMAILS,
} from '../utils/memoryUserStore.js';
import bcrypt from 'bcryptjs';

/**
 * Helper to generate 6-digit numeric OTP
 */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Sync memory users to MongoDB to ensure preloaded demo & registered users exist in DB
 */
export const syncMemoryUsersToDB = async () => {
  if (!isDBConnected()) return;
  try {
    // 1. Sanitize any legacy accounts so only the two authorized emails have admin privileges
    await User.updateMany(
      { email: { $nin: ['inisio2026@gmail.com', 'junnupravalika59@gmail.com'] }, role: { $in: ['admin', 'superadmin', 'admin1', 'admin2', 'admin3'] } },
      { $set: { role: 'user' } }
    );

    for (const memUser of memoryUsers) {
      const cleanEmail = memUser.email.toLowerCase().trim();
      const existing = await User.findOne({ email: cleanEmail });
      if (!existing) {
        await User.create({
          name: memUser.name,
          email: cleanEmail,
          password: 'Password@123', // Will be hashed by pre-save hook
          role: memUser.role || 'user',
          company: memUser.company || '',
          phone: memUser.phone || '',
          isVerified: true,
        });
        console.log(`[AuthService] Seeded user ${cleanEmail} (${memUser.role}) into MongoDB.`);
      } else {
        // Ensure proper role is strictly set for the authorized emails
        if (cleanEmail === 'junnupravalika59@gmail.com' && existing.role !== 'superadmin') {
          existing.role = 'superadmin';
          await existing.save();
        } else if (cleanEmail === 'inisio2026@gmail.com' && existing.role !== 'admin') {
          existing.role = 'admin';
          await existing.save();
        }
      }
    }
  } catch (err) {
    console.warn('[AuthService] Auto-sync to DB warning:', err.message);
  }
};

// Initial sync attempt
setTimeout(() => {
  syncMemoryUsersToDB().catch(() => {});
}, 3000);

/**
 * Register a new user and dispatch email verification OTP via Nodemailer
 */
export const registerUser = async ({ name, email, password, role = 'user', company = '', phone = '' }) => {
  if (!email || !email.includes('@')) {
    const error = new Error('Please provide a valid email address');
    error.statusCode = 400;
    throw error;
  }
  if (!password || password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();

  // Strict role security: ONLY junnupravalika59@gmail.com is superadmin, ONLY inisio2026@gmail.com is admin
  let assignedRole = 'user';
  if (cleanEmail === 'junnupravalika59@gmail.com') {
    assignedRole = 'superadmin';
  } else if (cleanEmail === 'inisio2026@gmail.com') {
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
      : assignedRole === 'prosync' || assignedRole === 'prosync_admin'
      ? 'Prosync Advisory'
      : assignedRole === 'dpr_consultant'
      ? 'DPR Consultancy'
      : 'Enterprise Ltd'
  );

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

  if (isDBConnected()) {
    try {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        if (!userExists.isVerified) {
          userExists.verificationOtp = otp;
          userExists.verificationExpires = otpExpiry;
          if (password && password.length >= 6) {
            userExists.password = password; // Mongoose will re-hash
          }
          if (name) userExists.name = name;
          if (phone) userExists.phone = phone;
          if (company) userExists.company = company;
          await userExists.save();

          await sendVerificationEmail({
            to: cleanEmail,
            name: userExists.name,
            otp,
          });

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
            message: `Account already exists and is pending verification. A fresh 6-digit code has been dispatched to ${cleanEmail}.`,
          };
        }

        const error = new Error(`An account with ${cleanEmail} is already registered. Please click 'Sign In' or 'Forgot Password?' to access your account.`);
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

      // Send verification email via Nodemailer
      await sendVerificationEmail({
        to: cleanEmail,
        name: user.name,
        otp,
      });

      const feedbackMessage = `Account created! A 6-digit verification code has been dispatched to ${cleanEmail}. Please enter the code to activate your account.`;

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
        message: feedbackMessage,
      };
    } catch (err) {
      if (err.message.includes('already') || err.message.includes('valid') || err.message.includes('Password')) {
        throw err;
      }
      console.warn('MongoDB error in registerUser, fallback to memory store:', err.message);
    }
  }

  // Memory fallback when DB is offline or for memory users
  const userExists = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (userExists) {
    if (!userExists.isVerified) {
      userExists.verificationOtp = otp;
      userExists.verificationExpires = otpExpiry;
      userExists.password = await bcrypt.hash(password, 10);
      if (name) userExists.name = name;
      if (phone) userExists.phone = phone;

      await sendVerificationEmail({
        to: cleanEmail,
        name: userExists.name,
        otp,
      });

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
        message: `Account already exists and is pending verification. A fresh 6-digit code has been dispatched to ${cleanEmail}.`,
      };
    }

    const error = new Error(`An account with ${cleanEmail} is already registered. Please click 'Sign In' or 'Forgot Password?' to access your account.`);
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

  // Send verification email via Nodemailer
  await sendVerificationEmail({
    to: cleanEmail,
    name: newUser.name,
    otp,
  });

  const feedbackMessage = `Account created! A 6-digit verification code has been dispatched to ${cleanEmail}. Please enter the code to activate your account.`;

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
    message: feedbackMessage,
  };
};

/**
 * Verify Email with 6-Digit OTP Code
 */
export const verifyEmailOtp = async ({ email, otp }) => {
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
        const error = new Error('User not found with this email address. Please register a new account.');
        error.statusCode = 404;
        throw error;
      }

      if (user.isVerified) {
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
          message: 'Account is already verified. Logged in successfully.',
        };
      }

      if (!user.verificationOtp || user.verificationOtp !== cleanOtp) {
        const error = new Error('Invalid verification code. Please check your email or click Resend Code.');
        error.statusCode = 400;
        throw error;
      }

      if (user.verificationExpires && new Date() > new Date(user.verificationExpires)) {
        const error = new Error('Verification code has expired. Please click Resend Code for a fresh code.');
        error.statusCode = 400;
        throw error;
      }

      user.isVerified = true;
      user.verificationOtp = null;
      user.verificationExpires = null;
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
        avatarUrl: user.avatarUrl,
        isVerified: true,
        token,
        message: 'Email successfully verified! Welcome to Inisio.',
      };
    } catch (err) {
      if (err.statusCode || err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('not found') || err.message.includes('register')) {
        throw err;
      }
      console.warn('MongoDB error in verifyEmailOtp, checking memory store:', err.message);
    }
  }

  // In-memory verification fallback
  const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    const error = new Error('User not found with this email address. Please register a new account.');
    error.statusCode = 404;
    throw error;
  }

  if (user.isVerified) {
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
      message: 'Account is already verified. Logged in successfully.',
    };
  }

  if (!user.verificationOtp || user.verificationOtp !== cleanOtp) {
    const error = new Error('Invalid verification code. Please check your email or click Resend Code.');
    error.statusCode = 400;
    throw error;
  }

  if (user.verificationExpires && new Date() > new Date(user.verificationExpires)) {
    const error = new Error('Verification code has expired. Please click Resend Code for a fresh code.');
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.verificationOtp = null;
  user.verificationExpires = null;

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
 * Resend Email Verification Code via Nodemailer
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
    const error = new Error('No registered account found with this email address. Please create an account.');
    error.statusCode = 404;
    throw error;
  }

  // Send email via Nodemailer
  await sendVerificationEmail({
    to: cleanEmail,
    name: userName,
    otp,
  });

  return {
    email: cleanEmail,
    message: `A new 6-digit verification code has been dispatched to ${cleanEmail}.`,
    expiresIn: '15 minutes',
  };
};

/**
 * Login user strictly from database and ensure email is verified
 */
export const loginUser = async ({ email, password }) => {
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

  // 1. Database-backed authentication
  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      
      if (user) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          const error = new Error(`Incorrect password for ${cleanEmail}. If you forgot your password, please click 'Forgot Password?' to reset it.`);
          error.statusCode = 401;
          throw error;
        }

        // Check if user's email is verified
        if (!user.isVerified) {
          const otp = generateOtp();
          user.verificationOtp = otp;
          user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
          await user.save();

          await sendVerificationEmail({
            to: cleanEmail,
            name: user.name,
            otp,
          });

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: user.company,
            phone: user.phone,
            isVerified: false,
            requiresVerification: true,
            message: `Email verification required. A 6-digit verification code has been dispatched to ${cleanEmail}.`,
          };
        }

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

      const error = new Error(`No registered account found with ${cleanEmail}. Please click 'Create Account' to sign up.`);
      error.statusCode = 404;
      throw error;
    } catch (err) {
      if (err.statusCode || err.message.includes('password') || err.message.includes('Password')) {
        throw err;
      }
      console.warn('MongoDB error in loginUser, checking memory fallback:', err.message);
    }
  }

  // 2. Memory store fallback (or when DB user was not yet created)
  const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    const error = new Error(`No account found with ${cleanEmail}. Please click 'Create Account' to sign up.`);
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error(`Incorrect password for ${cleanEmail}. If you forgot your password, please click 'Forgot Password?' to reset it.`);
    error.statusCode = 401;
    throw error;
  }

  // If DB is connected now, sync this user to DB so future lookups find it directly
  if (isDBConnected()) {
    try {
      const existingInDb = await User.findOne({ email: cleanEmail });
      if (!existingInDb) {
        await User.create({
          name: user.name,
          email: cleanEmail,
          password: password,
          role: user.role || 'user',
          company: user.company || '',
          phone: user.phone || '',
          isVerified: true,
        });
      }
    } catch (syncErr) {
      console.warn('Could not sync memory user to DB:', syncErr.message);
    }
  }

  if (!user.isVerified) {
    const otp = generateOtp();
    user.verificationOtp = otp;
    user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await sendVerificationEmail({
      to: cleanEmail,
      name: user.name,
      otp,
    });

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      isVerified: false,
      requiresVerification: true,
      message: `Email verification required. A 6-digit verification code has been dispatched to ${cleanEmail}.`,
    };
  }

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
 * Get User Profile strictly by user ID
 */
export const getUserProfile = async (userId) => {
  if (isDBConnected()) {
    try {
      const user = await User.findById(userId).select('-password');
      if (user) return user;
    } catch (err) {
      console.warn('DB error in getUserProfile:', err.message);
    }
  }
  const found = memoryUsers.find((u) => String(u._id) === String(userId));
  if (!found) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  const { password, verificationOtp, resetPasswordOtp, ...safeUser } = found;
  return safeUser;
};

/**
 * Update User Profile
 */
export const updateUserProfile = async (userId, updates) => {
  if (isDBConnected()) {
    try {
      const user = await User.findById(userId);
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.company) user.company = updates.company;
        if (updates.phone) user.phone = updates.phone;
        if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
        if (updates.password && updates.password.length >= 6) {
          user.password = updates.password; // Mongoose pre-save hook will hash it
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
    } catch (err) {
      console.warn('DB error in updateUserProfile:', err.message);
    }
  }

  const idx = memoryUsers.findIndex((u) => String(u._id) === String(userId));
  if (idx === -1) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (updates.name) memoryUsers[idx].name = updates.name;
  if (updates.company) memoryUsers[idx].company = updates.company;
  if (updates.phone) memoryUsers[idx].phone = updates.phone;
  if (updates.avatarUrl) memoryUsers[idx].avatarUrl = updates.avatarUrl;
  if (updates.password && updates.password.length >= 6) {
    memoryUsers[idx].password = await bcrypt.hash(updates.password, 10);
  }

  const { password, verificationOtp, resetPasswordOtp, ...safeUser } = memoryUsers[idx];
  return safeUser;
};

/**
 * Forgot password - dispatches password reset link and OTP via Nodemailer
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

      // Sync into DB if DB is connected
      if (isDBConnected()) {
        try {
          await User.create({
            name: memUser.name,
            email: cleanEmail,
            password: 'Password@123',
            role: memUser.role || 'user',
            company: memUser.company || '',
            phone: memUser.phone || '',
            isVerified: true,
            resetPasswordOtp: otp,
            resetPasswordExpires: otpExpiry,
          });
        } catch (syncErr) {
          console.warn('Could not sync memory user to DB on forgotPassword:', syncErr.message);
        }
      }
    }
  }

  if (!foundUser) {
    const error = new Error('No registered account found with this email address. Please click Register to create a new account.');
    error.statusCode = 404;
    throw error;
  }

  // Determine base application URL
  const baseUrl = (
    clientOrigin ||
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');

  const resetLink = `${baseUrl}/?action=reset-password&email=${encodeURIComponent(cleanEmail)}&otp=${otp}&token=${otp}`;

  // Send password reset email via Nodemailer
  await sendPasswordResetEmail({
    to: cleanEmail,
    name: userName,
    otp,
    resetLink,
  });

  const maskedEmail = cleanEmail.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');
  return {
    message: `Password reset link and code dispatched to ${maskedEmail}`,
    email: cleanEmail,
    maskedEmail,
    resetLink,
    expiresIn: '15 minutes',
  };
};

/**
 * Verify Password Reset OTP
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

      if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
        const error = new Error('Invalid OTP code. Please check your email.');
        error.statusCode = 400;
        throw error;
      }

      if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
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

    if (!memUser.resetPasswordOtp || memUser.resetPasswordOtp !== cleanOtp) {
      const error = new Error('Invalid OTP code. Please check your email.');
      error.statusCode = 400;
      throw error;
    }

    if (memUser.resetPasswordExpires && new Date() > new Date(memUser.resetPasswordExpires)) {
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
 * Reset password with OTP
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  if (!newPassword || newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      if (!user.resetPasswordOtp || user.resetPasswordOtp !== cleanOtp) {
        const error = new Error('Invalid or expired OTP code.');
        error.statusCode = 400;
        throw error;
      }

      if (user.resetPasswordExpires && new Date() > new Date(user.resetPasswordExpires)) {
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
      if (err.statusCode || err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('not found')) {
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

  if (!memUser.resetPasswordOtp || memUser.resetPasswordOtp !== cleanOtp) {
    const error = new Error('Invalid or expired OTP code.');
    error.statusCode = 400;
    throw error;
  }

  if (memUser.resetPasswordExpires && new Date() > new Date(memUser.resetPasswordExpires)) {
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

/**
 * Dedicated Admin & Super Admin Login
 * Exclusively restricted to inisio2026@gmail.com and junnupravalika59@gmail.com
 */
export const adminLogin = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Please enter both administrative email and password');
    error.statusCode = 400;
    throw error;
  }
  const cleanEmail = email.toLowerCase().trim();

  // Strict email whitelist check
  if (!AUTHORIZED_ADMIN_EMAILS.includes(cleanEmail)) {
    const error = new Error('Access Denied. The Admin Portal is strictly restricted to authorized emails (junnupravalika59@gmail.com and inisio2026@gmail.com). Please use standard User Sign In.');
    error.statusCode = 403;
    throw error;
  }

  // 1. Try DB first
  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (user) {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          const error = new Error(`Incorrect administrative password for ${cleanEmail}. Click 'Forgot Password?' to reset.`);
          error.statusCode = 401;
          throw error;
        }

        const role = cleanEmail === 'junnupravalika59@gmail.com' ? 'superadmin' : 'admin';
        if (user.role !== role) {
          user.role = role;
          await user.save();
        }

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

  // 2. Memory fallback
  const memUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!memUser) {
    const error = new Error('Administrative account not initialized in system store.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, memUser.password);
  if (!isMatch) {
    const error = new Error(`Incorrect administrative password for ${cleanEmail}. Click 'Forgot Password?' to reset.`);
    error.statusCode = 401;
    throw error;
  }

  const role = cleanEmail === 'junnupravalika59@gmail.com' ? 'superadmin' : 'admin';
  memUser.role = role;

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

export default {
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

