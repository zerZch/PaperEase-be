const express = require('express');
const router = express.Router();
const controller = require('../controllers/novedades.controller');

router.get('/', controller.list);

module.exports = router;
