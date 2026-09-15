import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

let memoryProjects = [];

export const getProjects = async (filter = {}, userRole = 'admin', userId = null) => {
  if (isDBConnected()) {
    try {
      let query = {};
      
      if (filter.email && userId) {
        query.$or = [
          { userId: userId },
          { email: { $regex: new RegExp(`^${filter.email.trim()}$`, 'i') } }
        ];
      } else if (filter.email) {
        query.email = { $regex: new RegExp(`^${filter.email.trim()}$`, 'i') };
      } else if (userRole === 'user' && userId) {
        query.userId = userId;
      }

      const projects = await Project.find(query).sort({ updatedAt: -1 });
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
    results = results.filter((p) => p.userId === userId);
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

