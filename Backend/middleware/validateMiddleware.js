import { sendError } from '../utils/responseHandler.js';

/**
 * Validate required fields in request body
 * @param {string[]} requiredFields 
 */
export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return sendError(
        res,
        `Missing required fields: ${missing.join(', ')}`,
        400,
        { missingFields: missing }
      );
    }

    next();
  };
};

export default {
  validateBody,
};
