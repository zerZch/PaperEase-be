const conexion = require('../database/connection');
const { generarIdFormulario } = require('../utils/id-generator');

exports.submit = (req, res) => {
  try {
    const { nombre, apellido, cedula, genero, facultad, tipoPrograma, programa } = req.body;

    const camposRequeridos = { nombre, apellido, cedula, genero, facultad, tipoPrograma, programa };
    if (!nombre || !apellido || !cedula || !genero || !facultad || !tipoPrograma || !programa) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios', received: camposRequeridos });
    }

    const cedulaRegex = /^[0-9\-]+$/;
    if (!cedulaRegex.test(cedula)) {
      return res.status(400).json({ error: 'Formato de cédula inválido. Solo se permiten números y guiones.' });
    }

    const generoId = parseInt(genero);
    const facultadId = parseInt(facultad);
    const tipoProgramaId = parseInt(tipoPrograma);
    const programaId = parseInt(programa);

    if (isNaN(generoId) || isNaN(facultadId) || isNaN(tipoProgramaId) || isNaN(programaId)) {
      return res.status(400).json({ error: 'Los IDs deben ser números válidos' });
    }

    const archivo = req.file ? req.file.filename : null;
    const idFormulario = generarIdFormulario();

    const validarId = (query, params, fieldName) => {
      return new Promise((resolve, reject) => {
        conexion.query(query, params, (err, result) => {
          if (err) reject(`Error al validar ${fieldName}: ${err.message}`);
          else if (result.length === 0) reject(`ID de ${fieldName} inválido`);
          else resolve(true);
        });
      });
    };

    Promise.all([
      validarId('SELECT IdGenero FROM genero WHERE IdGenero = ?', [generoId], 'género'),
      validarId('SELECT IdFacultad FROM facultad WHERE IdFacultad = ?', [facultadId], 'facultad'),
      validarId('SELECT IdTipoP FROM tipoprograma WHERE IdTipoP = ?', [tipoProgramaId], 'tipo de programa'),
      validarId('SELECT IdPrograma FROM programa WHERE IdPrograma = ? AND IdTipoP = ?', [programaId, tipoProgramaId], 'programa')
    ]).then(() => {
      const sqlGetEstudiante = 'SELECT Cedula FROM estudiante WHERE Cedula = ? AND Activo = 1';
      conexion.query(sqlGetEstudiante, [cedula], (err, estudianteRows) => {
        if (err) return res.status(500).json({ error: 'Error al verificar información del estudiante', sql_error: err.message });
        if (estudianteRows.length === 0) {
          return res.status(404).json({ error: 'No se encontró un estudiante registrado con esa cédula.' });
        }

        const insertSQL = `
          INSERT INTO formulario_estudiante
          (id_formulario, Nombre, Apellido, Cedula, IdGenero, IdFacultad, IdTipoP, IdPrograma, Archivo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const insertParams = [idFormulario, nombre, apellido, cedula, generoId, facultadId, tipoProgramaId, programaId, archivo];

        conexion.query(insertSQL, insertParams, (err, result) => {
          if (err) return res.status(500).json({ error: 'Error al guardar la solicitud', sql_error: err.message });
          res.json({ success: true, message: 'Solicitud registrada exitosamente', id: idFormulario, archivo, insertId: result.insertId, affectedRows: result.affectedRows });
        });
      });
    }).catch((validationError) => {
      return res.status(400).json({ error: validationError });
    });

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

exports.misSolicitudes = (req, res) => {
  const { cedula } = req.params;
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

  conexion.query(sql, [cedula], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos', sql_error: err.message });
    res.json(results);
  });
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
