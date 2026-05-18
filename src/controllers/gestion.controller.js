const conexion = require('../database/connection');
const { crearNotificacion } = require('../services/notification.service');
const { generatePdf } = require('../services/pdf.service');
const { ESTADOS_SOLICITUD, PRIORIDADES_LIST, TIPO_NOTIFICACION } = require('../utils/constants');

exports.aprobar = async (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;
  try {
    const [existing] = await conexion.promise().query('SELECT Cedula FROM formulario_estudiante WHERE id_formulario = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    await conexion.promise().query(
      `UPDATE formulario_estudiante SET Estado = ?, NotasTrabajador = ?, FechaModificacion = NOW() WHERE id_formulario = ?`,
      [ESTADOS_SOLICITUD.APROBADA, notas || null, id]
    );

    await crearNotificacion(existing[0].Cedula, id, TIPO_NOTIFICACION.APROBADA, 'Solicitud Aprobada', `Tu solicitud ${id} ha sido aprobada.`);
    res.json({ success: true, message: 'Solicitud aprobada exitosamente' });
  } catch (error) {
    console.error('Error al aprobar:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.rechazar = async (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;
  try {
    const [existing] = await conexion.promise().query('SELECT Cedula FROM formulario_estudiante WHERE id_formulario = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    await conexion.promise().query(
      `UPDATE formulario_estudiante SET Estado = ?, NotasTrabajador = ?, FechaModificacion = NOW() WHERE id_formulario = ?`,
      [ESTADOS_SOLICITUD.RECHAZADA, notas || null, id]
    );

    await crearNotificacion(existing[0].Cedula, id, TIPO_NOTIFICACION.RECHAZADA, 'Solicitud Rechazada', `Tu solicitud ${id} ha sido rechazada.`);
    res.json({ success: true, message: 'Solicitud rechazada exitosamente' });
  } catch (error) {
    console.error('Error al rechazar:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.cambiarPrioridad = (req, res) => {
  const { id } = req.params;
  const { prioridad } = req.body;
  if (!PRIORIDADES_LIST.includes(prioridad)) {
    return res.status(400).json({ error: 'Prioridad inválida. Debe ser: baja, media o alta' });
  }
  conexion.query('UPDATE formulario_estudiante SET Prioridad = ?, FechaModificacion = NOW() WHERE id_formulario = ?', [prioridad, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Prioridad actualizada exitosamente' });
  });
};

exports.actualizarNotas = (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;
  conexion.query('UPDATE formulario_estudiante SET NotasTrabajador = ?, FechaModificacion = NOW() WHERE id_formulario = ?', [notas || null, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Notas actualizadas exitosamente' });
  });
};

exports.getSolicitud = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT fe.id_formulario, fe.Nombre, fe.Apellido, fe.Cedula,
      g.Genero, f.Facultad, tp.TipoPrograma, p.Programa,
      fe.Archivo, fe.Estado, fe.Prioridad, fe.FechaCreacion, fe.FechaModificacion, fe.NotasTrabajador
    FROM formulario_estudiante fe
    LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
    LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
    LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
    LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
    WHERE fe.id_formulario = ?`;
  conexion.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    res.json(results[0]);
  });
};

exports.getEstadisticas = (req, res) => {
  const sql = `
    SELECT Estado, COUNT(*) as total FROM formulario_estudiante GROUP BY Estado
    UNION ALL
    SELECT 'TOTAL' as Estado, COUNT(*) as total FROM formulario_estudiante`;
  conexion.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const porEstado = { pendiente: 0, aprobada: 0, rechazada: 0, total: 0 };
    rows.forEach(row => {
      if (row.Estado === ESTADOS_SOLICITUD.PENDIENTE) porEstado.pendiente = row.total;
      else if (row.Estado === ESTADOS_SOLICITUD.APROBADA) porEstado.aprobada = row.total;
      else if (row.Estado === ESTADOS_SOLICITUD.RECHAZADA) porEstado.rechazada = row.total;
      else if (row.Estado === 'TOTAL') porEstado.total = row.total;
    });

    conexion.query('SELECT Prioridad, COUNT(*) as total FROM formulario_estudiante GROUP BY Prioridad', (err, prioridades) => {
      if (err) return res.status(500).json({ error: err.message });
      const porPrioridad = {};
      prioridades.forEach(p => { porPrioridad[p.Prioridad] = p.total; });
      res.json({ porEstado, porPrioridad });
    });
  });
};

exports.getPdf = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT fe.*, g.Genero, f.Facultad, tp.TipoPrograma, p.Programa
    FROM formulario_estudiante fe
    LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
    LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
    LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
    LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
    WHERE fe.id_formulario = ?`;
  conexion.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Solicitud no encontrada' });
    generatePdf(results[0], res);
  });
};