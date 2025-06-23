const express = require('express');
const path = require('path');
const app = express();
const novedadesRouter = require('./novedades');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// API para novedades
app.use('/api', novedadesRouter);

// Servir archivos estáticos (imágenes, css, js) desde carpeta public
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));

// Servir archivos estáticos (html, js, css) desde carpeta src
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Definir la ruta raíz para enviar el HTML principal (menuPE.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/menuPE.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
