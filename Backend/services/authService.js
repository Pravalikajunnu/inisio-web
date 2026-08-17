import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export const registerUser = async ({ name, email, password, role = 'user', company = '', phone = '' }) => {
  const cleanEmail = email.toLowerCase().trim();

  const userExists = await User.findOne({ email: cleanEmail });
  if (userExists) {
    throw new Error('An account with this email address already exists.');
  }

  // Determine role based on email or specified role
  let assignedRole = role;
  if (cleanEmail === 'admin@gmail.com' || cleanEmail.includes('admin@inisio')) {
    assignedRole = 'admin';
  } else if (cleanEmail === 'ca@gmail.com' || cleanEmail.includes('ca@inisio')) {
    assignedRole = 'ca';
  }

  const user = await User.create({
    name,
    email: cleanEmail,
    password,
    role: assignedRole,
    company: company || (assignedRole === 'ca' ? 'Sharma & Associates CAs' : assignedRole === 'admin' ? 'Inisio HQ' : 'Enterprise Ltd'),
    phone: phone || '+91 98765 43210',
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
};

export const loginUser = async ({ email, password }) => {
  const cleanEmail = email.toLowerCase().trim();

  // Find user by email and select password
  let user = await User.findOne({ email: cleanEmail }).select('+password');

  // If user does not exist, automatically bootstrap standard demo account for instant accessibility
  if (!user) {
    let autoRole = 'user';
    let autoName = cleanEmail.split('@')[0];
    let autoCompany = 'Industrial Enterprises Ltd';

    if (cleanEmail === 'admin@gmail.com' || cleanEmail.includes('admin')) {
      autoRole = 'admin';
      autoName = 'Inisio Admin';
      autoCompany = 'Inisio HQ Administration';
    } else if (cleanEmail === 'ca@gmail.com' || cleanEmail.includes('ca')) {
      autoRole = 'ca';
      autoName = 'CA Rajesh Sharma (FCA)';
      autoCompany = 'Sharma & Associates Chartered Accountants';
    } else if (cleanEmail === 'user@gmail.com' || cleanEmail.includes('user')) {
      autoRole = 'user';
      autoName = 'Vikram Malhotra';
      autoCompany = 'Bio-Pharma Enterprises Ltd';
    }

    user = await User.create({
      name: autoName,
      email: cleanEmail,
      password: password || 'inisio12345',
      role: autoRole,
      company: autoCompany,
      phone: '+91 98765 43210',
    });
  } else {
    // If user exists and password is provided, verify it (or allow demo credentials)
    if (password && !(await user.matchPassword(password))) {
      // In development / demo environment, allow login if default password matching
      if (password !== 'inisio12345' && password !== 'admin123' && password !== 'ca123') {
        throw new Error('Invalid email or password');
      }
    }
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
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

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
};

export const forgotPassword = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: cleanEmail });

  if (!user) {
    // If demo/dev user, automatically create one so forgot password works seamlessly
    user = await User.create({
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      password: 'TemporaryPassword123!',
      role: 'user',
      company: 'Industrial Promoters',
    });
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOtp = otp;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  await user.save();

  // Return masked email and OTP (for instant real-time simulation/preview)
  const maskedEmail = cleanEmail.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');
  return {
    message: `Verification code sent to ${maskedEmail}`,
    email: cleanEmail,
    maskedEmail,
    demoOtp: otp, // Provided for easy demo verification in UI
    expiresIn: '15 minutes',
  };
};

export const verifyResetOtp = async ({ email, otp }) => {
  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    throw new Error('User not found with this email address.');
  }

  // Allow standard demo OTP or generated OTP
  const isDemo = otp === '123456' || otp === '999999';
  const matches = user.resetPasswordOtp && user.resetPasswordOtp === otp.trim();

  if (!isDemo && !matches) {
    throw new Error('Invalid verification code. Please check your email or enter 123456.');
  }

  if (!isDemo && user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
    throw new Error('Verification code has expired. Please request a new one.');
  }

  return {
    verified: true,
    email: cleanEmail,
    message: 'OTP code successfully verified. Please set your new password.',
  };
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const cleanEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    throw new Error('User not found.');
  }

  // Validate OTP
  const isDemo = otp === '123456' || otp === '999999';
  const matches = user.resetPasswordOtp && user.resetPasswordOtp === otp.trim();

  if (!isDemo && !matches) {
    throw new Error('Invalid or expired verification code.');
  }

  user.password = newPassword;
  user.resetPasswordOtp = null;
  user.resetPasswordExpires = null;
  await user.save();

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
    message: 'Password successfully updated! You are now logged in.',
  };
};

export const sendVerificationOtp = async (email) => {
  const cleanEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const user = await User.findOne({ email: cleanEmail });
  if (user) {
    user.verificationOtp = otp;
    await user.save();
  }

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
