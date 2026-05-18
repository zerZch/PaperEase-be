const conexion = require('../database/connection');

exports.getByCedula = (req, res) => {
  const { cedula } = req.params;
  conexion.query(
    'SELECT * FROM notificaciones WHERE Cedula = ? ORDER BY fecha_creacion DESC',
    [cedula],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener notificaciones' });
      res.json(results);
    }
  );
};

exports.getCount = (req, res) => {
  const { cedula } = req.params;
  conexion.query(
    'SELECT COUNT(*) as total FROM notificaciones WHERE Cedula = ? AND leida = 0',
    [cedula],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al contar notificaciones' });
      res.json({ total: results[0].total });
    }
  );
};

exports.markRead = (req, res) => {
  conexion.query(
    'UPDATE notificaciones SET leida = 1, fecha_lectura = NOW() WHERE id_notificacion = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al marcar notificación' });
      res.json({ success: true });
    }
  );
};

exports.markAllRead = (req, res) => {
  const { cedula } = req.params;
  conexion.query(
    'UPDATE notificaciones SET leida = 1, fecha_lectura = NOW() WHERE Cedula = ? AND leida = 0',
    [cedula],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al marcar notificaciones' });
      res.json({ success: true });
    }
  );
};

exports.delete = (req, res) => {
  conexion.query(
    'DELETE FROM notificaciones WHERE id_notificacion = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar notificación' });
      res.json({ success: true });
    }
  );
};

exports.deleteAll = (req, res) => {
  const { cedula } = req.params;
  conexion.query(
    'DELETE FROM notificaciones WHERE Cedula = ?',
    [cedula],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar notificaciones' });
      res.json({ success: true });
    }
  );
};
