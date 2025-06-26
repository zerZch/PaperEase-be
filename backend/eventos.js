// backend/eventos.js
const express = require('express');
const router = express.Router();
const db = require('./conexion');

router.get('/', (req, res) => {  // <-- Cambiar aquí a '/'
  db.query('SELECT * FROM eventos', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error en la base de datos' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
