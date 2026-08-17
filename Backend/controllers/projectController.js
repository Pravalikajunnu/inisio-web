import projectService from '../services/projectService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getProjects = async (req, res, next) => {
  try {
    const role = req.user ? req.user.role : 'user';
    const userId = req.user ? req.user._id : null;
    const projects = await projectService.getProjects(req.query, role, userId);
    return sendSuccess(res, projects, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return sendSuccess(res, project, 'Project details fetched');
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const project = await projectService.createProject(req.body, userId);
    return sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProjectAudit = async (req, res, next) => {
  try {
    const { status, caReviewNotes, assignedCA } = req.body;
    const project = await projectService.updateProjectAudit(req.params.id, status, caReviewNotes, assignedCA);
    return sendSuccess(res, project, 'Project audit status updated');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    return sendSuccess(res, null, 'Project removed');
  } catch (error) {
    next(error);
  }
};

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProjectAudit,
  deleteProject,
};
