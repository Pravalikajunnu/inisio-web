import ContactEnquiry from '../models/ContactEnquiry.js';
import { isDBConnected } from '../config/db.js';
import { sendWhatsAppNotification } from '../utils/whatsappService.js';
import { sendContactEnquiryAlertEmail } from '../utils/emailService.js';

// In-memory fallback repository with initial demo records
let memoryEnquiries = [
  {
    _id: 'enq_001',
    name: 'Suresh Reddy',
    phone: '9876543210',
    email: 'suresh.reddy@suryaindustries.in',
    company: 'Surya Solar & Glass Packaging Pvt Ltd',
    subject: '₹ 45 Cr Greenfield Float Glass Manufacturing Unit - Bank Loan & DPR',
    message: 'We are setting up a 150 TPD Greenfield Float Glass processing plant in Telangana. We need detailed project report (DPR), TEFR vetting, and bank funding syndication with SBI/Canara Bank. We have already acquired 12 acres of industrial land.',
    status: 'New',
    notes: 'High priority greenfield inquiry. Has 12 acres clear title land.',
    assignedTo: 'Senior Project Advisory Desk',
    isArchived: false,
    source: 'Website Contact Us Form',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000),
  },
  {
    _id: 'enq_002',
    name: 'Ananya Deshmukh',
    phone: '9845012345',
    email: 'ananya.d@greenbioenergy.com',
    company: 'GreenBio Energy Solutions LLP',
    subject: 'CBG (Compressed Bio-Gas) SATAT Scheme Subsidy & Term Loan',
    message: 'Seeking advisory on ₹ 28 Cr CBG plant under SATAT scheme in Maharashtra. Need CA financial modeling, subsidy documentation, and debt syndication support.',
    status: 'In Progress',
    notes: 'Initial introductory call scheduled. Sent SATAT checklist.',
    assignedTo: 'CA Rajesh Sharma',
    isArchived: false,
    source: 'Website Contact Us Form',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000),
  },
  {
    _id: 'enq_003',
    name: 'Vikramjit Singh',
    phone: '9988776655',
    email: 'v.singh@punjabcoldchain.org',
    company: 'Northern Agro Logistics Pvt Ltd',
    subject: 'Multi-Commodity Controlled Atmosphere Cold Storage Project',
    message: 'Planning 10,000 MT multi-commodity cold chain facility in Ludhiana with ₹ 32 Cr project outlay. Looking for MoFPI subsidy consultancy and consortium lending.',
    status: 'Contacted',
    notes: 'Spoke with promoter on phone. Requested balance sheets of parent firm.',
    assignedTo: 'Prosync Advisory Desk',
    isArchived: false,
    source: 'Website Contact Us Form',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    _id: 'enq_004',
    name: 'Kavitha Ramachandran',
    phone: '9711223344',
    email: 'kavitha@chennaiautoancillary.com',
    company: 'Sri Ram Precision Engineering Ltd',
    subject: '₹ 60 Cr EV Component Casting Unit - Term Loan Assistance',
    message: 'We are expanding into aluminum die casting for EV powertrain casings. Required debt is ₹ 42 Cr. Looking for end-to-end DPR, CMA data, and banker liaison.',
    status: 'Closed',
    notes: 'Term sheet issued by Union Bank of India. Vetting completed.',
    assignedTo: 'Senior Project Advisory Desk',
    isArchived: false,
    source: 'Website Contact Us Form',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000),
  },
];

/**
 * Validate and clean 10-digit Indian mobile number
 */
const sanitizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
};

/**
 * Create a new Contact Enquiry
 */
export const createContactEnquiry = async (data, ipAddress = '') => {
  const name = (data.name || data.fullName || '').trim();
  const phone = sanitizePhone(data.phone || data.mobile);
  const email = (data.email || '').trim().toLowerCase();
  const company = (data.company || data.companyName || '').trim();
  const subject = (data.subject || 'General Greenfield Project Enquiry').trim();
  const message = (data.message || data.projectBrief || '').trim();

  if (!name) {
    const error = new Error('Please provide your Full Name');
    error.statusCode = 400;
    throw error;
  }
  if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
    const error = new Error('Please provide a valid 10-digit Indian Mobile Number');
    error.statusCode = 400;
    throw error;
  }
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    const error = new Error('Please provide a valid Email Address');
    error.statusCode = 400;
    throw error;
  }
  if (!message || message.length < 5) {
    const error = new Error('Please provide a message or project brief (minimum 5 characters)');
    error.statusCode = 400;
    throw error;
  }

  const newRecord = {
    name,
    phone,
    email,
    company,
    subject,
    message,
    status: 'New',
    notes: data.notes || '',
    assignedTo: data.assignedTo || 'Senior Project Advisory Desk',
    isArchived: false,
    source: data.source || 'Website Contact Us Form',
    ipAddress,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let savedEnquiry = null;

  if (isDBConnected()) {
    try {
      savedEnquiry = await ContactEnquiry.create(newRecord);
    } catch (dbErr) {
      console.warn('[ContactService] MongoDB save warning, falling back to memory store:', dbErr.message);
    }
  }

  if (!savedEnquiry) {
    const memoryRecord = {
      _id: `enq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...newRecord,
    };
    memoryEnquiries.unshift(memoryRecord);
    savedEnquiry = memoryRecord;
  }

  // Asynchronous WhatsApp notification to Admin (Resilient: never blocks enquiry creation)
  try {
    sendWhatsAppNotification(savedEnquiry).catch((waErr) => {
      console.warn('[ContactService] WhatsApp notification background notice:', waErr.message);
    });
  } catch (waErr) {}

  // Asynchronous Email alert to Admin & User confirmation
  try {
    sendContactEnquiryAlertEmail(savedEnquiry).catch((mailErr) => {
      console.warn('[ContactService] Email alert background notice:', mailErr.message);
    });
  } catch (mailErr) {}

  return savedEnquiry;
};

/**
 * Get all contact enquiries with search, status filter, date range, pagination, and sorting
 */
export const getAllEnquiries = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    q = '',
    status = '',
    isArchived = 'false',
    startDate,
    endDate,
    sort = '-createdAt',
  } = query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const searchTerm = (search || q).trim().toLowerCase();
  const showArchived = isArchived === 'true' || isArchived === true;

  if (isDBConnected()) {
    try {
      const filter = {};

      if (!showArchived) {
        filter.isArchived = { $ne: true };
      } else {
        filter.isArchived = true;
      }

      if (status && status !== 'All' && status !== 'all') {
        filter.status = status;
      }

      if (searchTerm) {
        filter.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
          { company: { $regex: searchTerm, $options: 'i' } },
          { subject: { $regex: searchTerm, $options: 'i' } },
          { message: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }

      const total = await ContactEnquiry.countDocuments(filter);
      const enquiries = await ContactEnquiry.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return {
        enquiries,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      };
    } catch (err) {
      console.warn('[ContactService] DB query failed, falling back to memory store:', err.message);
    }
  }

  // Memory fallback query engine
  let filtered = memoryEnquiries.filter((item) => {
    if (!showArchived && item.isArchived) return false;
    if (showArchived && !item.isArchived) return false;
    if (status && status !== 'All' && status !== 'all' && item.status.toLowerCase() !== status.toLowerCase()) {
      return false;
    }
    if (searchTerm) {
      const matchName = (item.name || '').toLowerCase().includes(searchTerm);
      const matchEmail = (item.email || '').toLowerCase().includes(searchTerm);
      const matchPhone = (item.phone || '').toLowerCase().includes(searchTerm);
      const matchCompany = (item.company || '').toLowerCase().includes(searchTerm);
      const matchSubject = (item.subject || '').toLowerCase().includes(searchTerm);
      const matchMessage = (item.message || '').toLowerCase().includes(searchTerm);
      if (!matchName && !matchEmail && !matchPhone && !matchCompany && !matchSubject && !matchMessage) {
        return false;
      }
    }
    if (startDate && new Date(item.createdAt) < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(item.createdAt) > end) return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort.startsWith('-')) {
      const key = sort.substring(1);
      return new Date(b[key] || b.createdAt) - new Date(a[key] || a.createdAt);
    }
    return new Date(a[sort] || a.createdAt) - new Date(b[sort] || b.createdAt);
  });

  const total = filtered.length;
  const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return {
    enquiries: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Get Enquiry Details by ID
 */
export const getEnquiryById = async (id) => {
  if (isDBConnected()) {
    try {
      const item = await ContactEnquiry.findById(id);
      if (item) return item;
    } catch (err) {}
  }
  const memItem = memoryEnquiries.find((m) => String(m._id) === String(id));
  if (!memItem) {
    const error = new Error('Contact enquiry not found');
    error.statusCode = 404;
    throw error;
  }
  return memItem;
};

/**
 * Update Enquiry (Status, Notes, Assigned To, isArchived)
 */
export const updateEnquiry = async (id, updates = {}) => {
  const allowedUpdates = {};
  if (updates.status !== undefined) allowedUpdates.status = updates.status;
  if (updates.notes !== undefined) allowedUpdates.notes = updates.notes;
  if (updates.assignedTo !== undefined) allowedUpdates.assignedTo = updates.assignedTo;
  if (updates.isArchived !== undefined) allowedUpdates.isArchived = Boolean(updates.isArchived);
  allowedUpdates.updatedAt = new Date();

  if (isDBConnected()) {
    try {
      const updated = await ContactEnquiry.findByIdAndUpdate(id, allowedUpdates, {
        new: true,
        runValidators: true,
      });
      if (updated) return updated;
    } catch (err) {}
  }

  const idx = memoryEnquiries.findIndex((m) => String(m._id) === String(id));
  if (idx === -1) {
    const error = new Error('Contact enquiry not found');
    error.statusCode = 404;
    throw error;
  }

  memoryEnquiries[idx] = {
    ...memoryEnquiries[idx],
    ...allowedUpdates,
  };

  return memoryEnquiries[idx];
};

/**
 * Soft delete or permanently delete enquiry
 */
export const deleteEnquiry = async (id, { soft = true } = {}) => {
  if (soft) {
    return await updateEnquiry(id, { isArchived: true });
  }

  if (isDBConnected()) {
    try {
      await ContactEnquiry.findByIdAndDelete(id);
    } catch (err) {}
  }

  memoryEnquiries = memoryEnquiries.filter((m) => String(m._id) !== String(id));
  return { success: true, message: 'Contact enquiry permanently deleted' };
};

// Aliases for backward compatibility
export const createContactMessage = createContactEnquiry;
export const getAllContactMessages = async () => (await getAllEnquiries({ limit: 100 })).enquiries;
export const updateMessageStatus = async (id, status, notes = '') => updateEnquiry(id, { status, notes });

export default {
  createContactEnquiry,
  createContactMessage,
  getAllEnquiries,
  getAllContactMessages,
  getEnquiryById,
  updateEnquiry,
  updateMessageStatus,
  deleteEnquiry,
};
