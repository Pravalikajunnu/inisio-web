import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

let memoryNotifs = [];

export const getNotifications = async (query = {}) => {
  if (isDBConnected()) {
    try {
      let filter = {};
      if (query.unread === 'true') {
        filter.read = false;
      }
      const notifs = await Notification.find(filter).sort({ createdAt: -1 });
      return notifs;
    } catch (err) {
      console.warn('MongoDB query failed in getNotifications, using memory fallback:', err.message);
    }
  }

  let results = [...memoryNotifs];
  if (query.unread === 'true') {
    results = results.filter((n) => !n.read);
  }
  return results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
};

export const createNotification = async (data) => {
  if (isDBConnected()) {
    try {
      return await Notification.create({
        ...data,
        timestamp: new Date()
      });
    } catch (err) {}
  }

  const notif = {
    _id: `notif_${Date.now()}`,
    ...data,
    read: false,
    createdAt: new Date(),
    timestamp: new Date(),
  };
  memoryNotifs.unshift(notif);
  return notif;
};

export const markAsRead = async (id) => {
  if (isDBConnected()) {
    try {
      return await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    } catch (err) {}
  }
  const idx = memoryNotifs.findIndex((n) => String(n._id) === String(id));
  if (idx !== -1) {
    memoryNotifs[idx].read = true;
    return memoryNotifs[idx];
  }
  return null;
};

export const markAllAsRead = async () => {
  if (isDBConnected()) {
    try {
      await Notification.updateMany({ read: false }, { read: true });
    } catch (err) {}
  }
  memoryNotifs.forEach((n) => { n.read = true; });
  return { message: 'All notifications marked as read' };
};

export const clearNotifications = async () => {
  if (isDBConnected()) {
    try {
      await Notification.deleteMany({});
    } catch (err) {}
  }
  memoryNotifs = [];
  return { message: 'All notifications cleared' };
};

export default {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
};

