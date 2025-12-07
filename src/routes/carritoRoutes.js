// src/routes/carritoRoutes.js
const express = require('express');
const router = express.Router();

const carritoCtrl = require('../controllers/carritoController');

// Todas las rutas del carrito requieren autenticación
// Middleware que verifica sesión de cliente
const requireCliente = (req, res, next) => {
  if (!req.session || !req.session.cliente || !req.session.cliente.telefono) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }
  next();
};

// Rutas
router.get('/', requireCliente, carritoCtrl.obtenerCarrito);
router.post('/', requireCliente, carritoCtrl.agregarAlCarrito);
router.put('/:articulo_id', requireCliente, carritoCtrl.actualizarCantidad);
router.delete('/:articulo_id', requireCliente, carritoCtrl.eliminarDelCarrito);
router.delete('/', requireCliente, carritoCtrl.vaciarCarrito);
router.get('/count', requireCliente, carritoCtrl.contarItems);

module.exports = router;
