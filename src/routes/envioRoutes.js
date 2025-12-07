// src/routes/envioRoutes.js
const express = require('express');
const router = express.Router();
const envioController = require('../controllers/envioController');
const requireAdmin = require('../middleware/requireAdmin');

// Todas las rutas requieren autenticación de admin
router.post('/admin/envios', requireAdmin, envioController.crearEnvio);
router.get('/admin/envios', requireAdmin, envioController.listarEnvios);
router.get('/admin/envios/:pedido_id', requireAdmin, envioController.obtenerEnvio);
router.patch('/admin/envios/:pedido_id', requireAdmin, envioController.actualizarEnvio);

module.exports = router;
