// src/routes/articuloRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const articuloCtrl = require('../controllers/articuloController');

// Configuración de multer para guardar imágenes en /public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // .jpg, .png, etc.
    const nombreBase = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const nombreFinal = `${Date.now()}-${nombreBase}${ext}`;
    cb(null, nombreFinal);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// CRUD
// Rutas públicas (GET solamente)
router.get('/public', articuloCtrl.listarArticulos);
router.get('/public/:id', articuloCtrl.obtenerArticulo);

// Rutas protegidas (admin)
router.get('/', articuloCtrl.listarArticulos);
router.get('/:id', articuloCtrl.obtenerArticulo);

// Para crear y actualizar aceptamos multipart/form-data con campo "imagen"
router.post('/', upload.single('imagen'), articuloCtrl.crearArticulo);
router.put('/:id', upload.single('imagen'), articuloCtrl.actualizarArticulo);
router.delete('/:id', articuloCtrl.eliminarArticulo);

module.exports = router;
