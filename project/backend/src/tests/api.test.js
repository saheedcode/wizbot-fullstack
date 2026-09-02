const request = require('supertest');
const app = require('../app');

describe('API: General', () => {
  it('returns healthy status from /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('returns a consistent error shape', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bad', password: '' });
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });
});
