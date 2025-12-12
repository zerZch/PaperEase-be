const express = require('express');
const router = express.Router();
const db = require('./conexion');

// Obtener estadísticas generales del dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const queries = {
      participantes: `
        SELECT COUNT(DISTINCT id_formulario) as total 
        FROM formulario_estudiante
      `,
      programas: `
        SELECT COUNT(*) as total FROM programa
      `,
      facultades: `
        SELECT COUNT(*) as total FROM facultad
      `,
      eventos: `
        SELECT COUNT(*) as total FROM eventos 
        WHERE year = YEAR(CURDATE())
      `
    };

    const results = {};
    
    // Ejecutar todas las consultas
    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await executeQuery(query);
        results[key] = result[0]?.total || 0;
      } catch (error) {
        console.error(`Error en consulta ${key}:`, error);
        results[key] = 0;
      }
    }

    console.log('Estadísticas dashboard:', results);
    res.json(results);
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas básicas (ruta alternativa)
router.get('/estadisticas', async (req, res) => {
  try {
    const queries = {
      participantes: `
        SELECT COUNT(DISTINCT id_formulario) as total 
        FROM formulario_estudiante
      `,
      programas: `
        SELECT COUNT(*) as total FROM programa
      `,
      facultades: `
        SELECT COUNT(*) as total FROM facultad
      `,
      eventos: `
        SELECT COUNT(*) as total FROM eventos 
        WHERE year = YEAR(CURDATE())
      `
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await executeQuery(query);
        results[key] = result[0]?.total || 0;
      } catch (error) {
        console.error(`Error en consulta ${key}:`, error);
        results[key] = 0;
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener participación por facultades
router.get('/facultades', (req, res) => {
  const { programa, tipo, year } = req.query;
  
  let query = `
    SELECT 
      f.Facultad,
      COUNT(fe.id_formulario) as participantes
    FROM facultad f
    LEFT JOIN formulario_estudiante fe ON f.IdFacultad = fe.IdFacultad
  `;
  
  const conditions = [];
  const values = [];
  
  if (programa) {
    query += ` LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma`;
    conditions.push('p.Programa = ?');
    values.push(programa);
  }
  
  if (tipo) {
    if (!programa) {
      query += ` LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma`;
    }
    query += ` LEFT JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP`;
    conditions.push('tp.TipoPrograma = ?');
    values.push(tipo);
  }
  
  // IMPORTANTE: Filtrar por año usando fecha_registro
  if (year) {
    conditions.push('YEAR(fe.FechaCreacion) = ?');
    values.push(year);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY f.IdFacultad, f.Facultad ORDER BY participantes DESC';
  
  console.log('Query facultades:', query);
  console.log('Valores:', values);
  
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error en consulta facultades:', err);
      return res.status(500).json({ error: 'Error al obtener datos de facultades' });
    }
    console.log('Resultado facultades:', result);
    res.json(result);
  });
});

// Obtener participación por género y año
router.get('/participacion-genero-anual', async (req, res) => {
  try {
    console.log('=== INICIANDO CONSULTA DE PARTICIPACIÓN POR GÉNERO ===');
    
    // CORRECCIÓN: yearEnd debe ser el año actual o 2026 (el que sea mayor)
    const currentYear = new Date().getFullYear();
    const defaultYearEnd = Math.max(currentYear, 2026);
    const { yearStart = 2018, yearEnd = defaultYearEnd } = req.query;
    
    console.log(`Rango de años: ${yearStart} - ${yearEnd}`);
    
    // Verificar total de participantes
    const totalQuery = `SELECT COUNT(*) as total FROM formulario_estudiante`;
    const totalResult = await executeQuery(totalQuery);
    console.log('Total de participantes en BD:', totalResult[0]?.total || 0);
    
    // Consulta principal usando fecha_registro
    const query = `
      SELECT 
        YEAR(fe.FechaCreacion) as year,
        g.Genero,
        COUNT(fe.id_formulario) as participantes
      FROM formulario_estudiante fe
      LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
      WHERE fe.FechaCreacion IS NOT NULL 
        AND YEAR(fe.FechaCreacion) BETWEEN ? AND ?
        AND g.Genero IS NOT NULL
      GROUP BY YEAR(fe.FechaCreacion), g.IdGenero, g.Genero
      ORDER BY year ASC, g.Genero ASC
    `;
    
    const params = [yearStart, yearEnd];
    const result = await executeQuery(query, params);
    console.log('Resultado de consulta por género:', result);
    
    // Crear estructura de años - SIEMPRE incluye todos los años del rango
    const years = [];
    for (let year = parseInt(yearStart); year <= parseInt(yearEnd); year++) {
      years.push(year.toString());
    }
    
    console.log('Años en el rango:', years);
    
    // Inicializar arrays con CEROS para todos los años
    let hombresData = new Array(years.length).fill(0);
    let mujeresData = new Array(years.length).fill(0);
    
    // Procesar resultados SOLO si existen datos reales de la BD
    // NO distribuir ni inventar datos
    result.forEach(row => {
      const yearIndex = years.indexOf(row.year.toString());
      if (yearIndex !== -1 && row.Genero) {
        const genero = row.Genero.toLowerCase();
        const participantes = parseInt(row.participantes) || 0;
        
        if (genero.includes('masculino') || genero.includes('hombre') || 
            genero.includes('male') || genero === 'm' || genero === 'h') {
          hombresData[yearIndex] = participantes;
        } else if (genero.includes('femenino') || genero.includes('mujer') || 
                   genero.includes('female') || genero === 'f' || genero === 'w') {
          mujeresData[yearIndex] = participantes;
        }
      }
    });
    
    const response = {
      years: years,
      hombres: hombresData,
      mujeres: mujeresData,
      totalParticipantes: totalResult[0]?.total || 0
    };
    
    console.log('=== RESPUESTA FINAL ===');
    console.log(JSON.stringify(response, null, 2));
    
    res.json(response);
    
  } catch (error) {
    console.error('Error en participacion-genero-anual:', error);
    
    // Respuesta de emergencia vacía
    const currentYear = new Date().getFullYear();
    const defaultYearEnd = Math.max(currentYear, 2026);
    const years = [];
    for (let year = parseInt(req.query.yearStart || 2018); year <= parseInt(req.query.yearEnd || defaultYearEnd); year++) {
      years.push(year.toString());
    }
    
    const response = {
      years: years,
      hombres: new Array(years.length).fill(0),
      mujeres: new Array(years.length).fill(0),
      totalParticipantes: 0,
      error: error.message
    };
    
    res.json(response);
  }
});

// Ruta de debug para verificar la estructura de datos
router.get('/debug-participacion', async (req, res) => {
  try {
    const queries = {
      total_participantes: 'SELECT COUNT(*) as total FROM formulario_estudiante',
      generos: `
        SELECT g.IdGenero, g.Genero, COUNT(fe.id_formulario) as participantes
        FROM genero g
        LEFT JOIN formulario_estudiante fe ON g.IdGenero = fe.IdGenero
        GROUP BY g.IdGenero, g.Genero
        ORDER BY participantes DESC
      `,
      tiene_fechas: `
        SELECT 
          COUNT(*) as total,
          COUNT(fecha_registro) as con_fecha,
          MIN(fecha_registro) as fecha_min,
          MAX(fecha_registro) as fecha_max
        FROM formulario_estudiante
      `,
      muestra_datos: `
        SELECT 
          fe.id_formulario,
          fe.fecha_registro,
          g.Genero
        FROM formulario_estudiante fe
        LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
        LIMIT 10
      `
    };
    
    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      try {
        results[key] = await executeQuery(query);
      } catch (error) {
        results[key] = { error: error.message };
      }
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener participación por programas
router.get('/programas-participacion', (req, res) => {
  const { facultad, tipo } = req.query;
  
  let query = `
    SELECT 
      p.Programa,
      tp.TipoPrograma,
      COUNT(fe.id_formulario) as participantes
    FROM programa p
    LEFT JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP
    LEFT JOIN formulario_estudiante fe ON p.IdPrograma = fe.IdPrograma
  `;
  
  const conditions = [];
  const values = [];
  
  if (facultad) {
    query += ` LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad`;
    conditions.push('f.Facultad = ?');
    values.push(facultad);
  }
  
  if (tipo) {
    conditions.push('tp.TipoPrograma = ?');
    values.push(tipo);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' GROUP BY p.IdPrograma, p.Programa, tp.TipoPrograma ORDER BY participantes DESC';
  
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error en consulta programas-participacion:', err);
      return res.status(500).json({ error: 'Error al obtener datos de programas' });
    }
    res.json(result);
  });
});

// Obtener todos los programas disponibles
router.get('/programas', (req, res) => {
  const query = `
    SELECT 
      p.IdPrograma,
      p.Programa,
      tp.TipoPrograma,
      tp.IdTipoP
    FROM programa p
    LEFT JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP
    ORDER BY tp.TipoPrograma, p.Programa
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error en consulta programas:', err);
      return res.status(500).json({ error: 'Error al obtener programas' });
    }
    console.log('Programas obtenidos:', result.length);
    res.json(result);
  });
});

// Obtener tipos de programas
router.get('/tipos-programa', (req, res) => {
  const query = 'SELECT * FROM tipoprograma ORDER BY TipoPrograma';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error en consulta tipos-programa:', err);
      return res.status(500).json({ error: 'Error al obtener tipos de programa' });
    }
    console.log('Tipos de programa obtenidos:', result.length);
    res.json(result);
  });
});

// Obtener todas las facultades
router.get('/facultades-lista', (req, res) => {
  const query = 'SELECT * FROM facultad ORDER BY Facultad';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error en consulta facultades-lista:', err);
      return res.status(500).json({ error: 'Error al obtener facultades' });
    }
    res.json(result);
  });
});

// Obtener estadísticas de eventos por mes (timeline)
router.get('/eventos-timeline', (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  
  const query = `
    SELECT 
      e.Mes,
      COUNT(*) as total_eventos,
      COALESCE(e.Categoria, 'General') as Categoria
    FROM eventos e
    WHERE e.year = ?
    GROUP BY e.Mes, e.Categoria
    ORDER BY e.Mes, e.Categoria
  `;
  
  console.log('Query eventos timeline:', query);
  console.log('Year:', year);
  
  db.query(query, [year], (err, result) => {
    if (err) {
      console.error('Error en consulta eventos-timeline:', err);
      return res.status(500).json({ error: 'Error al obtener timeline de eventos' });
    }
    console.log('Eventos timeline obtenidos:', result);
    res.json(result);
  });
});

// Obtener estadísticas de eventos
router.get('/eventos-stats', (req, res) => {
  const { year = new Date().getFullYear(), facultad, categoria } = req.query;
  
  let query = `
    SELECT 
      COALESCE(e.Categoria, 'General') as Categoria,
      COUNT(*) as total_eventos,
      e.Facultad
    FROM eventos e
    WHERE e.year = ?
  `;
  
  const values = [year];
  
  if (facultad) {
    query += ' AND e.Facultad = ?';
    values.push(facultad);
  }
  
  if (categoria) {
    query += ' AND e.Categoria = ?';
    values.push(categoria);
  }
  
  query += ' GROUP BY e.Categoria, e.Facultad ORDER BY total_eventos DESC';
  
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error en consulta eventos-stats:', err);
      return res.status(500).json({ error: 'Error al obtener estadísticas de eventos' });
    }
    res.json(result);
  });
});

// Obtener estadísticas detalladas de un programa específico
router.get('/programa/:id', async (req, res) => {
  const programaId = req.params.id;
  
  if (isNaN(programaId)) {
    return res.status(400).json({ error: 'ID de programa inválido' });
  }
  
  try {
    const queries = {
      info: `
        SELECT p.*, tp.TipoPrograma 
        FROM programa p
        LEFT JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP
        WHERE p.IdPrograma = ?
      `,
      participantes: `
        SELECT COUNT(*) as total 
        FROM formulario_estudiante 
        WHERE IdPrograma = ?
      `,
      por_facultad: `
        SELECT 
          f.Facultad,
          COUNT(fe.id_formulario) as participantes
        FROM formulario_estudiante fe
        JOIN facultad f ON fe.IdFacultad = f.IdFacultad
        WHERE fe.IdPrograma = ?
        GROUP BY f.IdFacultad, f.Facultad
        ORDER BY participantes DESC
      `,
      por_genero: `
        SELECT 
          g.Genero,
          COUNT(fe.id_formulario) as participantes
        FROM formulario_estudiante fe
        JOIN genero g ON fe.IdGenero = g.IdGenero
        WHERE fe.IdPrograma = ?
        GROUP BY g.IdGenero, g.Genero
        ORDER BY participantes DESC
      `
    };
    
    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        const result = await executeQuery(query, [programaId]);
        results[key] = result;
      } catch (error) {
        console.error(`Error en consulta ${key}:`, error);
        results[key] = [];
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error en programa específico:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del programa' });
  }
});

// Obtener participantes detallados con filtros
router.get('/participantes', (req, res) => {
  const { programa, facultad, genero, tipo } = req.query;
  
  let query = `
    SELECT 
      fe.id_formulario,
      fe.Nombre,
      fe.Apellido,
      fe.Cedula,
      f.Facultad,
      g.Genero,
      p.Programa,
      tp.TipoPrograma,
      fe.Archivo
    FROM formulario_estudiante fe
    LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
    LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
    LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
    LEFT JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP
  `;
  
  const conditions = [];
  const values = [];
  
  if (programa) {
    conditions.push('p.Programa = ?');
    values.push(programa);
  }
  
  if (facultad) {
    conditions.push('f.Facultad = ?');
    values.push(facultad);
  }
  
  if (genero) {
    conditions.push('g.Genero = ?');
    values.push(genero);
  }
  
  if (tipo) {
    conditions.push('tp.TipoPrograma = ?');
    values.push(tipo);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY fe.Nombre, fe.Apellido';
  
  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error en consulta participantes:', err);
      return res.status(500).json({ error: 'Error al obtener participantes' });
    }
    res.json(result);
  });
});

// Exportar datos de estadísticas (CSV)
router.get('/exportar', (req, res) => {
  const { formato = 'json', tabla = 'participantes' } = req.query;
  
  let query;
  
  if (tabla === 'participantes') {
    query = `
      SELECT 
        fe.id_formulario as ID,
        fe.Nombre,
        fe.Apellido,
        fe.Cedula,
        f.Facultad,
        g.Genero,
        p.Programa,
        tp.TipoPrograma
      FROM formulario_estudiante fe
      LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
      LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
      LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
      LEFT JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP
      ORDER BY fe.Nombre, fe.Apellido
    `;
  } else if (tabla === 'eventos') {
    query = `
      SELECT 
        Id_Eventos as ID,
        Titulo,
        Descripcion,
        Lugar,
        HoraInicio,
        HoraFin,
        Categoria,
        Facultad,
        Programa,
        Dia,
        Mes,
        year as Año
      FROM eventos
      ORDER BY year DESC, Mes DESC, Dia DESC
    `;
  } else {
    return res.status(400).json({ error: 'Tabla no válida' });
  }
  
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error en exportar:', err);
      return res.status(500).json({ error: 'Error al exportar datos' });
    }
    
    if (formato === 'csv') {
      try {
        const csv = convertToCSV(result);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${tabla}_estadisticas.csv`);
        res.send('\uFEFF' + csv);
      } catch (error) {
        console.error('Error al convertir a CSV:', error);
        res.status(500).json({ error: 'Error al generar CSV' });
      }
    } else {
      res.json(result);
    }
  });
});

// Función auxiliar para convertir a CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Función auxiliar para promisificar las consultas
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = router;