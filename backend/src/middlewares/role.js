const AppError = require('../utils/AppError');

const ROLE_HIERARCHY = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  OPERATOR: 2,
  VIEWER: 1,
};

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated.', 401));
    }

    const hasRole = allowedRoles.some((role) => req.user.role === role);
    if (!hasRole) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
}

function requireMinimumRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated.', 401));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (!requiredLevel) {
      return next(new AppError('Invalid role specified.', 500));
    }

    if (userLevel < requiredLevel) {
      return next(new AppError('You do not have sufficient permissions.', 403));
    }

    next();
  };
}

module.exports = { authorize, requireMinimumRole };
