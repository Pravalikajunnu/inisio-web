import Notification from '../models/Notification.js';

const INITIAL_NOTIFS = [
  {
    type: 'TEASER_DOWNLOAD',
    title: 'Project Teaser Downloaded',
    message: 'Suraj Kanu (kanusuraj15@gmail.com) downloaded Executive Teaser PDF for Solar Panel Cell Manufacturing Unit (₹120 Cr).',
    userEmail: 'kanusuraj15@gmail.com',
    userName: 'Suraj Kanu',
    projectName: 'Solar Panel Cell Manufacturing Unit',
    read: false,
    metadata: { capexCr: 120, loanCr: 90, grade: 'A+' }
  },
  {
    type: 'TEASER_DOWNLOAD',
    title: 'Project Teaser Downloaded',
    message: 'Suraj Kanu (kanusuraj15@gmail.com) downloaded Executive Teaser PDF for Bio-Pharma Formulation Plant (₹18.5 Cr).',
    userEmail: 'kanusuraj15@gmail.com',
    userName: 'Suraj Kanu',
    projectName: 'Bio-Pharma Formulation Plant',
    read: false,
    metadata: { capexCr: 18.5, loanCr: 13.8, grade: 'A+' }
  },
  {
    type: 'ASSESSMENT_SUBMITTED',
    title: 'New Greenfield Feasibility Assessment',
    message: 'Pravalika Junnu submitted assessment for Hotel Greenfield Resort & Convention (₹20 Cr).',
    userEmail: 'pravalikajunnu14@gmail.com',
    userName: 'Pravalika Junnu',
    projectName: 'Hotel Greenfield Resort & Convention',
    read: false,
    metadata: { capexCr: 20, loanCr: 10, grade: 'A+' }
  }
];

export const getNotifications = async (query = {}) => {
  let filter = {};
  if (query.unread === 'true') {
    filter.read = false;
  }
  let notifs = await Notification.find(filter).sort({ createdAt: -1 });

  if (notifs.length === 0 && !query.unread) {
    await Notification.insertMany(INITIAL_NOTIFS);
    notifs = await Notification.find({}).sort({ createdAt: -1 });
  }

  return notifs;
};

export const createNotification = async (data) => {
  const notif = await Notification.create({
    ...data,
    timestamp: new Date()
  });
  return notif;
};

export const markAsRead = async (id) => {
  return await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
};

export const markAllAsRead = async () => {
  await Notification.updateMany({ read: false }, { read: true });
  return { message: 'All notifications marked as read' };
};

export const clearNotifications = async () => {
  await Notification.deleteMany({});
  return { message: 'All notifications cleared' };
};

export default {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
};
