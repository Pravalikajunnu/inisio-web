export let memoryPayments = [
  {
    _id: 'pay_mem_001',
    orderId: 'order_INISIO_SAMPLE_001',
    paymentId: 'pay_INISIO_SAMPLE_001',
    signature: 'sig_mock_verified',
    userEmail: 'promoter@inisio.com',
    userName: 'Industrial Promoter',
    userPhone: '+91 98765 43213',
    amount: 14999,
    amountPaise: 1499900,
    currency: 'INR',
    status: 'captured',
    itemType: 'membership',
    planName: 'Enterprise',
    billingCycle: 'quarterly',
    receipt: 'rcpt_inisio_sample_001',
    invoiceNumber: 'INV-INISIO-2026-0001',
    paymentMethod: 'UPI / NetBanking',
    notes: {
      source: 'Initial Provisioning',
      entitlements: 'Comprehensive DPR + Bank Liaising + Investor Matching',
    },
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    updatedAt: new Date('2026-01-15T10:30:00.000Z'),
  },
];

export const getMemoryPayments = () => memoryPayments;

export const findMemoryPaymentByOrderId = (orderId) => {
  if (!orderId) return null;
  return memoryPayments.find((p) => p.orderId === orderId) || null;
};

export const findMemoryPaymentById = (id) => {
  if (!id) return null;
  return (
    memoryPayments.find(
      (p) => String(p._id) === String(id) || p.orderId === id || p.paymentId === id
    ) || null
  );
};

export const getMemoryPaymentsByUser = (email) => {
  if (!email) return [];
  const clean = email.toLowerCase().trim();
  return memoryPayments.filter((p) => p.userEmail && p.userEmail.toLowerCase().trim() === clean);
};

export const addMemoryPayment = (payment) => {
  memoryPayments.unshift(payment);
  return payment;
};

export const updateMemoryPayment = (orderId, updates) => {
  const idx = memoryPayments.findIndex(
    (p) => p.orderId === orderId || (updates.paymentId && p.paymentId === updates.paymentId)
  );
  if (idx !== -1) {
    memoryPayments[idx] = { ...memoryPayments[idx], ...updates, updatedAt: new Date() };
    return memoryPayments[idx];
  }
  return null;
};

export default {
  memoryPayments,
  getMemoryPayments,
  findMemoryPaymentByOrderId,
  findMemoryPaymentById,
  getMemoryPaymentsByUser,
  addMemoryPayment,
  updateMemoryPayment,
};
