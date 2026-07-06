const prisma = require('../config/database');
const { verifyAccessToken } = require('../utils/token');
const AppError = require('../utils/AppError');

async function authenticate(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        district: true,
        taluka: true,
        assignedWetland: true,
        phone: true,
        employeeId: true,
        department: true,
        designation: true,
        avatar: true,
        accountStatus: true,
        permissions: true,
        isActive: true,
        passwordChangedAt: true,
      },
    });

    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact an administrator.', 401));
    }

    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('User recently changed password. Please log in again.', 401));
      }
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticate };
