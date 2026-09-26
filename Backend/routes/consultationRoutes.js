import express from 'express';
import {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultationStatus,
} from '../controllers/consultationController.js';
import { authenticateUser, authorizeRoles, restrictSuperAdminViewer } from '../middleware/authMiddleware.js';
import { validateBody, validateIndianPhone } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public booking
router.post('/', validateBody(['fullName', 'phone']), validateIndianPhone('phone'), createConsultation);

// Advisor & Admin routes (Superadmin can view, but only admin/ca/prosync_admin can update status)
router.get('/', authenticateUser, authorizeRoles('admin', 'superadmin', 'ca', 'prosync_admin'), getConsultations);
router.get('/:id', authenticateUser, authorizeRoles('admin', 'superadmin', 'ca', 'prosync_admin'), getConsultationById);
router.put('/:id/status', authenticateUser, restrictSuperAdminViewer, authorizeRoles('admin', 'ca', 'prosync_admin'), updateConsultationStatus);

export default router;
