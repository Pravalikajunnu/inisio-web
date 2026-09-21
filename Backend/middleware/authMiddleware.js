import { verifyToken } from '../utils/generateToken.js';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';
import { isDBConnected } from '../config/db.js';

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

      if (!decoded || !decoded.id) {
        return sendError(res, 'Not authorized, invalid token payload', 401);
      }

      if (isDBConnected()) {
        try {
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
            return next();
          }
        } catch (dbErr) {
          console.warn('DB lookup in authMiddleware failed:', dbErr.message);
        }
      }

      req.user = {
        _id: decoded.id,
        email: decoded.email,
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        role: decoded.role || 'user',
        company: decoded.company || '',
        phone: decoded.phone || '',
        isVerified: decoded.isVerified ?? true,
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
      if (!req.user && decoded) {
        req.user = {
          _id: decoded.id,
          email: decoded.email,
          role: decoded.role || 'user',
          name: decoded.name || decoded.email?.split('@')[0],
          isVerified: decoded.isVerified ?? true,
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
 * @param  {...string} roles - e.g. 'admin', 'superadmin', 'ca', 'prosync', 'user'
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User authentication required', 401);
    }

    const userRole = req.user.role || 'user';

    // Strict Super Admin Access Control: Super Admin is strictly Read-Only across all resources
    if (userRole === 'superadmin' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return sendError(
        res,
        'Super Admin account has View-Only privileges. Data modifications, updates, and deletions require an Admin account.',
        403
      );
    }

    // Normalize admin aliases
    const normalizedRole = userRole === 'admin1' || userRole === 'admin2' || userRole === 'admin3'
      ? 'admin'
      : userRole === 'prosync'
        ? 'prosync_admin'
        : userRole;

    // Super Admin has view-only authorization for any admin, superadmin, or general reporting resource
    const isSuperAdminViewer = userRole === 'superadmin' && req.method === 'GET' && (roles.includes('admin') || roles.includes('superadmin') || roles.includes('ca') || roles.includes('prosync_admin'));

    const isAuthorized =
      roles.includes(userRole) ||
      roles.includes(normalizedRole) ||
      isSuperAdminViewer ||
      (roles.includes('admin') && (userRole.startsWith('admin') || req.user.email === 'admin@gmail.com' || req.user.email === 'inisioadmin@gmail.com'));

    if (!isAuthorized) {
      return sendError(
        res,
        `Access denied. Role '${userRole}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

/**
 * Middleware that strictly enforces View-Only restriction for Super Admin
 * Super Admin can read/view everything, but cannot create, update, or delete data.
 */
export const restrictSuperAdminViewer = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return sendError(
        res,
        'Super Admin account has View-Only access. Data modifications, updates, and deletions require an Admin account.',
        403
      );
    }
  }
  next();
};

export default {
  authenticateUser,
  optionalAuth,
  authorizeRoles,
  restrictSuperAdminViewer,
};
