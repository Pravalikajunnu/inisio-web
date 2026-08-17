import express from 'express';
import { getAllIndustries, getIndustryBySlug, createIndustry } from '../controllers/industryController.js';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllIndustries);
router.get('/:slug', getIndustryBySlug);
router.post('/', authenticateUser, authorizeRoles('admin'), createIndustry);

export default router;
