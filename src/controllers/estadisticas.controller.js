const conexion = require('../database/connection');

exports.dashboard = (req, res) => {
  const queries = {
    totalParticipantes: 'SELECT COUNT(DISTINCT Cedula) as total FROM formulario_estudiante',
    totalSolicitudes: 'SELECT COUNT(*) as total FROM formulario_estudiante',
    totalProgramas: 'SELECT COUNT(*) as total FROM programa',
    totalFacultades: 'SELECT COUNT(*) as total FROM facultad',
    totalEventos: 'SELECT COUNT(*) as total FROM eventos',
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    conexion.query(sql, (err, rows) => {
      if (!err && rows.length > 0) {
        results[key] = rows[0].total || rows[0][Object.keys(rows[0])[0]];
      }
      completed++;
      if (completed === total) res.json(results);
    });
  });
};

exports.facultades = (req, res) => {
  const { year } = req.query;
  let sql, params = [];

  if (year) {
    sql = `SELECT f.Facultad, COUNT(fe.id_formulario) as total
           FROM facultad f
           LEFT JOIN formulario_estudiante fe ON f.IdFacultad = fe.IdFacultad AND YEAR(fe.FechaCreacion) = ?
           GROUP BY f.IdFacultad, f.Facultad ORDER BY total DESC`;
    params = [year];
  } else {
    sql = `SELECT f.Facultad, COUNT(fe.id_formulario) as total
           FROM facultad f
           LEFT JOIN formulario_estudiante fe ON f.IdFacultad = fe.IdFacultad
           GROUP BY f.IdFacultad, f.Facultad ORDER BY total DESC`;
  }

  conexion.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.facultadesLista = (req, res) => {
  conexion.query('SELECT IdFacultad, Facultad FROM facultad ORDER BY Facultad', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.participacionGeneroAnual = (req, res) => {
  const query = req.query.year
    ? `SELECT YEAR(fe.FechaCreacion) as year, g.Genero, COUNT(fe.id_formulario) as total
       FROM formulario_estudiante fe
       JOIN genero g ON fe.IdGenero = g.IdGenero
       WHERE YEAR(fe.FechaCreacion) = ?
       GROUP BY YEAR(fe.FechaCreacion), g.Genero ORDER BY year`
    : `SELECT YEAR(fe.FechaCreacion) as year, g.Genero, COUNT(fe.id_formulario) as total
       FROM formulario_estudiante fe
       JOIN genero g ON fe.IdGenero = g.IdGenero
       GROUP BY YEAR(fe.FechaCreacion), g.Genero ORDER BY year`;

  conexion.query(query, req.query.year ? [req.query.year] : [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const masculinoReg = /^masculino$/i;
    const femeninoReg = /^femenino$/i;
    const labels = {};
    const data = {};

    rows.forEach(row => {
      const yr = `year_${row.year}`;
      if (!labels[yr]) labels[yr] = true;
      if (masculinoReg.test(row.Genero)) {
        data[yr] = data[yr] || {};
        data[yr].masculino = row.total;
      } else if (femeninoReg.test(row.Genero)) {
        data[yr] = data[yr] || {};
        data[yr].femenino = row.total;
      }
    });

    const sortedYears = Object.keys(data).sort();
    const result = {
      labels: sortedYears.map(y => y.replace('year_', '')),
      masculino: sortedYears.map(y => data[y].masculino || 0),
      femenino: sortedYears.map(y => data[y].femenino || 0),
    };

    res.json(result);
  });
};

exports.programasParticipacion = (req, res) => {
  conexion.query(
    `SELECT p.Programa, COUNT(fe.id_formulario) as total
     FROM programa p
     LEFT JOIN formulario_estudiante fe ON p.IdPrograma = fe.IdPrograma
     GROUP BY p.IdPrograma, p.Programa ORDER BY total DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

exports.programasLista = (req, res) => {
  conexion.query(
    'SELECT p.IdPrograma, p.Programa, tp.TipoPrograma FROM programa p JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP ORDER BY p.Programa',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

exports.tiposPrograma = (req, res) => {
  conexion.query('SELECT IdTipoP, TipoPrograma FROM tipoprograma ORDER BY TipoPrograma', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.eventosTimeline = (req, res) => {
  conexion.query(
    `SELECT year, Mes, COUNT(*) as total
     FROM eventos GROUP BY year, Mes ORDER BY year, Mes`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

exports.eventosStats = (req, res) => {
  conexion.query(
    `SELECT Categoria, COUNT(*) as total FROM eventos GROUP BY Categoria ORDER BY total DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

exports.programaDetail = (req, res) => {
  const { id } = req.params;
  conexion.query(
    `SELECT fe.Estado, COUNT(*) as total
     FROM formulario_estudiante fe
     WHERE fe.IdPrograma = ? GROUP BY fe.Estado`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

exports.participantes = (req, res) => {
  const { facultad, programa, estado } = req.query;
  let sql = `
    SELECT DISTINCT fe.Cedula, fe.Nombre, fe.Apellido, f.Facultad, p.Programa, fe.Estado, fe.FechaCreacion
    FROM formulario_estudiante fe
    LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
    LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
    WHERE 1=1`;
  const params = [];

  if (facultad) { sql += ' AND fe.IdFacultad = ?'; params.push(facultad); }
  if (programa) { sql += ' AND fe.IdPrograma = ?'; params.push(programa); }
  if (estado) { sql += ' AND fe.Estado = ?'; params.push(estado); }

  sql += ' ORDER BY fe.FechaCreacion DESC LIMIT 500';

  conexion.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.exportar = (req, res) => {
  const format = req.query.format || 'json';
  conexion.query(
    `SELECT fe.id_formulario, fe.Nombre, fe.Apellido, fe.Cedula, g.Genero, f.Facultad, tp.TipoPrograma, p.Programa, fe.Estado, fe.Prioridad, fe.FechaCreacion
     FROM formulario_estudiante fe
     LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
     LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
     LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
     LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
     ORDER BY fe.FechaCreacion DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (format === 'csv') {
        if (rows.length === 0) return res.send('');
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map(r => Object.values(r).map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="solicitudes.csv"');
        return res.send([headers, ...csvRows].join('\n'));
      }

      res.json(rows);
    }
  );
};
