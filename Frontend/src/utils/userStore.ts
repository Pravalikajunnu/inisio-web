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
      const defaultUsers = getInitialSeedUsers();
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(raw);
  } catch (err) {
    return getInitialSeedUsers();
  }
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
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: user.name || user.email.split('@')[0],
      email: user.email.toLowerCase(),
      phone: user.phone || '+91 98765 43210',
      company: user.company || 'Greenfield Enterprise',
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
}

function getInitialSeedUsers(): RegisteredUserRecord[] {
  return [
    {
      id: 'usr_admin3',
      name: 'Super Admin',
      email: 'admin@inisio.com',
      phone: '+91 63020 26462',
      company: 'Inisio Capital Advisory Group',
      role: 'admin3',
      createdAt: '2026-06-01T09:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
      loginCount: 38,
      status: 'active'
    },
    {
      id: 'usr_promoter1',
      name: 'K. S. Rao',
      email: 'pravalikajunnu14@gmail.com',
      phone: '+91 98490 11223',
      company: 'Sri Venkateswara Agro Foods & Bio-Ethanol Ltd',
      role: 'user',
      createdAt: '2026-08-15T10:30:00.000Z',
      lastLoginAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      loginCount: 12,
      projectsCount: 2,
      status: 'active'
    },
    {
      id: 'usr_ca1',
      name: 'CA Rajesh Agarwal',
      email: 'rajesh.agarwal@auditpartners.in',
      phone: '+91 98110 55443',
      company: 'Agarwal & Co. Chartered Accountants',
      role: 'ca',
      createdAt: '2026-07-20T14:15:00.000Z',
      lastLoginAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      loginCount: 19,
      status: 'active'
    },
    {
      id: 'usr_promoter2',
      name: 'Ananya Deshmukh',
      email: 'ananya@greenenergyfab.com',
      phone: '+91 98220 77889',
      company: 'Deccan Solar & Ingot Tech Pvt Ltd',
      role: 'user',
      createdAt: '2026-08-01T11:00:00.000Z',
      lastLoginAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      loginCount: 5,
      projectsCount: 1,
      status: 'active'
    }
  ];
}
