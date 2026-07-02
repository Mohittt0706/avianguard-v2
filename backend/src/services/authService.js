const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const AppError = require('../utils/AppError');

class AuthService {
  async register({ name, email, password, role, district }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'VIEWER',
        district: district || null,
      },
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { password: _, refreshToken: _rt, ...userWithoutSensitive } = user;
    return { user: userWithoutSensitive, accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
      },
    });

    const { password: _, refreshToken: _rt, ...userWithoutSensitive } = user;
    return { user: userWithoutSensitive, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    if (user.refreshToken !== refreshToken) {
      throw new AppError('Refresh token has been revoked', 401);
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    const { password: _, refreshToken: _rt, ...userWithoutSensitive } = user;
    return { user: userWithoutSensitive, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password: _, refreshToken: _rt, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        refreshToken: null,
      },
    });
  }

  async getUsers(filters = {}) {
    const where = {};
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.district) where.district = filters.district;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          district: true,
          assignedWetland: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        district: true,
        assignedWetland: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async createUser(data) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        district: data.district || null,
        assignedWetland: data.assignedWetland || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        district: true,
        assignedWetland: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(id, data) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new AppError('Email is already in use', 409);
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.assignedWetland !== undefined) updateData.assignedWetland = data.assignedWetland;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        district: true,
        assignedWetland: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteUser(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.delete({ where: { id } });
  }
}

module.exports = new AuthService();
