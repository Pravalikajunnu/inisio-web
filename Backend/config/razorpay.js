import Razorpay from 'razorpay';

let razorpayInstance = null;

/**
 * Returns the current Razorpay gateway configuration state.
 */
export const getRazorpayConfig = () => {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const webhook_secret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  const isConfigured = Boolean(key_id && key_secret);

  return {
    key_id,
    key_secret,
    webhook_secret,
    isConfigured,
    isTestMode: key_id.startsWith('rzp_test_') || !isConfigured,
  };
};

/**
 * Lazily initializes and returns the Razorpay instance.
 */
export const getRazorpayInstance = () => {
  const config = getRazorpayConfig();
  if (!config.isConfigured) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.key_id,
      key_secret: config.key_secret,
    });
  }
  return razorpayInstance;
};

export default {
  getRazorpayConfig,
  getRazorpayInstance,
};
