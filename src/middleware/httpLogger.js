const logger = require('../config/logger');

const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, `${req.method} ${req.originalUrl} ${res.statusCode}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      correlationId: req.headers['x-correlation-id'] || undefined,
      userId: req.headers['x-user-id'] || undefined,
    });
  });

  next();
};

module.exports = httpLogger;
