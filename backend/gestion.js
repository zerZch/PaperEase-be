const express = require('express');
const conexion = require('./conexion');
const PDFDocument = require('pdfkit');
const { crearNotificacion } = require('./notificaciones');
const router = express.Router();

// ============================================
// ENDPOINT: Aprobar Solicitud
// PUT /api/gestion/solicitud/:id/aprobar
// ============================================
router.put('/solicitud/:id/aprobar', async (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;

  console.log(`✅ Aprobando solicitud: ${id}`);

  const sql = `
    UPDATE formulario_estudiante
    SET
      Estado = 'aprobada',
      NotasTrabajador = ?,
      FechaModificacion = NOW()
    WHERE id_formulario = ?
  `;

  conexion.query(sql, [notas || null, id], async (err, result) => {
    if (err) {
      console.error('❌ Error al aprobar solicitud:', err);
      return res.status(500).json({
        error: 'Error al aprobar la solicitud',
        sql_error: err.message
      });
    }

    if (result.affectedRows === 0) {
      console.log('⚠️  Solicitud no encontrada:', id);
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        id: id
      });
    }

    console.log(`✅ Solicitud ${id} aprobada exitosamente`);

    // Obtener el IdEstudiante de la solicitud para crear la notificación
    const sqlEstudiante = 'SELECT IdEstudiante FROM formulario_estudiante WHERE id_formulario = ?';
    conexion.query(sqlEstudiante, [id], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error('⚠️  No se pudo obtener el IdEstudiante para la notificación');
      } else {
        const idEstudiante = rows[0].IdEstudiante;

        // Crear notificación
        try {
          await crearNotificacion(
            idEstudiante,
            id,
            'aprobada',
            '¡Solicitud Aprobada!',
            `Tu solicitud #${id} ha sido aprobada. ${notas ? 'Notas: ' + notas : ''}`
          );
          console.log(`🔔 Notificación de aprobación enviada al estudiante ${idEstudiante}`);
        } catch (notifErr) {
          console.error('❌ Error al crear notificación:', notifErr);
        }
      }
    });

    res.json({
      success: true,
      message: 'Solicitud aprobada exitosamente',
      id: id,
      estado: 'aprobada'
    });
  });
});

// ============================================
// ENDPOINT: Rechazar Solicitud
// PUT /api/gestion/solicitud/:id/rechazar
// ============================================
router.put('/solicitud/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;

  console.log(`❌ Rechazando solicitud: ${id}`);

  const sql = `
    UPDATE formulario_estudiante
    SET
      Estado = 'rechazada',
      NotasTrabajador = ?,
      FechaModificacion = NOW()
    WHERE id_formulario = ?
  `;

  conexion.query(sql, [notas || null, id], async (err, result) => {
    if (err) {
      console.error('❌ Error al rechazar solicitud:', err);
      return res.status(500).json({
        error: 'Error al rechazar la solicitud',
        sql_error: err.message
      });
    }

    if (result.affectedRows === 0) {
      console.log('⚠️  Solicitud no encontrada:', id);
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        id: id
      });
    }

    console.log(`✅ Solicitud ${id} rechazada exitosamente`);

    // Obtener el IdEstudiante de la solicitud para crear la notificación
    const sqlEstudiante = 'SELECT IdEstudiante FROM formulario_estudiante WHERE id_formulario = ?';
    conexion.query(sqlEstudiante, [id], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error('⚠️  No se pudo obtener el IdEstudiante para la notificación');
      } else {
        const idEstudiante = rows[0].IdEstudiante;

        // Crear notificación
        try {
          await crearNotificacion(
            idEstudiante,
            id,
            'rechazada',
            'Solicitud Rechazada',
            `Tu solicitud #${id} ha sido rechazada. ${notas ? 'Motivo: ' + notas : 'Por favor, contacta con Bienestar Estudiantil para más información.'}`
          );
          console.log(`🔔 Notificación de rechazo enviada al estudiante ${idEstudiante}`);
        } catch (notifErr) {
          console.error('❌ Error al crear notificación:', notifErr);
        }
      }
    });

    res.json({
      success: true,
      message: 'Solicitud rechazada exitosamente',
      id: id,
      estado: 'rechazada'
    });
  });
});

// ============================================
// ENDPOINT: Cambiar Prioridad
// PUT /api/gestion/solicitud/:id/prioridad
// ============================================
router.put('/solicitud/:id/prioridad', (req, res) => {
  const { id } = req.params;
  const { prioridad } = req.body;

  // Validar prioridad
  const prioridadesValidas = ['baja', 'media', 'alta'];
  if (!prioridad || !prioridadesValidas.includes(prioridad)) {
    return res.status(400).json({
      error: 'Prioridad inválida',
      validas: prioridadesValidas,
      recibida: prioridad
    });
  }

  console.log(`🔔 Cambiando prioridad de ${id} a: ${prioridad}`);

  const sql = `
    UPDATE formulario_estudiante
    SET
      Prioridad = ?,
      FechaModificacion = NOW()
    WHERE id_formulario = ?
  `;

  conexion.query(sql, [prioridad, id], (err, result) => {
    if (err) {
      console.error('❌ Error al cambiar prioridad:', err);
      return res.status(500).json({
        error: 'Error al cambiar la prioridad',
        sql_error: err.message
      });
    }

    if (result.affectedRows === 0) {
      console.log('⚠️  Solicitud no encontrada:', id);
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        id: id
      });
    }

    console.log(`✅ Prioridad de ${id} cambiada a ${prioridad}`);
    res.json({
      success: true,
      message: `Prioridad cambiada a ${prioridad}`,
      id: id,
      prioridad: prioridad
    });
  });
});

// ============================================
// ENDPOINT: Agregar/Actualizar Notas
// PUT /api/gestion/solicitud/:id/notas
// ============================================
router.put('/solicitud/:id/notas', (req, res) => {
  const { id } = req.params;
  const { notas } = req.body;

  console.log(`📝 Actualizando notas de solicitud: ${id}`);

  const sql = `
    UPDATE formulario_estudiante
    SET
      NotasTrabajador = ?,
      FechaModificacion = NOW()
    WHERE id_formulario = ?
  `;

  conexion.query(sql, [notas || null, id], (err, result) => {
    if (err) {
      console.error('❌ Error al actualizar notas:', err);
      return res.status(500).json({
        error: 'Error al actualizar las notas',
        sql_error: err.message
      });
    }

    if (result.affectedRows === 0) {
      console.log('⚠️  Solicitud no encontrada:', id);
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        id: id
      });
    }

    console.log(`✅ Notas de ${id} actualizadas`);
    res.json({
      success: true,
      message: 'Notas actualizadas exitosamente',
      id: id
    });
  });
});

// ============================================
// ENDPOINT: Obtener Detalle de Solicitud
// GET /api/gestion/solicitud/:id
// ============================================
router.get('/solicitud/:id', (req, res) => {
  const { id } = req.params;

  console.log(`🔍 Obteniendo detalle de solicitud: ${id}`);

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
    WHERE fe.id_formulario = ?
  `;

  conexion.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitud:', err);
      return res.status(500).json({
        error: 'Error al obtener la solicitud',
        sql_error: err.message
      });
    }

    if (results.length === 0) {
      console.log('⚠️  Solicitud no encontrada:', id);
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        id: id
      });
    }

    console.log(`✅ Solicitud ${id} obtenida`);
    res.json(results[0]);
  });
});

// ============================================
// ENDPOINT: Obtener Estadísticas
// GET /api/gestion/estadisticas
// ============================================
router.get('/estadisticas', (req, res) => {
  console.log('📊 Obteniendo estadísticas de gestión...');

  const queries = {
    porEstado: `
      SELECT Estado, COUNT(*) as cantidad
      FROM formulario_estudiante
      GROUP BY Estado
    `,
    porPrioridad: `
      SELECT Prioridad, COUNT(*) as cantidad
      FROM formulario_estudiante
      GROUP BY Prioridad
    `,
    total: `
      SELECT COUNT(*) as total
      FROM formulario_estudiante
    `
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    conexion.query(queries[key], (err, result) => {
      if (err) {
        console.error(`❌ Error en query ${key}:`, err);
        results[key] = { error: err.message };
      } else {
        results[key] = result;
      }

      completed++;

      if (completed === total) {
        console.log('✅ Estadísticas obtenidas');
        res.json(results);
      }
    });
  });
});

// ============================================
// ENDPOINT: Generar PDF de Solicitud
// GET /api/gestion/solicitud/:id/pdf
// ============================================
router.get('/solicitud/:id/pdf', (req, res) => {
  const { id } = req.params;

  console.log(`📄 Generando PDF de solicitud: ${id}`);

  // Obtener datos de la solicitud
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
    WHERE fe.id_formulario = ?
  `;

  conexion.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitud:', err);
      return res.status(500).json({
        error: 'Error al obtener la solicitud',
        sql_error: err.message
      });
    }

    if (results.length === 0) {
      console.log('⚠️  Solicitud no encontrada:', id);
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        id: id
      });
    }

    const solicitud = results[0];

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=solicitud-${id}.pdf`);

    // Pipe del PDF a la respuesta
    doc.pipe(res);

    // ====== CONTENIDO DEL PDF ======

    // Header
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .text('UNIVERSIDAD TECNOLÓGICA DE PANAMÁ', { align: 'center' })
      .fontSize(16)
      .text('Bienestar Estudiantil', { align: 'center' })
      .fontSize(14)
      .text('Solicitud de Programa', { align: 'center' })
      .moveDown();

    // Línea separadora
    doc.moveTo(50, doc.y)
      .lineTo(562, doc.y)
      .stroke()
      .moveDown();

    // ID de Solicitud
    doc.fontSize(12)
      .font('Helvetica')
      .text(`ID de Solicitud: `, { continued: true })
      .font('Helvetica-Bold')
      .text(solicitud.id_formulario)
      .moveDown(0.5);

    // Fecha
    const fecha = solicitud.FechaCreacion
      ? new Date(solicitud.FechaCreacion).toLocaleDateString('es-PA')
      : 'N/A';

    doc.font('Helvetica')
      .text(`Fecha de Solicitud: `, { continued: true })
      .font('Helvetica-Bold')
      .text(fecha)
      .moveDown();

    // Estado y Prioridad
    const estadoBadge = solicitud.Estado === 'aprobada' ? '✓ APROBADA'
      : solicitud.Estado === 'rechazada' ? '✗ RECHAZADA'
      : '⏳ PENDIENTE';

    const prioridadText = solicitud.Prioridad === 'alta' ? '🔴 ALTA'
      : solicitud.Prioridad === 'media' ? '🟡 MEDIA'
      : '🟢 BAJA';

    doc.fontSize(11)
      .font('Helvetica')
      .text(`Estado: `, { continued: true })
      .font('Helvetica-Bold')
      .text(estadoBadge)
      .moveDown(0.5);

    doc.font('Helvetica')
      .text(`Prioridad: `, { continued: true })
      .font('Helvetica-Bold')
      .text(prioridadText)
      .moveDown(1.5);

    // ====== DATOS DEL ESTUDIANTE ======
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text('DATOS DEL ESTUDIANTE')
      .moveDown(0.5);

    doc.fontSize(11)
      .font('Helvetica');

    const leftColumn = 50;
    const rightColumn = 320;
    let currentY = doc.y;

    // Nombre
    doc.text('Nombre:', leftColumn, currentY, { width: 100, continued: false })
      .font('Helvetica-Bold')
      .text(solicitud.Nombre, leftColumn + 100, currentY);

    // Apellido
    currentY = doc.y + 5;
    doc.font('Helvetica')
      .text('Apellido:', leftColumn, currentY, { width: 100, continued: false })
      .font('Helvetica-Bold')
      .text(solicitud.Apellido, leftColumn + 100, currentY);

    // Cédula
    currentY = doc.y + 5;
    doc.font('Helvetica')
      .text('Cédula:', leftColumn, currentY, { width: 100, continued: false })
      .font('Helvetica-Bold')
      .text(solicitud.Cedula || 'N/A', leftColumn + 100, currentY);

    // Género
    currentY = doc.y + 5;
    doc.font('Helvetica')
      .text('Género:', leftColumn, currentY, { width: 100, continued: false })
      .font('Helvetica-Bold')
      .text(solicitud.Genero || 'N/A', leftColumn + 100, currentY);

    // Facultad
    currentY = doc.y + 5;
    doc.font('Helvetica')
      .text('Facultad:', leftColumn, currentY, { width: 100, continued: false })
      .font('Helvetica-Bold')
      .text(solicitud.Facultad || 'N/A', leftColumn + 100, currentY);

    doc.moveDown(2);

    // ====== PROGRAMA SOLICITADO ======
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text('PROGRAMA SOLICITADO')
      .moveDown(0.5);

    doc.fontSize(11)
      .font('Helvetica');

    currentY = doc.y;

    // Tipo de Programa
    doc.text('Tipo de Programa:', leftColumn, currentY, { width: 150, continued: false })
      .font('Helvetica-Bold')
      .text(solicitud.TipoPrograma || 'N/A', leftColumn + 150, currentY);

    // Programa
    currentY = doc.y + 5;
    doc.font('Helvetica')
      .text('Programa:', leftColumn, currentY, { width: 150, continued: false })
      .font('Helvetica-Bold')
      .text(solicitud.Programa || 'N/A', leftColumn + 150, currentY);

    doc.moveDown(2);

    // ====== DOCUMENTOS ADJUNTOS ======
    doc.fontSize(14)
      .font('Helvetica-Bold')
      .text('DOCUMENTOS ADJUNTOS')
      .moveDown(0.5);

    doc.fontSize(11)
      .font('Helvetica');

    if (solicitud.Archivo) {
      doc.text(`✓ ${solicitud.Archivo}`);
    } else {
      doc.text('No hay documentos adjuntos');
    }

    doc.moveDown(2);

    // ====== NOTAS DEL TRABAJADOR SOCIAL ======
    if (solicitud.NotasTrabajador) {
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('NOTAS DEL TRABAJADOR SOCIAL')
        .moveDown(0.5);

      doc.fontSize(11)
        .font('Helvetica')
        .text(solicitud.NotasTrabajador, {
          width: 500,
          align: 'justify'
        })
        .moveDown(2);
    }

    // ====== FOOTER ======
    const pageHeight = doc.page.height;
    doc.fontSize(9)
      .font('Helvetica')
      .text(
        `Generado el ${new Date().toLocaleDateString('es-PA')} a las ${new Date().toLocaleTimeString('es-PA')}`,
        50,
        pageHeight - 80,
        { align: 'center' }
      )
      .text(
        'Universidad Tecnológica de Panamá - Bienestar Estudiantil',
        50,
        pageHeight - 65,
        { align: 'center' }
      )
      .text(
        'Este documento es generado automáticamente por PaperEase',
        50,
        pageHeight - 50,
        { align: 'center' }
      );

    // Finalizar PDF
    doc.end();

    console.log(`✅ PDF generado para solicitud ${id}`);
  });
});

module.exports = router;
