const request = require('supertest');
const sequelize = require('../../src/config/database');
const Product = require('../../src/models/product.model');
const app = require('../../src/app');

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Integration Tests', () => {
  let createdProductId;

  it('GET /api/health → 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('POST /api/products → 201', async () => {
    const res = await request(app).post('/api/products').send({
      name: 'Integration Product',
      price: 19.99,
      category: 'Testing',
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Integration Product');
    expect(res.body.id).toBeDefined();
    createdProductId = res.body.id;
  });

  it('GET /api/products/:id → 200', async () => {
    const res = await request(app).get(`/api/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Integration Product');
    expect(res.body.price).toBe('19.99');
    expect(res.body.category).toBe('Testing');
  });

  it('GET /api/products?name=Integration → 200', async () => {
    const res = await request(app).get('/api/products?name=Integration');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toContain('Integration');
  });

  it('PUT /api/products/:id → 200', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .send({ name: 'Updated Product', price: 29.99 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Product');
  });

  it('DELETE /api/products/:id → 200', async () => {
    const res = await request(app).delete(`/api/products/${createdProductId}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/products/:id → 404 after deletion', async () => {
    const res = await request(app).get(`/api/products/${createdProductId}`);
    expect(res.status).toBe(404);
  });

  it('POST /api/products → 400 on validation error', async () => {
    const res = await request(app).post('/api/products').send({
      price: -5,
    });
    expect(res.status).toBe(400);
  });
});
