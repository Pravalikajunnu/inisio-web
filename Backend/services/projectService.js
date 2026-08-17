import Project from '../models/Project.js';
import Notification from '../models/Notification.js';

const INITIAL_PROJECTS = [
  {
    promoterName: 'Suraj Kanu',
    email: 'kanusuraj15@gmail.com',
    mobile: '9848012345',
    projectName: 'Solar Panel Cell Manufacturing Unit',
    industry: 'Renewable Energy & Solar',
    location: 'Gujarat (Dholera SIR)',
    capexCr: 120.0,
    loanCr: 90.0,
    equityCr: 30.0,
    dscr: 1.55,
    feasibilityScore: 92,
    bankabilityRating: 'A+',
    subsidyEligible: true,
    status: 'CA Approved',
    assignedCA: 'CA Rajesh Sharma (FCA)',
    assignedBank: 'State Bank of India / Canara Bank',
    caReviewNotes: 'TEFR and 10-year financial cashflows audited. PLI solar scheme subsidy eligibility approved for ₹18 Cr capex incentive.',
  },
  {
    promoterName: 'Suraj Kanu',
    email: 'kanusuraj15@gmail.com',
    mobile: '9848012345',
    projectName: 'Bio-Pharma Formulation Plant',
    industry: 'Pharmaceuticals & Life Sciences',
    location: 'Telangana (Genome Valley)',
    capexCr: 18.5,
    loanCr: 13.8,
    equityCr: 4.7,
    dscr: 1.48,
    feasibilityScore: 88,
    bankabilityRating: 'A+',
    subsidyEligible: true,
    status: 'Pending Audit',
    assignedCA: 'CA Rajesh Sharma (FCA)',
    assignedBank: 'HDFC Bank / State Bank of India',
    caReviewNotes: 'Auditing machinery import quotes, USFDA validation schedule, and cleanroom civil estimates.',
  },
  {
    promoterName: 'Rajesh Patel',
    email: 'rajesh.patel@dahejchem.com',
    mobile: '9825011223',
    projectName: 'High-Purity Chemical Refinery',
    industry: 'Specialty Chemicals',
    location: 'Gujarat (Dahej PCPIR)',
    capexCr: 34.0,
    loanCr: 25.5,
    equityCr: 8.5,
    dscr: 1.62,
    feasibilityScore: 92,
    bankabilityRating: 'A+',
    subsidyEligible: true,
    status: 'CA Approved',
    assignedCA: 'CA Rajesh Sharma (FCA)',
    assignedBank: 'Punjab National Bank',
    caReviewNotes: 'TEFR and DSCR validated at 1.62. Approved for SBI debt syndication consortium.',
  },
  {
    promoterName: 'Sunita Reddy',
    email: 'sunita.reddy@precisionauto.in',
    mobile: '9849098765',
    projectName: 'Precision Auto Component Unit',
    industry: 'Auto Ancillary & EV Components',
    location: 'Karnataka (Hosur Border)',
    capexCr: 12.0,
    loanCr: 9.0,
    equityCr: 3.0,
    dscr: 1.35,
    feasibilityScore: 82,
    bankabilityRating: 'A',
    subsidyEligible: true,
    status: 'Pending Audit',
    assignedCA: 'CA Rajesh Sharma (FCA)',
    assignedBank: 'Bank of Baroda',
    caReviewNotes: 'Awaiting OEM off-take agreement letter and TS-iPASS pollution consent.',
  }
];

export const getProjects = async (filter = {}, userRole = 'admin', userId = null) => {
  let query = { ...filter };
  
  if (filter.email) {
    query = {
      $or: [
        { email: { $regex: new RegExp(`^${filter.email}$`, 'i') } },
        ...(userId ? [{ userId }] : [])
      ]
    };
  } else if (userRole === 'user' && userId) {
    query = {
      $or: [{ userId }, { email: 'kanusuraj15@gmail.com' }]
    };
  }

  let projects = await Project.find(query).sort({ updatedAt: -1 });

  // Auto seed initial projects if empty
  if (projects.length === 0 && (!filter || Object.keys(filter).length === 0)) {
    await Project.insertMany(INITIAL_PROJECTS);
    projects = await Project.find({}).sort({ updatedAt: -1 });
  }

  return projects;
};

export const createProject = async (projectData, userId = null) => {
  const project = await Project.create({
    ...projectData,
    userId: userId || null,
  });

  // Trigger Admin Notification
  try {
    await Notification.create({
      type: 'PROJECT_MODIFIED',
      title: 'New Greenfield Project Created',
      message: `${project.promoterName || 'Promoter'} (${project.email || 'N/A'}) created project '${project.projectName}' (₹${project.capexCr} Cr).`,
      userEmail: project.email,
      userName: project.promoterName,
      projectName: project.projectName,
      read: false,
      metadata: { capexCr: project.capexCr, loanCr: project.loanCr, status: project.status }
    });
  } catch (e) {
    console.log('Notification trigger error:', e.message);
  }

  return project;
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new Error('Project not found');
  }
  return project;
};

export const updateProjectAudit = async (id, status, caReviewNotes = '', assignedCA = '', updates = {}) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new Error('Project not found');
  }

  if (status) project.status = status;
  if (caReviewNotes) project.caReviewNotes = caReviewNotes;
  if (assignedCA) project.assignedCA = assignedCA;
  
  if (updates) {
    if (updates.capexCr !== undefined) project.capexCr = updates.capexCr;
    if (updates.loanCr !== undefined) project.loanCr = updates.loanCr;
    if (updates.equityCr !== undefined) project.equityCr = updates.equityCr;
    if (updates.dscr !== undefined) project.dscr = updates.dscr;
    if (updates.projectName) project.projectName = updates.projectName;
    if (updates.industry) project.industry = updates.industry;
    if (updates.location) project.location = updates.location;
  }

  const saved = await project.save();

  // Create notification for admin
  try {
    await Notification.create({
      type: status ? 'CA_AUDIT_UPDATE' : 'PROJECT_MODIFIED',
      title: status ? `Project Status Updated: ${status}` : 'Project Parameters Modified',
      message: `${project.promoterName || 'Promoter'} project '${project.projectName}' was updated (Status: ${project.status}, Capex: ₹${project.capexCr} Cr).`,
      userEmail: project.email,
      userName: project.promoterName,
      projectName: project.projectName,
      read: false,
      metadata: { capexCr: project.capexCr, status: project.status, notes: caReviewNotes }
    });
  } catch (e) {
    console.log('Notification trigger error:', e.message);
  }

  return saved;
};

export const deleteProject = async (id) => {
  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    throw new Error('Project not found');
  }
  return project;
};

export default {
  getProjects,
  createProject,
  getProjectById,
  updateProjectAudit,
  deleteProject,
};
