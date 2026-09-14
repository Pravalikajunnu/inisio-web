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

export const validateIndianPhone = (field) => {
  return (req, res, next) => {
    const value = req.body[field];
    if (value === undefined || value === null || value === '') {
      return next();
    }

    const clean = String(value).trim().replace(/[\s\-+()]/g, '')
      .replace(/^91(?=\d{10}$)/, '')
      .replace(/^0(?=\d{10}$)/, '');
    const dummyNumbers = new Set(['0123456789', '1234567890', '9876543210', '9848012345']);
    const isSequential = clean.length === 10 && clean.split('').every((digit, index, digits) => {
      if (index === 0) return true;
      const difference = Number(digit) - Number(digits[index - 1]);
      return difference === 1 || difference === -1;
    });

    if (
      clean.length !== 10 ||
      !/^\d{10}$/.test(clean) ||
      !/^[6-9]\d{9}$/.test(clean) ||
      /^(\d)\1{9}$/.test(clean) ||
      dummyNumbers.has(clean) ||
      isSequential
    ) {
      return sendError(res, `Please provide a valid real Indian mobile number for ${field}`, 400);
    }

    next();
  };
};

export default {
  validateBody,
  validateIndianPhone,
};
