import bcrypt from 'bcryptjs';

// Pre-hashed default passwords for local fallback resilience
const CA_HASH = bcrypt.hashSync('ca123456', 10);
const PROSYNC_HASH = bcrypt.hashSync('prosync123', 10);
const PROMOTER_HASH = bcrypt.hashSync('promoter123', 10);
const USER_HASH = bcrypt.hashSync('pravalika123', 10);

/**
 * Dynamically resolves authorized administrative emails from environment variables
 */
export const getAdminEmail1 = () => {
  return (process.env.ADMIN_EMAIL_1 || process.env.ADMIN_EMAIL || 'inisio2026@gmail.com').toLowerCase().trim();
};

export const getAdminEmail2 = () => {
  return (process.env.ADMIN_EMAIL_2 || process.env.SUPERADMIN_EMAIL || 'junnupravalika59@gmail.com').toLowerCase().trim();
};

export const getAuthorizedAdminEmails = () => {
  const admin1 = getAdminEmail1();
  const admin2 = getAdminEmail2();
  const extra = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const set = new Set([admin1, admin2, ...extra]);
  return Array.from(set).filter(Boolean);
};

export const isAuthorizedAdminEmail = (email) => {
  if (!email) return false;
  const clean = String(email).toLowerCase().trim();
  return getAuthorizedAdminEmails().includes(clean);
};

// Legacy array export that dynamically reflects current environment config
export const AUTHORIZED_ADMIN_EMAILS = new Proxy([], {
  get(target, prop) {
    const list = getAuthorizedAdminEmails();
    if (prop === 'length') return list.length;
    if (prop === 'includes') return (val) => isAuthorizedAdminEmail(val);
    if (prop in list) return list[prop];
    return target[prop];
  },
});

export let memoryUsers = [
  {
    _id: 'user_superadmin_001',
    name: 'Executive Super Admin',
    email: getAdminEmail2(),
    password: bcrypt.hashSync(getAdminEmail2(), 10),
    role: 'superadmin',
    company: 'Inisio Executive Board',
    phone: '+91 63020 26462',
    isVerified: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    _id: 'user_admin_002',
    name: 'Inisio Operations Admin',
    email: getAdminEmail1(),
    password: bcrypt.hashSync(getAdminEmail1(), 10),
    role: 'admin',
    company: 'Inisio HQ Operations',
    phone: '+91 63020 26462',
    isVerified: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    _id: 'user_ca_003',
    name: 'CA Rajesh Sharma',
    email: 'ca@gmail.com',
    password: CA_HASH,
    role: 'ca',
    company: 'Chartered Accountancy Firm',
    phone: '+91 98765 43211',
    isVerified: true,
    createdAt: new Date('2025-01-02'),
  },
  {
    _id: 'user_prosync_004',
    name: 'Prosync Advisory Ops',
    email: 'prosync@gmail.com',
    password: PROSYNC_HASH,
    role: 'prosync_admin',
    company: 'Prosync Advisory Desk',
    phone: '+91 98765 43212',
    isVerified: true,
    createdAt: new Date('2025-01-03'),
  },
  {
    _id: 'user_promoter_005',
    name: 'Industrial Promoter',
    email: 'promoter@inisio.com',
    password: PROMOTER_HASH,
    role: 'user',
    company: 'Nexus Manufacturing Pvt Ltd',
    phone: '+91 98765 43213',
    isVerified: true,
    createdAt: new Date('2025-01-04'),
  },
  {
    _id: 'user_promoter_006',
    name: 'Pravalika Junnu',
    email: 'pravalikajunnu14@gmail.com',
    password: USER_HASH,
    role: 'user',
    company: 'Greenfield Ventures',
    phone: '+91 98765 43214',
    isVerified: true,
    createdAt: new Date('2025-01-05'),
  },
];

export const getMemoryUsers = () => {
  // Ensure both dynamic admin accounts are always present in memoryUsers
  const admin1 = getAdminEmail1();
  const admin2 = getAdminEmail2();

  if (!memoryUsers.some((u) => u.email.toLowerCase() === admin2)) {
    memoryUsers.unshift({
      _id: 'user_superadmin_dynamic',
      name: 'Executive Super Admin',
      email: admin2,
      password: bcrypt.hashSync(admin2, 10),
      role: 'superadmin',
      company: 'Inisio Executive Board',
      phone: '+91 63020 26462',
      isVerified: true,
      createdAt: new Date(),
    });
  }

  if (!memoryUsers.some((u) => u.email.toLowerCase() === admin1)) {
    memoryUsers.unshift({
      _id: 'user_admin_dynamic',
      name: 'Inisio Operations Admin',
      email: admin1,
      password: bcrypt.hashSync(admin1, 10),
      role: 'admin',
      company: 'Inisio HQ Operations',
      phone: '+91 63020 26462',
      isVerified: true,
      createdAt: new Date(),
    });
  }

  return memoryUsers;
};

export const findMemoryUserByEmail = (email) => {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  const list = getMemoryUsers();
  return list.find((u) => u.email.toLowerCase().trim() === clean) || null;
};

export const findMemoryUserById = (id) => {
  if (!id) return null;
  const list = getMemoryUsers();
  return list.find((u) => String(u._id) === String(id) || u.email.toLowerCase() === String(id).toLowerCase()) || null;
};

export const addMemoryUser = (user) => {
  memoryUsers.push(user);
  return user;
};

export const updateMemoryUser = (id, updates) => {
  const idx = memoryUsers.findIndex((u) => String(u._id) === String(id) || u.email.toLowerCase() === String(id).toLowerCase());
  if (idx !== -1) {
    memoryUsers[idx] = { ...memoryUsers[idx], ...updates };
    return memoryUsers[idx];
  }
  return null;
};

export const deleteMemoryUser = (id) => {
  const initialLen = memoryUsers.length;
  memoryUsers = memoryUsers.filter((u) => String(u._id) !== String(id) && u.email.toLowerCase() !== String(id).toLowerCase());
  return memoryUsers.length < initialLen;
};

export default {
  getAdminEmail1,
  getAdminEmail2,
  getAuthorizedAdminEmails,
  isAuthorizedAdminEmail,
  AUTHORIZED_ADMIN_EMAILS,
  memoryUsers,
  getMemoryUsers,
  findMemoryUserByEmail,
  findMemoryUserById,
  addMemoryUser,
  updateMemoryUser,
  deleteMemoryUser,
};
