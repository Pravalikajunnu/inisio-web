import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { isDBConnected } from '../config/db.js';
import { DEFAULT_USERS } from '../data/defaultData.js';

// Memory users cache
let memoryUsers = DEFAULT_USERS.map((u, i) => ({
  _id: `usr_${i + 1}`,
  name: u.name,
  email: u.email,
  role: u.role,
  company: u.company,
  phone: u.phone,
  isVerified: u.isVerified ?? true,
  status: 'active',
  loginCount: 5 + i * 3,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 3600 * 1000).toISOString(),
}));

export const getAllUsers = async (req, res, next) => {
  try {
    if (isDBConnected()) {
      try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        if (users && users.length > 0) {
          return sendSuccess(res, users, 'Users retrieved successfully');
        }
      } catch (err) {
        console.warn('DB error in getAllUsers, returning memory users:', err.message);
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
