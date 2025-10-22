// authMiddleware.js - Middleware de autenticación para PaperEase
const conexion = require('../conexion');

/**
 * Middleware para verificar que el usuario está autenticado
 */
async function verificarAutenticacion(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Token de autenticación no proporcionado'
    });
  }

  try {
    // Verificar token en BD
    const [sesion] = await conexion.promise().query(
      'SELECT * FROM sesiones WHERE TokenSesion = ? AND Activa = 1 AND FechaExpiracion > NOW()',
      [token]
    );

    if (sesion.length === 0) {
      return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Sesión inválida o expirada'
      });
    }

    // Agregar información del usuario a la request
    req.usuario = {
      id: sesion[0].IdUsuarioRef,
      tipoUsuario: sesion[0].TipoUsuario
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({ error: 'Error al verificar autenticación' });
  }
}

/**
 * Middleware para verificar que el usuario es estudiante (rol 1)
 */
async function verificarEstudiante(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Debe estar autenticado'
    });
  }

  if (req.usuario.tipoUsuario !== 1) {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo estudiantes pueden acceder a este recurso'
    });
  }

  next();
}

/**
 * Middleware para verificar que el usuario es trabajador social (rol 2)
 */
async function verificarTrabajadorSocial(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'No autorizado',
      mensaje: 'Debe estar autenticado'
    });
  }

  if (req.usuario.tipoUsuario !== 2) {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Solo trabajadores sociales pueden acceder a este recurso'
    });
  }

  next();
}

module.exports = {
  verificarAutenticacion,
  verificarEstudiante,
  verificarTrabajadorSocial
};
