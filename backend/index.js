const express = require('express');
const path = require('path');
const multer = require('multer');
const http = require('http');
const socketIO = require('socket.io');
const { verificarAutenticacion, verificarEstudiante, verificarTrabajadorSocial } = require('./middleware/authMiddleware');
const app = express();
const server = http.createServer(app);
const FRONTEND_DIR = path.join(__dirname, '../frontend/src');

const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500']
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'];

// Configurar Socket.IO
const io = socketIO(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true
  }
});

const novedadesRouter = require('./novedades.js');
const eventosRouter = require('./eventos.js');
const cors = require('cors');
const estadisticasRoutes = require('./estadisticas.js');
const formularioRoutes = require('./formulario');
const authRoutes = require('./auth.js');
const gestionRoutes = require('./gestion.js');
const notificacionesRoutes = require('./notificaciones.js');

// Configurar CORS
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Headers de seguridad con helmet
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdn.socket.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false // Necesario para cargar recursos de CDNs
}));

// Railway usa reverse proxy — necesario para cookies secure
app.set('trust proxy', 1);

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Inyectar Socket.IO en el módulo de notificaciones
notificacionesRoutes.setSocketIO(io);

// Montar routers con las rutas correctas
app.use('/api/novedades', novedadesRouter);     // http://localhost:3000/api/novedades
app.use('/api/eventos', verificarAutenticacion, verificarTrabajadorSocial, eventosRouter);         // http://localhost:3000/api/eventos
app.use('/api/estadisticas', verificarAutenticacion, estadisticasRoutes); // http://localhost:3000/api/estadisticas
app.use('/api', formularioRoutes);
app.use('/api/auth', authRoutes);               // http://localhost:3000/api/auth
app.use('/api/gestion', verificarAutenticacion, verificarTrabajadorSocial, gestionRoutes);         // http://localhost:3000/api/gestion
app.use('/api/notificaciones', verificarAutenticacion, notificacionesRoutes); // http://localhost:3000/api/notificaciones
// Redirect 301: /index.html → / (evita contenido duplicado)
app.get('/index.html', (req, res) => {
  res.redirect(301, '/');
});

// Servir archivos estáticos del frontend
app.use(express.static(FRONTEND_DIR));
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Página principal - Servir landing page pública
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Mapa de programas para SEO dinámico en Formulario.html
const programasMap = {
  '1': { nombre: 'Canasta Navideña', tipo: 'Bienestar Social' },
  '2': { nombre: 'Campaña de Fortalecimiento de Valores', tipo: 'Bienestar Social' },
  '3': { nombre: 'Campaña de Concienciación de Instalaciones', tipo: 'Bienestar Social' },
  '4': { nombre: 'Feria de Empleo', tipo: 'Bienestar Social' },
  '5': { nombre: 'Consejería Personal', tipo: 'Bienestar Social' },
  '6': { nombre: 'Banco de Sangre', tipo: 'Bienestar en Salud' },
  '7': { nombre: 'Ayuda en Gastos Médicos', tipo: 'Bienestar en Salud' },
  '8': { nombre: 'Feria de Salud', tipo: 'Bienestar en Salud' },
  '9': { nombre: 'Compra de Lentes', tipo: 'Bienestar en Salud' },
  '10': { nombre: 'Apoyo en Medicamentos', tipo: 'Bienestar en Salud' },
  '11': { nombre: 'Póliza de Salud', tipo: 'Bienestar en Salud' }
};

// Ruta dinámica para Formulario.html con SEO por programa
const fs = require('fs');
const formularioHtmlPath = path.join(FRONTEND_DIR, 'formulario.html');

app.get(['/Formulario.html', '/formulario.html', '/Formulario', '/formulario'], (req, res) => {
  const { tipo, programa } = req.query;

  // Redirect 301 desde versiones con mayúsculas
  if (req.path === '/Formulario.html' || req.path === '/Formulario') {
    const qs = req.originalUrl.includes('?') ? req.originalUrl.substring(req.originalUrl.indexOf('?')) : '';
    return res.redirect(301, '/formulario.html' + qs);
  }
  
  fs.readFile(formularioHtmlPath, 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send('Error interno del servidor');
    }

    const prog = programa ? programasMap[programa] : null;
    const baseUrl = 'https://paperease.up.railway.app';

    if (prog) {
      // Título, meta description y canonical dinámicos
      const title = `Solicitar ${prog.nombre} | PaperEase`;
      const description = `Solicita ${prog.nombre} del programa de ${prog.tipo} en la UTP. Completa el formulario en PaperEase y gestiona tu solicitud en línea.`;
      const canonical = `${baseUrl}/formulario.html?tipo=${tipo}&programa=${programa}`;

      html = html.replace(
        '<title>Formulario de Solicitud • PaperEase</title>',
        `<title>${title}</title>\n  <meta name="description" content="${description}" />\n  <link rel="canonical" href="${canonical}" />`
      );

      // H1 dinámico (reemplaza el h2 actual)
      html = html.replace(
        '<h2>Formulario de Solicitud</h2>',
        `<h1>Solicitar ${prog.nombre}</h1>`
      );
    } else {
      // Sin parámetros: versión genérica
      const canonical = `${baseUrl}/formulario.html`;
      html = html.replace(
        '<title>Formulario de Solicitud • PaperEase</title>',
        `<title>Formulario de Solicitud | PaperEase</title>\n  <meta name="description" content="Formulario de solicitud de programas de Bienestar Estudiantil en la UTP. Selecciona tu programa y completa tus datos en PaperEase." />\n  <link rel="canonical" href="${canonical}" />`
      );

      // H1 genérico
      html = html.replace(
        '<h2>Formulario de Solicitud</h2>',
        '<h1>Formulario de Solicitud</h1>'
      );
    }

    res.set('Content-Type', 'text/html');
    res.send(html);
  });
});

// Mapa de redirects 301: URLs antiguas con mayúsculas → nuevas en minúsculas
const legacyRedirects = {
  'Login.html': 'login.html',
  'Registro.html': 'registro.html',
  'MenuPE.html': 'menupe.html',
  'Programas.html': 'programas.html',
  'Novedades.html': 'novedades.html',
  'Solicitudes.html': 'solicitudes.html',
  'Eventos.html': 'eventos.html',
  'Estadisticas_Dashboard.html': 'estadisticas_dashboard.html',
  'Ayuda.html': 'ayuda.html',
  'Privacidad.html': 'privacidad.html',
  'Terminos.html': 'terminos.html',
  'Contacto.html': 'contacto.html'
};

// Redirects 301 desde URLs con mayúsculas
Object.entries(legacyRedirects).forEach(([oldPage, newPage]) => {
  const oldWithout = oldPage.replace('.html', '');
  app.get([`/${oldPage}`, `/${oldWithout}`], (req, res) => {
    res.redirect(301, `/${newPage}`);
  });
});

// Rutas HTML en minúsculas (archivos reales)
const htmlPages = [
  'login.html',
  'registro.html',
  'menupe.html',
  'programas.html',
  'novedades.html',
  'solicitudes.html',
  'eventos.html',
  'estadisticas_dashboard.html',
  'gestion.html',
  'ayuda.html',
  'privacidad.html',
  'terminos.html',
  'contacto.html'
];

htmlPages.forEach((page) => {
  const pageWithoutExtension = page.replace('.html', '');
  const aliases = [`/${page}`, `/${pageWithoutExtension}`];

  app.get([...new Set(aliases)], (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, page));
  });
});

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/novedades',
      '/api/eventos', 
      '/api/formulario',
      '/api/estadisticas'
    ]
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.url,
    availableRoutes: [
      'GET /api/test',
      'GET /api/estadisticas/dashboard',
      'GET /api/estadisticas/facultades',
      'GET /api/estadisticas/programas',
      'GET /api/estadisticas/tipos-programa',
      'GET /api/estadisticas/eventos-timeline'
    ]
  });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error capturado:', error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'JSON inválido en la solicitud' });
  }
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Archivo demasiado grande. Máximo 5MB.' });
    }
  }
  
  if (error.message === 'Tipo de archivo no permitido. Solo PDF, JPG, JPEG, PNG') {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// ============================================
// CONFIGURACIÓN DE SOCKET.IO
// ============================================
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`);

  // CAMBIO: El cliente envía su cédula (no IdEstudiante) al conectarse
  socket.on('registrar_estudiante', (cedula) => {
    socket.join(`estudiante_${cedula}`);
    console.log(`📝 Estudiante con cédula ${cedula} registrado en la sala`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Estadísticas disponibles en http://localhost:${PORT}/api/estadisticas/dashboard`);
  console.log(`🧪 Prueba la API en http://localhost:${PORT}/api/test`);
  console.log(`🔔 Sistema de notificaciones en tiempo real activado`);
});

module.exports = app;
