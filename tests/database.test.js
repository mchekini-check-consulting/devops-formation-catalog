describe('Database configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should create a Sequelize instance with default values', () => {
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.NODE_ENV;

    const sequelize = require('../src/config/database');
    expect(sequelize.config.database).toBe('catalogue_db');
    expect(sequelize.config.username).toBe('postgres');
    expect(sequelize.config.host).toBe('localhost');
    expect(sequelize.config.port).toBe(5432);
    expect(sequelize.getDialect()).toBe('postgres');
  });

  it('should use environment variables when provided', () => {
    process.env.DB_NAME = 'test_db';
    process.env.DB_USER = 'test_user';
    process.env.DB_PASSWORD = 'test_pass';
    process.env.DB_HOST = 'test_host';
    process.env.DB_PORT = '5433';

    const sequelize = require('../src/config/database');
    expect(sequelize.config.database).toBe('test_db');
    expect(sequelize.config.username).toBe('test_user');
    expect(sequelize.config.host).toBe('test_host');
    expect(sequelize.config.port).toBe(5433);
  });

  it('should enable logging in development mode', () => {
    process.env.NODE_ENV = 'development';

    const sequelize = require('../src/config/database');
    expect(typeof sequelize.options.logging).toBe('function');
  });

  it('should disable logging in non-development mode', () => {
    process.env.NODE_ENV = 'production';

    const sequelize = require('../src/config/database');
    expect(sequelize.options.logging).toBe(false);
  });
});
