const express = require('express');
const router = express.Router();
const db = require('./conexion');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evento-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Obtener todos los eventos
router.get('/', (req, res) => {
  db.query('SELECT * FROM eventos ORDER BY year DESC, Mes DESC, Dia DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Obtener un evento específico por ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM eventos WHERE Id_Eventos = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(result[0]);
  });
});

// Crear evento (con soporte para imágenes)
router.post('/', upload.single('imagen'), (req, res) => {
  const {
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa
  } = req.body;

  // Construir la URL de la imagen si se subió un archivo
  const imagenUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `INSERT INTO eventos
    (Titulo, Descripcion, Lugar, HoraInicio, HoraFin, Categoria, Dia, Mes, year, Facultad, Programa, Imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    Titulo, Descripcion || null, Lugar || null, HoraInicio || null, HoraFin || null,
    Categoria || null, parseInt(Dia), parseInt(Mes), parseInt(year),
    Facultad || null, Programa || null, imagenUrl
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al insertar evento:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId, imagen: imagenUrl });
  });
});

// Actualizar evento (con soporte para imágenes)
router.put('/:id', upload.single('imagen'), (req, res) => {
  const {
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa
  } = req.body;

  // Si se subió una nueva imagen, usar su URL; si no, mantener la actual o null
  let query, values;

  if (req.file) {
    // Se subió nueva imagen
    const imagenUrl = `/uploads/${req.file.filename}`;
    query = `UPDATE eventos SET
      Titulo = ?, Descripcion = ?, Lugar = ?, HoraInicio = ?, HoraFin = ?, Categoria = ?,
      Dia = ?, Mes = ?, year = ?, Facultad = ?, Programa = ?, Imagen = ?
      WHERE Id_Eventos = ?`;

    values = [
      Titulo, Descripcion || null, Lugar || null, HoraInicio || null, HoraFin || null,
      Categoria || null, parseInt(Dia), parseInt(Mes), parseInt(year),
      Facultad || null, Programa || null, imagenUrl,
      req.params.id
    ];
  } else {
    // No se subió nueva imagen, no actualizar el campo Imagen
    query = `UPDATE eventos SET
      Titulo = ?, Descripcion = ?, Lugar = ?, HoraInicio = ?, HoraFin = ?, Categoria = ?,
      Dia = ?, Mes = ?, year = ?, Facultad = ?, Programa = ?
      WHERE Id_Eventos = ?`;

    values = [
      Titulo, Descripcion || null, Lugar || null, HoraInicio || null, HoraFin || null,
      Categoria || null, parseInt(Dia), parseInt(Mes), parseInt(year),
      Facultad || null, Programa || null,
      req.params.id
    ];
  }

  db.query(query, values, (err) => {
    if (err) {
      console.error('Error al actualizar evento:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Eliminar evento
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM eventos WHERE Id_Eventos = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;
