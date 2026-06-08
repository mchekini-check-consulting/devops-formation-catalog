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

describe('POST /api/products', () => {
  it('should create a product and return 201', async () => {
    Product.create.mockResolvedValue(mockProduct);
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      price: 29.99,
      category: 'Electronics',
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
  });
  it('should return 400 if name is missing', async () => {
    const res = await request(app).post('/api/products').send({
      price: 29.99,
      category: 'Electronics',
    });
    expect(res.status).toBe(400);
  });
  it('should return 400 if price is negative', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Bad Product',
      price: -5,
      category: 'Electronics',
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/products/:id', () => {
  it('should update a product and return 200', async () => {
    Product.findByPk.mockResolvedValue({
      ...mockProduct,
      update: jest.fn().mockResolvedValue({ ...mockProduct, name: 'Updated' }),
    });
    const res = await request(app)
      .put(`/api/products/${mockProduct.id}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });
  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/products/nonexistent-id')
      .send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  it('should delete a product and return 200', async () => {
    Product.findByPk.mockResolvedValue({
      ...mockProduct,
      destroy: jest.fn().mockResolvedValue(true),
    });
    const res = await request(app).delete(`/api/products/${mockProduct.id}`);
    expect(res.status).toBe(200);
  });
  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/products', () => {
  it('should return all products', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('should support filtering by name', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products?name=Test');
    expect(res.status).toBe(200);
  });
  it('should support filtering by price range', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products?minPrice=10&maxPrice=50');
    expect(res.status).toBe(200);
  });
  it('should return 400 if minPrice is negative', async () => {
    const res = await request(app).get('/api/products?minPrice=-1');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/products/:id', () => {
  it('should return a product by id', async () => {
    Product.findByPk.mockResolvedValue(mockProduct);
    const res = await request(app).get(`/api/products/${mockProduct.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Product');
  });
  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
  });
  it('should return 500 on internal error', async () => {
    Product.findByPk.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get(`/api/products/${mockProduct.id}`);
    expect(res.status).toBe(500);
  });
});

describe('Error handling', () => {
  it('POST should return 500 on internal error', async () => {
    Product.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/products').send({
      name: 'Test Product',
      price: 29.99,
      category: 'Electronics',
    });
    expect(res.status).toBe(500);
  });
  it('PUT should return 500 on internal error', async () => {
    Product.findByPk.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put(`/api/products/${mockProduct.id}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
  });
  it('DELETE should return 500 on internal error', async () => {
    Product.findByPk.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete(`/api/products/${mockProduct.id}`);
    expect(res.status).toBe(500);
  });
  it('GET search should return 500 on internal error', async () => {
    Product.findAll.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/health', () => {
  it('should return 200 and status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Route not found');
  });
});