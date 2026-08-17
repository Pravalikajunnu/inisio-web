import Industry from '../models/Industry.js';

export const getAllIndustries = async () => {
  return await Industry.find({}).sort({ category: 1, name: 1 });
};

export const getIndustryBySlug = async (slug) => {
  const ind = await Industry.findOne({ slug });
  if (!ind) {
    throw new Error(`Industry '${slug}' not found`);
  }
  return ind;
};

export const createIndustry = async (data) => {
  return await Industry.create(data);
};

export default {
  getAllIndustries,
  getIndustryBySlug,
  createIndustry,
};
