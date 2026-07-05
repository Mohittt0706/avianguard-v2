const AppError = require('../utils/AppError');

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: {
    dashboard: ['read'],
    sensors: ['read', 'create', 'update', 'delete', 'export'],
    alerts: ['read', 'create', 'update', 'delete'],
    reports: ['read', 'create', 'update', 'delete', 'export'],
    citizens: ['read', 'create', 'update', 'delete'],
    maps: ['read', 'update'],
    settings: ['read', 'update'],
    ai: ['read'],
    users: ['read', 'create', 'update', 'delete'],
  },
  ADMIN: {
    dashboard: ['read'],
    sensors: ['read', 'update'],
    alerts: ['read', 'update'],
    reports: ['read', 'create', 'export'],
    citizens: ['read', 'update'],
    maps: ['read'],
    settings: ['read'],
    ai: ['read'],
    users: ['read'],
  },
  OPERATOR: {
    dashboard: ['read'],
    sensors: ['read', 'update'],
    alerts: ['read'],
    reports: ['read'],
    citizens: ['read'],
    maps: ['read'],
    settings: [],
    ai: [],
    users: [],
  },
  VIEWER: {
    dashboard: ['read'],
    sensors: ['read'],
    alerts: ['read'],
    reports: ['read'],
    citizens: [],
    maps: ['read'],
    settings: [],
    ai: [],
    users: [],
  },
};

function getEffectivePermissions(user) {
  const rolePerms = ROLE_PERMISSIONS[user.role] || {};
  if (user.permissions && typeof user.permissions === 'object') {
    const merged = {};
    for (const resource of Object.keys(rolePerms)) {
      const roleActions = rolePerms[resource] || [];
      const customActions = user.permissions[resource] || null;
      merged[resource] = customActions !== null ? customActions : roleActions;
    }
    for (const resource of Object.keys(user.permissions)) {
      if (!(resource in merged)) {
        merged[resource] = user.permissions[resource] || [];
      }
    }
    return merged;
  }
  return rolePerms;
}

function hasPermission(user, resource, action) {
  const perms = getEffectivePermissions(user);
  return (perms[resource] || []).includes(action);
}

function authorizePermission(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated.', 401));
    }
    if (req.user.role === 'SUPER_ADMIN' && !req.user.permissions) {
      return next();
    }
    if (!hasPermission(req.user, resource, action)) {
      return next(new AppError(`Insufficient permissions: ${resource}:${action} required.`, 403));
    }
    next();
  };
}

module.exports = { authorizePermission, hasPermission, getEffectivePermissions, ROLE_PERMISSIONS };
