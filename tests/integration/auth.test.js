const request = require('supertest');
const { createApp } = require('../../src/app');

describe('GET /api/test', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('debe responder con servidor funcionando', async () => {
    const res = await request(app).get('/api/test');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/servidor/i);
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Auth routes - validación', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('POST /api/auth/login sin body debe dar 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/auth/register sin body debe dar 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/auth/me sin token debe dar 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
