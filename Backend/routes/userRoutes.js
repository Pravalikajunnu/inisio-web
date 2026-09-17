import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateUser, authorizeRoles, restrictSuperAdminViewer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authenticate all user routes
router.use(authenticateUser);

// Viewing routes (Admin & Super Admin Viewer)
router.get('/', authorizeRoles('admin', 'superadmin'), getAllUsers);
router.get('/:id', authorizeRoles('admin', 'superadmin'), getUserById);

// Modification routes (Admin only)
router.put('/:id/role', restrictSuperAdminViewer, authorizeRoles('admin', 'admin1', 'admin2', 'admin3'), updateUserRole);
router.put('/:id/status', restrictSuperAdminViewer, authorizeRoles('admin', 'admin1', 'admin2', 'admin3'), updateUserStatus);
router.delete('/:id', restrictSuperAdminViewer, authorizeRoles('admin', 'admin1', 'admin2', 'admin3'), deleteUser);

export default router;
