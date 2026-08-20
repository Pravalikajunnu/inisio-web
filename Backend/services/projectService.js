import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

const INITIAL_PROJECTS = [
  {
    _id: 'proj_01',
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
    createdAt: new Date(Date.now() - 3 * 3600000),
    updatedAt: new Date(Date.now() - 3 * 3600000),
  },
  {
    _id: 'proj_02',
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
    createdAt: new Date(Date.now() - 6 * 3600000),
    updatedAt: new Date(Date.now() - 6 * 3600000),
  },
  {
    _id: 'proj_03',
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
    createdAt: new Date(Date.now() - 24 * 3600000),
    updatedAt: new Date(Date.now() - 24 * 3600000),
  },
  {
    _id: 'proj_04',
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
    createdAt: new Date(Date.now() - 48 * 3600000),
    updatedAt: new Date(Date.now() - 48 * 3600000),
  }
];

let memoryProjects = [...INITIAL_PROJECTS];

export const getProjects = async (filter = {}, userRole = 'admin', userId = null) => {
  if (isDBConnected()) {
    try {
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

      if (projects.length === 0 && (!filter || Object.keys(filter).length === 0)) {
        await Project.insertMany(INITIAL_PROJECTS).catch(() => {});
        projects = await Project.find({}).sort({ updatedAt: -1 });
      }

      return projects;
    } catch (err) {
      console.warn('MongoDB query failed in getProjects, using memory fallback:', err.message);
    }
  }

  // Memory fallback filtering
  let results = [...memoryProjects];
  if (filter.email) {
    const em = filter.email.toLowerCase();
    results = results.filter((p) => (p.email && p.email.toLowerCase() === em) || (userId && p.userId === userId));
  } else if (userRole === 'user' && userId) {
    results = results.filter((p) => p.userId === userId || p.email === 'kanusuraj15@gmail.com');
  }
  return results.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
};

export const createProject = async (projectData, userId = null) => {
  if (isDBConnected()) {
    try {
      const project = await Project.create({
        ...projectData,
        userId: userId || null,
      });

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
      } catch (e) {}

      return project;
    } catch (err) {
      console.warn('MongoDB create failed in createProject, using memory fallback:', err.message);
    }
  }

  const created = {
    _id: `proj_${Date.now()}`,
    ...projectData,
    userId: userId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryProjects.unshift(created);
  return created;
};

export const getProjectById = async (id) => {
  if (isDBConnected()) {
    try {
      const project = await Project.findById(id);
      if (project) return project;
    } catch (err) {}
  }
  const found = memoryProjects.find((p) => String(p._id) === String(id));
  if (!found) throw new Error('Project not found');
  return found;
};

export const updateProjectAudit = async (id, status, caReviewNotes = '', assignedCA = '', updates = {}) => {
  if (isDBConnected()) {
    try {
      const project = await Project.findById(id);
      if (project) {
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
        return saved;
      }
    } catch (err) {}
  }

  const idx = memoryProjects.findIndex((p) => String(p._id) === String(id));
  if (idx === -1) throw new Error('Project not found');

  const p = memoryProjects[idx];
  if (status) p.status = status;
  if (caReviewNotes) p.caReviewNotes = caReviewNotes;
  if (assignedCA) p.assignedCA = assignedCA;
  if (updates) {
    Object.assign(p, updates);
  }
  p.updatedAt = new Date();
  memoryProjects[idx] = p;
  return p;
};

export const deleteProject = async (id) => {
  if (isDBConnected()) {
    try {
      const project = await Project.findByIdAndDelete(id);
      if (project) return project;
    } catch (err) {}
  }
  const idx = memoryProjects.findIndex((p) => String(p._id) === String(id));
  if (idx === -1) throw new Error('Project not found');
  const removed = memoryProjects.splice(idx, 1)[0];
  return removed;
};

export default {
  getProjects,
  createProject,
  getProjectById,
  updateProjectAudit,
  deleteProject,
};

