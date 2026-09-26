import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';

let memoryLeads = [];

const isSuperAdminOrAdmin = (role = '') => ['superadmin', 'admin', 'admin1', 'admin2', 'admin3'].includes(role);

const canAccessLead = (lead, requester) => {
  if (!requester) return false;
  if (isSuperAdminOrAdmin(requester.role)) return true;
  if (requester.role === 'ca') return lead.assignedCA === requester.email;
  if (requester.role === 'dpr_consultant') return lead.dprAssignedTo === requester.email;
  if (requester.role === 'prosync' || requester.role === 'prosync_admin') {
    return lead.consultationAssignedTo === requester.email || lead.consultationAssignedTo === 'Prosync';
  }
  return String(lead.userId) === String(requester._id) || (lead.email && requester.email && lead.email.toLowerCase() === requester.email.toLowerCase());
};

export const getAllLeads = async (query = {}, requester = null) => {
  let leadsList = [];
  if (isDBConnected()) {
    try {
      let filter = {};
      if (requester?.role === 'user') {
        if (requester.email) {
          filter.$or = [
            { userId: requester._id },
            { email: { $regex: new RegExp(`^${requester.email.trim()}$`, 'i') } }
          ];
        } else {
          filter.userId = requester._id;
        }
      } else if (requester?.role === 'ca') {
        filter.assignedCA = requester.email;
      } else if (requester?.role === 'dpr_consultant') {
        filter.dprAssignedTo = requester.email;
      } else if (requester?.role === 'prosync' || requester?.role === 'prosync_admin') {
        filter.consultationAssignedTo = { $in: [requester.email, 'Prosync'] };
      }
      if (query.email) {
        filter.email = { $regex: new RegExp(`^${query.email.trim()}$`, 'i') };
      }
      if (query.search) {
        const s = query.search;
        filter.$or = [
          { fullName: { $regex: s, $options: 'i' } },
          { mobile: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
          { projectName: { $regex: s, $options: 'i' } },
          { industry: { $regex: s, $options: 'i' } },
        ];
      }
      if (query.filterSource === 'PDF') {
        filter.downloadedPDF = true;
      } else if (query.filterSource === 'FORM') {
        filter.downloadedPDF = false;
      }

      leadsList = await Lead.find(filter).sort({ updatedAt: -1, createdAt: -1 });
    } catch (err) {
      console.warn('MongoDB query failed in getAllLeads, using memory fallback:', err.message);
      leadsList = [...memoryLeads];
    }
  } else {
    leadsList = [...memoryLeads];
  }

  // Apply in-memory security filtering (applies to memory store AND as defense-in-depth)
  let results = [...leadsList];

  if (requester?.role === 'user') {
    const reqEmail = (requester.email || '').toLowerCase().trim();
    const reqId = String(requester._id || requester.id || '');
    results = results.filter((l) => {
      const lEmail = (l.email || '').toLowerCase().trim();
      const lUserId = String(l.userId || '');
      return (reqEmail && lEmail === reqEmail) || (reqId && lUserId === reqId);
    });
  } else if (requester?.role === 'ca') {
    const caEmail = (requester.email || '').toLowerCase().trim();
    results = results.filter((l) => (l.assignedCA || '').toLowerCase().trim() === caEmail);
  } else if (requester?.role === 'dpr_consultant') {
    const dprEmail = (requester.email || '').toLowerCase().trim();
    results = results.filter((l) => (l.dprAssignedTo || '').toLowerCase().trim() === dprEmail);
  } else if (requester?.role === 'prosync' || requester?.role === 'prosync_admin') {
    const pEmail = (requester.email || '').toLowerCase().trim();
    results = results.filter((l) => {
      const assigned = (l.consultationAssignedTo || '').toLowerCase().trim();
      return assigned === pEmail || assigned === 'prosync';
    });
  }

  if (query.email) {
    const em = query.email.toLowerCase().trim();
    results = results.filter((l) => (l.email || '').toLowerCase().trim() === em);
  }

  if (query.search) {
    const s = query.search.toLowerCase();
    results = results.filter(
      (l) =>
        (l.fullName && l.fullName.toLowerCase().includes(s)) ||
        (l.mobile && l.mobile.includes(s)) ||
        (l.email && l.email.toLowerCase().includes(s)) ||
        (l.projectName && l.projectName.toLowerCase().includes(s)) ||
        (l.industry && l.industry.toLowerCase().includes(s))
    );
  }
  if (query.filterSource === 'PDF') {
    results = results.filter((l) => l.downloadedPDF);
  } else if (query.filterSource === 'FORM') {
    results = results.filter((l) => !l.downloadedPDF);
  }

  leadsList = results.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());

  // Deduplicate records for the same user with identical or uppercase/lowercase project name
  const dedupedMap = new Map();
  leadsList.forEach((lead) => {
    const emailKey = (lead.email || '').trim().toLowerCase();
    const nameKey = (lead.projectName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = emailKey && nameKey ? `${emailKey}__${nameKey}` : String(lead._id || lead.id);
    
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, lead);
    } else {
      // If the existing entry is less detailed or older, merge/keep the better one
      const existing = dedupedMap.get(key);
      const existingHasDetails = existing.financials || (existing.customCostComponents && existing.customCostComponents.length > 0);
      const currentHasDetails = lead.financials || (lead.customCostComponents && lead.customCostComponents.length > 0);
      if (!existingHasDetails && currentHasDetails) {
        dedupedMap.set(key, lead);
      }
    }
  });

  return Array.from(dedupedMap.values());
};

export const createLead = async (leadData, userId = null) => {
  const normEmail = (leadData.email || '').trim().toLowerCase();
  const normProject = (leadData.projectName || '').trim().toLowerCase();

  if (isDBConnected()) {
    try {
      // Deduplicate: If an existing lead from the same user with same project name exists, update it
      if (normEmail && normProject) {
        const existing = await Lead.findOne({
          email: { $regex: new RegExp(`^${normEmail}$`, 'i') },
          projectName: { $regex: new RegExp(`^${normProject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (existing) {
          const updated = await Lead.findByIdAndUpdate(
            existing._id,
            { ...leadData, userId: userId || existing.userId, updatedAt: new Date() },
            { new: true }
          );
          return updated;
        }
      }

      const lead = await Lead.create({
        ...leadData,
        userId,
        timestamp: new Date(),
      });

      try {
        const isTeaser = lead.downloadedPDF || lead.source?.includes('PDF');
        await Notification.create({
          type: isTeaser ? 'TEASER_DOWNLOAD' : 'LEAD_CREATED',
          title: isTeaser ? 'Project Teaser Downloaded' : 'New Greenfield Lead Received',
          message: `${lead.fullName} (${lead.email || lead.mobile}) ${isTeaser ? 'downloaded Teaser PDF for' : 'submitted project'} '${lead.projectName}' (₹${lead.totalCostCr} Cr).`,
          userEmail: lead.email,
          userName: lead.fullName,
          projectName: lead.projectName,
          read: false,
          metadata: { totalCostCr: lead.totalCostCr, loanRequiredCr: lead.loanRequiredCr, source: lead.source }
        });
      } catch (e) {}

      return lead;
    } catch (err) {
      console.warn('MongoDB create failed in createLead, storing in memory fallback:', err.message);
    }
  }

  // Memory fallback deduplication
  if (normEmail && normProject) {
    const existingIdx = memoryLeads.findIndex(
      (l) => (l.email || '').toLowerCase() === normEmail && (l.projectName || '').trim().toLowerCase() === normProject
    );
    if (existingIdx !== -1) {
      memoryLeads[existingIdx] = {
        ...memoryLeads[existingIdx],
        ...leadData,
        updatedAt: new Date(),
      };
      return memoryLeads[existingIdx];
    }
  }

  const created = {
    _id: `lead_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    ...leadData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryLeads.unshift(created);
  return created;
};

export const getLeadById = async (id, requester = null) => {
  if (isDBConnected()) {
    try {
      const lead = await Lead.findById(id);
      if (lead && canAccessLead(lead, requester)) return lead;
    } catch (err) {}
  }
  const found = memoryLeads.find((l) => String(l._id) === String(id));
  if (!found) throw new Error('Lead not found');
  return found;
};

export const updateLead = async (id, updates, requester = null) => {
  if (requester?.role === 'superadmin') {
    throw new Error('Super Admin has view-only permissions. Modifying data requires an Admin account.');
  }
  const normEmail = (updates.email || '').trim().toLowerCase();
  const normProject = (updates.projectName || '').trim().toLowerCase();

  if (isDBConnected()) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const lead = await Lead.findById(id);
        if (lead && canAccessLead(lead, requester)) {
          Object.assign(lead, updates);
          lead.updatedAt = new Date();
          return await lead.save();
        }
      }

      // Try find by exact string id
      let lead = await Lead.findOne({ _id: id });
      if (lead && canAccessLead(lead, requester)) {
        Object.assign(lead, updates);
        lead.updatedAt = new Date();
        await lead.save();
        return lead;
      }

      // Fallback: match by email and projectName if provided in updates
      if (normEmail && normProject) {
        const existing = await Lead.findOne({
          email: { $regex: new RegExp(`^${normEmail}$`, 'i') },
          projectName: { $regex: new RegExp(`^${normProject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
        if (existing) {
          Object.assign(existing, updates);
          existing.updatedAt = new Date();
          await existing.save();
          return existing;
        }
      }
    } catch (err) {
      console.warn('MongoDB updateLead error, attempting fallback:', err.message);
    }
  }

  let idx = memoryLeads.findIndex((l) => String(l._id) === String(id) || String(l.id) === String(id));
  if (idx === -1 && normEmail && normProject) {
    idx = memoryLeads.findIndex(
      (l) => (l.email || '').toLowerCase() === normEmail && (l.projectName || '').trim().toLowerCase() === normProject
    );
  }

  if (idx !== -1) {
    memoryLeads[idx] = { ...memoryLeads[idx], ...updates, updatedAt: new Date() };
    return memoryLeads[idx];
  }

  // If not found in memory, create/save as updated lead
  const created = {
    _id: id || `lead_${Date.now()}`,
    ...updates,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryLeads.unshift(created);
  return created;
};

export const assignLead = async (id, { dprAssignedTo, consultationAssignedTo }, requester) => {
  if (requester?.role === 'superadmin') throw new Error('Super Admin has view-only permissions. Team assignment requires an Admin account.');
  if (!['admin', 'admin1', 'admin2', 'admin3'].includes(requester?.role)) throw new Error('Only an Admin can assign project work');
  if (!isDBConnected()) throw new Error('Database unavailable; assignments require MongoDB');

  const lead = await Lead.findById(id);
  if (!lead) throw new Error('Lead not found');
  if (dprAssignedTo !== undefined) lead.dprAssignedTo = dprAssignedTo;
  if (consultationAssignedTo !== undefined) {
    lead.consultationAssignedTo = consultationAssignedTo;
    if (consultationAssignedTo) lead.consultationStatus = 'New';
  }
  lead.assignedAt = new Date().toISOString();
  return lead.save();
};

export const updateLeadProgress = async (id, progress, requester) => {
  if (requester?.role === 'superadmin') throw new Error('Super Admin has view-only permissions. Modifying progress requires an Admin account.');
  if (!isDBConnected()) throw new Error('Database unavailable; project progress requires MongoDB');
  const lead = await Lead.findById(id);
  if (!lead || !canAccessLead(lead, requester)) throw new Error('Project not found or access denied');

  const fields = ['assessmentCompleted', 'documentsUploaded', 'dprCompleted', 'bankApplicationSubmitted', 'isFunded'];
  fields.forEach((field) => {
    if (progress[field] !== undefined) lead[field] = Boolean(progress[field]);
  });
  if (lead.bankApplicationSubmitted) lead.bankAppliedAt = lead.bankAppliedAt || new Date().toISOString();
  if (lead.isFunded) lead.fundingDisbursedAt = lead.fundingDisbursedAt || new Date().toISOString();
  lead.successProbability = lead.isFunded
    ? 100
    : 25 + (lead.assessmentCompleted ? 15 : 0) + (lead.documentsUploaded ? 15 : 0) + (lead.dprCompleted ? 20 : 0) + (lead.bankApplicationSubmitted ? 25 : 0);
  return lead.save();
};

export const deleteLead = async (id, requester) => {
  if (requester?.role === 'superadmin') throw new Error('Super Admin has view-only permissions. Deletion requires an Admin account.');
  if (isDBConnected()) {
    try {
      const lead = await Lead.findByIdAndDelete(id);
      if (lead) return lead;
    } catch (err) {}
  }
  const idx = memoryLeads.findIndex((l) => String(l._id) === String(id));
  if (idx === -1) throw new Error('Lead not found');
  const removed = memoryLeads.splice(idx, 1)[0];
  return removed;
};

export const clearAllLeads = async (requester) => {
  if (requester?.role === 'superadmin') throw new Error('Super Admin has view-only permissions. Clearing leads requires an Admin account.');
  if (isDBConnected()) {
    try {
      await Lead.deleteMany({});
    } catch (err) {}
  }
  memoryLeads = [];
  return { message: 'All leads cleared successfully' };
};

export default {
  getAllLeads,
  createLead,
  getLeadById,
  updateLead,
  assignLead,
  updateLeadProgress,
  deleteLead,
  clearAllLeads,
};

