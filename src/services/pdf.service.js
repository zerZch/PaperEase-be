const PDFDocument = require('pdfkit');

function generatePdf(solicitud, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const filename = `solicitud_${solicitud.id_formulario}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(18).text('UNIVERSIDAD TECNOLOGICA DE PANAMA', { align: 'center' });
  doc.fontSize(14).text('Bienestar Estudiantil', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Solicitud: ${solicitud.id_formulario}`, { align: 'left' });
  doc.moveDown(0.5);
  doc.text(`Fecha: ${new Date(solicitud.FechaCreacion).toLocaleDateString('es-PA')}`);
  doc.text(`Estado: ${solicitud.Estado}`);
  doc.text(`Prioridad: ${solicitud.Prioridad}`);
  doc.moveDown();
  doc.text(`Nombre: ${solicitud.Nombre} ${solicitud.Apellido}`);
  doc.text(`Cédula: ${solicitud.Cedula}`);
  doc.text(`Facultad: ${solicitud.Facultad || 'No especificada'}`);
  doc.text(`Programa: ${solicitud.Programa || 'No especificado'}`);
  doc.text(`Tipo: ${solicitud.TipoPrograma || 'No especificado'}`);
  doc.moveDown();

  if (solicitud.NotasTrabajador) {
    doc.fontSize(11).text('Notas del Trabajador Social:', { underline: true });
    doc.fontSize(10).text(solicitud.NotasTrabajador);
    doc.moveDown();
  }

  doc.fontSize(9).text('Universidad Tecnologica de Panama - Bienestar Estudiantil', { align: 'center' });
  doc.end();
}

module.exports = { generatePdf };
