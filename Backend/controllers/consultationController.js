import consultationService from '../services/consultationService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const createConsultation = async (req, res, next) => {
  try {
    const consultation = await consultationService.createConsultation(req.body);
    return sendSuccess(res, consultation, 'Advisory consultation scheduled successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getConsultations = async (req, res, next) => {
  try {
    const list = await consultationService.getAllConsultations(req.query);
    return sendSuccess(res, list, 'Consultations retrieved');
  } catch (error) {
    next(error);
  }
};

export const getConsultationById = async (req, res, next) => {
  try {
    const item = await consultationService.getConsultationById(req.params.id);
    return sendSuccess(res, item, 'Consultation details fetched');
  } catch (error) {
    next(error);
  }
};

export const updateConsultationStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const item = await consultationService.updateConsultationStatus(req.params.id, status, feedback);
    return sendSuccess(res, item, 'Consultation status updated');
  } catch (error) {
    next(error);
  }
};

export default {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultationStatus,
};
