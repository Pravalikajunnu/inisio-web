import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { getRazorpayConfig, getRazorpayInstance } from '../config/razorpay.js';
import { isDBConnected } from '../config/db.js';
import {
  addMemoryPayment,
  updateMemoryPayment,
  getMemoryPayments,
  getMemoryPaymentsByUser,
  findMemoryPaymentByOrderId,
} from '../utils/memoryPaymentStore.js';
import { updateMemoryUser, findMemoryUserByEmail } from '../utils/memoryUserStore.js';

/**
 * Generate a unique sequential invoice number
 */
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-INISIO-${year}-${randomSuffix}`;
};

/**
 * Create a new Razorpay order
 */
export const createOrder = async ({
  amount,
  currency = 'INR',
  userEmail,
  userName = 'Promoter',
  userPhone = '',
  itemType = 'membership',
  itemId = '',
  planName = 'Starter',
  billingCycle = 'quarterly',
  notes = {},
}) => {
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    const error = new Error('A valid positive payment amount is required');
    error.statusCode = 400;
    throw error;
  }

  const numAmount = Number(amount);
  const amountPaise = Math.round(numAmount * 100);
  const cleanEmail = (userEmail || '').trim().toLowerCase();

  const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const config = getRazorpayConfig();
  const razorpay = getRazorpayInstance();

  let razorpayOrderId = '';
  let orderData = null;

  if (razorpay && config.isConfigured) {
    try {
      const options = {
        amount: amountPaise,
        currency: currency.toUpperCase(),
        receipt,
        notes: {
          itemType,
          planName,
          userEmail: cleanEmail,
          ...notes,
        },
        payment_capture: 1,
      };
      orderData = await razorpay.orders.create(options);
      razorpayOrderId = orderData.id;
    } catch (err) {
      console.warn('Razorpay live order creation failed, falling back to sandbox order:', err.message);
      razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
  } else {
    // Sandbox / Test fallback if keys are not yet provided
    razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  const paymentRecordData = {
    orderId: razorpayOrderId,
    paymentId: '',
    signature: '',
    userEmail: cleanEmail,
    userName,
    userPhone,
    amount: numAmount,
    amountPaise,
    currency: currency.toUpperCase(),
    status: 'created',
    itemType,
    itemId,
    planName,
    billingCycle,
    receipt,
    notes: {
      ...notes,
      isTestMode: config.isTestMode,
    },
    rawRazorpayResponse: orderData,
  };

  let savedPayment = null;

  if (isDBConnected()) {
    try {
      // Find userId if exists
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        paymentRecordData.userId = user._id;
      }
      savedPayment = await Payment.create(paymentRecordData);
    } catch (dbErr) {
      console.warn('DB error saving Payment, using in-memory store:', dbErr.message);
    }
  }

  if (!savedPayment) {
    savedPayment = addMemoryPayment({
      _id: `pay_mem_${Date.now()}`,
      ...paymentRecordData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return {
    orderId: razorpayOrderId,
    amount: amountPaise,
    amountINR: numAmount,
    currency: currency.toUpperCase(),
    receipt,
    keyId: config.key_id || 'rzp_test_inisio_demo_key',
    isTestMode: config.isTestMode,
    planName,
    billingCycle,
    user: {
      name: userName,
      email: cleanEmail,
      phone: userPhone,
    },
  };
};

/**
 * Verify Razorpay payment signature and fulfill the purchase
 */
export const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  userEmail,
  planName,
  paymentMethod = 'Razorpay Gateway',
}) => {
  if (!razorpay_order_id) {
    const error = new Error('Razorpay Order ID is required for verification');
    error.statusCode = 400;
    throw error;
  }

  if (!razorpay_payment_id) {
    const error = new Error('Razorpay Payment ID is required for verification');
    error.statusCode = 400;
    throw error;
  }

  const config = getRazorpayConfig();
  let isSignatureValid = false;

  if (config.isConfigured && config.key_secret && razorpay_signature) {
    try {
      const generated_signature = crypto
        .createHmac('sha256', config.key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = generated_signature === razorpay_signature;
    } catch (e) {
      console.error('Signature verification calculation error:', e);
      isSignatureValid = false;
    }
  } else {
    // If running in test/sandbox simulation or signature test mode
    isSignatureValid = true;
  }

  if (!isSignatureValid) {
    const error = new Error('Invalid Razorpay signature. Payment verification failed.');
    error.statusCode = 400;
    throw error;
  }

  const invoiceNumber = generateInvoiceNumber();
  const updateFields = {
    paymentId: razorpay_payment_id,
    signature: razorpay_signature || 'test_verified_signature',
    status: 'captured',
    invoiceNumber,
    paymentMethod,
    updatedAt: new Date(),
  };

  let updatedRecord = null;
  const cleanEmail = (userEmail || '').trim().toLowerCase();

  if (isDBConnected()) {
    try {
      updatedRecord = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { $set: updateFields },
        { new: true }
      );
      if (cleanEmail && planName) {
        await User.findOneAndUpdate(
          { email: cleanEmail },
          { $set: { membershipTier: planName } }
        );
      }
    } catch (err) {
      console.warn('DB error updating verified payment:', err.message);
    }
  }

  if (!updatedRecord) {
    updatedRecord = updateMemoryPayment(razorpay_order_id, updateFields);
    if (cleanEmail && planName) {
      updateMemoryUser(cleanEmail, { membershipTier: planName });
    }
  }

  return {
    success: true,
    message: 'Payment successfully captured and verified.',
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    invoiceNumber,
    status: 'captured',
    planName: planName || updatedRecord?.planName || 'Active',
    amount: updatedRecord?.amount || 0,
    currency: updatedRecord?.currency || 'INR',
    receipt: updatedRecord?.receipt || '',
    userEmail: cleanEmail || updatedRecord?.userEmail,
  };
};

/**
 * Retrieve transaction history for a user
 */
export const getUserPayments = async (userEmail) => {
  const cleanEmail = (userEmail || '').trim().toLowerCase();
  if (isDBConnected()) {
    try {
      const query = cleanEmail ? { userEmail: cleanEmail } : {};
      const payments = await Payment.find(query).sort({ createdAt: -1 });
      if (payments && payments.length > 0) {
        return payments;
      }
    } catch (err) {
      console.warn('DB error in getUserPayments:', err.message);
    }
  }

  return cleanEmail ? getMemoryPaymentsByUser(cleanEmail) : getMemoryPayments();
};

/**
 * Get payment by ID or Order ID
 */
export const getPaymentDetails = async (identifier) => {
  if (!identifier) return null;
  if (isDBConnected()) {
    try {
      const payment = await Payment.findOne({
        $or: [{ orderId: identifier }, { paymentId: identifier }],
      });
      if (payment) return payment;
    } catch (err) {
      console.warn('DB error in getPaymentDetails:', err.message);
    }
  }

  return findMemoryPaymentByOrderId(identifier);
};

export default {
  createOrder,
  verifyPayment,
  getUserPayments,
  getPaymentDetails,
};
