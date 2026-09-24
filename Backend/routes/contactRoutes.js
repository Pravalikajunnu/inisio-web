import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  getEnquiryDetails,
  updateEnquiry,
  deleteEnquiry,
  updateMessageStatus,
} from '../controllers/contactController.js';
import { authenticateUser, authorizeRoles, restrictSuperAdminViewer } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Route
 * POST /api/contact
 */
router.post('/', createEnquiry);

/**
 * Admin Routes
 * Protected with Authentication & Role-based Authorization
 */
const allowedAdminRoles = ['admin', 'superadmin', 'ca', 'prosync_admin', 'prosync', 'admin1', 'admin2', 'admin3'];

router.get('/', authenticateUser, authorizeRoles(...allowedAdminRoles), getEnquiries);
router.get('/:id', authenticateUser, authorizeRoles(...allowedAdminRoles), getEnquiryDetails);
router.put('/:id', authenticateUser, restrictSuperAdminViewer, authorizeRoles(...allowedAdminRoles), updateEnquiry);
router.put('/:id/status', authenticateUser, restrictSuperAdminViewer, authorizeRoles(...allowedAdminRoles), updateMessageStatus);
router.delete('/:id', authenticateUser, restrictSuperAdminViewer, authorizeRoles(...allowedAdminRoles), deleteEnquiry);

export default router;
