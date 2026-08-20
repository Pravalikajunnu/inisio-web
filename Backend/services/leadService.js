import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

const INITIAL_LEADS_DATA = [
  {
    _id: 'lead_01',
    fullName: 'Suraj Kanu',
    mobile: '9848012345',
    email: 'kanusuraj15@gmail.com',
    projectName: 'Solar Panel Cell Manufacturing Unit',
    industry: 'Renewable Energy & Solar',
    location: 'Gujarat (Dholera SIR)',
    totalCostCr: '120',
    loanRequiredCr: '90',
    feasibilityScore: 92,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'TSIIC / Industrial Park Allotted',
    collateralStatus: 'Plant & Machinery Hypothecation',
    promoterExp: '12+ Years Manufacturing',
    notes: 'Downloaded Teaser PDF. Land acquired in Dholera SIR. Looking for SBI syndication consortium.',
    status: 'DPR Ready',
    createdAt: new Date(Date.now() - 2 * 3600000),
  },
  {
    _id: 'lead_02',
    fullName: 'Suraj Kanu',
    mobile: '9848012345',
    email: 'kanusuraj15@gmail.com',
    projectName: 'Bio-Pharma Formulation Plant',
    industry: 'Pharmaceuticals & APIs',
    location: 'Telangana (Genome Valley)',
    totalCostCr: '18.5',
    loanRequiredCr: '13.8',
    feasibilityScore: 88,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'Industrial Lease Signed',
    collateralStatus: 'Factory Premises & Fixed Assets',
    promoterExp: '10+ Years Pharma R&D',
    notes: 'Downloaded Teaser PDF. USFDA compliant formulation facility in Genome Valley.',
    status: 'In Appraisal',
    createdAt: new Date(Date.now() - 4 * 3600000),
  },
  {
    _id: 'lead_03',
    fullName: 'Pravalika junnu',
    mobile: '6302026462',
    email: 'pravalikajunnu14@gmail.com',
    projectName: 'Hotel Greenfield Resort & Convention',
    industry: 'Hospitality & Commercial',
    location: 'Hyderabad, Telangana',
    totalCostCr: '20',
    loanRequiredCr: '10',
    feasibilityScore: 90,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'Land Owned & Registered',
    collateralStatus: 'Prime Land & Building Mortgage',
    promoterExp: '8+ Years Hospitality & Infrastructure',
    notes: 'Downloaded Teaser PDF. Interested in Debt Syndication for 50% debt component.',
    status: 'In Appraisal',
    createdAt: new Date(Date.now() - 8 * 3600000),
  },
  {
    _id: 'lead_04',
    fullName: 'Rajesh Patel',
    mobile: '9825011223',
    email: 'rajesh.patel@dahejchem.com',
    projectName: 'High-Purity Chemical Refinery',
    industry: 'Specialty Chemicals',
    location: 'Gujarat (Dahej PCPIR)',
    totalCostCr: '34',
    loanRequiredCr: '25.5',
    feasibilityScore: 92,
    bankabilityRating: 'A+',
    source: 'PDF Teaser Downloaded',
    downloadedPDF: true,
    landStatus: 'GIDC Land Allotted',
    collateralStatus: 'Factory & Heavy Distillation Columns',
    promoterExp: '15+ Years Chemical Engineering',
    notes: 'Downloaded Teaser PDF. TEFR approved by CA desk.',
    status: 'DPR Ready',
    createdAt: new Date(Date.now() - 24 * 3600000),
  }
];

let memoryLeads = [...INITIAL_LEADS_DATA];

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

      let leads = await Lead.find(filter).sort({ createdAt: -1 });
      if (leads.length === 0 && !query.search && !query.filterSource) {
        await Lead.insertMany(INITIAL_LEADS_DATA).catch(() => {});
        leads = await Lead.find(filter).sort({ createdAt: -1 });
      }
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
      const recent = await Lead.findOne({
        mobile: leadData.mobile,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
      });

      let lead;
      if (recent) {
        Object.assign(recent, leadData);
        lead = await recent.save();
      } else {
        lead = await Lead.create({
          ...leadData,
          timestamp: new Date(),
        });
      }

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
  const existingIdx = memoryLeads.findIndex((l) => l.mobile === leadData.mobile);
  let created;
  if (existingIdx >= 0) {
    memoryLeads[existingIdx] = { ...memoryLeads[existingIdx], ...leadData, updatedAt: new Date() };
    created = memoryLeads[existingIdx];
  } else {
    created = {
      _id: `lead_${Date.now()}`,
      ...leadData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryLeads.unshift(created);
  }
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

