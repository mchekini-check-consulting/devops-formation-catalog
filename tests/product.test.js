const request = require('supertest');

jest.mock('../src/models/product.model', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  sync: jest.fn(),
}));

jest.mock('../src/config/database', () => ({
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  define: jest.fn(),
}));

const Product = require('../src/models/product.model');

const app = require('../src/app');

const mockProduct = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Product',
  price: 29.99,
  category: 'Electronics',
  createdAt: new Date(),
  updatedAt: new Date(),
  update: jest.fn(),
  destroy: jest.fn(),
};

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.clearAllMocks());

describe('POST /products', () => {
  it('should create a product and return 201', async () => {
    Product.create.mockResolvedValue(mockProduct);

    const res = await request(app).post('/products').send({
      name: 'Test Product',
      price: 29.99,
      category: 'Electronics',
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).post('/products').send({
      price: 29.99,
      category: 'Electronics',
    });
    expect(res.status).toBe(400);
  });

  it('should return 400 if price is negative', async () => {
    const res = await request(app).post('/products').send({
      name: 'Bad Product',
      price: -5,
      category: 'Electronics',
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /products/:id', () => {
  it('should update a product and return 200', async () => {
    Product.findByPk.mockResolvedValue({
      ...mockProduct,
      update: jest.fn().mockResolvedValue({ ...mockProduct, name: 'Updated' }),
    });

    const res = await request(app)
      .put(`/products/${mockProduct.id}`)
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/products/nonexistent-id')
      .send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /products/:id', () => {
  it('should delete a product and return 200', async () => {
    Product.findByPk.mockResolvedValue({
      ...mockProduct,
      destroy: jest.fn().mockResolvedValue(true),
    });

    const res = await request(app).delete(`/products/${mockProduct.id}`);
    expect(res.status).toBe(200);
  });

  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);

    const res = await request(app).delete('/products/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('GET /products', () => {
  it('should return all products', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);

    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should support filtering by name', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);

    const res = await request(app).get('/products?name=Test');
    expect(res.status).toBe(200);
  });

  it('should support filtering by price range', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);

    const res = await request(app).get('/products?minPrice=10&maxPrice=50');
    expect(res.status).toBe(200);
  });

  it('should return 400 if minPrice is negative', async () => {
    const res = await request(app).get('/products?minPrice=-1');
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('should return 200 and status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });
});
