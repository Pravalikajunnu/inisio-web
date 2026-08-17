import contactService from '../services/contactService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const createMessage = async (req, res, next) => {
  try {
    const msg = await contactService.createContactMessage(req.body);
    return sendSuccess(res, msg, 'Inquiry submitted successfully. Our lead project consultant will contact you within 24 hours.', 201);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const list = await contactService.getAllContactMessages();
    return sendSuccess(res, list, 'Contact inquiries retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateMessageStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const item = await contactService.updateMessageStatus(req.params.id, status, notes);
    return sendSuccess(res, item, 'Inquiry status updated');
  } catch (error) {
    next(error);
  }
};

export default {
  createMessage,
  getMessages,
  updateMessageStatus,
};
