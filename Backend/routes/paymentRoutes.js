import express from 'express';
import {
  getGatewayConfig,
  createCheckoutOrder,
  verifyPaymentSignature,
  getPaymentHistory,
  getPaymentById,
  handleWebhook,
} from '../controllers/paymentController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public gateway configuration
router.get('/config', getGatewayConfig);

// Create checkout order
router.post('/create-order', optionalAuth, createCheckoutOrder);

// Verify signature and fulfill payment
router.post('/verify-signature', optionalAuth, verifyPaymentSignature);

// Payment history
router.get('/history', optionalAuth, getPaymentHistory);

// Single transaction lookup
router.get('/:id', optionalAuth, getPaymentById);

// Razorpay Webhook endpoint
router.post('/webhook', handleWebhook);

export default router;
