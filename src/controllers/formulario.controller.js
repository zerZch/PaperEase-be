const conexion = require('../database/connection');
const { generarIdFormulario } = require('../utils/id-generator');

exports.submit = async (req, res) => {
  try {
    const { tipoPrograma, programa } = req.body;
    const usuarioId = req.usuario.id;
    const usuarioTipo = req.usuario.tipoUsuario;

    if (!tipoPrograma || !programa) {
      return res.status(400).json({ error: 'tipoPrograma y programa son obligatorios' });
    }

    const tipoProgramaId = parseInt(tipoPrograma);
    const programaId = parseInt(programa);

    if (isNaN(tipoProgramaId) || isNaN(programaId)) {
      return res.status(400).json({ error: 'tipoPrograma y programa deben ser números válidos' });
    }

    const [estudiantes] = await conexion.promise().query(
      'SELECT IdEstudiante, Nombre, Apellido, Cedula, IdGenero, IdFacultad FROM estudiante WHERE IdEstudiante = ? AND Activo = 1',
      [usuarioId]
    );

    if (estudiantes.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const estudiante = estudiantes[0];

    if (!estudiante.Cedula) {
      return res.status(400).json({ error: 'Tu perfil no tiene cédula registrada. Completa tu perfil antes de solicitar.' });
    }
    if (!estudiante.IdGenero) {
      return res.status(400).json({ error: 'Tu perfil no tiene género registrado. Completa tu perfil antes de solicitar.' });
    }
    if (!estudiante.IdFacultad) {
      return res.status(400).json({ error: 'Tu perfil no tiene facultad registrada. Completa tu perfil antes de solicitar.' });
    }

    const [tipoRows] = await conexion.promise().query('SELECT IdTipoP FROM tipoprograma WHERE IdTipoP = ?', [tipoProgramaId]);
    if (tipoRows.length === 0) {
      return res.status(400).json({ error: 'Tipo de programa inválido' });
    }

    const [progRows] = await conexion.promise().query('SELECT IdPrograma FROM programa WHERE IdPrograma = ? AND IdTipoP = ?', [programaId, tipoProgramaId]);
    if (progRows.length === 0) {
      return res.status(400).json({ error: 'Programa inválido o no pertenece al tipo de programa indicado' });
    }

    const archivo = req.file ? req.file.filename : null;
    const idFormulario = generarIdFormulario();

    await conexion.promise().query(
      `INSERT INTO formulario_estudiante
        (id_formulario, Nombre, Apellido, Cedula, IdGenero, IdFacultad, IdTipoP, IdPrograma, Archivo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idFormulario, estudiante.Nombre, estudiante.Apellido, estudiante.Cedula, estudiante.IdGenero, estudiante.IdFacultad, tipoProgramaId, programaId, archivo]
    );

    res.json({ success: true, message: 'Solicitud registrada exitosamente', id: idFormulario, archivo });
  } catch (error) {
    console.error('Error general en formulario:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
};

exports.listSolicitudes = (req, res) => {
  const sql = `
    SELECT fe.id_formulario, fe.Nombre, fe.Apellido, fe.Cedula,
      g.Genero, f.Facultad, tp.TipoPrograma, p.Programa,
      fe.Archivo, fe.Estado, fe.Prioridad, fe.FechaCreacion, fe.FechaModificacion, fe.NotasTrabajador
    FROM formulario_estudiante fe
    LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
    LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
    LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
    LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
    ORDER BY fe.id_formulario DESC`;

  conexion.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos', sql_error: err.message });
    res.json(results);
  });
};

exports.countSolicitudes = (req, res) => {
  conexion.query('SELECT COUNT(*) as total FROM formulario_estudiante', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos', sql_error: err.message });
    res.json({ total: results[0].total });
  });
};

exports.misSolicitudes = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [estudiantes] = await conexion.promise().query(
      'SELECT Cedula FROM estudiante WHERE IdEstudiante = ? AND Activo = 1',
      [usuarioId]
    );

    if (estudiantes.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    const cedula = estudiantes[0].Cedula;

    const sql = `
      SELECT fe.id_formulario, fe.Nombre, fe.Apellido, fe.Cedula,
        g.Genero, f.Facultad, tp.TipoPrograma, p.Programa,
        fe.Archivo, fe.Estado, fe.Prioridad, fe.FechaCreacion, fe.FechaModificacion, fe.NotasTrabajador
      FROM formulario_estudiante fe
      LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
      LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
      LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
      LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
      WHERE fe.Cedula = ?
      ORDER BY fe.FechaCreacion DESC`;

    const [results] = await conexion.promise().query(sql, [cedula]);
    res.json(results);
  } catch (error) {
    console.error('Error en mis solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

exports.getConfig = (req, res) => {
  const queries = {
    generos: 'SELECT IdGenero, Genero FROM genero ORDER BY Genero',
    facultades: 'SELECT IdFacultad, Facultad FROM facultad ORDER BY Facultad',
    tiposPrograma: 'SELECT IdTipoP, TipoPrograma FROM tipoprograma ORDER BY TipoPrograma',
    programas: 'SELECT IdPrograma, Programa, IdTipoP FROM programa ORDER BY Programa'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    conexion.query(queries[key], (err, result) => {
      if (err) results[key] = { error: err.message };
      else results[key] = result;
      completed++;
      if (completed === total) res.json(results);
    });
  });
};