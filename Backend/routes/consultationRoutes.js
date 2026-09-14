import express from 'express';
import {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultationStatus,
} from '../controllers/consultationController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateBody, validateIndianPhone } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public booking
router.post('/', validateBody(['fullName', 'email', 'phone']), validateIndianPhone('phone'), createConsultation);

// Advisor & Admin routes
router.get('/', authenticateUser, authorizeRoles('superadmin', 'ca', 'prosync_admin'), getConsultations);
router.get('/:id', authenticateUser, authorizeRoles('superadmin', 'ca', 'prosync_admin'), getConsultationById);
router.put('/:id/status', authenticateUser, authorizeRoles('superadmin', 'ca', 'prosync_admin'), updateConsultationStatus);

export default router;
