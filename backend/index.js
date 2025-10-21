const express = require('express');
const path = require('path');
const multer = require('multer');
const app = express();
const novedadesRouter = require('./novedades.js');
const eventosRouter = require('./eventos.js');
const cors = require('cors');
const estadisticasRoutes = require('./estadisticas.js');
const formularioRoutes = require('./formulario');

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Montar routers con las rutas correctas
app.use('/api/novedades', novedadesRouter);     // http://localhost:3000/api/novedades
app.use('/api/eventos', eventosRouter);         // http://localhost:3000/api/eventos
app.use('/api/estadisticas', estadisticasRoutes); // http://localhost:3000/api/estadisticas
app.use('/api', formularioRoutes);
// Servir archivos estáticos
// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));
// También exponer el contenido de frontend/src en la raíz para que rutas como
// /Estadisticas_Dashboard.html funcionen directamente.
app.use(express.static(path.join(__dirname, '../frontend/src')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/menuPE.html'));
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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Estadísticas disponibles en http://localhost:${PORT}/api/estadisticas/dashboard`);
  console.log(`🧪 Prueba la API en http://localhost:${PORT}/api/test`);
});

module.exports = app;