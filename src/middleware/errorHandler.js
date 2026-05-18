const multer = require('multer');

function errorHandler() {
  return (error, req, res, next) => {
    console.error('Error capturado:', error);

    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'JSON inválido en la solicitud' });
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Archivo demasiado grande. Máximo 5MB.' });
      }
    }

    if (error.message === 'Tipo de archivo no permitido. Solo PDF, JPG, JPEG, PNG') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  };
}

module.exports = { errorHandler };
