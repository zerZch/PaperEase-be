const db = require('../database/connection');

exports.list = (req, res) => {
  db.query('SELECT * FROM eventos ORDER BY year DESC, Mes DESC, Dia DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    res.json(results);
  });
};
