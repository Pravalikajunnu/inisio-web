import projectService from '../services/projectService.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects(req.query, req.user);
    return sendSuccess(res, projects, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user);
    return sendSuccess(res, project, 'Project details fetched');
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const project = await projectService.createProject(req.body, userId, req.user);
    return sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProjectAudit = async (req, res, next) => {
  try {
    const { status, caReviewNotes, assignedCA, ...rest } = req.body;
    const project = await projectService.updateProjectAudit(req.params.id, status, caReviewNotes, assignedCA, rest, req.user);
    return sendSuccess(res, project, 'Project audit status updated');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user);
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
