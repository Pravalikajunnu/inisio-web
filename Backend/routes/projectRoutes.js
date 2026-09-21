import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProjectAudit,
  deleteProject,
} from '../controllers/projectController.js';
import { authenticateUser, authorizeRoles, restrictSuperAdminViewer, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', optionalAuth, validateBody(['promoterName', 'projectName', 'industry', 'capexCr', 'loanCr']), createProject);
router.put('/:id/audit', authenticateUser, restrictSuperAdminViewer, authorizeRoles('admin', 'ca'), updateProjectAudit);
router.delete('/:id', authenticateUser, restrictSuperAdminViewer, authorizeRoles('admin'), deleteProject);

export default router;
