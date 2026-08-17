import leadService from '../services/leadService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getLeads = async (req, res, next) => {
  try {
    const leads = await leadService.getAllLeads(req.query);
    return sendSuccess(res, leads, 'Leads retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const {
      fullName,
      mobile,
      email,
      projectName,
      industry,
      location,
      totalCostCr,
      loanRequiredCr,
      feasibilityScore,
      bankabilityRating,
      source,
      downloadedPDF,
      notes,
      promoterContribCr,
      landStatus,
      collateralStatus,
      promoterExp,
    } = req.body;

    const lead = await leadService.createLead({
      fullName,
      mobile,
      email,
      projectName,
      industry,
      location,
      totalCostCr,
      loanRequiredCr,
      feasibilityScore,
      bankabilityRating,
      source: source || 'Web Portal Lead',
      downloadedPDF: downloadedPDF || false,
      notes,
      promoterContribCr,
      landStatus,
      collateralStatus,
      promoterExp,
    });

    return sendSuccess(res, lead, 'Lead captured successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);
    return sendSuccess(res, lead, 'Lead retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body);
    return sendSuccess(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    await leadService.deleteLead(req.params.id);
    return sendSuccess(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const clearAllLeads = async (req, res, next) => {
  try {
    const result = await leadService.clearAllLeads();
    return sendSuccess(res, result, 'All leads cleared');
  } catch (error) {
    next(error);
  }
};

export default {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  clearAllLeads,
};
