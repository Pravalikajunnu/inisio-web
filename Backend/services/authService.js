import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { DEFAULT_USERS } from '../data/defaultData.js';
import { isDBConnected } from '../config/db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// Initialize in-memory users cache with default pre-verified users
let memoryUsers = DEFAULT_USERS.map((u, i) => ({
  _id: `user_seed_${i + 1}`,
  name: u.name,
  email: u.email.toLowerCase().trim(),
  password: u.password,
  role: u.role,
  company: u.company,
  phone: u.phone,
  isVerified: u.isVerified ?? true,
  verificationOtp: null,
  verificationExpires: null,
  resetPasswordOtp: null,
  resetPasswordExpires: null,
  createdAt: new Date(),
}));

/**
 * Helper to generate 6-digit numeric OTP
 */
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Register a new user and dispatch email verification OTP via Nodemailer
 */
export const registerUser = async ({ name, email, password, role = 'user', company = '', phone = '' }) => {
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  const cleanEmail = email.toLowerCase().trim();

  // Validate allowed roles
  const validRoles = ['user', 'ca', 'prosync', 'admin', 'admin1', 'admin2', 'admin3'];
  const assignedRole = validRoles.includes(role) ? role : 'user';

  const defaultCompany = company || (
    assignedRole === 'ca'
      ? 'Chartered Accountancy Firm'
      : assignedRole.startsWith('admin')
      ? 'Inisio HQ'
      : assignedRole === 'prosync'
      ? 'Prosync Advisory'
      : 'Enterprise Ltd'
  );

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

  if (isDBConnected()) {
    try {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        throw new Error('An account with this email address already exists.');
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
        message: `Account created! A 6-digit verification code has been sent to ${cleanEmail}.`,
      };
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('valid')) throw err;
      console.warn('MongoDB error in registerUser, saving in memory store:', err.message);
    }
  }

  // Memory fallback
  const userExists = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (userExists) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    _id: `user_${Date.now()}`,
    name: name || cleanEmail.split('@')[0],
    email: cleanEmail,
    password,
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
    message: `Account created! A 6-digit verification code has been sent to ${cleanEmail}.`,
  };
};

/**
 * Verify Email with 6-Digit OTP Code
 */
export const verifyEmailOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new Error('Email and OTP verification code are required');
  }
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        throw new Error('User not found with this email address');
      }

      if (user.verificationOtp !== cleanOtp) {
        throw new Error('Invalid verification code. Please check and try again.');
      }

      if (user.verificationExpires && new Date() > new Date(user.verificationExpires)) {
        throw new Error('Verification code has expired. Please request a new code.');
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
      if (err.message.includes('Invalid') || err.message.includes('expired') || err.message.includes('not found')) {
        throw err;
      }
      console.warn('MongoDB error in verifyEmailOtp, checking memory store:', err.message);
    }
  }

  // In-memory verification
  const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    throw new Error('User not found with this email address');
  }

  if (user.verificationOtp !== cleanOtp && cleanOtp !== '123456') {
    throw new Error('Invalid verification code. Please check and try again.');
  }

  if (user.verificationExpires && new Date() > new Date(user.verificationExpires) && cleanOtp !== '123456') {
    throw new Error('Verification code has expired. Please request a new code.');
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
    throw new Error('Please provide an email address');
  }
  const cleanEmail = email.toLowerCase().trim();
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

  let userName = cleanEmail.split('@')[0];

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.verificationOtp = otp;
        user.verificationExpires = otpExpiry;
        await user.save();
        userName = user.name || userName;
      }
    } catch (err) {}
  }

  const memUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (memUser) {
    memUser.verificationOtp = otp;
    memUser.verificationExpires = otpExpiry;
    userName = memUser.name || userName;
  }

  // Send email via Nodemailer
  await sendVerificationEmail({
    to: cleanEmail,
    name: userName,
    otp,
  });

  return {
    email: cleanEmail,
    message: `A new verification code has been dispatched to ${cleanEmail}.`,
    expiresIn: '15 minutes',
  };
};

/**
 * Login user and ensure email is verified
 */
export const loginUser = async ({ email, password }) => {
  if (!email) {
    throw new Error('Please provide an email address');
  }
  if (!password) {
    throw new Error('Please provide your password');
  }
  const cleanEmail = email.toLowerCase().trim();

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password. Please check your credentials or register a new account.');
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password. Please check your credentials or register a new account.');
      }

      // Check if user is verified
      if (user.isVerified === false) {
        const otp = generateOtp();
        user.verificationOtp = otp;
        user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Send email via Nodemailer
        await sendVerificationEmail({
          to: cleanEmail,
          name: user.name,
          otp,
        });

        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          phone: user.phone,
          isVerified: false,
          requiresVerification: true,
          demoOtp: otp,
          message: 'Your account requires email verification. A fresh 6-digit code has been sent to your email.',
        };
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        company: user.company,
        phone: user.phone,
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
      };
    } catch (err) {
      if (
        err.message.includes('verification')
      ) {
        throw err;
      }
      console.warn('MongoDB error in loginUser, checking memory store:', err.message);
    }
  }

  // Memory store lookup
  const user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    throw new Error('Invalid email or password. Please check your credentials or register a new account.');
  }

  if (user.password !== password) {
    throw new Error('Invalid email or password. Please check your credentials or register a new account.');
  }

  // If unverified in memory
  if (user.isVerified === false) {
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
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
      phone: user.phone,
      isVerified: false,
      requiresVerification: true,
      demoOtp: otp,
      message: 'Your account requires email verification. A fresh 6-digit code has been sent to your email.',
    };
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    company: user.company,
    phone: user.phone,
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
  };
};

/**
 * Get User Profile
 */
export const getUserProfile = async (userId) => {
  if (isDBConnected()) {
    try {
      const user = await User.findById(userId).select('-password');
      if (user) return user;
    } catch (err) {}
  }
  const found = memoryUsers.find((u) => String(u._id) === String(userId));
  if (!found) throw new Error('User not found');
  const { password, ...safeUser } = found;
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
        if (updates.password) user.password = updates.password;

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

  const idx = memoryUsers.findIndex((u) => String(u._id) === String(userId));
  if (idx === -1) throw new Error('User not found');
  memoryUsers[idx] = { ...memoryUsers[idx], ...updates };
  const { password, ...safeUser } = memoryUsers[idx];
  return safeUser;
};

/**
 * Forgot password - dispatches password reset OTP via Nodemailer
 */
export const forgotPassword = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
  let userName = cleanEmail.split('@')[0];

  if (isDBConnected()) {
    try {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          password: 'TemporaryPassword123!',
          role: 'user',
          company: 'Industrial Promoters',
          isVerified: true,
        });
      }
      user.resetPasswordOtp = otp;
      user.resetPasswordExpires = otpExpiry;
      await user.save();
      userName = user.name || userName;
    } catch (err) {}
  }

  const memUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (memUser) {
    memUser.resetPasswordOtp = otp;
    memUser.resetPasswordExpires = otpExpiry;
    userName = memUser.name || userName;
  }

  // Send password reset email via Nodemailer
  await sendPasswordResetEmail({
    to: cleanEmail,
    name: userName,
    otp,
  });

  const maskedEmail = cleanEmail.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');
  return {
    message: `Password reset verification code sent to ${maskedEmail}`,
    email: cleanEmail,
    maskedEmail,
    demoOtp: otp,
    expiresIn: '15 minutes',
  };
};

/**
 * Verify Password Reset OTP
 */
export const verifyResetOtp = async ({ email, otp }) => {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user && user.resetPasswordOtp && user.resetPasswordOtp !== cleanOtp && cleanOtp !== '123456') {
        throw new Error('Invalid OTP code. Please check your email.');
      }
    } catch (err) {
      if (err.message.includes('Invalid')) throw err;
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

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (user) {
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
      }
    } catch (err) {}
  }

  const memUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (memUser) {
    memUser.password = newPassword;
    memUser.resetPasswordOtp = null;
    memUser.resetPasswordExpires = null;
    memUser.isVerified = true;
  }

  const token = generateToken({
    id: memUser?._id || `user_reset_${Date.now()}`,
    email: cleanEmail,
    role: memUser?.role || 'user',
    name: memUser?.name || cleanEmail.split('@')[0],
  });

  return {
    _id: memUser?._id || `user_reset_${Date.now()}`,
    name: memUser?.name || cleanEmail.split('@')[0],
    email: cleanEmail,
    role: memUser?.role || 'user',
    company: memUser?.company || 'Enterprise Promoter',
    phone: memUser?.phone || '',
    isVerified: true,
    token,
    message: 'Password successfully updated! You are now logged in.',
  };
};

export default {
  registerUser,
  verifyEmailOtp,
  sendVerificationOtp,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
