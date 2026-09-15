// Inisio User Management & Login History Store
import { AuthUser, UserRole } from '../types';

export interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
  projectsCount?: number;
  status: 'active' | 'suspended' | 'pending';
}

const REGISTERED_USERS_KEY = 'inisio_all_registered_users_v1';

export function getAllRegisteredUsers(): RegisteredUserRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export async function fetchUsersFromBackend(): Promise<RegisteredUserRecord[]> {
  try {
    const token = localStorage.getItem('inisio_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/users', { headers });
    if (response.ok) {
      const resData = await response.json();
      if (resData && resData.data && Array.isArray(resData.data)) {
        const mapped: RegisteredUserRecord[] = resData.data.map((u: any) => ({
          id: u._id || u.id,
          name: u.name || u.email?.split('@')[0],
          email: u.email,
          phone: u.phone || '',
          company: u.company || '',
          role: u.role || 'user',
          createdAt: u.createdAt || new Date().toISOString(),
          lastLoginAt: u.lastLoginAt || new Date().toISOString(),
          loginCount: u.loginCount || 1,
          projectsCount: u.projectsCount !== undefined ? u.projectsCount : 0,
          status: u.status || 'active',
        }));

        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Backend users sync deferred to local cache:', err);
  }
  return getAllRegisteredUsers();
}

export function recordUserLogin(user: AuthUser): void {
  if (typeof window === 'undefined' || !user.email) return;

  const users = getAllRegisteredUsers();
  const existingIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    users[existingIdx] = {
      ...users[existingIdx],
      name: user.name || users[existingIdx].name,
      role: user.role || users[existingIdx].role,
      phone: user.phone || users[existingIdx].phone,
      company: user.company || users[existingIdx].company,
      lastLoginAt: now,
      loginCount: (users[existingIdx].loginCount || 1) + 1,
      status: 'active'
    };
  } else {
    const newUser: RegisteredUserRecord = {
      id: user._id || 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: user.name || user.email.split('@')[0],
      email: user.email.toLowerCase(),
      phone: user.phone || '',
      company: user.company || '',
      role: user.role || 'user',
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
      status: 'active'
    };
    users.unshift(newUser);
  }

  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('inisio_user_registered_or_logged_in', { detail: user }));
  } catch (err) {
    console.error('Failed to save user record:', err);
  }
}

export function updateUserStatus(userId: string, newStatus: 'active' | 'suspended' | 'pending'): void {
  const users = getAllRegisteredUsers();
  const updated = users.map(u => u.id === userId ? { ...u, status: newStatus } : u);
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('inisio_user_registered_or_logged_in', { detail: { id: userId, newStatus } }));
  } catch (err) {
    console.error('Failed to update user status:', err);
  }

  const token = localStorage.getItem('inisio_auth_token');
  fetch(`/api/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status: newStatus }),
  }).catch(() => {});
}
