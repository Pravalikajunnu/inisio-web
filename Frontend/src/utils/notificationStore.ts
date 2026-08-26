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

export function getAdminNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse notifications:', e);
    return [];
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
  fetch('/api/notifications', {
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

  fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
}

export function markAllNotificationsAsRead(): void {
  const existing = getAdminNotifications();
  const updated = existing.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));

  fetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {});
}

export function clearAllNotifications(): void {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));
}

export function getUnreadNotificationCount(): number {
  const existing = getAdminNotifications();
  return existing.filter(n => !n.read).length;
}
