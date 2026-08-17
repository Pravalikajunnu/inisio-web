import Consultation from '../models/Consultation.js';

export const createConsultation = async (data) => {
  const consultation = await Consultation.create(data);
  return consultation;
};

export const getAllConsultations = async (filter = {}) => {
  return await Consultation.find(filter).sort({ createdAt: -1 });
};

export const getConsultationById = async (id) => {
  const item = await Consultation.findById(id);
  if (!item) {
    throw new Error('Consultation booking not found');
  }
  return item;
};

export const updateConsultationStatus = async (id, status, feedback = '') => {
  const item = await Consultation.findById(id);
  if (!item) {
    throw new Error('Consultation booking not found');
  }
  item.status = status;
  if (feedback) item.feedback = feedback;
  return await item.save();
};

export default {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus,
};
