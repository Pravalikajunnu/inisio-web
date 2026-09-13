import express from 'express';
import {
  register,
  login,
  verifyEmail,
  getMe,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  sendVerificationOtp,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateBody(['name', 'email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);
router.post('/verify-email', validateBody(['email', 'otp']), verifyEmail);
router.post('/verify-otp', validateBody(['email', 'otp']), verifyOtp);
router.post('/forgot-password', validateBody(['email']), forgotPassword);
router.post('/reset-password', validateBody(['email', 'otp', 'newPassword']), resetPassword);
router.post('/send-verification', validateBody(['email']), sendVerificationOtp);
router.post('/resend-verification', validateBody(['email']), sendVerificationOtp);

// Protected routes
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

export default router;
