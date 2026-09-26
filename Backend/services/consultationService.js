import Consultation from '../models/Consultation.js';
import Lead from '../models/Lead.js';
import Notification from '../models/Notification.js';
import { isDBConnected } from '../config/db.js';
import { sendConsultationConfirmationEmail } from '../utils/emailService.js';

let memoryConsultations = [];

export const createConsultation = async (data) => {
  let createdItem = null;

  if (isDBConnected()) {
    try {
      createdItem = await Consultation.create(data);
    } catch (err) {
      console.warn('MongoDB create failed in createConsultation, using memory fallback:', err.message);
    }
  }

  if (!createdItem) {
    createdItem = {
      _id: `cons_${Date.now()}`,
      ...data,
      status: data.status || 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryConsultations.unshift(createdItem);
  }

  // Ensure a Lead record is created/linked so it shows in Admin Leads & Pipelines
  try {
    if (isDBConnected()) {
      await Lead.create({
        fullName: createdItem.fullName || 'Consultation Lead',
        mobile: createdItem.phone || 'N/A',
        email: createdItem.email || 'N/A',
        projectName: createdItem.companyName ? `${createdItem.companyName} Greenfield` : `${createdItem.industry || 'Advisory'} Project`,
        industry: createdItem.industry || 'General Sector',
        location: 'India',
        totalCostCr: createdItem.projectCostCr || '0',
        loanRequiredCr: '0',
        source: 'Advisory Call Booked',
        downloadedPDF: false,
        notes: createdItem.additionalNotes || createdItem.message || '',
        consultationAssignedTo: createdItem.assignedAdvisor || 'Prosync',
        consultationStatus: 'Pending',
      });

      await Notification.create({
        title: 'New Consultation Booking',
        message: `${createdItem.fullName || 'A promoter'} booked a free 1-on-1 advisory session for ₹${createdItem.projectCostCr || 'N/A'} Cr project.`,
        type: 'consultation',
        read: false,
      });
    }
  } catch (err) {
    console.warn('Lead/Notification sync in createConsultation warning:', err.message);
  }

  // Dispatch email notification via Nodemailer
  if (createdItem.email) {
    sendConsultationConfirmationEmail({
      to: createdItem.email,
      name: createdItem.fullName || 'Valued Promoter',
      companyName: createdItem.companyName || '',
      projectCostCr: createdItem.projectCostCr || '',
      capexAmount: createdItem.projectCostCr || '',
      preferredDate: createdItem.preferredDate,
      preferredTime: createdItem.preferredTime,
      topic: createdItem.projectStage || createdItem.industry || createdItem.message || 'Greenfield Project Bankability Consultation',
    }).catch((e) => console.warn('Consultation confirmation email error:', e.message));
  }

  return createdItem;
};

export const getAllConsultations = async (filter = {}) => {
  if (isDBConnected()) {
    try {
      return await Consultation.find(filter).sort({ createdAt: -1 });
    } catch (err) {
      console.warn('MongoDB query failed in getAllConsultations, using memory fallback:', err.message);
    }
  }
  return memoryConsultations;
};

export const getConsultationById = async (id) => {
  if (isDBConnected()) {
    try {
      const item = await Consultation.findById(id);
      if (item) return item;
    } catch (err) {}
  }
  const found = memoryConsultations.find((c) => String(c._id) === String(id));
  if (!found) {
    throw new Error('Consultation booking not found');
  }
  return found;
};

export const updateConsultationStatus = async (id, status, feedback = '') => {
  if (isDBConnected()) {
    try {
      const item = await Consultation.findById(id);
      if (item) {
        item.status = status;
        if (feedback) item.feedback = feedback;
        return await item.save();
      }
    } catch (err) {}
  }

  const idx = memoryConsultations.findIndex((c) => String(c._id) === String(id));
  if (idx === -1) throw new Error('Consultation booking not found');
  memoryConsultations[idx].status = status;
  if (feedback) memoryConsultations[idx].feedback = feedback;
  memoryConsultations[idx].updatedAt = new Date();
  return memoryConsultations[idx];
};

export default {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus,
};
