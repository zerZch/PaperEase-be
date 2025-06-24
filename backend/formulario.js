const express = require('express');
const path = require('path');
const multer = require('multer');
const conexion = require('./conexion');

const router = express.Router();

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, path.join(__dirname, '../backend/uploads'));

  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({ storage });

// Ruta para manejar el formulario
router.post('/formulario', upload.single('archivo'), (req, res) => {
  const { nombre, apellido, cedula, correo, programa } = req.body;
  const archivo = req.file ? req.file.filename : null;

  const sql = `INSERT INTO solicitudes_formulario (nombre, apellido, cedula, correo, programa, archivo)
   VALUES (?, ?, ?, ?, ?, ?)`;


  conexion.query(sql, [nombre, apellido, cedula, correo, programa, archivo], (err, result) => {
    if (err) {
      console.error('Error al insertar solicitud:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json({ message: 'Solicitud registrada', id: result.insertId });
  });
});

module.exports = router;

