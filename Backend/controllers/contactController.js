import contactService from '../services/contactService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * Public Contact Us Enquiry Submission
 * POST /api/contact
 */
export const createEnquiry = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const enquiry = await contactService.createContactEnquiry(req.body, ipAddress);

    return sendSuccess(
      res,
      enquiry,
      'Thank you for contacting Inisio. Our team has received your enquiry and will contact you shortly.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get All Enquiries (Paginated, Searchable, Filterable)
 * GET /api/admin/contact & GET /api/contact
 */
export const getEnquiries = async (req, res, next) => {
  try {
    const result = await contactService.getAllEnquiries(req.query);
    return sendSuccess(res, result, 'Contact enquiries retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get Single Enquiry by ID
 * GET /api/admin/contact/:id
 */
export const getEnquiryDetails = async (req, res, next) => {
  try {
    const enquiry = await contactService.getEnquiryById(req.params.id);
    return sendSuccess(res, enquiry, 'Enquiry details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update Enquiry Status, Notes, Assignment
 * PUT /api/admin/contact/:id
 */
export const updateEnquiry = async (req, res, next) => {
  try {
    const updated = await contactService.updateEnquiry(req.params.id, req.body);
    return sendSuccess(res, updated, 'Enquiry successfully updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Soft Delete / Archive or Delete Enquiry
 * DELETE /api/admin/contact/:id
 */
export const deleteEnquiry = async (req, res, next) => {
  try {
    const isPermanent = req.query.permanent === 'true';
    const result = await contactService.deleteEnquiry(req.params.id, { soft: !isPermanent });
    return sendSuccess(
      res,
      result,
      isPermanent ? 'Enquiry permanently deleted' : 'Enquiry archived successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Aliases for backwards compatibility with previous controllers
export const createMessage = createEnquiry;
export const getMessages = getEnquiries;
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const item = await contactService.updateEnquiry(req.params.id, { status, notes });
    return sendSuccess(res, item, 'Enquiry status updated');
  } catch (error) {
    next(error);
  }
};

export default {
  createEnquiry,
  getEnquiries,
  getEnquiryDetails,
  updateEnquiry,
  deleteEnquiry,
  createMessage,
  getMessages,
  updateMessageStatus,
};
