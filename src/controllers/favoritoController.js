// src/controllers/favoritoController.js
const pool = require('../db/pool');

// GET /api/favoritos
async function listarFavoritos(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  try {
    const [rows] = await pool.query(
      `SELECT f.articulo_id, a.nombre, a.precio, a.imagen_url AS imagen
       FROM favorito f
       JOIN articulo a ON a.id = f.articulo_id
       WHERE f.cliente_tel = ?
       ORDER BY f.created_at DESC`,
      [cliente_tel]
    );
    res.json({ favoritos: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener favoritos' });
  }
}

// POST /api/favoritos/:articuloId
async function agregarFavorito(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { articuloId } = req.params;

  try {
    await pool.query(
      `INSERT IGNORE INTO favorito (cliente_tel, articulo_id) VALUES (?, ?)`
      , [cliente_tel, articuloId]
    );
    res.status(201).json({ mensaje: 'Favorito guardado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al guardar favorito' });
  }
}

// DELETE /api/favoritos/:articuloId
async function eliminarFavorito(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { articuloId } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM favorito WHERE cliente_tel = ? AND articulo_id = ?`,
      [cliente_tel, articuloId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Favorito no encontrado' });
    }

    res.json({ mensaje: 'Favorito eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar favorito' });
  }
}

module.exports = { listarFavoritos, agregarFavorito, eliminarFavorito };
