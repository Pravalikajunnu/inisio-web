import express from 'express';
import {
  evaluateProject,
  calculateQuickMetrics,
  getUserAssessments,
  getAllAssessments,
} from '../controllers/assessmentController.js';
import { authenticateUser, authorizeRoles, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public / User evaluate endpoint
router.post('/evaluate', optionalAuth, validateBody(['industry', 'projectCostCr']), evaluateProject);
router.post('/quick-calc', calculateQuickMetrics);

// User's own assessments
router.get('/my-assessments', authenticateUser, getUserAssessments);

// Admin review
router.get('/all', authenticateUser, authorizeRoles('admin', 'ca'), getAllAssessments);

export default router;
