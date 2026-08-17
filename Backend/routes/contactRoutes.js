import express from 'express';
import { createMessage, getMessages, updateMessageStatus } from '../controllers/contactController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Public contact form
router.post('/', validateBody(['fullName', 'email', 'phone', 'message']), createMessage);

// Admin review
router.get('/', authenticateUser, authorizeRoles('admin', 'ca'), getMessages);
router.put('/:id/status', authenticateUser, authorizeRoles('admin'), updateMessageStatus);

export default router;
