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

export async function fetchNotificationsFromBackend(): Promise<AdminNotification[]> {
  try {
    const token = localStorage.getItem('inisio_auth_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/notifications', { headers });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
        const notifs: AdminNotification[] = data.data.map((item: any) => ({
          id: item._id || item.id,
          timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
          type: item.type || 'PROJECT_MODIFIED',
          title: item.title,
          message: item.message,
          userEmail: item.userEmail,
          userName: item.userName,
          projectName: item.projectName,
          read: Boolean(item.read),
          metadata: item.metadata,
        }));
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
        return notifs;
      }
    }
  } catch (err) {
    console.warn('Backend notification fetch fallback:', err);
  }
  return getAdminNotifications();
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
  const token = localStorage.getItem('inisio_auth_token');
  fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(newNotif)
  }).catch((e) => console.log('Async notification persist:', e.message));

  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const existing = getAdminNotifications();
  const updated = existing.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));

  const token = localStorage.getItem('inisio_auth_token');
  fetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).catch(() => {});
}

export function markAllNotificationsAsRead(): void {
  const existing = getAdminNotifications();
  const updated = existing.map(n => ({ ...n, read: true }));
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));

  const token = localStorage.getItem('inisio_auth_token');
  fetch('/api/notifications/read-all', {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).catch(() => {});
}

export function clearAllNotifications(): void {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('inisio_admin_notification_added'));

  const token = localStorage.getItem('inisio_auth_token');
  fetch('/api/notifications/clear-all', {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).catch(() => {});
}

export function getUnreadNotificationCount(): number {
  const existing = getAdminNotifications();
  return existing.filter(n => !n.read).length;
}
