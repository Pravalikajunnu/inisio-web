import express from 'express';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  clearAllLeads,
} from '../controllers/leadController.js';
import { authenticateUser, authorizeRoles, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public submission
router.post('/', validateBody(['fullName', 'mobile', 'email']), createLead);

// Lead retrieval & management (Admins & CAs)
router.get('/', optionalAuth, getLeads);
router.get('/:id', optionalAuth, getLeadById);
router.put('/:id', authenticateUser, authorizeRoles('admin', 'ca'), updateLead);
router.delete('/clear-all', authenticateUser, authorizeRoles('admin'), clearAllLeads);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteLead);

export default router;
