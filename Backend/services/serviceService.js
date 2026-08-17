import Service from '../models/Service.js';

export const getAllServices = async () => {
  return await Service.find({ active: true });
};

export const getServiceBySlug = async (slug) => {
  const service = await Service.findOne({ slug });
  if (!service) {
    throw new Error(`Service '${slug}' not found`);
  }
  return service;
};

export const createService = async (data) => {
  return await Service.create(data);
};

export default {
  getAllServices,
  getServiceBySlug,
  createService,
};
