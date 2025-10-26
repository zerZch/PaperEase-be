const express = require('express');
const path = require('path');
const multer = require('multer');
const conexion = require('./conexion');
const fs = require('fs');

const router = express.Router();

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Guardando archivo en:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/\s+/g, '_');
    const extension = path.extname(file.originalname);
    const filename = `${uniqueSuffix}-${safeName}`;
    console.log('📎 Nombre del archivo:', filename);
    cb(null, filename);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  console.log('🔍 Verificando tipo de archivo:', file.mimetype);
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ Tipo de archivo permitido');
    cb(null, true);
  } else {
    console.log('❌ Tipo de archivo no permitido:', file.mimetype);
    cb(new Error('Tipo de archivo no permitido. Solo PDF, JPG, JPEG, PNG'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Función para generar ID único
function generarIdFormulario() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `FORM_${timestamp}_${random}`.toUpperCase();
}

// RUTA DE PRUEBA PARA VERIFICAR CONEXIÓN
router.get('/test-db', (req, res) => {
  console.log('🔍 Probando conexión a la base de datos...');
  
  conexion.query('SELECT 1 as test', (err, results) => {
    if (err) {
      console.error('❌ Error de conexión a la BD:', err);
      return res.status(500).json({ 
        error: 'Error de conexión a la base de datos',
        details: err.message 
      });
    }
    
    console.log('✅ Conexión a la BD exitosa');
    res.json({ 
      success: true, 
      message: 'Conexión a la base de datos exitosa',
      result: results 
    });
  });
});

// RUTA PARA VERIFICAR QUE EXISTEN LAS TABLAS
router.get('/test-tables', (req, res) => {
  console.log('🔍 Verificando tablas...');
  
  const queries = [
    "SHOW TABLES LIKE 'formulario_estudiante'",
    "SHOW TABLES LIKE 'genero'",
    "SHOW TABLES LIKE 'facultad'",
    "SHOW TABLES LIKE 'programa'",
    "SHOW TABLES LIKE 'tipoprograma'"
  ];
  
  let results = {};
  let completed = 0;
  
  queries.forEach((query, index) => {
    conexion.query(query, (err, result) => {
      const tableName = query.split("'")[1];
      
      if (err) {
        console.error(`❌ Error verificando tabla ${tableName}:`, err);
        results[tableName] = { exists: false, error: err.message };
      } else {
        const exists = result.length > 0;
        console.log(`${exists ? '✅' : '❌'} Tabla ${tableName}: ${exists ? 'existe' : 'no existe'}`);
        results[tableName] = { exists: exists };
      }
      
      completed++;
      if (completed === queries.length) {
        res.json(results);
      }
    });
  });
});

// RUTA PARA OBTENER DATOS DE CONFIGURACIÓN
router.get('/config', (req, res) => {
  console.log('🔍 Obteniendo datos de configuración...');
  
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
    console.log(`🔍 Ejecutando consulta para ${key}...`);
    
    conexion.query(queries[key], (err, result) => {
      if (err) {
        console.error(`❌ Error al obtener ${key}:`, err);
        results[key] = { error: err.message };
      } else {
        console.log(`✅ ${key}: ${result.length} registros obtenidos`);
        results[key] = result;
      }
      
      completed++;
      
      if (completed === total) {
        console.log('✅ Configuración obtenida exitosamente');
        res.json(results);
      }
    });
  });
});

// RUTA PRINCIPAL DEL FORMULARIO CON DEBUG COMPLETO Y CORRECCIONES
router.post('/formulario', upload.single('archivo'), (req, res) => {
  console.log('\n🚀 === INICIO DE PROCESAMIENTO DEL FORMULARIO ===');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  try {
    // 1. VERIFICAR QUE SE RECIBIERON LOS DATOS
    console.log('📥 Datos recibidos en req.body:', req.body);
    console.log('📎 Archivo recibido:', req.file ? req.file.filename : 'Sin archivo');
    
    const { nombre, apellido, cedula, genero, facultad, tipoPrograma, programa } = req.body;
    
    // 2. VALIDACIÓN DE CAMPOS OBLIGATORIOS
    console.log('🔍 Validando campos obligatorios...');
    const camposRequeridos = { nombre, apellido, cedula, genero, facultad, tipoPrograma, programa };
    
    for (const [campo, valor] of Object.entries(camposRequeridos)) {
      console.log(`   ${campo}: "${valor}" ${valor ? '✅' : '❌'}`);
    }
    
    if (!nombre || !apellido || !cedula || !genero || !facultad || !tipoPrograma || !programa) {
      console.log('❌ Faltan campos obligatorios');
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios',
        received: camposRequeridos
      });
    }

    // 3. VALIDACIÓN DE FORMATO DE CÉDULA
    console.log('🔍 Validando formato de cédula...');
    const cedulaRegex = /^[0-9\-]+$/;
    if (!cedulaRegex.test(cedula)) {
      console.log('❌ Formato de cédula inválido:', cedula);
      return res.status(400).json({ 
        error: 'Formato de cédula inválido. Solo se permiten números y guiones.',
        cedula_received: cedula
      });
    }
    console.log('✅ Formato de cédula válido');

    // 4. CONVERTIR Y VALIDAR QUE LOS IDs SEAN NÚMEROS
    console.log('🔍 Validando formato de IDs...');
    const generoId = parseInt(genero);
    const facultadId = parseInt(facultad);
    const tipoProgramaId = parseInt(tipoPrograma);
    const programaId = parseInt(programa);

    // Verificar que la conversión fue exitosa
    if (isNaN(generoId) || isNaN(facultadId) || isNaN(tipoProgramaId) || isNaN(programaId)) {
      console.log('❌ Error en conversión de IDs:', {
        genero: `"${genero}" -> ${generoId}`,
        facultad: `"${facultad}" -> ${facultadId}`,
        tipoPrograma: `"${tipoPrograma}" -> ${tipoProgramaId}`,
        programa: `"${programa}" -> ${programaId}`
      });
      return res.status(400).json({ 
        error: 'Los IDs deben ser números válidos',
        received_ids: { genero, facultad, tipoPrograma, programa },
        converted_ids: { generoId, facultadId, tipoProgramaId, programaId }
      });
    }

    console.log('✅ IDs convertidos correctamente:', {
      generoId, facultadId, tipoProgramaId, programaId
    });

    const archivo = req.file ? req.file.filename : null;
    const idFormulario = generarIdFormulario();
    
    console.log('🆔 ID generado para el formulario:', idFormulario);
    console.log('📎 Archivo a guardar:', archivo);
    
    // 5. VERIFICAR SI LA CÉDULA YA EXISTE
    console.log('🔍 Verificando si la cédula ya existe...');
    const checkCedulaSQL = 'SELECT id_formulario FROM formulario_estudiante WHERE Cedula = ?';
    
    conexion.query(checkCedulaSQL, [cedula], (err, results) => {
      if (err) {
        console.error('❌ Error al verificar cédula:', err);
        return res.status(500).json({ 
          error: 'Error en la base de datos al verificar cédula',
          sql_error: err.message 
        });
      }
      
      console.log(`🔍 Resultados de verificación de cédula: ${results.length} registros encontrados`);
      
      if (results.length > 0) {
        console.log('❌ Cédula ya existe:', results[0]);
        return res.status(400).json({ 
          error: 'Ya existe una solicitud con esta cédula',
          existing_id: results[0].id_formulario
        });
      }
      
      console.log('✅ Cédula disponible');
      
      // 6. VALIDAR QUE LOS IDs EXISTAN EN SUS RESPECTIVAS TABLAS (CORREGIDO)
      console.log('🔍 Validando IDs en tablas relacionadas...');
      
      // Función para validar un ID en una tabla específica
      const validarId = (query, params, fieldName) => {
        return new Promise((resolve, reject) => {
          console.log(`🔍 Validando ${fieldName}:`, params);
          conexion.query(query, params, (err, result) => {
            if (err) {
              console.error(`❌ Error validando ${fieldName}:`, err);
              reject(`Error al validar ${fieldName}: ${err.message}`);
            } else if (result.length === 0) {
              console.log(`❌ ID de ${fieldName} no encontrado:`, params);
              reject(`ID de ${fieldName} inválido: ${Array.isArray(params) ? params.join(', ') : params}`);
            } else {
              console.log(`✅ ${fieldName} válido:`, result[0]);
              resolve(true);
            }
          });
        });
      };

      // Ejecutar todas las validaciones
      Promise.all([
        validarId('SELECT IdGenero FROM genero WHERE IdGenero = ?', [generoId], 'género'),
        validarId('SELECT IdFacultad FROM facultad WHERE IdFacultad = ?', [facultadId], 'facultad'),
        validarId('SELECT IdTipoP FROM tipoprograma WHERE IdTipoP = ?', [tipoProgramaId], 'tipo de programa'),
        validarId('SELECT IdPrograma FROM programa WHERE IdPrograma = ? AND IdTipoP = ?', [programaId, tipoProgramaId], 'programa')
      ]).then(() => {
        // 7. TODAS LAS VALIDACIONES PASARON - INSERTAR LA NUEVA SOLICITUD
        console.log('💾 Insertando nueva solicitud en la base de datos...');
        const insertSQL = `
          INSERT INTO formulario_estudiante 
          (id_formulario, Nombre, Apellido, Cedula, IdGenero, IdFacultad, IdTipoP, IdPrograma, Archivo) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertParams = [
          idFormulario, 
          nombre, 
          apellido, 
          cedula, 
          generoId, 
          facultadId, 
          tipoProgramaId, 
          programaId, 
          archivo
        ];
        
        console.log('📝 Parámetros para inserción:', insertParams);
        
        conexion.query(insertSQL, insertParams, (err, result) => {
          if (err) {
            console.error('❌ Error al insertar solicitud:', err);
            console.error('❌ SQL:', insertSQL);
            console.error('❌ Parámetros:', insertParams);
            return res.status(500).json({ 
              error: 'Error al guardar la solicitud',
              sql_error: err.message,
              sql_code: err.code,
              sql_errno: err.errno
            });
          }
          
          console.log('✅ Solicitud insertada exitosamente:', result);
          console.log('🎉 === FIN DE PROCESAMIENTO EXITOSO ===\n');
          
          res.json({ 
            success: true,
            message: 'Solicitud registrada exitosamente', 
            id: idFormulario,
            archivo: archivo,
            insertId: result.insertId,
            affectedRows: result.affectedRows
          });
        });
        
      }).catch((validationError) => {
        console.log('❌ Error en validación:', validationError);
        return res.status(400).json({ 
          error: validationError,
          received_data: {
            genero: generoId,
            facultad: facultadId,
            tipoPrograma: tipoProgramaId,
            programa: programaId
          }
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error general en el procesamiento:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// RUTA PARA VER TODAS LAS SOLICITUDES
router.get('/solicitudes', (req, res) => {
  console.log('🔍 Obteniendo todas las solicitudes...');

  const sql = `
    SELECT
      fe.id_formulario,
      fe.Nombre,
      fe.Apellido,
      fe.Cedula,
      g.Genero,
      f.Facultad,
      tp.TipoPrograma,
      p.Programa,
      fe.Archivo,
      fe.Estado,
      fe.Prioridad,
      fe.FechaCreacion,
      fe.FechaModificacion,
      fe.NotasTrabajador
    FROM formulario_estudiante fe
    LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
    LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
    LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
    LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
    ORDER BY fe.id_formulario DESC
  `;
  
  conexion.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitudes:', err);
      return res.status(500).json({ 
        error: 'Error en la base de datos',
        sql_error: err.message 
      });
    }
    
    console.log(`✅ ${results.length} solicitudes obtenidas`);
    res.json(results);
  });
});

// RUTA PARA CONTAR SOLICITUDES
router.get('/count', (req, res) => {
  console.log('🔍 Contando solicitudes...');
  
  conexion.query('SELECT COUNT(*) as total FROM formulario_estudiante', (err, results) => {
    if (err) {
      console.error('❌ Error al contar solicitudes:', err);
      return res.status(500).json({ 
        error: 'Error en la base de datos',
        sql_error: err.message 
      });
    }
    
    const total = results[0].total;
    console.log(`📊 Total de solicitudes: ${total}`);
    res.json({ total: total });
  });
});

// ============================================
// RUTA PARA OBTENER SOLICITUDES DE UN ESTUDIANTE
// GET /api/mis-solicitudes/:cedula
// ============================================
router.get('/mis-solicitudes/:cedula', (req, res) => {
  const { cedula } = req.params;

  console.log(`🔍 Obteniendo solicitudes del estudiante con cédula: ${cedula}`);

  const sql = `
    SELECT
      fe.id_formulario,
      fe.Nombre,
      fe.Apellido,
      fe.Cedula,
      g.Genero,
      f.Facultad,
      tp.TipoPrograma,
      p.Programa,
      fe.Archivo,
      fe.Estado,
      fe.Prioridad,
      fe.FechaCreacion,
      fe.FechaModificacion,
      fe.NotasTrabajador
    FROM formulario_estudiante fe
    LEFT JOIN genero g ON fe.IdGenero = g.IdGenero
    LEFT JOIN facultad f ON fe.IdFacultad = f.IdFacultad
    LEFT JOIN tipoprograma tp ON fe.IdTipoP = tp.IdTipoP
    LEFT JOIN programa p ON fe.IdPrograma = p.IdPrograma
    WHERE fe.Cedula = ?
    ORDER BY fe.FechaCreacion DESC
  `;

  conexion.query(sql, [cedula], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitudes del estudiante:', err);
      return res.status(500).json({
        error: 'Error en la base de datos',
        sql_error: err.message
      });
    }

    console.log(`✅ ${results.length} solicitudes obtenidas para cédula ${cedula}`);
    res.json(results);
  });
});

module.exports = router;