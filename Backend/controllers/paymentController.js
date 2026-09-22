import {
  createOrder,
  verifyPayment as verifyRazorpayPayment,
  getUserPayments,
  getPaymentDetails,
} from '../services/razorpayService.js';
import { getRazorpayConfig } from '../config/razorpay.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * @desc Get public payment gateway config (Key ID, currency, test mode status)
 * @route GET /api/payments/config
 * @access Public
 */
export const getGatewayConfig = async (req, res, next) => {
  try {
    const config = getRazorpayConfig();
    return sendSuccess(
      res,
      {
        keyId: config.key_id || 'rzp_test_inisio_demo_key',
        isConfigured: config.isConfigured,
        isTestMode: config.isTestMode,
        currency: 'INR',
        merchantName: 'Inisio Greenfield Consultancy',
        themeColor: '#2563EB',
      },
      'Payment gateway configuration retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new Razorpay checkout order
 * @route POST /api/payments/create-order
 * @access Public / Authenticated
 */
export const createCheckoutOrder = async (req, res, next) => {
  try {
    const {
      amount,
      currency,
      userEmail,
      userName,
      userPhone,
      itemType,
      itemId,
      planName,
      billingCycle,
      notes,
    } = req.body;

    const email = req.user?.email || userEmail;
    const name = req.user?.name || userName;
    const phone = req.user?.phone || userPhone;

    if (!amount) {
      return sendError(res, 'Payment amount is required', 400);
    }

    const order = await createOrder({
      amount,
      currency,
      userEmail: email,
      userName: name,
      userPhone: phone,
      itemType,
      itemId,
      planName,
      billingCycle,
      notes,
    });

    return sendSuccess(res, order, 'Razorpay order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify Razorpay payment signature & confirm fulfillment
 * @route POST /api/payments/verify-signature
 * @access Public / Authenticated
 */
export const verifyPaymentSignature = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail,
      planName,
      paymentMethod,
    } = req.body;

    const email = req.user?.email || userEmail;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return sendError(res, 'Missing razorpay_order_id or razorpay_payment_id', 400);
    }

    const result = await verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail: email,
      planName,
      paymentMethod,
    });

    return sendSuccess(res, result, 'Payment signature verified and purchase fulfilled', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get payment / transaction history
 * @route GET /api/payments/history
 * @access Public / Authenticated
 */
export const getPaymentHistory = async (req, res, next) => {
  try {
    const email = req.user?.email || req.query.email;
    const payments = await getUserPayments(email);
    return sendSuccess(res, payments, 'Payment transactions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get payment transaction by Order ID or Payment ID
 * @route GET /api/payments/:id
 * @access Public / Authenticated
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentDetails(id);
    if (!payment) {
      return sendError(res, 'Payment transaction not found', 404);
    }
    return sendSuccess(res, payment, 'Payment transaction retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Razorpay Webhook Handler
 * @route POST /api/payments/webhook
 * @access Public (Webhook Signature Verified)
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const config = getRazorpayConfig();

    if (config.webhook_secret && webhookSignature) {
      const crypto = await import('crypto');
      const expectedSignature = crypto.default
        .createHmac('sha256', config.webhook_secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== webhookSignature) {
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    return res.status(200).json({ status: 'ok', eventReceived: event });
  } catch (error) {
    next(error);
  }
};

export default {
  getGatewayConfig,
  createCheckoutOrder,
  verifyPaymentSignature,
  getPaymentHistory,
  getPaymentById,
  handleWebhook,
};
