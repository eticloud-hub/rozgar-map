const logger = require('../utils/logger');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-me-in-production';

function verifyAdminToken(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin token required'
    });
  }

  if (token !== ADMIN_TOKEN) {
    logger.warn(`⚠️ Invalid admin token attempt from ${req.ip}`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid token'
    });
  }

  logger.info(`✅ Admin authorized from ${req.ip}`);
  next();
}

module.exports = { verifyAdminToken };
