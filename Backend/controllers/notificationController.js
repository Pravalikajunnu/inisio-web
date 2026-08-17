import notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifs = await notificationService.getNotifications(req.query);
    return sendSuccess(res, notifs, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notif = await notificationService.createNotification(req.body);
    return sendSuccess(res, notif, 'Notification created', 201);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notif = await notificationService.markAsRead(req.params.id);
    return sendSuccess(res, notif, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead();
    return sendSuccess(res, result, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const clearNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.clearNotifications();
    return sendSuccess(res, result, 'Notifications cleared');
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
};
