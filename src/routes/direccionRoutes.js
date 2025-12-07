// src/routes/direccionRoutes.js
const express = require('express');
const router = express.Router();
const direccionCtrl = require('../controllers/direccionController');

const requireCliente = (req, res, next) => {
  if (!req.session || !req.session.cliente || !req.session.cliente.telefono) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }
  next();
};

router.get('/', requireCliente, direccionCtrl.listarDirecciones);
router.post('/', requireCliente, direccionCtrl.crearDireccion);
router.put('/:id', requireCliente, direccionCtrl.actualizarDireccion);
router.delete('/:id', requireCliente, direccionCtrl.eliminarDireccion);

module.exports = router;
