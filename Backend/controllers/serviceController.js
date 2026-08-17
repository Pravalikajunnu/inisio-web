import serviceService from '../services/serviceService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllServices = async (req, res, next) => {
  try {
    const list = await serviceService.getAllServices();
    return sendSuccess(res, list, 'Consultancy services retrieved');
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceBySlug(req.params.slug);
    return sendSuccess(res, service, 'Service details retrieved');
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.body);
    return sendSuccess(res, service, 'Service added successfully', 201);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllServices,
  getServiceBySlug,
  createService,
};
