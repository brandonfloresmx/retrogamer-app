// src/routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const categoriaCtrl = require('../controllers/categoriaController');

// CRUD
router.get('/', categoriaCtrl.listarCategorias);
router.get('/:id', categoriaCtrl.obtenerCategoria);
router.post('/', categoriaCtrl.crearCategoria);
router.put('/:id', categoriaCtrl.actualizarCategoria);
router.delete('/:id', categoriaCtrl.eliminarCategoria);

module.exports = router;
