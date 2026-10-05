import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { isAuthorizedAdminEmail } from '../utils/memoryUserStore.js';

let memoryLeads = [];

const isSuperAdminOrAdmin = (role = '', email = '') => {
  return (
    ['superadmin', 'admin', 'admin1', 'admin2', 'admin3'].includes(role) ||
    isAuthorizedAdminEmail(email)
  );
};

const isAssignedToTeamMember = (assignment, requester, team) => {
  const assigned = String(assignment || '').trim().toLowerCase();
  const identities = [requester?.email, requester?.name].map((value) => String(value || '').trim().toLowerCase());
  return identities.includes(assigned) || assigned === team || assigned.startsWith(`${team}:`);
};

const canAccessLead = (lead, requester) => {
  if (!requester) return true; // Default view if unauthenticated query
  if (isSuperAdminOrAdmin(requester.role, requester.email)) return true;
  if (requester.role === 'ca') return isAssignedToTeamMember(lead.assignedCA, requester, 'ca');
  if (requester.role === 'dpr_consultant') return isAssignedToTeamMember(lead.dprAssignedTo, requester, 'dpr');
  if (requester.role === 'prosync' || requester.role === 'prosync_admin') {
    return isAssignedToTeamMember(lead.consultationAssignedTo, requester, 'prosync');
  }
  return String(lead.userId) === String(requester._id) || (lead.email && requester.email && lead.email.toLowerCase() === requester.email.toLowerCase());
};

export const getAllLeads = async (query = {}, requester = null) => {
  let leadsList = [];
  const isAdmin = isSuperAdminOrAdmin(requester?.role, requester?.email);

  if (isDBConnected()) {
    try {
      let filter = {};
      if (!isAdmin && requester?.role === 'user') {
        if (requester.email) {
          filter.$or = [
            { userId: requester._id },
            { email: { $regex: new RegExp(`^${requester.email.trim()}$`, 'i') } }
          ];
        } else {
          filter.userId = requester._id;
        }
      } else if (!isAdmin && requester?.role === 'ca') {
        filter.assignedCA = { $in: [requester.email, requester.name, /^ca:/i] };
      } else if (!isAdmin && requester?.role === 'dpr_consultant') {
        filter.dprAssignedTo = { $in: [requester.email, requester.name, /^dpr:/i] };
      } else if (!isAdmin && (requester?.role === 'prosync' || requester?.role === 'prosync_admin')) {
        filter.consultationAssignedTo = { $in: [requester.email, requester.name, 'Prosync', /^prosync:/i] };
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

      // Fetch all Lead documents
      const dbLeads = await Lead.find(filter).sort({ updatedAt: -1, createdAt: -1 });

      // For admin / superadmin view, also synchronize standalone Project records so nothing in DB is omitted
      let dbProjectsAsLeads = [];
      if (isAdmin || !requester) {
        try {
          const dbProjects = await Project.find({}).sort({ updatedAt: -1 });
          const existingLeadIds = new Set(dbLeads.map((l) => String(l._id)));
          const existingNames = new Set(dbLeads.map((l) => `${(l.email || '').toLowerCase()}__${(l.projectName || '').toLowerCase()}`));

          dbProjectsAsLeads = dbProjects
            .filter((p) => {
              const key = `${(p.email || '').toLowerCase()}__${(p.projectName || '').toLowerCase()}`;
              return !existingLeadIds.has(String(p._id)) && !existingNames.has(key);
            })
            .map((p) => ({
              _id: p._id,
              userId: p.userId,
              fullName: p.promoterName || 'Promoter',
              mobile: p.mobile || '',
              email: p.email || '',
              projectName: p.projectName || 'Greenfield Project',
              industry: p.industry || 'Manufacturing',
              location: p.location || 'India',
              totalCostCr: p.capexCr || 0,
              loanRequiredCr: p.loanCr || 0,
              promoterContribCr: p.equityCr || 0,
              feasibilityScore: p.feasibilityScore || 85,
              bankabilityRating: p.bankabilityRating || 'A',
              dscrEstimate: p.dscr || 1.45,
              source: 'Direct Project Registry',
              downloadedPDF: false,
              status: p.status || 'Active',
              createdAt: p.createdAt || new Date(),
              updatedAt: p.updatedAt || new Date(),
            }));
        } catch (projErr) {
          console.warn('[LeadService] Could not aggregate Project documents:', projErr.message);
        }
      }

      leadsList = [...dbLeads, ...dbProjectsAsLeads];
    } catch (err) {
      console.warn('MongoDB query failed in getAllLeads, using memory fallback:', err.message);
      leadsList = [...memoryLeads];
    }
  } else {
    leadsList = [...memoryLeads];
  }

  // Apply in-memory security filtering (applies to memory store AND as defense-in-depth)
  let results = [...leadsList];

  if (!isAdmin && requester?.role === 'user') {
    const reqEmail = (requester.email || '').toLowerCase().trim();
    const reqId = String(requester._id || requester.id || '');
    results = results.filter((l) => {
      const lEmail = (l.email || '').toLowerCase().trim();
      const lUserId = String(l.userId || '');
      return (reqEmail && lEmail === reqEmail) || (reqId && lUserId === reqId);
    });
  } else if (!isAdmin && requester?.role === 'ca') {
    results = results.filter((lead) => isAssignedToTeamMember(lead.assignedCA, requester, 'ca'));
  } else if (!isAdmin && requester?.role === 'dpr_consultant') {
    results = results.filter((lead) => isAssignedToTeamMember(lead.dprAssignedTo, requester, 'dpr'));
  } else if (!isAdmin && (requester?.role === 'prosync' || requester?.role === 'prosync_admin')) {
    results = results.filter((lead) => isAssignedToTeamMember(lead.consultationAssignedTo, requester, 'prosync'));
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

  // Sort by recent activity
  results.sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || b.timestamp || 0).getTime() -
      new Date(a.updatedAt || a.createdAt || a.timestamp || 0).getTime()
  );

  // Deduplicate strictly by unique database ID so every individual project in the database is displayed
  const uniqueById = new Map();
  results.forEach((item) => {
    const idKey = String(item._id || item.id);
    if (!uniqueById.has(idKey)) {
      uniqueById.set(idKey, item);
    }
  });

  return Array.from(uniqueById.values());
};

export const createLead = async (leadData, userId = null) => {
  const normEmail = (leadData.email || '').trim().toLowerCase();
  const normProject = (leadData.projectName || '').trim().toLowerCase();

  if (isDBConnected()) {
    try {
      // If updating an existing lead with matching ID
      if (leadData._id || leadData.id) {
        const leadId = leadData._id || leadData.id;
        if (mongoose.Types.ObjectId.isValid(leadId)) {
          const updated = await Lead.findByIdAndUpdate(
            leadId,
            { ...leadData, userId: userId || undefined, updatedAt: new Date() },
            { new: true }
          );
          if (updated) return updated;
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

  const created = {
    _id: leadData.id || `lead_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
  if (!['admin', 'admin1', 'admin2', 'admin3'].includes(requester?.role) && !isAuthorizedAdminEmail(requester?.email)) {
    throw new Error('Only an Admin can assign project work');
  }
  if (isDBConnected()) {
    const lead = await Lead.findById(id);
    if (!lead) throw new Error('Lead not found');
    if (dprAssignedTo !== undefined) lead.dprAssignedTo = dprAssignedTo;
    if (consultationAssignedTo !== undefined) {
      lead.consultationAssignedTo = consultationAssignedTo;
      if (consultationAssignedTo) lead.consultationStatus = 'New';
    }
    lead.assignedAt = new Date().toISOString();
    return lead.save();
  }

  const idx = memoryLeads.findIndex((l) => String(l._id) === String(id) || String(l.id) === String(id));
  if (idx === -1) throw new Error('Lead not found');
  if (dprAssignedTo !== undefined) memoryLeads[idx].dprAssignedTo = dprAssignedTo;
  if (consultationAssignedTo !== undefined) {
    memoryLeads[idx].consultationAssignedTo = consultationAssignedTo;
    if (consultationAssignedTo) memoryLeads[idx].consultationStatus = 'New';
  }
  memoryLeads[idx].assignedAt = new Date().toISOString();
  return memoryLeads[idx];
};

export const updateLeadProgress = async (id, progress, requester) => {
  if (requester?.role === 'superadmin') throw new Error('Super Admin has view-only permissions. Modifying progress requires an Admin account.');
  const fields = ['assessmentCompleted', 'documentsUploaded', 'dprCompleted', 'bankApplicationSubmitted', 'isFunded'];

  if (isDBConnected()) {
    const lead = await Lead.findById(id);
    if (!lead || !canAccessLead(lead, requester)) throw new Error('Project not found or access denied');

    fields.forEach((field) => {
      if (progress[field] !== undefined) lead[field] = Boolean(progress[field]);
    });
    if (lead.bankApplicationSubmitted) lead.bankAppliedAt = lead.bankAppliedAt || new Date().toISOString();
    if (lead.isFunded) lead.fundingDisbursedAt = lead.fundingDisbursedAt || new Date().toISOString();
    lead.successProbability = lead.isFunded
      ? 100
      : 25 + (lead.assessmentCompleted ? 15 : 0) + (lead.documentsUploaded ? 15 : 0) + (lead.dprCompleted ? 20 : 0) + (lead.bankApplicationSubmitted ? 25 : 0);
    return lead.save();
  }

  const idx = memoryLeads.findIndex((l) => String(l._id) === String(id) || String(l.id) === String(id));
  if (idx === -1 || !canAccessLead(memoryLeads[idx], requester)) throw new Error('Project not found or access denied');

  fields.forEach((field) => {
    if (progress[field] !== undefined) memoryLeads[idx][field] = Boolean(progress[field]);
  });
  if (memoryLeads[idx].bankApplicationSubmitted) memoryLeads[idx].bankAppliedAt = memoryLeads[idx].bankAppliedAt || new Date().toISOString();
  if (memoryLeads[idx].isFunded) memoryLeads[idx].fundingDisbursedAt = memoryLeads[idx].fundingDisbursedAt || new Date().toISOString();
  memoryLeads[idx].successProbability = memoryLeads[idx].isFunded
    ? 100
    : 25 + (memoryLeads[idx].assessmentCompleted ? 15 : 0) + (memoryLeads[idx].documentsUploaded ? 15 : 0) + (memoryLeads[idx].dprCompleted ? 20 : 0) + (memoryLeads[idx].bankApplicationSubmitted ? 25 : 0);
  return memoryLeads[idx];
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
