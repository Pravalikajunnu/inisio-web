import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';

const INITIAL_LEADS_DATA = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  }
];

export const getAllLeads = async (query = {}) => {
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

  // Auto-seed initial leads if collection is empty
  if (leads.length === 0 && !query.search && !query.filterSource) {
    await Lead.insertMany(INITIAL_LEADS_DATA);
    leads = await Lead.find(filter).sort({ createdAt: -1 });
  }

  return leads;
};

export const createLead = async (leadData) => {
  // Check if lead with same mobile exists in past hour
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

  // Trigger Admin Notification
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
  } catch (e) {
    console.log('Notification trigger error:', e.message);
  }

  return lead;
};

export const getLeadById = async (id) => {
  const lead = await Lead.findById(id);
  if (!lead) {
    throw new Error('Lead not found');
  }
  return lead;
};

export const updateLead = async (id, updates) => {
  const lead = await Lead.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!lead) {
    throw new Error('Lead not found');
  }
  return lead;
};

export const deleteLead = async (id) => {
  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) {
    throw new Error('Lead not found');
  }
  return lead;
};

export const clearAllLeads = async () => {
  await Lead.deleteMany({});
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
