// src/controllers/direccionController.js
const pool = require('../db/pool');

// GET /api/direcciones
async function listarDirecciones(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  try {
    const [rows] = await pool.query(
      `SELECT id, alias, calle, colonia, cp, ciudad, estado, referencias, es_default
       FROM direccion
       WHERE cliente_tel = ?
       ORDER BY es_default DESC, id DESC`,
      [cliente_tel]
    );
    res.json({ direcciones: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener direcciones' });
  }
}

// POST /api/direcciones
async function crearDireccion(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { alias, calle, colonia, cp, ciudad, estado, referencias, es_default } = req.body;

  if (!calle || !colonia || !cp || !ciudad || !estado) {
    return res.status(400).json({ mensaje: 'Campos requeridos incompletos' });
  }

  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (es_default) {
        await conn.query(`UPDATE direccion SET es_default = 0 WHERE cliente_tel = ?`, [cliente_tel]);
      }

      const [result] = await conn.query(
        `INSERT INTO direccion (cliente_tel, alias, calle, colonia, cp, ciudad, estado, referencias, es_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        , [cliente_tel, alias || 'Mi dirección', calle, colonia, cp, ciudad, estado, referencias || '', es_default ? 1 : 0]
      );

      await conn.commit();
      res.status(201).json({ id: result.insertId, mensaje: 'Dirección guardada' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ mensaje: 'Error al guardar dirección' });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error de conexión' });
  }
}

// PUT /api/direcciones/:id
async function actualizarDireccion(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { id } = req.params;
  const { alias, calle, colonia, cp, ciudad, estado, referencias, es_default } = req.body;

  if (!calle || !colonia || !cp || !ciudad || !estado) {
    return res.status(400).json({ mensaje: 'Campos requeridos incompletos' });
  }

  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (es_default) {
        await conn.query(`UPDATE direccion SET es_default = 0 WHERE cliente_tel = ?`, [cliente_tel]);
      }

      const [result] = await conn.query(
        `UPDATE direccion SET alias = ?, calle = ?, colonia = ?, cp = ?, ciudad = ?, estado = ?, referencias = ?, es_default = ?
         WHERE id = ? AND cliente_tel = ?`,
        [alias || 'Mi dirección', calle, colonia, cp, ciudad, estado, referencias || '', es_default ? 1 : 0, id, cliente_tel]
      );

      await conn.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Dirección no encontrada' });
      }

      res.json({ mensaje: 'Dirección actualizada' });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      res.status(500).json({ mensaje: 'Error al actualizar dirección' });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error de conexión' });
  }
}

// DELETE /api/direcciones/:id
async function eliminarDireccion(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM direccion WHERE id = ? AND cliente_tel = ?`,
      [id, cliente_tel]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Dirección no encontrada' });
    }

    res.json({ mensaje: 'Dirección eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar dirección' });
  }
}

module.exports = { listarDirecciones, crearDireccion, actualizarDireccion, eliminarDireccion };
