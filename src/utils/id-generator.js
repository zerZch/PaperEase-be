function generarIdFormulario() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `FORM_${timestamp}_${random}`.toUpperCase();
}

module.exports = { generarIdFormulario };
