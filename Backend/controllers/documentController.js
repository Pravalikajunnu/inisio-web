import fs from 'fs/promises';
import path from 'path';
import Document from '../models/Document.js';
import Lead from '../models/Lead.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const storageRoot = path.resolve(process.env.DOCUMENT_STORAGE_DIR || './storage/private');

const canAccess = (lead, user) => {
  if (!lead || !user) return false;
  if (['superadmin', 'admin', 'admin1', 'admin2', 'admin3'].includes(user.role)) return true;
  if (user.role === 'ca') return lead.assignedCA === user.email;
  if (user.role === 'dpr_consultant') return lead.dprAssignedTo === user.email;
  if (user.role === 'prosync' || user.role === 'prosync_admin') return lead.consultationAssignedTo === user.email || lead.consultationAssignedTo === 'Prosync';
  return String(lead.userId) === String(user._id);
};

export const uploadDocument = async (req, res, next) => {
  try {
    const { leadId, category } = req.body;
    if (!leadId || !category || !req.file) return sendError(res, 'leadId, category, and a file are required', 400);
    const lead = await Lead.findById(leadId);
    if (!canAccess(lead, req.user)) return sendError(res, 'You are not authorized to upload to this project', 403);

    const document = await Document.create({
      leadId,
      userId: lead.userId,
      category,
      originalName: req.file.originalname,
      storageName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
    lead.documentsUploaded = true;
    await lead.save();
    return sendSuccess(res, document, 'Document uploaded securely', 201);
  } catch (error) {
    next(error);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!canAccess(lead, req.user)) return sendError(res, 'You are not authorized to view these documents', 403);
    const documents = await Document.find({ leadId: lead._id }).sort({ createdAt: -1 });
    return sendSuccess(res, documents, 'Documents retrieved');
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return sendError(res, 'Document not found', 404);
    const lead = await Lead.findById(document.leadId);
    if (!canAccess(lead, req.user)) return sendError(res, 'You are not authorized to access this document', 403);
    const storageName = path.basename(document.storageName || '');
    if (!storageName) return sendError(res, 'Document file is unavailable', 404);
    const filePath = path.join(storageRoot, storageName);
    try {
      await fs.access(filePath);
    } catch {
      return sendError(res, 'Document file is unavailable', 404);
    }
    return res.download(filePath, document.originalName, {
      headers: { 'Content-Type': document.mimeType || 'application/octet-stream' },
    }, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
};