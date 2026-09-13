import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

let memoryLeads = [];

export const getAllLeads = async (query = {}) => {
  let leadsList = [];
  if (isDBConnected()) {
    try {
      let filter = {};
      if (query.email) {
        filter.email = { $regex: new RegExp(`^${query.email}$`, 'i') };
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
    // Memory fallback filtering
    let results = [...memoryLeads];
    if (query.email) {
      const em = query.email.toLowerCase();
      results = results.filter((l) => l.email && l.email.toLowerCase() === em);
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
  }

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

export const createLead = async (leadData) => {
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
            { ...leadData, updatedAt: new Date() },
            { new: true }
          );
          return updated;
        }
      }

      const lead = await Lead.create({
        ...leadData,
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

export const getLeadById = async (id) => {
  if (isDBConnected()) {
    try {
      const lead = await Lead.findById(id);
      if (lead) return lead;
    } catch (err) {}
  }
  const found = memoryLeads.find((l) => String(l._id) === String(id));
  if (!found) throw new Error('Lead not found');
  return found;
};

export const updateLead = async (id, updates) => {
  const normEmail = (updates.email || '').trim().toLowerCase();
  const normProject = (updates.projectName || '').trim().toLowerCase();

  if (isDBConnected()) {
    try {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const lead = await Lead.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
        if (lead) return lead;
      }

      // Try find by exact string id
      let lead = await Lead.findOne({ _id: id });
      if (lead) {
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

export const deleteLead = async (id) => {
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

export const clearAllLeads = async () => {
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
  deleteLead,
  clearAllLeads,
};

