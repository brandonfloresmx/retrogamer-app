// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

// Registro
router.post('/register', authCtrl.register);

// Login
router.post('/login', authCtrl.login);

// Estado de sesión actual
router.get('/me', authCtrl.me);

// Logout
router.post('/logout', authCtrl.logout);

module.exports = router;
