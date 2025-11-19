// src/controllers/clienteController.js
const crypto = require('crypto');
const pool = require('../db/pool');

// helpers de validación
const regexTelefono = /^[0-9]{10}$/;
const regexCorreo  = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function validarCliente(datos, {esCreacion = true} = {}) {
  const errores = [];

  const { telefono, nombre, correo, password } = datos;

  if (!telefono || !regexTelefono.test(telefono)) {
    errores.push('El teléfono debe tener exactamente 10 dígitos.');
  }

  if (!nombre || nombre.trim().length === 0 || nombre.length > 150) {
    errores.push('El nombre es obligatorio y debe tener máximo 150 caracteres.');
  }

  if (!correo || !regexCorreo.test(correo) || correo.length > 120) {
    errores.push('El correo no es válido.');
  }

  if (esCreacion) {
    if (!password || password.length < 8) {
      errores.push('La contraseña debe tener al menos 8 caracteres.');
    }
  }

  return errores;
}

function hashMD5(passwordPlano) {
  return crypto.createHash('md5').update(passwordPlano).digest('hex');
}

// GET /api/clientes
async function listarClientes(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT telefono, nombre, correo, creado_en FROM cliente ORDER BY creado_en DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
}

// GET /api/clientes/:telefono
async function obtenerCliente(req, res) {
  const { telefono } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT telefono, nombre, correo, creado_en FROM cliente WHERE telefono = ?',
      [telefono]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener cliente' });
  }
}

// POST /api/clientes
async function crearCliente(req, res) {
  const errores = validarCliente(req.body, { esCreacion: true });
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const { telefono, nombre, correo, password } = req.body;
  const passwordHash = hashMD5(password);

  try {
    await pool.query(
      `INSERT INTO cliente (telefono, nombre, correo, password)
       VALUES (?, ?, ?, ?)`,
      [telefono, nombre, correo, passwordHash]
    );
    res.status(201).json({ mensaje: 'Cliente creado correctamente' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ mensaje: 'El teléfono o correo ya están registrados' });
    }
    res.status(500).json({ mensaje: 'Error al crear cliente' });
  }
}

// PUT /api/clientes/:telefono
async function actualizarCliente(req, res) {
  const telefonoUrl = req.params.telefono;
  const { nombre, correo, password } = req.body;

  const errores = validarCliente(
    { telefono: telefonoUrl, nombre, correo, password },
    { esCreacion: false }
  );
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const campos = ['nombre = ?', 'correo = ?'];
  const valores = [nombre, correo];

  if (password && password.length > 0) {
    if (password.length < 8) {
      return res
        .status(400)
        .json({ errores: ['La nueva contraseña debe tener al menos 8 caracteres.'] });
    }
    campos.push('password = ?');
    valores.push(hashMD5(password));
  }

  valores.push(telefonoUrl);

  try {
    const [resultado] = await pool.query(
      `UPDATE cliente SET ${campos.join(', ')} WHERE telefono = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ mensaje: 'El correo ya está registrado por otro cliente' });
    }
    res.status(500).json({ mensaje: 'Error al actualizar cliente' });
  }
}

// DELETE /api/clientes/:telefono
async function eliminarCliente(req, res) {
  const { telefono } = req.params;
  try {
    const [resultado] = await pool.query(
      'DELETE FROM cliente WHERE telefono = ?',
      [telefono]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar cliente' });
  }
}

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};
