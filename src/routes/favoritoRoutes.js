// src/routes/favoritoRoutes.js
const express = require('express');
const router = express.Router();
const favoritoCtrl = require('../controllers/favoritoController');

const requireCliente = (req, res, next) => {
  if (!req.session || !req.session.cliente || !req.session.cliente.telefono) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }
  next();
};

router.get('/', requireCliente, favoritoCtrl.listarFavoritos);
router.post('/:articuloId', requireCliente, favoritoCtrl.agregarFavorito);
router.delete('/:articuloId', requireCliente, favoritoCtrl.eliminarFavorito);

module.exports = router;
