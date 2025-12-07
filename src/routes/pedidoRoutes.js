// src/routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();

const pedidoCtrl = require('../controllers/pedidoController');
const requireAdmin = require('../middleware/requireAdmin');

// Middleware de autenticación
const requireCliente = (req, res, next) => {
  if (!req.session || !req.session.cliente || !req.session.cliente.telefono) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }
  next();
};

// Rutas cliente
router.post('/', requireCliente, pedidoCtrl.crearPedido);
router.get('/', requireCliente, pedidoCtrl.obtenerPedidos);
router.get('/:id', requireCliente, pedidoCtrl.obtenerDetallePedido);

// Rutas admin
router.get('/admin/todos', requireAdmin, pedidoCtrl.obtenerTodosPedidos);
router.get('/admin/:id', requireAdmin, pedidoCtrl.obtenerDetallePedidoAdmin);
router.patch('/admin/:id/estado', requireAdmin, pedidoCtrl.actualizarEstadoPedidoAdmin);

module.exports = router;
