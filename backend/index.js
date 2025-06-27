const express = require('express');
const path = require('path');
const app = express();
const novedadesRouter = require('./novedades.js');
const eventosRouter = require('./eventos.js');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Montar routers
app.use('/api/novedades', novedadesRouter); // http://localhost:3000/api/novedades
app.use('/api/eventos', eventosRouter);     // http://localhost:3000/api/eventos

// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/menuPE.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
