import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: '',
      index: true,
    },
    signature: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    userName: {
      type: String,
      default: 'Promoter',
      trim: true,
    },
    userPhone: {
      type: String,
      default: '',
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount in INR is required'],
      min: 0,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    status: {
      type: String,
      enum: ['created', 'attempted', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    itemType: {
      type: String,
      enum: ['membership', 'consultation', 'dpr_service', 'assessment', 'custom'],
      default: 'membership',
    },
    itemId: {
      type: String,
      default: '',
    },
    planName: {
      type: String,
      default: '',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'one-time'],
      default: 'quarterly',
    },
    receipt: {
      type: String,
      default: '',
      index: true,
    },
    invoiceNumber: {
      type: String,
      default: '',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: '',
    },
    cardOrVpaDetails: {
      type: String,
      default: '',
    },
    bank: {
      type: String,
      default: '',
    },
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    rawRazorpayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    errorDescription: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
