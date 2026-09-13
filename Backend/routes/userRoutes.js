import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.use(authenticateUser);
router.use(authorizeRoles('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
