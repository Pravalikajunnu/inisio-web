import Assessment from '../models/Assessment.js';
import { calculateUnderwritingMetrics } from '../utils/underwritingScorer.js';
import { isDBConnected } from '../config/db.js';

let memoryAssessments = [];

export const evaluateProject = async (inputData, userId = null) => {
  const metrics = calculateUnderwritingMetrics(inputData);

  if (isDBConnected()) {
    try {
      const assessmentDoc = await Assessment.create({
        ...inputData,
        ...metrics,
        userId: userId || null,
      });

      return {
        assessmentId: assessmentDoc._id,
        ...assessmentDoc.toObject(),
      };
    } catch (err) {
      console.warn('MongoDB create failed in evaluateProject, using memory fallback:', err.message);
    }
  }

  const item = {
    _id: `assess_${Date.now()}`,
    assessmentId: `assess_${Date.now()}`,
    ...inputData,
    ...metrics,
    userId: userId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryAssessments.unshift(item);
  return item;
};

export const getUserAssessments = async (userId) => {
  if (isDBConnected()) {
    try {
      return await Assessment.find({ userId }).sort({ createdAt: -1 });
    } catch (err) {}
  }
  return memoryAssessments.filter((a) => a.userId === userId);
};

export const getAllAssessments = async () => {
  if (isDBConnected()) {
    try {
      return await Assessment.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
    } catch (err) {}
  }
  return memoryAssessments;
};

export default {
  evaluateProject,
  getUserAssessments,
  getAllAssessments,
};

