const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/verificar', controller.verificar);
router.get('/me', controller.me);

module.exports = router;
