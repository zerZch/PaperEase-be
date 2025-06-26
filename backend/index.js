const express = require('express');
const path = require('path');
const app = express();
const novedadesRouter = require('./novedades.js');
const eventosRouter = require('./eventos.js');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Montar routers en rutas específicas para evitar conflicto
app.use('/api/novedades', novedadesRouter);
app.use('/api/eventos', eventosRouter);

// Servir archivos estáticos (imágenes, css, js) desde carpeta public
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));

// Servir archivos estáticos (html, js, css) desde carpeta src
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Ruta raíz sirve el archivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/menuPE.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
