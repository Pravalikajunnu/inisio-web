import industryService from '../services/industryService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAllIndustries = async (req, res, next) => {
  try {
    const list = await industryService.getAllIndustries();
    return sendSuccess(res, list, 'Industries retrieved');
  } catch (error) {
    next(error);
  }
};

export const getIndustryBySlug = async (req, res, next) => {
  try {
    const item = await industryService.getIndustryBySlug(req.params.slug);
    return sendSuccess(res, item, 'Industry fetched');
  } catch (error) {
    next(error);
  }
};

export const createIndustry = async (req, res, next) => {
  try {
    const item = await industryService.createIndustry(req.body);
    return sendSuccess(res, item, 'Industry profile created', 201);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllIndustries,
  getIndustryBySlug,
  createIndustry,
};
