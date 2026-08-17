import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, user, 'User found');
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, user, `User role updated to ${role}`);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};
