const crypto = require('crypto');

function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateNumericCode(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function paginate(page = 1, limit = 20) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip,
  };
}

function buildPaginationResponse(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

function sanitizeQuery(query) {
  const sanitized = { ...query };
  const excludeFields = ['page', 'limit', 'sort', 'fields', 'search'];

  excludeFields.forEach((field) => delete sanitized[field]);

  return sanitized;
}

function buildSearchQuery(searchTerm, fields) {
  if (!searchTerm || !fields.length) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    })),
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

module.exports = {
  generateToken,
  generateNumericCode,
  paginate,
  buildPaginationResponse,
  sanitizeQuery,
  buildSearchQuery,
  formatBytes,
};
