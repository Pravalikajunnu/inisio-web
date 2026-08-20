import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';

const INITIAL_NOTIFS = [
  {
    _id: 'notif_01',
    type: 'TEASER_DOWNLOAD',
    title: 'Project Teaser Downloaded',
    message: 'Suraj Kanu (kanusuraj15@gmail.com) downloaded Executive Teaser PDF for Solar Panel Cell Manufacturing Unit (₹120 Cr).',
    userEmail: 'kanusuraj15@gmail.com',
    userName: 'Suraj Kanu',
    projectName: 'Solar Panel Cell Manufacturing Unit',
    read: false,
    metadata: { capexCr: 120, loanCr: 90, grade: 'A+' },
    createdAt: new Date(Date.now() - 2 * 3600000),
  },
  {
    _id: 'notif_02',
    type: 'TEASER_DOWNLOAD',
    title: 'Project Teaser Downloaded',
    message: 'Suraj Kanu (kanusuraj15@gmail.com) downloaded Executive Teaser PDF for Bio-Pharma Formulation Plant (₹18.5 Cr).',
    userEmail: 'kanusuraj15@gmail.com',
    userName: 'Suraj Kanu',
    projectName: 'Bio-Pharma Formulation Plant',
    read: false,
    metadata: { capexCr: 18.5, loanCr: 13.8, grade: 'A+' },
    createdAt: new Date(Date.now() - 4 * 3600000),
  },
  {
    _id: 'notif_03',
    type: 'ASSESSMENT_SUBMITTED',
    title: 'New Greenfield Feasibility Assessment',
    message: 'Pravalika Junnu submitted assessment for Hotel Greenfield Resort & Convention (₹20 Cr).',
    userEmail: 'pravalikajunnu14@gmail.com',
    userName: 'Pravalika Junnu',
    projectName: 'Hotel Greenfield Resort & Convention',
    read: false,
    metadata: { capexCr: 20, loanCr: 10, grade: 'A+' },
    createdAt: new Date(Date.now() - 6 * 3600000),
  }
];

let memoryNotifs = [...INITIAL_NOTIFS];

export const getNotifications = async (query = {}) => {
  if (isDBConnected()) {
    try {
      let filter = {};
      if (query.unread === 'true') {
        filter.read = false;
      }
      let notifs = await Notification.find(filter).sort({ createdAt: -1 });

      if (notifs.length === 0 && !query.unread) {
        await Notification.insertMany(INITIAL_NOTIFS).catch(() => {});
        notifs = await Notification.find({}).sort({ createdAt: -1 });
      }

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

