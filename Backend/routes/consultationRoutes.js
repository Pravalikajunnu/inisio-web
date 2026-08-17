import express from 'express';
import {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultationStatus,
} from '../controllers/consultationController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public booking
router.post('/', validateBody(['fullName', 'email', 'phone']), createConsultation);

// Advisor & Admin routes
router.get('/', authenticateUser, authorizeRoles('admin', 'ca'), getConsultations);
router.get('/:id', authenticateUser, authorizeRoles('admin', 'ca'), getConsultationById);
router.put('/:id/status', authenticateUser, authorizeRoles('admin', 'ca'), updateConsultationStatus);

export default router;
