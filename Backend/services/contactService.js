import ContactMessage from '../models/ContactMessage.js';
import { isDBConnected } from '../config/db.js';

let memoryMessages = [];

export const createContactMessage = async (data) => {
  if (isDBConnected()) {
    try {
      return await ContactMessage.create(data);
    } catch (err) {}
  }
  const msg = {
    _id: `msg_${Date.now()}`,
    ...data,
    status: data.status || 'Unread',
    createdAt: new Date(),
  };
  memoryMessages.unshift(msg);
  return msg;
};

export const getAllContactMessages = async () => {
  if (isDBConnected()) {
    try {
      return await ContactMessage.find({}).sort({ createdAt: -1 });
    } catch (err) {}
  }
  return memoryMessages;
};

export const updateMessageStatus = async (id, status, notes = '') => {
  if (isDBConnected()) {
    try {
      const msg = await ContactMessage.findById(id);
      if (msg) {
        msg.status = status;
        if (notes) msg.notes = notes;
        return await msg.save();
      }
    } catch (err) {}
  }

  const idx = memoryMessages.findIndex((m) => String(m._id) === String(id));
  if (idx === -1) throw new Error('Contact message not found');
  memoryMessages[idx].status = status;
  if (notes) memoryMessages[idx].notes = notes;
  return memoryMessages[idx];
};

export default {
  createContactMessage,
  getAllContactMessages,
  updateMessageStatus,
};

