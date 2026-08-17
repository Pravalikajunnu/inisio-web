import express from 'express';
import { getAllServices, getServiceBySlug, createService } from '../controllers/serviceController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:slug', getServiceBySlug);
router.post('/', authenticateUser, authorizeRoles('admin'), createService);

export default router;
