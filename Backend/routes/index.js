import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import leadRoutes from './leadRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import projectRoutes from './projectRoutes.js';
import industryRoutes from './industryRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import contactRoutes from './contactRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

// Root API health & metadata
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Inisio Greenfield Consultancy REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/consultations', consultationRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/projects', projectRoutes);
router.use('/industries', industryRoutes);
router.use('/services', serviceRoutes);
router.use('/contact', contactRoutes);
router.use('/notifications', notificationRoutes);

export default router;
