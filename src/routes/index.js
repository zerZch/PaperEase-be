const express = require('express');
const path = require('path');
const fs = require('fs');
const serverConfig = require('../../config/server');
const { verificarAutenticacion, verificarTrabajadorSocial } = require('../middleware/auth');

const FRONTEND_DIR = serverConfig.frontendDir;

function mountAllRoutes(app) {
  app.use('/api/novedades', require('./novedades.routes'));
  app.use('/api/eventos', require('./eventos.routes'));
  app.use('/api/estadisticas', verificarAutenticacion, require('./estadisticas.routes'));
  app.use('/api', require('./formulario.routes'));
  app.use('/api/auth', require('./auth.routes'));
  app.use('/api/gestion', verificarAutenticacion, verificarTrabajadorSocial, require('./gestion.routes'));
  app.use('/api/notificaciones', verificarAutenticacion, require('./notificaciones.routes'));

  app.get('/index.html', (req, res) => res.redirect(301, '/'));

  mountSeoRoute(app);
  mountLegacyRedirects(app);
  mountStaticAndPages(app);
}

function mountSeoRoute(app) {
  const formularioHtmlPath = path.join(FRONTEND_DIR, 'pages', 'formulario.html');

  const programasMap = {
    '1': { nombre: 'Canasta Navideña', tipo: 'Promoción Social' },
    '2': { nombre: 'Campaña de Fortalecimiento de Valores', tipo: 'Promoción Social' },
    '3': { nombre: 'Campaña de Concienciación de Instalaciones', tipo: 'Promoción Social' },
    '4': { nombre: 'Feria de Empleo', tipo: 'Promoción Social' },
    '5': { nombre: 'Consejería Personal', tipo: 'Salud' },
    '6': { nombre: 'Banco de Sangre', tipo: 'Salud' },
    '7': { nombre: 'Ayuda en Gastos Médicos', tipo: 'Salud' },
    '8': { nombre: 'Feria de Salud', tipo: 'Salud' },
    '9': { nombre: 'Compra de Lentes', tipo: 'Salud' },
    '10': { nombre: 'Apoyo en Medicamentos', tipo: 'Salud' },
    '11': { nombre: 'Póliza de Salud', tipo: 'Salud' },
    '12': { nombre: 'Matrícula', tipo: 'Salud' },
    '13': { nombre: 'Apoyo en Casos de Siniestros', tipo: 'Promoción Social' }
  };

  app.get(['/Formulario.html', '/formulario.html', '/Formulario', '/formulario'], (req, res) => {
    const { tipo, programa } = req.query;

    if (req.path === '/Formulario.html' || req.path === '/Formulario') {
      const qs = req.originalUrl.includes('?') ? req.originalUrl.substring(req.originalUrl.indexOf('?')) : '';
      return res.redirect(301, '/formulario.html' + qs);
    }

    fs.readFile(formularioHtmlPath, 'utf8', (err, html) => {
      if (err) return res.status(500).send('Error interno del servidor');

      const prog = programa ? programasMap[programa] : null;
      const baseUrl = serverConfig.baseUrl;

      if (prog) {
        const title = `Solicitar ${prog.nombre} | PaperEase`;
        const description = `Solicita ${prog.nombre} del programa de ${prog.tipo} en la UTP. Completa el formulario en PaperEase y gestiona tu solicitud en línea.`;
        const canonical = `${baseUrl}/formulario.html?tipo=${tipo}&programa=${programa}`;

        html = html
          .replace('<title>Formulario de Solicitud • PaperEase</title>', `<title>${title}</title>\n  <meta name="description" content="${description}" />\n  <link rel="canonical" href="${canonical}" />`)
          .replace('<h2>Formulario de Solicitud</h2>', `<h1>Solicitar ${prog.nombre}</h1>`);
      } else {
        const canonical = `${baseUrl}/formulario.html`;
        html = html
          .replace('<title>Formulario de Solicitud • PaperEase</title>', `<title>Formulario de Solicitud | PaperEase</title>\n  <meta name="description" content="Formulario de solicitud de programas de Bienestar Estudiantil en la UTP." />\n  <link rel="canonical" href="${canonical}" />`)
          .replace('<h2>Formulario de Solicitud</h2>', '<h1>Formulario de Solicitud</h1>');
      }

      res.set('Content-Type', 'text/html');
      res.send(html);
    });
  });
}

function mountLegacyRedirects(app) {
  const legacyRedirects = {
    'Login.html': 'login.html', 'Registro.html': 'registro.html', 'MenuPE.html': 'menupe.html',
    'Programas.html': 'programas.html', 'Novedades.html': 'novedades.html', 'Solicitudes.html': 'solicitudes.html',
    'Eventos.html': 'eventos.html', 'Estadisticas_Dashboard.html': 'estadisticas_dashboard.html',
    'Ayuda.html': 'ayuda.html', 'Privacidad.html': 'privacidad.html', 'Terminos.html': 'terminos.html', 'Contacto.html': 'contacto.html'
  };

  Object.entries(legacyRedirects).forEach(([oldPage, newPage]) => {
    const oldWithout = oldPage.replace('.html', '');
    const newWithout = newPage.replace('.html', '');

    app.get([`/${oldPage}`, `/${oldWithout}`], (req, res, next) => {
      const requestedPage = req.path.replace(/^\/+/, '');

      if (requestedPage === newPage || requestedPage === newWithout) {
        return next();
      }

      return res.redirect(301, `/${newPage}`);
    });
  });
}

function mountStaticAndPages(app) {
  // Serve root index.html
  app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

  // Explicit page routes - must come BEFORE express.static to prevent conflicts
  const htmlPages = [
    'login.html', 'registro.html', 'menupe.html', 'programas.html', 'novedades.html',
    'solicitudes.html', 'eventos.html', 'estadisticas_dashboard.html', 'gestion.html',
    'ayuda.html', 'privacidad.html', 'terminos.html', 'contacto.html'
  ];

  htmlPages.forEach((page) => {
    const pageWithoutExtension = page.replace('.html', '');
    const aliases = [`/${page}`, `/${pageWithoutExtension}`];
    app.get([...new Set(aliases)], (req, res) => {
      res.sendFile(path.join(FRONTEND_DIR, 'pages', page));
    });
  });

  // Static file serving - comes AFTER explicit routes
  app.use(express.static(FRONTEND_DIR));
  app.use('/uploads', express.static(serverConfig.uploadsDir));
}

function mountNotFound(app) {
  app.use((req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Ruta no encontrada', method: req.method, url: req.url });
  });
}

module.exports = { mountAllRoutes, mountNotFound };
