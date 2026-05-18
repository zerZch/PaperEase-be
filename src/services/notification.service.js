const conexion = require('../database/connection');

let io = null;

function setSocketIO(socketIO) {
  io = socketIO;
}

async function crearNotificacion(cedula, idFormulario, tipo, titulo, mensaje) {
  try {
    const [result] = await conexion.promise().query(
      'INSERT INTO notificaciones (Cedula, id_formulario, tipo, titulo, mensaje) VALUES (?, ?, ?, ?, ?)',
      [cedula, idFormulario || null, tipo, titulo, mensaje]
    );

    if (io) {
      io.to(`estudiante_${cedula}`).emit('nueva_notificacion', {
        id: result.insertId, cedula, idFormulario: idFormulario || null, tipo, titulo, mensaje, leida: 0, fecha_creacion: new Date().toISOString()
      });
    }
    return result;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
}

module.exports = { crearNotificacion, setSocketIO };
