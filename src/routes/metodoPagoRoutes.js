// src/routes/metodoPagoRoutes.js
const express = require('express');
const router = express.Router();
const metodoCtrl = require('../controllers/metodoPagoController');

const requireCliente = (req, res, next) => {
  if (!req.session || !req.session.cliente || !req.session.cliente.telefono) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }
  next();
};

router.get('/', requireCliente, metodoCtrl.listarMetodos);
router.post('/', requireCliente, metodoCtrl.crearMetodo);
router.put('/:id', requireCliente, metodoCtrl.actualizarMetodo);
router.delete('/:id', requireCliente, metodoCtrl.eliminarMetodo);

module.exports = router;
