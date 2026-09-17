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
import { authenticateUser, authorizeRoles, restrictSuperAdminViewer, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody, validateIndianPhone } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public submission
router.post('/', optionalAuth, validateBody(['fullName', 'mobile', 'email']), validateIndianPhone('mobile'), createLead);

// Lead retrieval & management (Admins & CAs & Super Admin viewer)
router.get('/', authenticateUser, getLeads);
router.get('/:id', authenticateUser, getLeadById);
router.put('/:id/assignment', authenticateUser, restrictSuperAdminViewer, authorizeRoles('admin', 'admin1', 'admin2', 'admin3'), assignLead);
router.put('/:id/progress', authenticateUser, restrictSuperAdminViewer, updateLeadProgress);
router.put('/:id', authenticateUser, restrictSuperAdminViewer, validateIndianPhone('mobile'), updateLead);
router.delete('/clear-all', authenticateUser, restrictSuperAdminViewer, authorizeRoles('admin', 'admin1', 'admin2', 'admin3'), clearAllLeads);
router.delete('/:id', authenticateUser, restrictSuperAdminViewer, authorizeRoles('admin', 'admin1', 'admin2', 'admin3'), deleteLead);

export default router;
