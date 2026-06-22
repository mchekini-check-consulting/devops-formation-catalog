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
    expect(attributes.id.type.key).toBe('UUID');

    expect(attributes.name).toBeDefined();
    expect(attributes.name.allowNull).toBe(false);
    expect(attributes.name.type.key).toBe('STRING');

    expect(attributes.price).toBeDefined();
    expect(attributes.price.allowNull).toBe(false);

    expect(attributes.category).toBeDefined();
    expect(attributes.category.allowNull).toBe(false);
    expect(attributes.category.type.key).toBe('STRING');
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

  it('should have name validation with notEmpty and len constraints', () => {
    const Product = require('../src/models/product.model');
    const nameValidate = Product.rawAttributes.name.validate;
    expect(nameValidate.notEmpty).toBeDefined();
    expect(nameValidate.notEmpty.msg).toBe('Name cannot be empty');
    expect(nameValidate.len).toBeDefined();
    expect(nameValidate.len.args).toEqual([1, 255]);
    expect(nameValidate.len.msg).toBe('Name must be between 1 and 255 characters');
  });

  it('should have price validation with isDecimal and min constraints', () => {
    const Product = require('../src/models/product.model');
    const priceValidate = Product.rawAttributes.price.validate;
    expect(priceValidate.isDecimal).toBeDefined();
    expect(priceValidate.isDecimal.msg).toBe('Price must be a valid number');
    expect(priceValidate.min).toBeDefined();
    expect(priceValidate.min.args).toEqual([0]);
    expect(priceValidate.min.msg).toBe('Price must be greater than or equal to 0');
  });

  it('should have category validation with notEmpty constraint', () => {
    const Product = require('../src/models/product.model');
    const categoryValidate = Product.rawAttributes.category.validate;
    expect(categoryValidate.notEmpty).toBeDefined();
    expect(categoryValidate.notEmpty.msg).toBe('Category cannot be empty');
  });

  it('should have price with DECIMAL(10,2) type', () => {
    const Product = require('../src/models/product.model');
    const priceType = Product.rawAttributes.price.type;
    expect(priceType.key).toBe('DECIMAL');
    expect(priceType._precision).toBe(10);
    expect(priceType._scale).toBe(2);
  });
});
