// src/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteCtrl = require('../controllers/clienteController');

// API tipo módulo para panel de admin
router.get('/', clienteCtrl.listarClientes);
router.get('/:telefono', clienteCtrl.obtenerCliente);
router.post('/', clienteCtrl.crearCliente);
router.put('/:telefono', clienteCtrl.actualizarCliente);
router.delete('/:telefono', clienteCtrl.eliminarCliente);

module.exports = router;
