// auth.js - Sistema de autenticación para PaperEase
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const conexion = require('./conexion');




// Constante para el número de rounds de bcrypt (seguridad)
const SALT_ROUNDS = 10;

// =====================================================
// FUNCIÓN: Registrar Usuario
// =====================================================
/**
 * POST /api/auth/register
 * Body: {
 *   nombre, apellido, email, password, rol (1=estudiante, 2=trabajadora),
 *   cedula (opcional), idGenero (opcional), idFacultad (opcional para estudiantes)
 * }
 */
router.post('/register', async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    password,
    rol,
    cedula,
    idGenero,
    idFacultad,
    fechaNacimiento,
    departamento,
    oficina
  } = req.body;

  // Validaciones básicas
  if (!nombre || !apellido || !email || !password || !rol) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios',
      campos: ['nombre', 'apellido', 'email', 'password', 'rol']
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  // Validar longitud de contraseña
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Validar rol (solo 1 o 2)
  if (rol !== 1 && rol !== 2 && rol !== '1' && rol !== '2') {
    return res.status(400).json({ error: 'Rol inválido. Debe ser 1 (Estudiante) o 2 (Trabajador Social)' });
  }

  const rolNumerico = parseInt(rol);

  try {
    // Verificar si el email ya existe en estudiantes
    const checkEmailEstudiante = 'SELECT Email FROM estudiante WHERE Email = ?';
    const [existeEstudiante] = await conexion.promise().query(checkEmailEstudiante, [email]);

    // Verificar si el email ya existe en trabajadores sociales
    const checkEmailTrabajador = 'SELECT Email FROM trabajador_social WHERE Email = ?';
    const [existeTrabajador] = await conexion.promise().query(checkEmailTrabajador, [email]);

    if (existeEstudiante.length > 0 || existeTrabajador.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Verificar si la cédula ya existe (si se proporcionó)
    if (cedula) {
      const checkCedulaEstudiante = 'SELECT Cedula FROM estudiante WHERE Cedula = ?';
      const [cedulaEstudiante] = await conexion.promise().query(checkCedulaEstudiante, [cedula]);

      const checkCedulaTrabajador = 'SELECT Cedula FROM trabajador_social WHERE Cedula = ?';
      const [cedulaTrabajador] = await conexion.promise().query(checkCedulaTrabajador, [cedula]);

      if (cedulaEstudiante.length > 0 || cedulaTrabajador.length > 0) {
        return res.status(409).json({ error: 'La cédula ya está registrada' });
      }
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let resultado;
    let idUsuario;

    // Registrar según el rol
    if (rolNumerico === 1) {
      // ESTUDIANTE
      const queryEstudiante = `
        INSERT INTO estudiante
        (Email, Password, Nombre, Apellido, Cedula, IdGenero, IdFacultad, FechaNacimiento, Activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `;

      [resultado] = await conexion.promise().query(queryEstudiante, [
        email,
        hashedPassword,
        nombre,
        apellido,
        cedula || null,
        idGenero || null,
        idFacultad || null,
        fechaNacimiento || null
      ]);

      idUsuario = resultado.insertId;

      // Registrar en auditoría
      await registrarAuditoria(idUsuario, 1, email, 'registro', 'Registro exitoso de estudiante', req.ip, req.get('user-agent'), true);

      return res.status(201).json({
        success: true,
        message: 'Estudiante registrado exitosamente',
        usuario: {
          id: idUsuario,
          email: email,
          nombre: nombre,
          apellido: apellido,
          rol: 1,
          tipoUsuario: 'estudiante'
        }
      });

    } else if (rolNumerico === 2) {
      // TRABAJADOR SOCIAL
      const queryTrabajador = `
        INSERT INTO trabajador_social
        (Email, Password, Nombre, Apellido, Cedula, IdGenero, Departamento, Oficina, Activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `;

      [resultado] = await conexion.promise().query(queryTrabajador, [
        email,
        hashedPassword,
        nombre,
        apellido,
        cedula || null,
        idGenero || null,
        departamento || null,
        oficina || null
      ]);

      idUsuario = resultado.insertId;

      // Registrar en auditoría
      await registrarAuditoria(idUsuario, 2, email, 'registro', 'Registro exitoso de trabajador social', req.ip, req.get('user-agent'), true);

      return res.status(201).json({
        success: true,
        message: 'Trabajador social registrado exitosamente',
        usuario: {
          id: idUsuario,
          email: email,
          nombre: nombre,
          apellido: apellido,
          rol: 2,
          tipoUsuario: 'trabajadora'
        }
      });
    }

  } catch (error) {
    console.error('Error en registro:', error);

    // Registrar intento fallido en auditoría
    await registrarAuditoria(null, rolNumerico, email, 'registro', `Error en registro: ${error.message}`, req.ip, req.get('user-agent'), false);

    return res.status(500).json({
      error: 'Error al registrar usuario',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =====================================================
// FUNCIÓN: Login (⭐ CORREGIDO)
// =====================================================
/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    let usuario = null;
    let tipoUsuario = null;
    let rol = null;

    // Buscar en la tabla de estudiantes
    const queryEstudiante = 'SELECT * FROM estudiante WHERE Email = ? AND Activo = 1';
    const [estudiantes] = await conexion.promise().query(queryEstudiante, [email]);

    if (estudiantes.length > 0) {
      usuario = estudiantes[0];
      tipoUsuario = 1;
      rol = 'estudiante';
    } else {
      // Si no es estudiante, buscar en trabajadores sociales
      const queryTrabajador = 'SELECT * FROM trabajador_social WHERE Email = ? AND Activo = 1';
      const [trabajadores] = await conexion.promise().query(queryTrabajador, [email]);

      if (trabajadores.length > 0) {
        usuario = trabajadores[0];
        tipoUsuario = 2;
        rol = 'trabajadora';
      }
    }

    // Si no se encontró el usuario
    if (!usuario) {
      // Registrar intento fallido
      await registrarAuditoria(null, null, email, 'login', 'Usuario no encontrado o inactivo', req.ip, req.get('user-agent'), false);

      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.Password);

    if (!passwordValido) {
      // Registrar intento fallido
      const idUsuarioRef = tipoUsuario === 1 ? usuario.IdEstudiante : usuario.IdTrabajadorSocial;
      await registrarAuditoria(idUsuarioRef, tipoUsuario, email, 'login', 'Contraseña incorrecta', req.ip, req.get('user-agent'), false);

      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último acceso
    if (tipoUsuario === 1) {
      await conexion.promise().query(
        'UPDATE estudiante SET UltimoAcceso = CURRENT_TIMESTAMP WHERE IdEstudiante = ?',
        [usuario.IdEstudiante]
      );
    } else {
      await conexion.promise().query(
        'UPDATE trabajador_social SET UltimoAcceso = CURRENT_TIMESTAMP WHERE IdTrabajadorSocial = ?',
        [usuario.IdTrabajadorSocial]
      );
    }

    // Generar token de sesión
    const crypto = require('crypto');
    const tokenSesion = crypto.randomBytes(64).toString('hex');
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24); // Token válido por 24 horas

    // Guardar sesión en BD
    const idUsuarioRef = tipoUsuario === 1 ? usuario.IdEstudiante : usuario.IdTrabajadorSocial;

    await conexion.promise().query(
      'INSERT INTO sesiones (IdUsuarioRef, TipoUsuario, TokenSesion, DireccionIP, UserAgent, FechaExpiracion) VALUES (?, ?, ?, ?, ?, ?)',
      [idUsuarioRef, tipoUsuario, tokenSesion, req.ip, req.get('user-agent'), fechaExpiracion]
    );

    // Registrar login exitoso en auditoría
    await registrarAuditoria(idUsuarioRef, tipoUsuario, email, 'login', 'Login exitoso', req.ip, req.get('user-agent'), true);

    // ⭐⭐⭐ CAMBIO 1: Guardar sesión en express-session CON TODOS LOS DATOS ⭐⭐⭐
    req.session.usuario = {
      id: idUsuarioRef,
      email: usuario.Email,
      nombre: usuario.Nombre,
      apellido: usuario.Apellido,
      rol: tipoUsuario,
      tipoUsuario: rol
    };

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token: tokenSesion,
      usuario: {
        id: idUsuarioRef,
        email: usuario.Email,
        nombre: usuario.Nombre,
        apellido: usuario.Apellido,
        rol: tipoUsuario,
        tipoUsuario: rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);

    // Registrar error en auditoría
    await registrarAuditoria(null, null, email, 'login', `Error en login: ${error.message}`, req.ip, req.get('user-agent'), false);

    return res.status(500).json({
      error: 'Error al procesar login',
      detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// =====================================================
// FUNCIÓN: Logout
// =====================================================
/**
 * POST /api/auth/logout
 * Headers: { Authorization: Bearer <token> }
 */
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(400).json({ error: 'Token no proporcionado' });
  }

  try {
    // Desactivar sesión en BD
    await conexion.promise().query(
      'UPDATE sesiones SET Activa = 0 WHERE TokenSesion = ?',
      [token]
    );

    // Obtener información de la sesión para auditoría
    const [sesion] = await conexion.promise().query(
      'SELECT IdUsuarioRef, TipoUsuario FROM sesiones WHERE TokenSesion = ?',
      [token]
    );

    if (sesion.length > 0) {
      await registrarAuditoria(
        sesion[0].IdUsuarioRef,
        sesion[0].TipoUsuario,
        null,
        'logout',
        'Logout exitoso',
        req.ip,
        req.get('user-agent'),
        true
      );
    }

    // Destruir sesión de express
    if (req.session) {
      req.session.destroy();
    }

    return res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

// =====================================================
// =====================================================
/**
 * GET /api/auth/verificar
 * Headers: { Authorization: Bearer <token> }
 */
router.get('/verificar', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      autenticado: false,
      error: 'Token no proporcionado'
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
        autenticado: false,
        error: 'Sesión inválida o expirada'
      });
    }

    const { IdUsuarioRef, TipoUsuario } = sesion[0];

    // ⭐⭐⭐ CAMBIO 2: Obtener información completa del usuario con JOINs ⭐⭐⭐
    let usuario = null;
    
    if (TipoUsuario === 1) {
      // ESTUDIANTE - Incluir cédula, género, facultad
      const [estudiantes] = await conexion.promise().query(
        `SELECT 
          e.IdEstudiante as id,
          e.Email,
          e.Nombre,
          e.Apellido,
          e.Cedula,                    
          e.IdGenero,                  
          e.IdFacultad,                
          e.FechaNacimiento,
          g.Genero,                    
          f.Facultad                   
        FROM estudiante e
        LEFT JOIN genero g ON e.IdGenero = g.IdGenero
        LEFT JOIN facultad f ON e.IdFacultad = f.IdFacultad
        WHERE e.IdEstudiante = ? AND e.Activo = 1`,
        [IdUsuarioRef]
      );
      usuario = estudiantes[0];
      
    } else {
      // TRABAJADOR SOCIAL - Incluir cédula, género
      const [trabajadores] = await conexion.promise().query(
        `SELECT 
          ts.IdTrabajadorSocial as id,
          ts.Email,
          ts.Nombre,
          ts.Apellido,
          ts.Cedula,                   
          ts.IdGenero,
          ts.Departamento,
          ts.Oficina,
          g.Genero                     
        FROM trabajador_social ts
        LEFT JOIN genero g ON ts.IdGenero = g.IdGenero
        WHERE ts.IdTrabajadorSocial = ? AND ts.Activo = 1`,
        [IdUsuarioRef]
      );
      usuario = trabajadores[0];
    }

    if (!usuario) {
      return res.status(401).json({
        autenticado: false,
        error: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      autenticado: true,
      usuario: {
        id: usuario.id,
        email: usuario.Email,
        nombre: usuario.Nombre,
        apellido: usuario.Apellido,
        rol: TipoUsuario,
        tipoUsuario: TipoUsuario === 1 ? 'estudiante' : 'trabajadora'
      }
    });

  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return res.status(500).json({
      autenticado: false,
    });
  }
});

// =====================================================
// FUNCIÓN AUXILIAR: Registrar Auditoría
// =====================================================
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

module.exports = router;
module.exports = router;