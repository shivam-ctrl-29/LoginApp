const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/v1/employees', require('../routes/employees'));

describe('Employee API', () => {
  test('GET /api/v1/employees - should require auth token', async () => {
    const res = await request(app).get('/api/v1/employees');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/v1/employees - should require auth token', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .send({ name: 'Test', email: 'test@test.com' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/v1/employees/:id - should require auth token', async () => {
    const res = await request(app).get('/api/v1/employees/1');
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/v1/employees/:id - should require auth token', async () => {
    const res = await request(app).delete('/api/v1/employees/1');
    expect(res.statusCode).toBe(401);
  });
});
