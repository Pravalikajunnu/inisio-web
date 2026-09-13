import Consultation from '../models/Consultation.js';
import { isDBConnected } from '../config/db.js';
import { sendConsultationConfirmationEmail } from '../utils/emailService.js';

let memoryConsultations = [];

export const createConsultation = async (data) => {
  let createdItem = null;

  if (isDBConnected()) {
    try {
      createdItem = await Consultation.create(data);
    } catch (err) {
      console.warn('MongoDB create failed in createConsultation, using memory fallback:', err.message);
    }
  }

  if (!createdItem) {
    createdItem = {
      _id: `cons_${Date.now()}`,
      ...data,
      status: data.status || 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryConsultations.unshift(createdItem);
  }

  // Dispatch email notification via Nodemailer
  if (createdItem.email) {
    sendConsultationConfirmationEmail({
      to: createdItem.email,
      name: createdItem.fullName || 'Valued Promoter',
      preferredDate: createdItem.preferredDate,
      preferredTime: createdItem.preferredTime,
      topic: createdItem.projectStage || createdItem.message || 'Greenfield Project Bankability Consultation',
    }).catch((e) => console.warn('Consultation confirmation email error:', e.message));
  }

  return createdItem;
};

export const getAllConsultations = async (filter = {}) => {
  if (isDBConnected()) {
    try {
      return await Consultation.find(filter).sort({ createdAt: -1 });
    } catch (err) {
      console.warn('MongoDB query failed in getAllConsultations, using memory fallback:', err.message);
    }
  }
  return memoryConsultations;
};

export const getConsultationById = async (id) => {
  if (isDBConnected()) {
    try {
      const item = await Consultation.findById(id);
      if (item) return item;
    } catch (err) {}
  }
  const found = memoryConsultations.find((c) => String(c._id) === String(id));
  if (!found) {
    throw new Error('Consultation booking not found');
  }
  return found;
};

export const updateConsultationStatus = async (id, status, feedback = '') => {
  if (isDBConnected()) {
    try {
      const item = await Consultation.findById(id);
      if (item) {
        item.status = status;
        if (feedback) item.feedback = feedback;
        return await item.save();
      }
    } catch (err) {}
  }

  const idx = memoryConsultations.findIndex((c) => String(c._id) === String(id));
  if (idx === -1) throw new Error('Consultation booking not found');
  memoryConsultations[idx].status = status;
  if (feedback) memoryConsultations[idx].feedback = feedback;
  memoryConsultations[idx].updatedAt = new Date();
  return memoryConsultations[idx];
};

export default {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus,
};
