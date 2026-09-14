import express from 'express';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  clearAllLeads,
  assignLead,
  updateLeadProgress,
} from '../controllers/leadController.js';
import { authenticateUser, authorizeRoles, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody, validateIndianPhone } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public submission
router.post('/', optionalAuth, validateBody(['fullName', 'mobile', 'email']), validateIndianPhone('mobile'), createLead);

// Lead retrieval & management (Admins & CAs)
router.get('/', authenticateUser, getLeads);
router.get('/:id', authenticateUser, getLeadById);
router.put('/:id/assignment', authenticateUser, authorizeRoles('superadmin'), assignLead);
router.put('/:id/progress', authenticateUser, updateLeadProgress);
router.put('/:id', authenticateUser, validateIndianPhone('mobile'), updateLead);
router.delete('/clear-all', authenticateUser, authorizeRoles('superadmin'), clearAllLeads);
router.delete('/:id', authenticateUser, authorizeRoles('superadmin'), deleteLead);

export default router;
