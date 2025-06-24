const express = require('express');
const path = require('path');
const cors = require('cors');
const novedadesRouter = require('./novedades');
const formularioRouter = require('./formulario'); // 👈 Importamos solicitud

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Archivos estáticos
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Rutas API
app.use('/api', novedadesRouter);
app.use('/api', formularioRouter); // 👈 Usamos las rutas del formulario

// Página raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/menuPE.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
