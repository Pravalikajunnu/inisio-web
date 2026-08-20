import { apiUrl } from './apiClient';

export interface AdminNotification {
  id: string;
  timestamp: string;
  type: 'TEASER_DOWNLOAD' | 'PROJECT_MODIFIED' | 'ASSESSMENT_SUBMITTED' | 'CONSULTATION_BOOKED' | 'CA_AUDIT_UPDATE' | 'LEAD_CREATED';
  title: string;
  message: string;
  userEmail?: string;
  userName?: string;
  projectName?: string;
  read: boolean;
  metadata?: Record<string, any>;
}

const NOTIFICATIONS_STORAGE_KEY = 'inisio_admin_notifications_v1';

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
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
    id: 'notif-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
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
    id: 'notif-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'ASSESSMENT_SUBMITTED',
    title: 'New Greenfield Feasibility Assessment',
    message: 'Pravalika Junnu submitted assessment for Hotel Greenfield Resort & Convention (₹20 Cr).',
    userEmail: 'pravalikajunnu14@gmail.com',
    userName: 'Pravalika Junnu',
    projectName: 'Hotel Greenfield Resort & Convention',
    read: false,
    metadata: { capexCr: 20, loanCr: 10, grade: 'A+' }
  },
  {
    id: 'notif-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'CA_AUDIT_UPDATE',
    title: 'CA Audit Stage Updated',
    message: 'CA Rajesh Sharma approved TEFR Appraisal for High-Purity Chemical Refinery.',
    userEmail: 'rajesh.patel@dahejchem.com',
    userName: 'Rajesh Patel',
    projectName: 'High-Purity Chemical Refinery',
    read: true,
    metadata: { status: 'CA Approved', dscr: 1.62 }
  }
];

export function getAdminNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse notifications:', e);
    return INITIAL_NOTIFICATIONS;
  }
}

export function createAdminNotification(
  notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>
): AdminNotification {
  const existing = getAdminNotifications();
  const newNotif: AdminNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false
  };

  const updated = [newNotif, ...existing];
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('inisio_admin_notification_added', { detail: newNotif }));
  } catch (err) {
    console.error('Failed to store notification:', err);
  }

  // Sync to backend API asynchronously
  fetch(apiUrl('/notifications'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newNotif)
  }).catch((e) => console.log('Async notification persist:', e.message));

  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const existing = getAdminNotifications();
  const updated = existing.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));

  fetch(apiUrl(`/notifications/${id}/read`), { method: 'PATCH' }).catch(() => {});
}

export function markAllNotificationsAsRead(): void {
  const existing = getAdminNotifications();
  const updated = existing.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));

  fetch(apiUrl('/notifications/read-all'), { method: 'PATCH' }).catch(() => {});
}

export function clearAllNotifications(): void {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));
}

export function getUnreadNotificationCount(): number {
  const existing = getAdminNotifications();
  return existing.filter(n => !n.read).length;
}
