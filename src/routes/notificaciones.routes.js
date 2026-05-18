const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificaciones.controller');
const { verificarAutenticacion } = require('../middleware/auth');

router.get('/:cedula', verificarAutenticacion, controller.getByCedula);
router.get('/:cedula/conteo', verificarAutenticacion, controller.getCount);
router.put('/:id/leer', verificarAutenticacion, controller.markRead);
router.put('/estudiante/:cedula/leer-todas', verificarAutenticacion, controller.markAllRead);
router.delete('/:id', verificarAutenticacion, controller.delete);
router.delete('/estudiante/:cedula/eliminar-todas', verificarAutenticacion, controller.deleteAll);

module.exports = router;
