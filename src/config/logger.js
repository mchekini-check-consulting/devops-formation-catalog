const winston = require('winston');
const opentelemetry = require('@opentelemetry/api');

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const SERVICE_NAME = process.env.SERVICE_NAME || 'catalog';
const ENV = process.env.ENV || process.env.NODE_ENV || 'development';

const getTraceContext = () => {
  const span = opentelemetry.trace.getActiveSpan();
  if (span) {
    const context = span.spanContext();
    return {
      traceId: context.traceId,
      spanId: context.spanId,
    };
  }
  return { traceId: undefined, spanId: undefined };
};

const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { traceId, spanId } = getTraceContext();

    const logEntry = {
      timestamp: info.timestamp,
      level: info.level.toUpperCase(),
      service: SERVICE_NAME,
      env: ENV,
      traceId: traceId || undefined,
      spanId: spanId || undefined,
      message: info.message,
    };

    if (info.correlationId) {
      logEntry.correlationId = info.correlationId;
    }

    if (info.userId) {
      logEntry.userId = info.userId;
    }

    if (info.error || info.stack) {
      const err = info.error || info;
      logEntry.exception = {
        type: err.name || err.constructor?.name || 'Error',
        message: err.message || info.message,
        stackTrace: err.stack || info.stack,
      };
    }

    // Merge any additional metadata
    const reserved = [
      'timestamp', 'level', 'service', 'env', 'message',
      'traceId', 'spanId', 'correlationId', 'userId',
      'error', 'stack', 'splat',
    ];
    Object.keys(info).forEach((key) => {
      if (!reserved.includes(key)) {
        logEntry[key] = info[key];
      }
    });

    return JSON.stringify(logEntry);
  }),
);

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: structuredFormat,
  transports: [
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

module.exports = logger;
