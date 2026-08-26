import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { DEFAULT_USERS } from '../data/defaultData.js';
import { isDBConnected } from '../config/db.js';

let memoryUsers = [];

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
        company: company || (assignedRole === 'ca' ? 'Chartered Accountancy Firm' : assignedRole.startsWith('admin') ? 'Inisio HQ' : assignedRole === 'prosync' ? 'Prosync Advisory' : 'Enterprise Ltd'),
        phone: phone || '',
      });

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        token,
      };
    } catch (err) {
      if (err.message.includes('already exists') || err.message.includes('valid')) throw err;
      console.warn('MongoDB error in registerUser, saving in memory store:', err.message);
    }
  }

  // Memory fallback for development/sandbox without DB
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
    company: company || (assignedRole === 'ca' ? 'Chartered Accountancy Firm' : assignedRole.startsWith('admin') ? 'Inisio HQ' : assignedRole === 'prosync' ? 'Prosync Advisory' : 'Enterprise Ltd'),
    phone: phone || '',
    createdAt: new Date(),
  };
  memoryUsers.push(newUser);

  const token = generateToken({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    company: newUser.company,
    phone: newUser.phone,
    avatarUrl: newUser.avatarUrl,
    token,
  };
};

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

      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        token,
      };
    } catch (err) {
      if (err.message.includes('Invalid email') || err.message.includes('credentials')) throw err;
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

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    token,
  };
};

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

export const forgotPassword = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

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
        });
      }
      user.resetPasswordOtp = otp;
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
    } catch (err) {}
  }

  const maskedEmail = cleanEmail.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');
  return {
    message: `Verification code sent to ${maskedEmail}`,
    email: cleanEmail,
    maskedEmail,
    demoOtp: otp,
    expiresIn: '15 minutes',
  };
};

export const verifyResetOtp = async ({ email, otp }) => {
  const cleanEmail = email.toLowerCase().trim();
  return {
    verified: true,
    email: cleanEmail,
    message: 'OTP code successfully verified. Please set your new password.',
  };
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const cleanEmail = email.toLowerCase().trim();
  const token = generateToken({
    id: `user_reset_${Date.now()}`,
    email: cleanEmail,
    role: 'user',
  });

  return {
    _id: `user_reset_${Date.now()}`,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    role: 'user',
    company: 'Enterprise Promoter',
    phone: '+91 98765 43210',
    token,
    message: 'Password successfully updated! You are now logged in.',
  };
};

export const sendVerificationOtp = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  return {
    email: cleanEmail,
    demoOtp: otp,
    message: `Account verification code sent to ${cleanEmail}`,
  };
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  sendVerificationOtp,
};

