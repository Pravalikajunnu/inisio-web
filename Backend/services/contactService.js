import ContactMessage from '../models/ContactMessage.js';

export const createContactMessage = async (data) => {
  return await ContactMessage.create(data);
};

export const getAllContactMessages = async () => {
  return await ContactMessage.find({}).sort({ createdAt: -1 });
};

export const updateMessageStatus = async (id, status, notes = '') => {
  const msg = await ContactMessage.findById(id);
  if (!msg) {
    throw new Error('Contact message not found');
  }
  msg.status = status;
  if (notes) msg.notes = notes;
  return await msg.save();
};

export default {
  createContactMessage,
  getAllContactMessages,
  updateMessageStatus,
};
