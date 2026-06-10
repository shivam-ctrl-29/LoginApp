const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/v1/auth', require('../routes/auth'));

describe('Auth API', () => {
  test('POST /api/v1/auth/login - should fail with missing credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/v1/auth/login - should fail with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/v1/auth/login - should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'notanemail', password: 'password123' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
