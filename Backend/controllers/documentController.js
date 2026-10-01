import fs from 'fs/promises';
import path from 'path';
import Document from '../models/Document.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const storageRoot = path.resolve(
  process.env.DOCUMENT_STORAGE_DIR ||
  (path.join(process.cwd(), 'Backend', 'storage', 'private'))
);

const matchesAssignment = (assignment, user, team) => {
  const assigned = String(assignment || '').trim().toLowerCase();
  const identities = [user?.email, user?.name].map((value) => String(value || '').trim().toLowerCase());
  return identities.includes(assigned) || assigned === team || assigned.startsWith(`${team}:`) || (team === 'ca' && assigned.startsWith('ca '));
};

const canAccess = (project, user) => {
  if (!project || !user) return false;
  if (['superadmin', 'admin', 'admin1', 'admin2', 'admin3'].includes(user.role)) return true;
  if (user.role === 'ca') return matchesAssignment(project.assignedCA, user, 'ca');
  if (user.role === 'dpr_consultant') return matchesAssignment(project.dprAssignedTo, user, 'dpr');
  if (user.role === 'prosync' || user.role === 'prosync_admin') return matchesAssignment(project.consultationAssignedTo, user, 'prosync');
  const leadEmail = String(project.email || '').trim().toLowerCase();
  const userEmail = String(user.email || '').trim().toLowerCase();
  return String(project.userId || '') === String(user._id || '') || Boolean(leadEmail && userEmail && leadEmail === userEmail);
};

const findProjectRecord = async (id) => {
  const lead = await Lead.findById(id).catch(() => null);
  if (lead) return { type: 'lead', record: lead };
  const project = await Project.findById(id).catch(() => null);
  return project ? { type: 'project', record: project } : null;
};

export const uploadDocument = async (req, res, next) => {
  try {
    const { leadId, category } = req.body;
    if (!leadId || !category || !req.file) return sendError(res, 'leadId, category, and a file are required', 400);
    const projectRecord = await findProjectRecord(leadId);
    if (!projectRecord) return sendError(res, 'Project not found', 404);
    const { type, record } = projectRecord;
    if (!canAccess(record, req.user)) return sendError(res, 'You are not authorized to upload to this project', 403);

    const document = await Document.create({
      ...(type === 'lead' ? { leadId: record._id } : { projectId: record._id }),
      userId: record.userId || req.user._id,
      category,
      originalName: req.file.originalname,
      storageName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    const uploadedAt = new Date().toISOString();
    const fileUrl = `/api/documents/${document._id}/download`;
    const documentEntry = {
      id: String(document._id),
      type: category,
      name: document.originalName,
      size: document.size,
      uploadedAt,
      fileUrl,
      status: 'Uploaded',
      dpdpConsent: true,
    };
    const uploadedDocuments = Array.isArray(record.uploadedDocuments) ? [...record.uploadedDocuments] : [];
    const existingIndex = uploadedDocuments.findIndex((item) => item.type === category || item.name === document.originalName);
    if (existingIndex >= 0) uploadedDocuments[existingIndex] = documentEntry;
    else uploadedDocuments.unshift(documentEntry);
    record.uploadedDocuments = uploadedDocuments;
    record.documentsUploaded = true;

    if (category === 'DPR') {
      record.dprFile = { name: document.originalName, size: document.size, uploadedAt, fileUrl };
    } else if (category === 'Financial Model') {
      record.cmaFile = { name: document.originalName, size: document.size, uploadedAt, fileUrl };
    }

    await record.save();
    return sendSuccess(res, document, 'Document uploaded securely', 201);
  } catch (error) {
    next(error);
  }
};

export const listDocuments = async (req, res, next) => {
  try {
    const projectRecord = await findProjectRecord(req.params.leadId);
    if (!projectRecord) return sendError(res, 'Project not found', 404);
    if (!canAccess(projectRecord.record, req.user)) return sendError(res, 'You are not authorized to view these documents', 403);
    const selector = projectRecord.type === 'lead'
      ? { leadId: projectRecord.record._id }
      : { projectId: projectRecord.record._id };
    const documents = await Document.find(selector).sort({ createdAt: -1 });
    return sendSuccess(res, documents, 'Documents retrieved');
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return sendError(res, 'Document not found', 404);
    const projectRecord = document.projectId
      ? { record: await Project.findById(document.projectId).catch(() => null) }
      : { record: await Lead.findById(document.leadId).catch(() => null) };
    if (!canAccess(projectRecord.record, req.user)) return sendError(res, 'You are not authorized to access this document', 403);
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