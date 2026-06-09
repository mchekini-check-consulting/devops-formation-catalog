describe('Product model', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, NODE_ENV: 'test' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should define the Product model with correct attributes', () => {
    const Product = require('../src/models/product.model');

    expect(Product).toBeDefined();
    expect(Product.name).toBe('Product');

    const attributes = Product.rawAttributes;
    expect(attributes.id).toBeDefined();
    expect(attributes.id.primaryKey).toBe(true);

    expect(attributes.name).toBeDefined();
    expect(attributes.name.allowNull).toBe(false);

    expect(attributes.price).toBeDefined();
    expect(attributes.price.allowNull).toBe(false);

    expect(attributes.category).toBeDefined();
    expect(attributes.category.allowNull).toBe(false);
  });

  it('should use the products table name', () => {
    const Product = require('../src/models/product.model');
    expect(Product.getTableName()).toBe('products');
  });

  it('should have timestamps enabled', () => {
    const Product = require('../src/models/product.model');
    expect(Product.rawAttributes.createdAt).toBeDefined();
    expect(Product.rawAttributes.updatedAt).toBeDefined();
  });

  it('should generate a UUID as default id', () => {
    const Product = require('../src/models/product.model');
    const defaultValue = Product.rawAttributes.id.defaultValue;
    expect(typeof defaultValue).toBe('function');

    const uuid = defaultValue();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
