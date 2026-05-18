const conexion = require('../database/connection');

async function registrarAuditoria(idUsuarioRef, tipoUsuario, email, accion, descripcion, ip, userAgent, exitoso) {
  try {
    await conexion.promise().query(
      'INSERT INTO auditoria_acceso (IdUsuarioRef, TipoUsuario, Email, Accion, Descripcion, DireccionIP, UserAgent, Exitoso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [idUsuarioRef, tipoUsuario, email, accion, descripcion, ip, userAgent, exitoso ? 1 : 0]
    );
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
}

module.exports = { registrarAuditoria };
