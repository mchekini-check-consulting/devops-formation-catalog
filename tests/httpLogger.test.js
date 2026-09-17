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

  it('logs with the exact "METHOD URL STATUS" message format', () => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(200);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log.mock.calls[0][1]).toBe('GET /api/products 200');
  });

  it.each([
    [200, 'info'],
    [399, 'info'],
    [400, 'warn'],
    [499, 'warn'],
    [500, 'error'],
  ])('logs a %i response at "%s" level', (statusCode, expectedLevel) => {
    const req = { method: 'GET', originalUrl: '/api/products', headers: {} };
    const res = makeRes(statusCode);
    httpLogger(req, res, jest.fn());

    res.emit('finish');

    expect(logger.log.mock.calls[0][0]).toBe(expectedLevel);
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
