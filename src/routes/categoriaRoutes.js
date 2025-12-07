// src/routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const categoriaCtrl = require('../controllers/categoriaController');

// Rutas públicas (sin autenticación)
router.get('/public/padre/:slug', categoriaCtrl.obtenerCategoriaPadreConHijas);

// CRUD admin (ya están protegidas por middleware en app.js)
router.get('/', categoriaCtrl.listarCategorias);
router.get('/:id', categoriaCtrl.obtenerCategoria);
router.post('/', categoriaCtrl.crearCategoria);
router.put('/:id', categoriaCtrl.actualizarCategoria);
router.delete('/:id', categoriaCtrl.eliminarCategoria);

module.exports = router;

