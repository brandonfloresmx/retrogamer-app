// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

const requireCliente = (req, res, next) => {
	if (!req.session || !req.session.cliente || !req.session.cliente.telefono) {
		return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
	}
	next();
};

// Registro
router.post('/register', authCtrl.register);

// Login
router.post('/login', authCtrl.login);

// Estado de sesión actual
router.get('/me', authCtrl.me);

// Logout
router.post('/logout', authCtrl.logout);

// Actualizar perfil del cliente autenticado
router.put('/perfil', requireCliente, authCtrl.actualizarPerfil);

module.exports = router;
