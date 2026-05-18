const request = require('supertest');
const { createApp } = require('../../src/app');

describe('Route protection - formulario', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /api/config debe ser público (200)', async () => {
    const res = await request(app).get('/api/config');
    expect(res.status).toBe(200);
  });

  it('POST /api/formulario sin token debe dar 401', async () => {
    const res = await request(app).post('/api/formulario').send({ tipoPrograma: '1', programa: '1' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/mis-solicitudes sin token debe dar 401', async () => {
    const res = await request(app).get('/api/mis-solicitudes');
    expect(res.status).toBe(401);
  });

  it('GET /api/solicitudes sin token debe dar 401', async () => {
    const res = await request(app).get('/api/solicitudes');
    expect(res.status).toBe(401);
  });

  it('GET /api/count sin token debe dar 401', async () => {
    const res = await request(app).get('/api/count');
    expect(res.status).toBe(401);
  });
});

describe('Route protection - gestion', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('PUT /api/gestion/solicitud/1/aprobar sin token debe dar 401', async () => {
    const res = await request(app).put('/api/gestion/solicitud/1/aprobar').send({});
    expect(res.status).toBe(401);
  });

  it('PUT /api/gestion/solicitud/1/rechazar sin token debe dar 401', async () => {
    const res = await request(app).put('/api/gestion/solicitud/1/rechazar').send({});
    expect(res.status).toBe(401);
  });

  it('PUT /api/gestion/solicitud/1/prioridad sin token debe dar 401', async () => {
    const res = await request(app).put('/api/gestion/solicitud/1/prioridad').send({ prioridad: 'alta' });
    expect(res.status).toBe(401);
  });
});

describe('Auth routes - register validation', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('POST /api/auth/register sin body debe dar 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/auth/register sin género debe dar 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      nombre: 'Test',
      apellido: 'User',
      email: 'test@utp.ac.pa',
      password: '123456',
      rol: 1,
      cedula: '8-123-4567',
      idFacultad: 1
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nero/i);
  });
});

describe('Auth routes', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('POST /api/auth/login sin body debe dar 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/auth/me sin token debe dar 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/verificar sin token debe dar 401', async () => {
    const res = await request(app).get('/api/auth/verificar');
    expect(res.status).toBe(401);
  });
});

describe('Page routes', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('GET / debe servir index.html', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('PaperEase');
  });

  it('GET /registro.html debe servir la página', async () => {
    const res = await request(app).get('/registro.html');
    expect(res.status).toBe(200);
  });

  it('GET /programas.html debe servir la página', async () => {
    const res = await request(app).get('/programas.html');
    expect(res.status).toBe(200);
  });

  it('GET /formulario.html debe servir la página', async () => {
    const res = await request(app).get('/formulario.html');
    expect(res.status).toBe(200);
  });

  it('GET /formulario.html?tipo=2&programa=5 debe cargar SEO con Consejería Personal', async () => {
    const res = await request(app).get('/formulario.html?tipo=2&programa=5');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Consejería Personal');
    expect(res.text).toContain('Salud');
  });
});

describe('Legacy redirects', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /Registro.html debe redirigir a /registro.html', async () => {
    const res = await request(app).get('/Registro.html');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/registro.html');
  });

  it('GET /Programas.html debe redirigir a /programas.html', async () => {
    const res = await request(app).get('/Programas.html');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/programas.html');
  });

  it('GET /Formulario.html debe redirigir a /formulario.html', async () => {
    const res = await request(app).get('/Formulario.html');
    expect(res.status).toBe(301);
    expect(res.headers.location).toMatch(/formulario\.html/);
  });
});