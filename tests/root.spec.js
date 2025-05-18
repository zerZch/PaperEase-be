import request from 'supertest';
import { app } from '../src/index.js';

describe('GET /', () => {
  it('responde 200 y contiene el mensaje de bienvenida', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/PaperEase API/);
  });
});