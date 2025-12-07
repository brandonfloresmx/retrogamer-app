// src/controllers/metodoPagoController.js
const pool = require('../db/pool');

// GET /api/metodos-pago
async function listarMetodos(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  try {
    const [rows] = await pool.query(
      `SELECT id, alias, tipo, titular, ultimo4, expiracion, es_default
       FROM metodo_pago
       WHERE cliente_tel = ?
       ORDER BY es_default DESC, id DESC`,
      [cliente_tel]
    );
    res.json({ metodos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener métodos de pago' });
  }
}

// POST /api/metodos-pago
async function crearMetodo(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { alias, tipo, titular, numero, expiracion, es_default } = req.body;

  if (!tipo || !titular) {
    return res.status(400).json({ mensaje: 'Campos requeridos incompletos' });
  }

  const ultimo4 = numero ? String(numero).slice(-4) : null;

  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (es_default) {
        await conn.query(`UPDATE metodo_pago SET es_default = 0 WHERE cliente_tel = ?`, [cliente_tel]);
      }

      const [result] = await conn.query(
        `INSERT INTO metodo_pago (cliente_tel, alias, tipo, titular, ultimo4, expiracion, es_default)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
        , [cliente_tel, alias || 'Mi pago', tipo, titular, ultimo4, expiracion || null, es_default ? 1 : 0]
      );

      await conn.commit();
      res.status(201).json({ id: result.insertId, mensaje: 'Método de pago guardado' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ mensaje: 'Error al guardar método de pago' });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error de conexión' });
  }
}

// PUT /api/metodos-pago/:id
async function actualizarMetodo(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { id } = req.params;
  const { alias, tipo, titular, numero, expiracion, es_default } = req.body;

  if (!tipo || !titular) {
    return res.status(400).json({ mensaje: 'Campos requeridos incompletos' });
  }

  const ultimo4 = numero ? String(numero).slice(-4) : null;

  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (es_default) {
        await conn.query(`UPDATE metodo_pago SET es_default = 0 WHERE cliente_tel = ?`, [cliente_tel]);
      }

      const [result] = await conn.query(
        `UPDATE metodo_pago
         SET alias = ?, tipo = ?, titular = ?, ultimo4 = ?, expiracion = ?, es_default = ?
         WHERE id = ? AND cliente_tel = ?`,
        [alias || 'Mi pago', tipo, titular, ultimo4, expiracion || null, es_default ? 1 : 0, id, cliente_tel]
      );

      await conn.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
      }

      res.json({ mensaje: 'Método de pago actualizado' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ mensaje: 'Error al actualizar método de pago' });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error de conexión' });
  }
}

// DELETE /api/metodos-pago/:id
async function eliminarMetodo(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM metodo_pago WHERE id = ? AND cliente_tel = ?`,
      [id, cliente_tel]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
    }

    res.json({ mensaje: 'Método de pago eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar método de pago' });
  }
}

module.exports = { listarMetodos, crearMetodo, actualizarMetodo, eliminarMetodo };
