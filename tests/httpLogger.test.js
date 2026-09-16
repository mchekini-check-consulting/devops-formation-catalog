const EventEmitter = require('events');

jest.mock('../src/config/logger', () => ({
  log: jest.fn(),
}));
const logger = require('../src/config/logger');
const httpLogger = require('../src/middleware/httpLogger');

function makeRes(statusCode) {
  const res = new EventEmitter();
  res.statusCode = statusCode;
  return res;
}

describe('httpLogger middleware', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls next() immediately', () => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(200);
    const next = jest.fn();

    httpLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('logs at info level for a 2xx response', () => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(200);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log.mock.calls[0][0]).toBe('info');
    expect(logger.log.mock.calls[0][1]).toBe('GET /api/products 200');
  });

  it('logs at info level for a 399 response (just below the warn threshold)', () => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(399);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    expect(logger.log.mock.calls[0][0]).toBe('info');
  });

  it('logs at warn level for a 400 response (exact threshold)', () => {
    const req = { method: 'POST', originalUrl: '/api/products', headers: {} };
    const res = makeRes(400);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    expect(logger.log.mock.calls[0][0]).toBe('warn');
  });

  it('logs at warn level for a 499 response (just below the error threshold)', () => {
    const req = { method: 'GET', originalUrl: '/api/products/x', headers: {} };
    const res = makeRes(499);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    expect(logger.log.mock.calls[0][0]).toBe('warn');
  });

  it('logs at error level for a 500 response (exact threshold)', () => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(500);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    expect(logger.log.mock.calls[0][0]).toBe('error');
  });

  it('includes correlationId and userId from headers when present', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/products',
      headers: { 'x-correlation-id': 'corr-1', 'x-user-id': 'user-1' },
    };
    const res = makeRes(200);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    const meta = logger.log.mock.calls[0][2];
    expect(meta.correlationId).toBe('corr-1');
    expect(meta.userId).toBe('user-1');
    expect(meta.method).toBe('GET');
    expect(meta.url).toBe('/api/products');
    expect(meta.statusCode).toBe(200);
  });

  it('defaults correlationId and userId to undefined when headers are absent', () => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(200);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    const meta = logger.log.mock.calls[0][2];
    expect(meta.correlationId).toBeUndefined();
    expect(meta.userId).toBeUndefined();
  });

  it('includes the request duration in milliseconds', () => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(200);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    const meta = logger.log.mock.calls[0][2];
    expect(meta.duration).toMatch(/^\d+ms$/);
  });
});
