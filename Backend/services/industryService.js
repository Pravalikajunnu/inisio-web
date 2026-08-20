import Industry from '../models/Industry.js';
import { DEFAULT_INDUSTRIES } from '../data/defaultData.js';
import { isDBConnected } from '../config/db.js';

let memoryIndustries = [...DEFAULT_INDUSTRIES];

export const getAllIndustries = async () => {
  if (isDBConnected()) {
    try {
      const list = await Industry.find({}).sort({ category: 1, name: 1 });
      if (list && list.length > 0) return list;
      await Industry.insertMany(DEFAULT_INDUSTRIES).catch(() => {});
      return await Industry.find({}).sort({ category: 1, name: 1 });
    } catch (err) {
      console.warn('MongoDB query failed in getAllIndustries, using memory fallback:', err.message);
    }
  }
  return memoryIndustries;
};

export const getIndustryBySlug = async (slug) => {
  if (isDBConnected()) {
    try {
      const ind = await Industry.findOne({ slug });
      if (ind) return ind;
    } catch (err) {
      console.warn('MongoDB query failed in getIndustryBySlug, using memory fallback:', err.message);
    }
  }
  const found = memoryIndustries.find((i) => i.slug === slug);
  if (!found) {
    throw new Error(`Industry '${slug}' not found`);
  }
  return found;
};

export const createIndustry = async (data) => {
  if (isDBConnected()) {
    try {
      return await Industry.create(data);
    } catch (err) {
      console.warn('MongoDB create failed in createIndustry, saving to memory fallback:', err.message);
    }
  }
  const item = { ...data, _id: `ind_${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
  memoryIndustries.push(item);
  return item;
};

export default {
  getAllIndustries,
  getIndustryBySlug,
  createIndustry,
};

