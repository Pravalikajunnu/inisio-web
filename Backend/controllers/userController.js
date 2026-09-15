import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { isDBConnected } from '../config/db.js';

// Clean dynamic memory users cache (only used for non-persisted test sessions if DB disconnected)
let memoryUsers = [];

export const getAllUsers = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
        if (users && users.length > 0) {
          // Dynamically compute the count of associated projects/leads for each user
          const enrichedUsers = await Promise.all(
            users.map(async (u) => {
              const emailRegex = u.email ? new RegExp(`^${u.email.trim()}$`, 'i') : null;
              const leadCount = emailRegex 
                ? await Lead.countDocuments({ $or: [{ userId: u._id }, { email: emailRegex }] })
                : await Lead.countDocuments({ userId: u._id });
              const projectCount = emailRegex 
                ? await Project.countDocuments({ $or: [{ userId: u._id }, { email: emailRegex }] })
                : await Project.countDocuments({ userId: u._id });
              const totalProjects = Math.max(leadCount, projectCount);
              return {
                ...u,
                projectsCount: totalProjects
              };
            })
          );
          return sendSuccess(res, enrichedUsers, 'Users retrieved successfully');
        }
        return sendSuccess(res, [], 'Users retrieved successfully');
      } catch (err) {
        console.warn('DB error in getAllUsers:', err.message);
      }
    }
    return sendSuccess(res, memoryUsers, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
          return sendSuccess(res, user, 'User found');
        }
      } catch (err) {}
    }
    const found = memoryUsers.find((u) => String(u._id) === String(req.params.id) || u.email === req.params.id);
    if (!found) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, found, 'User found');
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return sendError(res, 'Role is required', 400);
    }

    if (isDBConnected()) {
      try {
        const user = await User.findByIdAndUpdate(
          req.params.id,
          { role },
          { new: true }
        ).select('-password');
        if (user) {
          return sendSuccess(res, user, `User role updated to ${role}`);
        }
      } catch (err) {}
    }

    const idx = memoryUsers.findIndex((u) => String(u._id) === String(req.params.id) || u.email === req.params.id);
    if (idx === -1) {
      return sendError(res, 'User not found', 404);
    }
    memoryUsers[idx].role = role;
    return sendSuccess(res, memoryUsers[idx], `User role updated to ${role}`);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const idx = memoryUsers.findIndex((u) => String(u._id) === String(req.params.id) || u.email === req.params.id);
    if (idx !== -1) {
      memoryUsers[idx].status = status;
    }

    return sendSuccess(res, { id: req.params.id, status }, `User status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
          return sendSuccess(res, null, 'User deleted successfully');
        }
      } catch (err) {}
    }
    memoryUsers = memoryUsers.filter((u) => String(u._id) !== String(req.params.id) && u.email !== req.params.id);
    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
