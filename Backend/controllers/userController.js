import User from '../models/User.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { isDBConnected } from '../config/db.js';
import {
  getMemoryUsers,
  findMemoryUserById,
  updateMemoryUser,
  deleteMemoryUser as removeMemoryUser,
} from '../utils/memoryUserStore.js';

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
    const safeUsers = getMemoryUsers().map(({ password, ...u }) => u);
    return sendSuccess(res, safeUsers, 'Users retrieved successfully');
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
    const found = findMemoryUserById(req.params.id);
    if (!found) {
      return sendError(res, 'User not found', 404);
    }
    const { password, ...safeUser } = found;
    return sendSuccess(res, safeUser, 'User found');
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

    const updated = updateMemoryUser(req.params.id, { role });
    if (!updated) {
      return sendError(res, 'User not found', 404);
    }
    const { password, ...safeUser } = updated;
    return sendSuccess(res, safeUser, `User role updated to ${role}`);
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

    updateMemoryUser(req.params.id, { status });
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
    removeMemoryUser(req.params.id);
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
