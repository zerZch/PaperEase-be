const express = require('express');
const router = express.Router();
const controller = require('../controllers/estadisticas.controller');
const { verificarAutenticacion } = require('../middleware/auth');

router.get('/dashboard', verificarAutenticacion, controller.dashboard);
router.get('/estadisticas', verificarAutenticacion, controller.dashboard);
router.get('/facultades', verificarAutenticacion, controller.facultades);
router.get('/facultades-lista', verificarAutenticacion, controller.facultadesLista);
router.get('/participacion-genero-anual', verificarAutenticacion, controller.participacionGeneroAnual);
router.get('/programas-participacion', verificarAutenticacion, controller.programasParticipacion);
router.get('/programas', verificarAutenticacion, controller.programasLista);
router.get('/tipos-programa', verificarAutenticacion, controller.tiposPrograma);
router.get('/eventos-timeline', verificarAutenticacion, controller.eventosTimeline);
router.get('/eventos-stats', verificarAutenticacion, controller.eventosStats);
router.get('/programa/:id', verificarAutenticacion, controller.programaDetail);
router.get('/participantes', verificarAutenticacion, controller.participantes);
router.get('/exportar', verificarAutenticacion, controller.exportar);

module.exports = router;
