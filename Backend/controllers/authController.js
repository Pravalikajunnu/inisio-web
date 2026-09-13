import authService from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company, phone } = req.body;
    const user = await authService.registerUser({ name, email, password, role, company, phone });
    return sendSuccess(res, user, user.message || 'User registered successfully. Verification code sent.', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    const message = result.isVerified === false
      ? 'Email verification required. Verification code has been sent to your inbox.'
      : 'Logged in successfully';
    return sendSuccess(res, result, message, 200);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendError(res, 'Email and 6-digit OTP verification code are required', 400);
    }
    const result = await authService.verifyEmailOtp({ email, otp });
    return sendSuccess(res, result, result.message || 'Email verified successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    return sendSuccess(res, user, 'User profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateUserProfile(req.user._id, req.body);
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide an email address', 400);
    }
    const result = await authService.forgotPassword(email);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendError(res, 'Email and OTP verification code are required', 400);
    }
    const result = await authService.verifyResetOtp({ email, otp });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return sendError(res, 'Email, OTP, and new password are required', 400);
    }
    const result = await authService.resetPassword({ email, otp, newPassword });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export const sendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Please provide an email address', 400);
    }
    const result = await authService.sendVerificationOtp(email);
    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  verifyEmail,
  getMe,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendVerificationOtp,
};
