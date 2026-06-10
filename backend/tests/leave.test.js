const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/v1/leave', require('../routes/leave'));

describe('Leave API', () => {
  test('GET /api/v1/leave/types - should return leave types without auth', async () => {
    const res = await request(app).get('/api/v1/leave/types');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/v1/leave/my - should require auth token', async () => {
    const res = await request(app).get('/api/v1/leave/my');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/v1/leave/apply - should require auth token', async () => {
    const res = await request(app)
      .post('/api/v1/leave/apply')
      .send({ leave_type_id: 1, from_date: '2026-07-01', to_date: '2026-07-03', reason: 'Test reason' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/v1/leave/all - should require auth token', async () => {
    const res = await request(app).get('/api/v1/leave/all');
    expect(res.statusCode).toBe(401);
  });
});
