// src/routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const bannerCtrl = require('../controllers/bannerController');

// Configuración de multer para imágenes de banners
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Cuando se monta en /api/admin/banners, estas rutas responden a /api/admin/banners/* 
// Cuando se monta en /api/banners, solo la GET / responde (sin admin)

// Ruta GET / para listar (inteligente: admin recibirá todos, público solo activos)
router.get('/', bannerCtrl.listarBanners);

// Rutas admin (solo disponibles cuando se monta en /api/admin/banners)
router.post('/', upload.single('imagen'), bannerCtrl.crearBanner);
router.put('/:id', upload.single('imagen'), bannerCtrl.actualizarBanner);
router.delete('/:id', bannerCtrl.eliminarBanner);

module.exports = router;
