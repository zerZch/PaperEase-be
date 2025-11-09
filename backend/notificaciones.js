const express = require('express');
const conexion = require('./conexion');
const router = express.Router();

// Variable para almacenar la instancia de Socket.IO (será inyectada desde index.js)
let io = null;

// Función para establecer la instancia de Socket.IO
function setSocketIO(socketIO) {
  io = socketIO;
  console.log('✅ Socket.IO configurado en el módulo de notificaciones');
}

// ============================================
// FUNCIÓN AUXILIAR: Crear Notificación
// ============================================
/**
 * Crea una nueva notificación para un estudiante
 * @param {number} idEstudiante - ID del estudiante
 * @param {string} idFormulario - ID del formulario relacionado
 * @param {string} tipo - Tipo de notificación ('aprobada', 'rechazada', 'info')
 * @param {string} titulo - Título de la notificación
 * @param {string} mensaje - Mensaje de la notificación
 * @returns {Promise<object>}
 */
async function crearNotificacion(idEstudiante, idFormulario, tipo, titulo, mensaje) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO notificaciones
      (IdEstudiante, id_formulario, tipo, titulo, mensaje, leida)
      VALUES (?, ?, ?, ?, ?, 0)
    `;

    conexion.query(sql, [idEstudiante, idFormulario, tipo, titulo, mensaje], (err, result) => {
      if (err) {
        console.error('❌ Error al crear notificación:', err);
        reject(err);
        return;
      }

      const notificacion = {
        id_notificacion: result.insertId,
        IdEstudiante: idEstudiante,
        id_formulario: idFormulario,
        tipo: tipo,
        titulo: titulo,
        mensaje: mensaje,
        leida: 0,
        fecha_creacion: new Date()
      };

      console.log(`✅ Notificación creada: ID ${result.insertId} para estudiante ${idEstudiante}`);

      // Emitir la notificación en tiempo real vía Socket.IO
      if (io) {
        io.to(`estudiante_${idEstudiante}`).emit('nueva_notificacion', notificacion);
        console.log(`📡 Notificación emitida a estudiante_${idEstudiante}`);
      }

      resolve(notificacion);
    });
  });
}

// ============================================
// ENDPOINT: Obtener Notificaciones del Usuario
// GET /api/notificaciones/:idEstudiante
// ============================================
router.get('/:idEstudiante', (req, res) => {
  const { idEstudiante } = req.params;
  const { solo_no_leidas } = req.query;

  console.log(`🔔 Obteniendo notificaciones del estudiante ${idEstudiante}`);

  let sql = `
    SELECT
      id_notificacion,
      IdEstudiante,
      id_formulario,
      tipo,
      titulo,
      mensaje,
      leida,
      fecha_creacion,
      fecha_lectura
    FROM notificaciones
    WHERE IdEstudiante = ?
  `;

  if (solo_no_leidas === 'true') {
    sql += ' AND leida = 0';
  }

  sql += ' ORDER BY fecha_creacion DESC LIMIT 50';

  conexion.query(sql, [idEstudiante], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener notificaciones:', err);
      return res.status(500).json({
        error: 'Error al obtener notificaciones',
        sql_error: err.message
      });
    }

    console.log(`✅ ${results.length} notificaciones obtenidas`);
    res.json(results);
  });
});

// ============================================
// ENDPOINT: Obtener Conteo de No Leídas
// GET /api/notificaciones/:idEstudiante/conteo
// ============================================
router.get('/:idEstudiante/conteo', (req, res) => {
  const { idEstudiante } = req.params;

  console.log(`🔢 Obteniendo conteo de notificaciones no leídas del estudiante ${idEstudiante}`);

  const sql = `
    SELECT COUNT(*) as no_leidas
    FROM notificaciones
    WHERE IdEstudiante = ? AND leida = 0
  `;

  conexion.query(sql, [idEstudiante], (err, results) => {
    if (err) {
      console.error('❌ Error al contar notificaciones:', err);
      return res.status(500).json({
        error: 'Error al contar notificaciones',
        sql_error: err.message
      });
    }

    const conteo = results[0].no_leidas;
    console.log(`✅ Conteo: ${conteo} notificaciones no leídas`);

    res.json({ no_leidas: conteo });
  });
});

// ============================================
// ENDPOINT: Marcar como Leída
// PUT /api/notificaciones/:id/leer
// ============================================
router.put('/:id/leer', (req, res) => {
  const { id } = req.params;

  console.log(`👁️ Marcando notificación ${id} como leída`);

  const sql = `
    UPDATE notificaciones
    SET leida = 1, fecha_lectura = NOW()
    WHERE id_notificacion = ?
  `;

  conexion.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al marcar como leída:', err);
      return res.status(500).json({
        error: 'Error al marcar la notificación como leída',
        sql_error: err.message
      });
    }

    if (result.affectedRows === 0) {
      console.log('⚠️ Notificación no encontrada:', id);
      return res.status(404).json({
        error: 'Notificación no encontrada',
        id: id
      });
    }

    console.log(`✅ Notificación ${id} marcada como leída`);
    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      id: id
    });
  });
});

// ============================================
// ENDPOINT: Marcar Todas como Leídas
// PUT /api/notificaciones/estudiante/:idEstudiante/leer-todas
// ============================================
router.put('/estudiante/:idEstudiante/leer-todas', (req, res) => {
  const { idEstudiante } = req.params;

  console.log(`👁️ Marcando todas las notificaciones del estudiante ${idEstudiante} como leídas`);

  const sql = `
    UPDATE notificaciones
    SET leida = 1, fecha_lectura = NOW()
    WHERE IdEstudiante = ? AND leida = 0
  `;

  conexion.query(sql, [idEstudiante], (err, result) => {
    if (err) {
      console.error('❌ Error al marcar todas como leídas:', err);
      return res.status(500).json({
        error: 'Error al marcar las notificaciones como leídas',
        sql_error: err.message
      });
    }

    console.log(`✅ ${result.affectedRows} notificaciones marcadas como leídas`);
    res.json({
      success: true,
      message: `${result.affectedRows} notificaciones marcadas como leídas`,
      actualizadas: result.affectedRows
    });
  });
});

// ============================================
// ENDPOINT: Eliminar Notificación
// DELETE /api/notificaciones/:id
// ============================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  console.log(`🗑️ Eliminando notificación ${id}`);

  const sql = 'DELETE FROM notificaciones WHERE id_notificacion = ?';

  conexion.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar notificación:', err);
      return res.status(500).json({
        error: 'Error al eliminar la notificación',
        sql_error: err.message
      });
    }

    if (result.affectedRows === 0) {
      console.log('⚠️ Notificación no encontrada:', id);
      return res.status(404).json({
        error: 'Notificación no encontrada',
        id: id
      });
    }

    console.log(`✅ Notificación ${id} eliminada`);
    res.json({
      success: true,
      message: 'Notificación eliminada',
      id: id
    });
  });
});

// ============================================
// ENDPOINT: Eliminar Todas las Notificaciones
// DELETE /api/notificaciones/estudiante/:idEstudiante/eliminar-todas
// ============================================
router.delete('/estudiante/:idEstudiante/eliminar-todas', (req, res) => {
  const { idEstudiante } = req.params;

  console.log(`🗑️ Eliminando todas las notificaciones del estudiante ${idEstudiante}`);

  const sql = 'DELETE FROM notificaciones WHERE IdEstudiante = ?';

  conexion.query(sql, [idEstudiante], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar todas las notificaciones:', err);
      return res.status(500).json({
        error: 'Error al eliminar las notificaciones',
        sql_error: err.message
      });
    }

    console.log(`✅ ${result.affectedRows} notificaciones eliminadas`);
    res.json({
      success: true,
      message: `${result.affectedRows} notificaciones eliminadas`,
      eliminadas: result.affectedRows
    });
  });
});

// Exportar el router y las funciones auxiliares
module.exports = router;
module.exports.crearNotificacion = crearNotificacion;
module.exports.setSocketIO = setSocketIO;
