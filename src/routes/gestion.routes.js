const express = require('express');
const router = express.Router();
const controller = require('../controllers/gestion.controller');
const { verificarAutenticacion, verificarTrabajadorSocial } = require('../middleware/auth');

router.put('/solicitud/:id/aprobar', verificarAutenticacion, verificarTrabajadorSocial, controller.aprobar);
router.put('/solicitud/:id/rechazar', verificarAutenticacion, verificarTrabajadorSocial, controller.rechazar);
router.put('/solicitud/:id/prioridad', verificarAutenticacion, verificarTrabajadorSocial, controller.cambiarPrioridad);
router.put('/solicitud/:id/notas', verificarAutenticacion, verificarTrabajadorSocial, controller.actualizarNotas);
router.get('/solicitud/:id', verificarAutenticacion, verificarTrabajadorSocial, controller.getSolicitud);
router.get('/estadisticas', verificarAutenticacion, verificarTrabajadorSocial, controller.getEstadisticas);
router.get('/solicitud/:id/pdf', verificarAutenticacion, verificarTrabajadorSocial, controller.getPdf);

module.exports = router;
