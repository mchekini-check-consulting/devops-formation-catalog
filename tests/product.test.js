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
    expect(res.body.price).toBe(29.99);
    expect(res.body.category).toBe('Electronics');
    expect(res.body.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(Product.create).toHaveBeenCalledTimes(1);
    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Product', price: 29.99, category: 'Electronics' })
    );
  });
  it('should return 400 if name is missing', async () => {
    const res = await request(app).post('/api/products').send({
      price: 29.99,
      category: 'Electronics',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
    expect(Product.create).not.toHaveBeenCalled();
  });
  it('should return 400 if price is negative', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Bad Product',
      price: -5,
      category: 'Electronics',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Product.create).not.toHaveBeenCalled();
  });
  it('should return 400 if price is missing', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'No Price',
      category: 'Electronics',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Product.create).not.toHaveBeenCalled();
  });
  it('should return 400 if category is missing', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'No Category',
      price: 10,
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Product.create).not.toHaveBeenCalled();
  });
  it('should return 400 if name exceeds 255 characters', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'A'.repeat(256),
      price: 10,
      category: 'Test',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
  it('should accept price of 0', async () => {
    Product.create.mockResolvedValue({ ...mockProduct, price: 0 });
    const res = await request(app).post('/api/products').send({
      name: 'Free Product',
      price: 0,
      category: 'Free',
    });
    expect(res.status).toBe(201);
  });
});

describe('PUT /api/products/:id', () => {
  it('should update a product and return 200', async () => {
    const productInstance = {
      ...mockProduct,
      update: jest.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        return Promise.resolve(this);
      }),
    };
    Product.findByPk.mockResolvedValue(productInstance);
    const res = await request(app)
      .put(`/api/products/${mockProduct.id}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
    expect(Product.findByPk).toHaveBeenCalledWith(mockProduct.id);
    expect(productInstance.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated' }));
  });
  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/products/nonexistent-id')
      .send({ name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });
  it('should return 400 if price is negative', async () => {
    const res = await request(app)
      .put(`/api/products/${mockProduct.id}`)
      .send({ price: -10 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Product.findByPk).not.toHaveBeenCalled();
  });
  it('should return 400 if name exceeds 255 characters', async () => {
    const res = await request(app)
      .put(`/api/products/${mockProduct.id}`)
      .send({ name: 'A'.repeat(256) });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
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
    expect(res.body.message).toBe('Product deleted successfully');
    expect(Product.findByPk).toHaveBeenCalledWith(mockProduct.id);
  });
  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });
});

describe('GET /api/products', () => {
  it('should return all products', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test Product');
  });
  it('should return empty array when no products', async () => {
    Product.findAll.mockResolvedValue([]);
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
  it('should support filtering by name', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products?name=Test');
    expect(res.status).toBe(200);
    expect(Product.findAll).toHaveBeenCalledTimes(1);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.name).toBeDefined();
  });
  it('should support filtering by category', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products?category=Electronics');
    expect(res.status).toBe(200);
    expect(Product.findAll).toHaveBeenCalledTimes(1);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.category).toBeDefined();
  });
  it('should support filtering by price range', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products?minPrice=10&maxPrice=50');
    expect(res.status).toBe(200);
    expect(Product.findAll).toHaveBeenCalledTimes(1);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.price).toBeDefined();
  });
  it('should support filtering by minPrice only', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products?minPrice=10');
    expect(res.status).toBe(200);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.price).toBeDefined();
  });
  it('should support filtering by maxPrice only', async () => {
    Product.findAll.mockResolvedValue([mockProduct]);
    const res = await request(app).get('/api/products?maxPrice=50');
    expect(res.status).toBe(200);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.price).toBeDefined();
  });
  it('should not set where.name when name not provided', async () => {
    Product.findAll.mockResolvedValue([]);
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.name).toBeUndefined();
  });
  it('should not set where.category when category not provided', async () => {
    Product.findAll.mockResolvedValue([]);
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.category).toBeUndefined();
  });
  it('should not set where.price when no price filters', async () => {
    Product.findAll.mockResolvedValue([]);
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.where.price).toBeUndefined();
  });
  it('should return 400 if minPrice is negative', async () => {
    const res = await request(app).get('/api/products?minPrice=-1');
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Product.findAll).not.toHaveBeenCalled();
  });
  it('should return 400 if maxPrice is negative', async () => {
    const res = await request(app).get('/api/products?maxPrice=-1');
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Product.findAll).not.toHaveBeenCalled();
  });
  it('should pass order by createdAt DESC', async () => {
    Product.findAll.mockResolvedValue([]);
    await request(app).get('/api/products');
    const callArgs = Product.findAll.mock.calls[0][0];
    expect(callArgs.order).toEqual([['createdAt', 'DESC']]);
  });
});

describe('GET /api/products/:id', () => {
  it('should return a product by id', async () => {
    Product.findByPk.mockResolvedValue(mockProduct);
    const res = await request(app).get(`/api/products/${mockProduct.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Product');
    expect(res.body.price).toBe(29.99);
    expect(res.body.category).toBe('Electronics');
    expect(Product.findByPk).toHaveBeenCalledWith(mockProduct.id);
  });
  it('should return 404 if product not found', async () => {
    Product.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });
  it('should return 500 on internal error', async () => {
    Product.findByPk.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get(`/api/products/${mockProduct.id}`);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
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
    expect(res.body.message).toBe('Internal server error');
    expect(res.body.error).toBe('DB error');
  });
  it('PUT should return 500 on internal error', async () => {
    Product.findByPk.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put(`/api/products/${mockProduct.id}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(res.body.error).toBe('DB error');
  });
  it('DELETE should return 500 on internal error', async () => {
    Product.findByPk.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete(`/api/products/${mockProduct.id}`);
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(res.body.error).toBe('DB error');
  });
  it('GET search should return 500 on internal error', async () => {
    Product.findAll.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(res.body.error).toBe('DB error');
  });
});

describe('GET /api/health', () => {
  it('should return 200 and status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('catalogue-service');
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Route not found');
  });
});
