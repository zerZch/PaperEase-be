const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/eventos.controller');
const { verificarAutenticacion, verificarTrabajadorSocial, verificarEstudiante } = require('../middleware/auth');
const serverConfig = require('../../config/server');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, serverConfig.uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evento-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: serverConfig.upload.maxFileSize }
});

router.get('/', verificarAutenticacion, controller.list);
router.get('/mis-inscripciones/:cedula', verificarAutenticacion, controller.getInscripciones);
router.get('/:id/inscrito', verificarAutenticacion, verificarEstudiante, controller.checkInscrito);
router.get('/:id', verificarAutenticacion, controller.getById);

router.post('/', verificarAutenticacion, verificarTrabajadorSocial, upload.single('imagen'), controller.create);
router.post('/:id/aplicar', verificarAutenticacion, verificarEstudiante, controller.apply);

router.put('/:id', verificarAutenticacion, verificarTrabajadorSocial, upload.single('imagen'), controller.update);

router.delete('/:id', verificarAutenticacion, verificarTrabajadorSocial, controller.remove);

module.exports = router;
