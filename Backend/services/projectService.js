import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';
import { isAuthorizedAdminEmail } from '../utils/memoryUserStore.js';

let memoryProjects = [];

const isSuperAdminOrAdmin = (role = '', email = '') => {
  return (
    ['superadmin', 'admin', 'admin1', 'admin2', 'admin3'].includes(role) ||
    isAuthorizedAdminEmail(email)
  );
};

const isAssignedToTeamMember = (assignment, requester, team) => {
  const assigned = String(assignment || '').trim().toLowerCase();
  const identities = [requester?.email, requester?.name].map((value) => String(value || '').trim().toLowerCase());
  return identities.includes(assigned) || assigned === team || assigned.startsWith(`${team}:`) || (team === 'ca' && assigned.startsWith('ca '));
};

const canAccessProject = (project, requester) => {
  if (!requester) return true;
  if (isSuperAdminOrAdmin(requester.role, requester.email)) return true;
  if (requester.role === 'ca') {
    return isAssignedToTeamMember(project.assignedCA, requester, 'ca') || project.status === 'Pending Audit' || !project.assignedCA;
  }
  if (requester.role === 'dpr_consultant') {
    return isAssignedToTeamMember(project.dprAssignedTo, requester, 'dpr');
  }
  if (requester.role === 'prosync' || requester.role === 'prosync_admin') {
    return isAssignedToTeamMember(project.consultationAssignedTo, requester, 'prosync');
  }
  const projectEmail = (project.email || '').toLowerCase().trim();
  const reqEmail = (requester.email || '').toLowerCase().trim();
  return String(project.userId || '') === String(requester._id || requester.id || '') || (projectEmail && reqEmail && projectEmail === reqEmail);
};

export const getProjects = async (filter = {}, requester = null) => {
  const isAdmin = isSuperAdminOrAdmin(requester?.role, requester?.email);
  const reqEmail = (requester?.email || filter.email || '').toLowerCase().trim();
  const reqId = requester?._id || requester?.id || null;
  const userRole = requester?.role || 'user';

  if (isDBConnected()) {
    try {
      let query = {};
      
      if (!isAdmin && userRole === 'user') {
        if (reqEmail && reqId) {
          query.$or = [
            { userId: reqId },
            { email: { $regex: new RegExp(`^${reqEmail}$`, 'i') } }
          ];
        } else if (reqEmail) {
          query.email = { $regex: new RegExp(`^${reqEmail}$`, 'i') };
        } else if (reqId) {
          query.userId = reqId;
        }
      } else if (!isAdmin && userRole === 'ca') {
        query.$or = [
          { assignedCA: { $in: [requester.email, requester.name, /^ca:/i] } },
          { status: 'Pending Audit' }
        ];
      } else if (!isAdmin && userRole === 'dpr_consultant') {
        query.dprAssignedTo = { $in: [requester.email, requester.name, /^dpr:/i] };
      } else if (!isAdmin && (userRole === 'prosync' || userRole === 'prosync_admin')) {
        query.consultationAssignedTo = { $in: [requester.email, requester.name, 'Prosync', /^prosync:/i] };
      } else if (filter.email) {
        query.email = { $regex: new RegExp(`^${filter.email.trim()}$`, 'i') };
      }

      const projects = await Project.find(query).sort({ updatedAt: -1, createdAt: -1 });
      return projects;
    } catch (err) {
      console.warn('MongoDB query failed in getProjects, using memory fallback:', err.message);
    }
  }

  // Memory fallback filtering
  let results = [...memoryProjects];
  if (!isAdmin && userRole === 'user') {
    results = results.filter((p) => {
      const pEmail = (p.email || '').toLowerCase().trim();
      const pUserId = String(p.userId || '');
      return (reqEmail && pEmail === reqEmail) || (reqId && pUserId === String(reqId));
    });
  } else if (!isAdmin && userRole === 'ca') {
    results = results.filter((p) => isAssignedToTeamMember(p.assignedCA, requester, 'ca') || p.status === 'Pending Audit');
  } else if (!isAdmin && userRole === 'dpr_consultant') {
    results = results.filter((p) => isAssignedToTeamMember(p.dprAssignedTo, requester, 'dpr'));
  } else if (!isAdmin && (userRole === 'prosync' || userRole === 'prosync_admin')) {
    results = results.filter((p) => isAssignedToTeamMember(p.consultationAssignedTo, requester, 'prosync'));
  } else if (filter.email) {
    const em = filter.email.toLowerCase().trim();
    results = results.filter((p) => (p.email && p.email.toLowerCase().trim() === em));
  }

  return results.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
};

export const createProject = async (projectData, userId = null, requester = null) => {
  if (isDBConnected()) {
    try {
      const project = await Project.create({
        ...projectData,
        userId: userId || requester?._id || null,
        email: projectData.email || requester?.email || '',
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
    userId: userId || requester?._id || null,
    email: projectData.email || requester?.email || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryProjects.unshift(created);
  return created;
};

export const getProjectById = async (id, requester = null) => {
  if (isDBConnected()) {
    try {
      const project = await Project.findById(id);
      if (project && canAccessProject(project, requester)) return project;
    } catch (err) {}
  }
  const found = memoryProjects.find((p) => String(p._id) === String(id));
  if (!found || !canAccessProject(found, requester)) throw new Error('Project not found');
  return found;
};

export const updateProjectAudit = async (id, status, caReviewNotes = '', assignedCA = '', updates = {}, requester = null) => {
  if (requester?.role === 'superadmin') {
    throw new Error('Super Admin has view-only permissions. Modifying data requires an Admin account.');
  }

  if (isDBConnected()) {
    try {
      const project = await Project.findById(id);
      if (project && canAccessProject(project, requester)) {
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

        project.updatedAt = new Date();
        const saved = await project.save();
        return saved;
      }
    } catch (err) {}
  }

  const idx = memoryProjects.findIndex((p) => String(p._id) === String(id));
  if (idx === -1 || !canAccessProject(memoryProjects[idx], requester)) throw new Error('Project not found');

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

export const deleteProject = async (id, requester = null) => {
  if (requester?.role === 'superadmin') {
    throw new Error('Super Admin has view-only permissions. Deletion requires an Admin account.');
  }
  if (isDBConnected()) {
    try {
      const project = await Project.findById(id);
      if (project && canAccessProject(project, requester)) {
        await Project.findByIdAndDelete(id);
        return project;
      }
    } catch (err) {}
  }
  const idx = memoryProjects.findIndex((p) => String(p._id) === String(id));
  if (idx === -1 || !canAccessProject(memoryProjects[idx], requester)) throw new Error('Project not found');
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


