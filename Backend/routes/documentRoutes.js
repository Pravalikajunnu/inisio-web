import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { authenticateUser, restrictSuperAdminViewer } from '../middleware/authMiddleware.js';
import { uploadDocument, listDocuments, downloadDocument } from '../controllers/documentController.js';

const router = express.Router();
const storageRoot = path.resolve(
  process.env.DOCUMENT_STORAGE_DIR ||
  (path.join(process.cwd(), 'Backend', 'storage', 'private'))
);
fs.mkdirSync(storageRoot, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, storageRoot),
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(authenticateUser);
router.post('/upload', restrictSuperAdminViewer, upload.single('file'), uploadDocument);
router.get('/project/:leadId', listDocuments);
router.get('/:id/download', downloadDocument);

export default router;