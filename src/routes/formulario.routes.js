const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('../controllers/formulario.controller');
const serverConfig = require('../../config/server');

if (!fs.existsSync(serverConfig.uploadsDir)) {
  fs.mkdirSync(serverConfig.uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, serverConfig.uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, JPG, JPEG, PNG'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: serverConfig.upload.maxFileSize } });

router.get('/config', controller.getConfig);
router.get('/solicitudes', controller.listSolicitudes);
router.get('/count', controller.countSolicitudes);
router.get('/mis-solicitudes/:cedula', controller.misSolicitudes);
router.post('/formulario', upload.single('archivo'), controller.submit);

module.exports = router;
