// src/controllers/authController.js
const crypto = require('crypto');
const pool = require('../db/pool');

// Helpers
const regexTelefono = /^[0-9]{10}$/;
const regexCorreo  = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function hashMD5(passwordPlano) {
  return crypto.createHash('md5').update(passwordPlano).digest('hex');
}

// ---------- POST /api/auth/register ----------
async function register(req, res) {
  const { nombre, telefono, correo, password } = req.body || {};

  const errores = [];

  if (!telefono || !regexTelefono.test(telefono)) {
    errores.push('El teléfono debe tener exactamente 10 dígitos.');
  }
  if (!nombre || !nombre.trim() || nombre.length > 150) {
    errores.push('El nombre es obligatorio y debe tener máximo 150 caracteres.');
  }
  if (!correo || !regexCorreo.test(correo) || correo.length > 120) {
    errores.push('El correo no es válido.');
  }
  if (!password || password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const passwordHash = hashMD5(password);

  try {
    await pool.query(
      `INSERT INTO cliente (telefono, nombre, correo, password)
       VALUES (?, ?, ?, ?)`,
      [telefono, nombre.trim(), correo.trim(), passwordHash]
    );

    // Opcional: iniciar sesión automáticamente al registrarse
    req.session.cliente = { telefono, nombre: nombre.trim(), correo: correo.trim() };

    return res.status(201).json({
      mensaje: 'Cuenta creada correctamente.',
      cliente: req.session.cliente
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'El teléfono o correo ya están registrados.' });
    }
    return res.status(500).json({ mensaje: 'Error al crear cuenta.' });
  }
}

// ---------- POST /api/auth/login ----------
async function login(req, res) {
  const { telefono, password } = req.body || {};

  if (!telefono || !password) {
    return res
      .status(400)
      .json({ mensaje: 'Debes enviar teléfono y contraseña.' });
  }

  const passwordHash = hashMD5(password);

  try {
    const [rows] = await pool.query(
      `SELECT telefono, nombre, correo
       FROM cliente
       WHERE telefono = ? AND password = ?`,
      [telefono, passwordHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: 'Teléfono o contraseña incorrectos.' });
    }

    const cliente = rows[0];

    // Guardar datos básicos en la sesión
    req.session.cliente = {
      telefono: cliente.telefono,
      nombre: cliente.nombre,
      correo: cliente.correo
    };

    return res.json({
      mensaje: 'Login correcto.',
      cliente: req.session.cliente
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
  }
}

// ---------- GET /api/auth/me ----------
function me(req, res) {
  if (!req.session || !req.session.cliente) {
    return res.status(401).json({ autenticado: false });
  }

  return res.json({
    autenticado: true,
    cliente: req.session.cliente
  });
}

// ---------- PUT /api/auth/perfil ----------
async function actualizarPerfil(req, res) {
  if (!req.session || !req.session.cliente) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }

  const { nombre, correo } = req.body || {};
  const telefono = req.session.cliente.telefono;
  const errores = [];

  if (!nombre || !nombre.trim() || nombre.length > 150) {
    errores.push('El nombre es obligatorio y debe tener máximo 150 caracteres.');
  }

  if (!correo || !regexCorreo.test(correo) || correo.length > 120) {
    errores.push('El correo no es válido.');
  }

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  try {
    const [resultado] = await pool.query(
      `UPDATE cliente SET nombre = ?, correo = ? WHERE telefono = ?`,
      [nombre.trim(), correo.trim(), telefono]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    req.session.cliente = { telefono, nombre: nombre.trim(), correo: correo.trim() };

    res.json({ mensaje: 'Perfil actualizado correctamente', cliente: req.session.cliente });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'El correo ya está en uso.' });
    }
    res.status(500).json({ mensaje: 'Error al actualizar el perfil' });
  }
}

// ---------- POST /api/auth/logout ----------
function logout(req, res) {
  if (!req.session) {
    return res.json({ mensaje: 'Sesión cerrada.' });
  }
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error al cerrar sesión.' });
    }
    res.json({ mensaje: 'Sesión cerrada correctamente.' });
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
  actualizarPerfil
};
