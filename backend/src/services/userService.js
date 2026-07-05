const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class UserService {
  async getUsers(filters = {}) {
    const where = {};
    if (filters.role) where.role = filters.role;
    if (filters.district) where.district = filters.district;
    if (filters.taluka) where.taluka = filters.taluka;
    if (filters.department) where.department = filters.department;
    if (filters.accountStatus) where.accountStatus = filters.accountStatus;
    if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { employeeId: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { district: { contains: filters.search, mode: 'insensitive' } },
        { role: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(filters.limit, 10) || 20), 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true, district: true,
          taluka: true, assignedWetland: true, phone: true, employeeId: true,
          department: true, designation: true, address: true, avatar: true,
          accountStatus: true, isActive: true, lastLoginAt: true,
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, district: true,
        taluka: true, assignedWetland: true, phone: true, employeeId: true,
        department: true, designation: true, address: true, avatar: true,
        accountStatus: true, permissions: true, isActive: true,
        lastLoginAt: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);

    const [loginHistory, auditLogs, alertsCount, reportsCount, citizenNotifsCount] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.auditLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.alert.count({ where: { sensorId: { in: [] } } }).catch(() => 0),
      prisma.report.count({ where: { generatedBy: user.name } }).catch(() => 0),
      prisma.citizenNotification.count({ where: { sentBy: user.name } }).catch(() => 0),
    ]);

    return {
      ...user,
      loginHistory,
      auditLogs,
      stats: {
        alertsAssigned: alertsCount,
        reportsGenerated: reportsCount,
        citizenNotificationsSent: citizenNotifsCount,
      },
    };
  }

  async createUser(data) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new AppError('Email is already registered', 409);

    if (data.employeeId) {
      const existingEmp = await prisma.user.findUnique({ where: { employeeId: data.employeeId } });
      if (existingEmp) throw new AppError('Employee ID already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'VIEWER',
        district: data.district || null,
        taluka: data.taluka || null,
        assignedWetland: data.assignedWetland || null,
        phone: data.phone || null,
        employeeId: data.employeeId || null,
        department: data.department || null,
        designation: data.designation || null,
        address: data.address || null,
        accountStatus: data.accountStatus || 'ACTIVE',
        permissions: data.permissions || null,
      },
      select: {
        id: true, name: true, email: true, role: true, district: true,
        taluka: true, assignedWetland: true, phone: true, employeeId: true,
        department: true, designation: true, address: true, avatar: true,
        accountStatus: true, isActive: true, createdAt: true,
      },
    });

    logger.info(`[USER] Created user: ${user.name} (${user.email}) role=${user.role}`);
    return user;
  }

  async updateUser(id, data) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new AppError('Email is already in use', 409);
    }

    if (data.employeeId && data.employeeId !== user.employeeId) {
      const existing = await prisma.user.findUnique({ where: { employeeId: data.employeeId } });
      if (existing) throw new AppError('Employee ID already in use', 409);
    }

    const updateData = {};
    const fields = ['name', 'email', 'role', 'district', 'taluka', 'assignedWetland', 'phone', 'employeeId', 'department', 'designation', 'address', 'avatar', 'accountStatus', 'permissions'];
    for (const field of fields) {
      if (data[field] !== undefined) updateData[field] = data[field];
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, role: true, district: true,
        taluka: true, assignedWetland: true, phone: true, employeeId: true,
        department: true, designation: true, address: true, avatar: true,
        accountStatus: true, isActive: true, lastLoginAt: true,
        createdAt: true, updatedAt: true,
      },
    });

    logger.info(`[USER] Updated user: ${updated.name} (${updated.email})`);
    return updated;
  }

  async deleteUser(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);
    await prisma.user.delete({ where: { id } });
    logger.info(`[USER] Deleted user: ${user.name} (${user.email})`);
  }

  async bulkAction(ids, action, data = {}) {
    const users = await prisma.user.findMany({ where: { id: { in: ids } } });
    if (!users.length) throw new AppError('No users found', 404);

    switch (action) {
      case 'delete':
        await prisma.user.deleteMany({ where: { id: { in: ids } } });
        logger.info(`[USER] Bulk deleted ${ids.length} users`);
        break;
      case 'disable':
        await prisma.user.updateMany({ where: { id: { in: ids } }, data: { isActive: false, accountStatus: 'INACTIVE' } });
        logger.info(`[USER] Bulk disabled ${ids.length} users`);
        break;
      case 'enable':
        await prisma.user.updateMany({ where: { id: { in: ids } }, data: { isActive: true, accountStatus: 'ACTIVE' } });
        logger.info(`[USER] Bulk enabled ${ids.length} users`);
        break;
      case 'assignDistrict':
        await prisma.user.updateMany({ where: { id: { in: ids } }, data: { district: data.district } });
        logger.info(`[USER] Bulk assigned district to ${ids.length} users`);
        break;
      case 'assignWetland':
        await prisma.user.updateMany({ where: { id: { in: ids } }, data: { assignedWetland: data.assignedWetland } });
        logger.info(`[USER] Bulk assigned wetland to ${ids.length} users`);
        break;
      default:
        throw new AppError('Invalid bulk action', 400);
    }

    return { affected: ids.length };
  }

  async resetPassword(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        refreshToken: null,
      },
    });

    logger.info(`[USER] Reset password for: ${user.name} (${user.email})`);
    return { tempPassword, email: user.email, name: user.name };
  }

  async toggleStatus(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    const newStatus = user.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await prisma.user.update({
      where: { id },
      data: { accountStatus: newStatus, isActive: newStatus === 'ACTIVE' },
      select: {
        id: true, name: true, email: true, role: true, accountStatus: true, isActive: true,
      },
    });

    logger.info(`[USER] Toggled status for ${user.name}: ${newStatus}`);
    return updated;
  }

  async uploadAvatar(id, filePath) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { avatar: filePath },
      select: { id: true, name: true, avatar: true },
    });

    return updated;
  }

  async getStats() {
    const [total, active, inactive, suspended, pending, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountStatus: 'ACTIVE' } }),
      prisma.user.count({ where: { accountStatus: 'INACTIVE' } }),
      prisma.user.count({ where: { accountStatus: 'SUSPENDED' } }),
      prisma.user.count({ where: { accountStatus: 'PENDING' } }),
      prisma.user.groupBy({ by: ['role'], _count: true }),
    ]);

    const roles = {};
    byRole.forEach(r => { roles[r.role] = r._count; });

    return { total, active, inactive, suspended, pending, roles };
  }

  async logLogin(userId, data) {
    await prisma.loginHistory.create({
      data: {
        userId,
        device: data.device || null,
        browser: data.browser || null,
        ipAddress: data.ipAddress || null,
        location: data.location || null,
        success: data.success ?? true,
      },
    });
  }

  async logAudit(userId, action, target, details) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        target: target || null,
        details: details || null,
      },
    });
  }

  async getLoginHistory(userId, limit = 20) {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAuditLogs(userId, limit = 50) {
    return prisma.auditLog.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getDepartments() {
    const result = await prisma.user.findMany({
      where: { department: { not: null } },
      select: { department: true },
      distinct: ['department'],
    });
    return result.map(r => r.department).filter(Boolean);
  }
}

module.exports = new UserService();
