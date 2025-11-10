const express = require('express');
const router = express.Router();
const db = require('./conexion');

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

// Obtener participación por FACULTADES
router.get('/facultades', async (req, res) => {
  try {
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
    
    if (year) {
      conditions.push('YEAR(fe.FechaCreacion) = ?');
      values.push(year);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY f.IdFacultad, f.Facultad ORDER BY participantes DESC';
    
    const result = await executeQuery(query, values);
    console.log('Facultades participación:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Error en facultades:', error);
    res.status(500).json({ error: 'Error al obtener datos de facultades' });
  }
});

// Obtener participación por género y año
router.get('/participacion-genero-anual', async (req, res) => {
  try {
    console.log('=== INICIANDO CONSULTA DE PARTICIPACIÓN POR GÉNERO ===');
    const { yearStart = 2023, yearEnd = 2025 } = req.query;
    
    // Verificar total de participantes
    const totalQuery = `SELECT COUNT(*) as total FROM formulario_estudiante`;
    const totalResult = await executeQuery(totalQuery);
    console.log('Total de participantes en BD:', totalResult[0]?.total || 0);
    
    // Consulta principal usando FechaCreacion
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
    
    // Crear estructura de años
    const years = [];
    for (let year = parseInt(yearStart); year <= parseInt(yearEnd); year++) {
      years.push(year.toString());
    }
    
    let hombresData = new Array(years.length).fill(0);
    let mujeresData = new Array(years.length).fill(0);
    
    // Procesar resultados
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
    res.status(500).json({ error: error.message });
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
          COUNT(FechaCreacion) as con_fecha,
          MIN(FechaCreacion) as fecha_min,
          MAX(FechaCreacion) as fecha_max
        FROM formulario_estudiante
      `,
      por_year: `
        SELECT 
          YEAR(FechaCreacion) as year,
          COUNT(*) as participantes
        FROM formulario_estudiante
        WHERE FechaCreacion IS NOT NULL
        GROUP BY YEAR(FechaCreacion)
        ORDER BY year
      `,
      muestra_datos: `
        SELECT 
          fe.id_formulario,
          fe.FechaCreacion,
          g.Genero,
          p.Programa,
          tp.TipoPrograma
        FROM formulario_estudiante fe
        LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
        LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
        LEFT JOIN tipoprograma tp ON p.IdTipoP = tp.IdTipoP
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

// Obtener todos los programas disponibles
router.get('/programas', async (req, res) => {
  try {
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
    
    const result = await executeQuery(query);
    console.log('Programas obtenidos:', result.length);
    res.json(result);
  } catch (error) {
    console.error('Error en consulta programas:', error);
    res.status(500).json({ error: 'Error al obtener programas' });
  }
});

// Obtener tipos de programas
router.get('/tipos-programa', async (req, res) => {
  try {
    const query = 'SELECT * FROM tipoprograma ORDER BY TipoPrograma';
    const result = await executeQuery(query);
    console.log('Tipos de programa obtenidos:', result.length);
    res.json(result);
  } catch (error) {
    console.error('Error en consulta tipos-programa:', error);
    res.status(500).json({ error: 'Error al obtener tipos de programa' });
  }
});

// Obtener participantes detallados con filtros
router.get('/participantes', async (req, res) => {
  try {
    const { programa, genero, tipo, year } = req.query;
    
    let query = `
      SELECT 
        fe.id_formulario,
        fe.Nombre,
        fe.Apellido,
        fe.Cedula,
        g.Genero,
        p.Programa,
        tp.TipoPrograma,
        fe.Estado,
        fe.FechaCreacion
      FROM formulario_estudiante fe
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
    
    if (genero) {
      conditions.push('g.Genero = ?');
      values.push(genero);
    }
    
    if (tipo) {
      conditions.push('tp.TipoPrograma = ?');
      values.push(tipo);
    }
    
    if (year) {
      conditions.push('YEAR(fe.FechaCreacion) = ?');
      values.push(year);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY fe.FechaCreacion DESC, fe.Nombre, fe.Apellido';
    
    const result = await executeQuery(query, values);
    res.json(result);
  } catch (error) {
    console.error('Error en consulta participantes:', error);
    res.status(500).json({ error: 'Error al obtener participantes' });
  }
});

module.exports = router;