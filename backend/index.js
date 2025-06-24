const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const novedadesRouter = require('./novedades');
const conexion = require('./conexion'); // Tu conexión a la base de datos

const app = express();
const PORT = 3000;

// Middleware para CORS y JSON
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, '../frontend/public')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Rutas API
app.use('/api', novedadesRouter);

// Ruta para la página principal (menuPE.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/menuPE.html'));
});

// También agregar ruta para formulario.html, si quieres:
// app.get('/formulario', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/src/formulario.html'));
// });

// Configuración Multer para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../frontend/public/uploads')); // Carpeta donde se guardan archivos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Reemplaza espacios por guiones bajos para evitar problemas en nombres
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({ storage });

// Ruta para recibir formulario con archivo
app.post('/api/solicitud', upload.single('archivo'), (req, res) => {
  try {
    const { nombre, apellido, cedula, correo, programa } = req.body;
    const archivo = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO solicitudes_formulario (nombre, apellido, cedula, correo, programa, archivo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexion.query(sql, [nombre, apellido, cedula, correo, programa, archivo], (err, result) => {
      if (err) {
        console.error('Error al insertar solicitud:', err);
        return res.status(500).json({ error: 'Error en la base de datos: ' + err.message });
      }
      res.json({ message: 'Solicitud registrada', id: result.insertId });
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
