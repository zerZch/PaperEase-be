const request = require('supertest');
const { createApp } = require('../../src/app');

describe('Page redirects', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /Login.html debe redirigir a /login.html', async () => {
    const res = await request(app).get('/Login.html');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/login.html');
  });

  it('GET /login.html debe servir la pagina sin autorredireccionarse', async () => {
    const res = await request(app).get('/login.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<h2>Iniciar Sesión</h2>');
  });
});
