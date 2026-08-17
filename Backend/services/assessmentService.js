import Assessment from '../models/Assessment.js';
import { calculateUnderwritingMetrics } from '../utils/underwritingScorer.js';

export const evaluateProject = async (inputData, userId = null) => {
  const metrics = calculateUnderwritingMetrics(inputData);

  const assessmentDoc = await Assessment.create({
    ...inputData,
    ...metrics,
    userId: userId || null,
  });

  return {
    assessmentId: assessmentDoc._id,
    ...assessmentDoc.toObject(),
  };
};

export const getUserAssessments = async (userId) => {
  return await Assessment.find({ userId }).sort({ createdAt: -1 });
};

export const getAllAssessments = async () => {
  return await Assessment.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
};

export default {
  evaluateProject,
  getUserAssessments,
  getAllAssessments,
};
