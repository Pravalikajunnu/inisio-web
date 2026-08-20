import { verifyToken } from '../utils/generateToken.js';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';
import { isDBConnected } from '../config/db.js';

// Built-in emergency user profiles for zero-downtime authentication fallback
const FALLBACK_USERS = [
  {
    _id: 'user_admin_01',
    email: 'admin@gmail.com',
    name: 'Admin Desk',
    role: 'admin',
    company: 'Inisio HQ',
    phone: '+91 98765 43210'
  },
  {
    _id: 'user_ca_01',
    email: 'ca@gmail.com',
    name: 'Sharma & Associates CAs',
    role: 'ca',
    company: 'Sharma & Associates Chartered Accountants',
    phone: '+91 98111 22334'
  },
  {
    _id: 'user_user_01',
    email: 'user@inisio.com',
    name: 'Suraj Kanu',
    role: 'user',
    company: 'Solar & Agro Industrial Ventures',
    phone: '+91 98480 12345'
  },
  {
    _id: 'user_pravalika',
    email: 'pravalikajunnu14@gmail.com',
    name: 'Pravalika Junnu',
    role: 'user',
    company: 'Hotel Greenfield Resort & Convention',
    phone: '+91 63020 26462'
  }
];

/**
 * Middleware to authenticate requests using JWT Access Token
 */
export const authenticateUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);

      if (isDBConnected()) {
        try {
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
            return next();
          }
        } catch (dbErr) {
          console.warn('DB lookup in authMiddleware failed, using token payload fallback:', dbErr.message);
        }
      }

      // Built-in fallback match for zero-downtime reliability
      const defaultMatch = FALLBACK_USERS.find(
        (u) => String(u._id) === String(decoded.id) || u.email.toLowerCase() === String(decoded.email || '').toLowerCase()
      );

      req.user = {
        _id: decoded.id || defaultMatch?._id || 'user_guest',
        email: decoded.email || defaultMatch?.email || 'user@inisio.com',
        name: decoded.name || defaultMatch?.name || 'Inisio User',
        role: decoded.role || defaultMatch?.role || 'user',
        company: defaultMatch?.company || 'Enterprise Ltd',
        phone: defaultMatch?.phone || '+91 98765 43210'
      };

      return next();
    } catch (error) {
      console.error('JWT Authentication Error:', error.message);
      return sendError(res, 'Not authorized, token invalid or expired', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Authentication token missing. Please log in.', 401);
  }
};

/**
 * Middleware for optional authentication (e.g. public endpoints with enhanced logged-in features)
 */
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      if (isDBConnected()) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (e) {}
      }
      if (!req.user) {
        req.user = {
          _id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'user',
        };
      }
    } catch (err) {
      // Ignored for optional auth
    }
  }
  next();
};

/**
 * Middleware to authorize specific user roles
 * @param  {...string} roles - e.g. 'admin', 'ca', 'user'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

export default {
  authenticateUser,
  optionalAuth,
  authorizeRoles,
};
