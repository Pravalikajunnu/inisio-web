import express from 'express';
import { createMessage, getMessages, updateMessageStatus } from '../controllers/contactController.js';
import { authenticateUser, authorizeRoles, restrictSuperAdminViewer } from '../middleware/authMiddleware.js';
import { validateBody, validateIndianPhone } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public contact form
router.post('/', validateBody(['fullName', 'email', 'phone', 'message']), validateIndianPhone('phone'), createMessage);

// Admin & Super Admin review
router.get('/', authenticateUser, authorizeRoles('admin', 'superadmin', 'ca'), getMessages);
router.put('/:id/status', authenticateUser, restrictSuperAdminViewer, authorizeRoles('admin'), updateMessageStatus);

export default router;
