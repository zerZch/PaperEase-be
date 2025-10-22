const express = require('express');
const router = express.Router();
const db = require('./conexion');

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

// Crear evento
router.post('/', (req, res) => {
  const {
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa, Imagen
  } = req.body;

  const query = `INSERT INTO eventos 
    (Titulo, Descripcion, Lugar, HoraInicio, HoraFin, Categoria, Dia, Mes, year, Facultad, Programa, Imagen) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa, Imagen
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// Actualizar evento
router.put('/:id', (req, res) => {
  const {
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa, Imagen
  } = req.body;

  const query = `UPDATE eventos SET 
    Titulo = ?, Descripcion = ?, Lugar = ?, HoraInicio = ?, HoraFin = ?, Categoria = ?, 
    Dia = ?, Mes = ?, year = ?, Facultad = ?, Programa = ?, Imagen = ?
    WHERE Id_Eventos = ?`;

  const values = [
    Titulo, Descripcion, Lugar, HoraInicio, HoraFin,
    Categoria, Dia, Mes, year, Facultad, Programa, Imagen,
    req.params.id
  ];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
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
