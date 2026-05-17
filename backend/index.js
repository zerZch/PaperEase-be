const express = require('express');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
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

// Railway usa reverse proxy — necesario para cookies secure
app.set('trust proxy', 1);

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'paperease-secret-key-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Inyectar Socket.IO en el módulo de notificaciones
notificacionesRoutes.setSocketIO(io);

// Montar routers con las rutas correctas
app.use('/api/novedades', novedadesRouter);     // http://localhost:3000/api/novedades
app.use('/api/eventos', eventosRouter);         // http://localhost:3000/api/eventos
app.use('/api/estadisticas', estadisticasRoutes); // http://localhost:3000/api/estadisticas
app.use('/api', formularioRoutes);
app.use('/api/auth', authRoutes);               // http://localhost:3000/api/auth
app.use('/api/gestion', gestionRoutes);         // http://localhost:3000/api/gestion
app.use('/api/notificaciones', notificacionesRoutes); // http://localhost:3000/api/notificaciones
// Servir archivos estáticos del frontend
app.use(express.static(FRONTEND_DIR));
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Página principal - Servir landing page pública
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Rutas HTML directas para que /Login.html, /MenuPE.html, etc. funcionen
// aunque el static middleware no resuelva la extension en algun entorno.
const htmlPages = [
  'Login.html',
  'Registro.html',
  'MenuPE.html',
  'Programas.html',
  'Novedades.html',
  'Solicitudes.html',
  'Formulario.html',
  'Eventos.html',
  'Estadisticas_Dashboard.html',
  'gestion.html',
  'Ayuda.html',
  'Privacidad.html',
  'Terminos.html',
  'Contacto.html'
];

htmlPages.forEach((page) => {
  const pageWithoutExtension = page.replace('.html', '');
  const aliases = [
    `/${page}`,
    `/${pageWithoutExtension}`,
    `/${page.toLowerCase()}`,
    `/${pageWithoutExtension.toLowerCase()}`
  ];

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
