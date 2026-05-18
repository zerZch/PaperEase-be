const bcrypt = require('bcrypt');
const crypto = require('crypto');
const conexion = require('../database/connection');
const { auth: authConfig } = require('../../config/server');
const { registrarAuditoria } = require('../services/audit.service');
const { ROLES, ROL_LABELS, ACCIONES_AUDITORIA } = require('../utils/constants');

const SALT_ROUNDS = authConfig.saltRounds;
const TOKEN_BYTES = authConfig.tokenBytes;
const TOKEN_EXPIRY_HOURS = authConfig.tokenExpiryHours;
const MIN_PASSWORD_LENGTH = authConfig.minPasswordLength;

exports.register = async (req, res) => {
  const { nombre, apellido, email, password, rol, cedula, idGenero, idFacultad, fechaNacimiento, departamento, oficina } = req.body;

  if (!nombre || !apellido || !email || !password || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios', campos: ['nombre', 'apellido', 'email', 'password', 'rol'] });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
  }

  if (rol !== ROLES.ESTUDIANTE && rol !== ROLES.TRABAJADOR_SOCIAL && rol !== '1' && rol !== '2') {
    return res.status(400).json({ error: 'Rol inválido. Debe ser 1 (Estudiante) o 2 (Trabajador Social)' });
  }

  const rolNumerico = parseInt(rol);

  try {
    const [existeEstudiante] = await conexion.promise().query('SELECT Email FROM estudiante WHERE Email = ?', [email]);
    const [existeTrabajador] = await conexion.promise().query('SELECT Email FROM trabajador_social WHERE Email = ?', [email]);

    if (existeEstudiante.length > 0 || existeTrabajador.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    if (cedula) {
      const [cedulaEst] = await conexion.promise().query('SELECT Cedula FROM estudiante WHERE Cedula = ?', [cedula]);
      const [cedulaTs] = await conexion.promise().query('SELECT Cedula FROM trabajador_social WHERE Cedula = ?', [cedula]);
      if (cedulaEst.length > 0 || cedulaTs.length > 0) {
        return res.status(409).json({ error: 'La cédula ya está registrada' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let resultado, idUsuario;
    if (rolNumerico === ROLES.ESTUDIANTE) {
      [resultado] = await conexion.promise().query(
        `INSERT INTO estudiante (Email, Password, Nombre, Apellido, Cedula, IdGenero, IdFacultad, FechaNacimiento, Activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [email, hashedPassword, nombre, apellido, cedula || null, idGenero || null, idFacultad || null, fechaNacimiento || null]
      );
      idUsuario = resultado.insertId;
      await registrarAuditoria(idUsuario, ROLES.ESTUDIANTE, email, ACCIONES_AUDITORIA.REGISTRO, 'Registro exitoso de estudiante', req.ip, req.get('user-agent'), true);
      return res.status(201).json({ success: true, message: 'Estudiante registrado exitosamente', usuario: { id: idUsuario, email, nombre, apellido, rol: ROLES.ESTUDIANTE, tipoUsuario: ROL_LABELS[ROLES.ESTUDIANTE] } });
    } else {
      [resultado] = await conexion.promise().query(
        `INSERT INTO trabajador_social (Email, Password, Nombre, Apellido, Cedula, IdGenero, Departamento, Oficina, Activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [email, hashedPassword, nombre, apellido, cedula || null, idGenero || null, departamento || null, oficina || null]
      );
      idUsuario = resultado.insertId;
      await registrarAuditoria(idUsuario, ROLES.TRABAJADOR_SOCIAL, email, ACCIONES_AUDITORIA.REGISTRO, 'Registro exitoso de trabajador social', req.ip, req.get('user-agent'), true);
      return res.status(201).json({ success: true, message: 'Trabajador social registrado exitosamente', usuario: { id: idUsuario, email, nombre, apellido, cedula: cedula || null, rol: ROLES.TRABAJADOR_SOCIAL, tipoUsuario: ROL_LABELS[ROLES.TRABAJADOR_SOCIAL] } });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    await registrarAuditoria(null, rolNumerico, email, ACCIONES_AUDITORIA.REGISTRO, `Error en registro: ${error.message}`, req.ip, req.get('user-agent'), false);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    let usuario = null, tipoUsuario = null, rol = null;

    const [estudiantes] = await conexion.promise().query('SELECT * FROM estudiante WHERE Email = ? AND Activo = 1', [email]);
    if (estudiantes.length > 0) { usuario = estudiantes[0]; tipoUsuario = ROLES.ESTUDIANTE; rol = ROL_LABELS[ROLES.ESTUDIANTE]; }
    else {
      const [trabajadores] = await conexion.promise().query('SELECT * FROM trabajador_social WHERE Email = ? AND Activo = 1', [email]);
      if (trabajadores.length > 0) { usuario = trabajadores[0]; tipoUsuario = ROLES.TRABAJADOR_SOCIAL; rol = ROL_LABELS[ROLES.TRABAJADOR_SOCIAL]; }
    }

    if (!usuario) {
      await registrarAuditoria(null, null, email, ACCIONES_AUDITORIA.LOGIN, 'Usuario no encontrado o inactivo', req.ip, req.get('user-agent'), false);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.Password);
    if (!passwordValido) {
      const idRef = tipoUsuario === 1 ? usuario.IdEstudiante : usuario.IdTrabajadorSocial;
      await registrarAuditoria(idRef, tipoUsuario, email, ACCIONES_AUDITORIA.LOGIN, 'Contraseña incorrecta', req.ip, req.get('user-agent'), false);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (tipoUsuario === 1) {
      await conexion.promise().query('UPDATE estudiante SET UltimoAcceso = CURRENT_TIMESTAMP WHERE IdEstudiante = ?', [usuario.IdEstudiante]);
    } else {
      await conexion.promise().query('UPDATE trabajador_social SET UltimoAcceso = CURRENT_TIMESTAMP WHERE IdTrabajadorSocial = ?', [usuario.IdTrabajadorSocial]);
    }

    const tokenSesion = crypto.randomBytes(TOKEN_BYTES).toString('hex');
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + TOKEN_EXPIRY_HOURS);

    const idUsuarioRef = tipoUsuario === 1 ? usuario.IdEstudiante : usuario.IdTrabajadorSocial;
    await conexion.promise().query(
      'INSERT INTO sesiones (IdUsuarioRef, TipoUsuario, TokenSesion, DireccionIP, UserAgent, FechaExpiracion) VALUES (?, ?, ?, ?, ?, ?)',
      [idUsuarioRef, tipoUsuario, tokenSesion, req.ip, req.get('user-agent'), fechaExpiracion]
    );

    await registrarAuditoria(idUsuarioRef, tipoUsuario, email, ACCIONES_AUDITORIA.LOGIN, 'Login exitoso', req.ip, req.get('user-agent'), true);

    return res.status(200).json({
      success: true, message: 'Login exitoso', token: tokenSesion,
      usuario: { id: idUsuarioRef, email: usuario.Email, nombre: usuario.Nombre, apellido: usuario.Apellido, cedula: usuario.Cedula, rol: tipoUsuario, tipoUsuario: rol }
    });
  } catch (error) {
    console.error('Error en login:', error);
    await registrarAuditoria(null, null, email, ACCIONES_AUDITORIA.LOGIN, `Error en login: ${error.message}`, req.ip, req.get('user-agent'), false);
    return res.status(500).json({ error: 'Error al procesar login' });
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(400).json({ error: 'Token no proporcionado' });

  try {
    await conexion.promise().query('UPDATE sesiones SET Activa = 0 WHERE TokenSesion = ?', [token]);
    const [sesion] = await conexion.promise().query('SELECT IdUsuarioRef, TipoUsuario FROM sesiones WHERE TokenSesion = ?', [token]);
    if (sesion.length > 0) {
      await registrarAuditoria(sesion[0].IdUsuarioRef, sesion[0].TipoUsuario, null, ACCIONES_AUDITORIA.LOGOUT, 'Logout exitoso', req.ip, req.get('user-agent'), true);
    }
    return res.status(200).json({ success: true, message: 'Logout exitoso' });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

exports.verificar = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ autenticado: false, error: 'Token no proporcionado' });

  try {
    const [sesion] = await conexion.promise().query('SELECT * FROM sesiones WHERE TokenSesion = ? AND Activa = 1 AND FechaExpiracion > NOW()', [token]);
    if (sesion.length === 0) return res.status(401).json({ autenticado: false, error: 'Sesión inválida o expirada' });

    const { IdUsuarioRef, TipoUsuario } = sesion[0];
    let usuario = null;

    if (TipoUsuario === 1) {
      const [estudiantes] = await conexion.promise().query(
        `SELECT e.IdEstudiante as id, e.Email, e.Nombre, e.Apellido, e.Cedula, e.IdGenero, e.IdFacultad, e.FechaNacimiento, g.Genero, f.Facultad
         FROM estudiante e LEFT JOIN genero g ON e.IdGenero = g.IdGenero LEFT JOIN facultad f ON e.IdFacultad = f.IdFacultad
         WHERE e.IdEstudiante = ? AND e.Activo = 1`, [IdUsuarioRef]);
      usuario = estudiantes[0];
    } else {
      const [trabajadores] = await conexion.promise().query(
        `SELECT ts.IdTrabajadorSocial as id, ts.Email, ts.Nombre, ts.Apellido, ts.Cedula, ts.IdGenero, ts.Departamento, ts.Oficina, g.Genero
         FROM trabajador_social ts LEFT JOIN genero g ON ts.IdGenero = g.IdGenero
         WHERE ts.IdTrabajadorSocial = ? AND ts.Activo = 1`, [IdUsuarioRef]);
      usuario = trabajadores[0];
    }

    if (!usuario) return res.status(401).json({ autenticado: false, error: 'Usuario no encontrado' });

    return res.status(200).json({
      autenticado: true,
      usuario: { id: usuario.id, email: usuario.Email, nombre: usuario.Nombre, apellido: usuario.Apellido, cedula: usuario.Cedula, idGenero: usuario.IdGenero, genero: usuario.Genero, idFacultad: usuario.IdFacultad, facultad: usuario.Facultad, fechaNacimiento: usuario.FechaNacimiento, rol: TipoUsuario, tipoUsuario: TipoUsuario === 1 ? ROL_LABELS[ROLES.ESTUDIANTE] : ROL_LABELS[ROLES.TRABAJADOR_SOCIAL] }
    });
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return res.status(500).json({ autenticado: false });
  }
};

exports.me = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ autenticado: false, error: 'Token no proporcionado' });

  try {
    const [sesion] = await conexion.promise().query('SELECT * FROM sesiones WHERE TokenSesion = ? AND Activa = 1 AND FechaExpiracion > NOW()', [token]);
    if (sesion.length === 0) return res.status(401).json({ autenticado: false, error: 'Sesión inválida o expirada' });

    const { IdUsuarioRef, TipoUsuario } = sesion[0];
    let usuario = null;

    if (TipoUsuario === 1) {
      const [rows] = await conexion.promise().query(
        `SELECT e.IdEstudiante as id, e.Email, e.Nombre, e.Apellido, e.Cedula, e.IdGenero, e.IdFacultad, e.FechaNacimiento, g.Genero, f.Facultad
         FROM estudiante e LEFT JOIN genero g ON e.IdGenero = g.IdGenero LEFT JOIN facultad f ON e.IdFacultad = f.IdFacultad
         WHERE e.IdEstudiante = ? AND e.Activo = 1`, [IdUsuarioRef]);
      usuario = rows[0];
    } else {
      const [rows] = await conexion.promise().query(
        `SELECT ts.IdTrabajadorSocial as id, ts.Email, ts.Nombre, ts.Apellido, ts.Cedula, ts.IdGenero, ts.Departamento, ts.Oficina, g.Genero
         FROM trabajador_social ts LEFT JOIN genero g ON ts.IdGenero = g.IdGenero
         WHERE ts.IdTrabajadorSocial = ? AND ts.Activo = 1`, [IdUsuarioRef]);
      usuario = rows[0];
    }

    if (!usuario) return res.status(401).json({ autenticado: false, error: 'Usuario no encontrado' });

    return res.status(200).json({ autenticado: true, ...usuario, rol: TipoUsuario, tipoUsuario: TipoUsuario === 1 ? ROL_LABELS[ROLES.ESTUDIANTE] : ROL_LABELS[ROLES.TRABAJADOR_SOCIAL] });
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return res.status(500).json({ autenticado: false, error: 'Error al obtener datos del usuario' });
  }
};
