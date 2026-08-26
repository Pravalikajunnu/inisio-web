import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

let memoryLeads = [];

export const getAllLeads = async (query = {}) => {
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

      const leads = await Lead.find(filter).sort({ createdAt: -1 });
      return leads;
    } catch (err) {
      console.warn('MongoDB query failed in getAllLeads, using memory fallback:', err.message);
    }
  }

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
  return results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
};

export const createLead = async (leadData) => {
  if (isDBConnected()) {
    try {
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

  // Memory fallback
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
  if (isDBConnected()) {
    try {
      const lead = await Lead.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (lead) return lead;
    } catch (err) {}
  }
  const idx = memoryLeads.findIndex((l) => String(l._id) === String(id));
  if (idx === -1) throw new Error('Lead not found');
  memoryLeads[idx] = { ...memoryLeads[idx], ...updates, updatedAt: new Date() };
  return memoryLeads[idx];
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

