import bcrypt from 'bcryptjs';

// Pre-hashed default passwords for local fallback resilience
const ADMIN_HASH = bcrypt.hashSync('admin123', 10);
const CA_HASH = bcrypt.hashSync('ca123456', 10);
const PROSYNC_HASH = bcrypt.hashSync('prosync123', 10);
const PROMOTER_HASH = bcrypt.hashSync('promoter123', 10);
const USER_HASH = bcrypt.hashSync('pravalika123', 10);

export let memoryUsers = [
  {
    _id: 'user_admin_001',
    name: 'Admin Executive',
    email: 'admin@gmail.com',
    password: ADMIN_HASH,
    role: 'admin',
    company: 'Inisio HQ',
    phone: '+91 98765 43210',
    isVerified: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    _id: 'user_ca_002',
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
    _id: 'user_prosync_003',
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
    _id: 'user_promoter_004',
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
    _id: 'user_promoter_005',
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

export const getMemoryUsers = () => memoryUsers;

export const findMemoryUserByEmail = (email) => {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  return memoryUsers.find((u) => u.email.toLowerCase().trim() === clean) || null;
};

export const findMemoryUserById = (id) => {
  if (!id) return null;
  return memoryUsers.find((u) => String(u._id) === String(id) || u.email.toLowerCase() === String(id).toLowerCase()) || null;
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
  memoryUsers,
  getMemoryUsers,
  findMemoryUserByEmail,
  findMemoryUserById,
  addMemoryUser,
  updateMemoryUser,
  deleteMemoryUser,
};
