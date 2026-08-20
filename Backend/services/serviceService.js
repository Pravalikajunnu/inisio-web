import Service from '../models/Service.js';
import { DEFAULT_SERVICES } from '../data/defaultData.js';
import { isDBConnected } from '../config/db.js';

let memoryServices = [...DEFAULT_SERVICES];

export const getAllServices = async () => {
  if (isDBConnected()) {
    try {
      const list = await Service.find({ active: true });
      if (list && list.length > 0) return list;
      await Service.insertMany(DEFAULT_SERVICES).catch(() => {});
      return await Service.find({ active: true });
    } catch (err) {
      console.warn('MongoDB query failed in getAllServices, using memory fallback:', err.message);
    }
  }
  return memoryServices;
};

export const getServiceBySlug = async (slug) => {
  if (isDBConnected()) {
    try {
      const service = await Service.findOne({ slug });
      if (service) return service;
    } catch (err) {
      console.warn('MongoDB query failed in getServiceBySlug, using memory fallback:', err.message);
    }
  }
  const found = memoryServices.find((s) => s.slug === slug);
  if (!found) {
    throw new Error(`Service '${slug}' not found`);
  }
  return found;
};

export const createService = async (data) => {
  if (isDBConnected()) {
    try {
      return await Service.create(data);
    } catch (err) {
      console.warn('MongoDB create failed in createService, saving to memory fallback:', err.message);
    }
  }
  const item = { ...data, _id: `srv_${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
  memoryServices.push(item);
  return item;
};

export default {
  getAllServices,
  getServiceBySlug,
  createService,
};

