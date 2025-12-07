// src/controllers/carritoController.js
const pool = require('../db/pool');

// GET /api/carrito - Obtener carrito del cliente
async function obtenerCarrito(req, res) {
  const cliente_tel = req.session.cliente.telefono;

  try {
    const [carrito] = await pool.query(
      `SELECT cliente_tel, fecha, total, estado
       FROM carrito
       WHERE cliente_tel = ? AND estado = 'abierto'`,
      [cliente_tel]
    );

    if (carrito.length === 0) {
      return res.json({ items: [], total: 0 });
    }

    const [items] = await pool.query(
      `SELECT 
         cd.articulo_id,
         cd.cantidad,
         cd.precio_unit,
         a.nombre,
         a.imagen_url
       FROM carrito_detalle cd
       JOIN articulo a ON cd.articulo_id = a.id
       WHERE cd.cliente_tel = ?`,
      [cliente_tel]
    );

    const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unit), 0);

    res.json({ items, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener carrito' });
  }
}

// POST /api/carrito - Agregar producto al carrito
async function agregarAlCarrito(req, res) {
  const { articulo_id, cantidad } = req.body;
  const cliente_tel = req.session.cliente.telefono;

  if (!articulo_id || !cantidad || cantidad <= 0) {
    return res.status(400).json({ mensaje: 'Datos inválidos' });
  }

  try {
    // Obtener datos del producto
    const [producto] = await pool.query(
      `SELECT id, precio, existencia FROM articulo WHERE id = ?`,
      [articulo_id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const prod = producto[0];
    if (prod.existencia < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    // Crear carrito si no existe
    await pool.query(
      `INSERT IGNORE INTO carrito (cliente_tel, fecha, total, estado)
       VALUES (?, NOW(), 0, 'abierto')`,
      [cliente_tel]
    );

    // Insertar o actualizar item en carrito_detalle
    await pool.query(
      `INSERT INTO carrito_detalle (cliente_tel, articulo_id, cantidad, precio_unit)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         cantidad = cantidad + ?,
         precio_unit = ?`,
      [cliente_tel, articulo_id, cantidad, prod.precio, cantidad, prod.precio]
    );

    // Recalcular total
    const [totales] = await pool.query(
      `SELECT SUM(cantidad * precio_unit) as total FROM carrito_detalle WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    await pool.query(
      `UPDATE carrito SET total = ? WHERE cliente_tel = ?`,
      [totales[0].total || 0, cliente_tel]
    );

    res.json({ mensaje: 'Producto agregado al carrito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al agregar al carrito' });
  }
}

// PUT /api/carrito/:articulo_id - Actualizar cantidad
async function actualizarCantidad(req, res) {
  const { articulo_id } = req.params;
  const { cantidad } = req.body;
  const cliente_tel = req.session.cliente.telefono;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ mensaje: 'Cantidad inválida' });
  }

  try {
    const [producto] = await pool.query(
      `SELECT existencia FROM articulo WHERE id = ?`,
      [articulo_id]
    );

    if (producto.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    if (producto[0].existencia < cantidad) {
      return res.status(400).json({ mensaje: 'Stock insuficiente' });
    }

    await pool.query(
      `UPDATE carrito_detalle SET cantidad = ? WHERE cliente_tel = ? AND articulo_id = ?`,
      [cantidad, cliente_tel, articulo_id]
    );

    // Recalcular total
    const [totales] = await pool.query(
      `SELECT SUM(cantidad * precio_unit) as total FROM carrito_detalle WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    await pool.query(
      `UPDATE carrito SET total = ? WHERE cliente_tel = ?`,
      [totales[0].total || 0, cliente_tel]
    );

    res.json({ mensaje: 'Cantidad actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar cantidad' });
  }
}

// DELETE /api/carrito/:articulo_id - Eliminar del carrito
async function eliminarDelCarrito(req, res) {
  const { articulo_id } = req.params;
  const cliente_tel = req.session.cliente.telefono;

  try {
    await pool.query(
      `DELETE FROM carrito_detalle WHERE cliente_tel = ? AND articulo_id = ?`,
      [cliente_tel, articulo_id]
    );

    // Recalcular total
    const [totales] = await pool.query(
      `SELECT SUM(cantidad * precio_unit) as total FROM carrito_detalle WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    await pool.query(
      `UPDATE carrito SET total = ? WHERE cliente_tel = ?`,
      [totales[0].total || 0, cliente_tel]
    );

    res.json({ mensaje: 'Producto eliminado del carrito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar del carrito' });
  }
}

// DELETE /api/carrito - Vaciar carrito
async function vaciarCarrito(req, res) {
  const cliente_tel = req.session.cliente.telefono;

  try {
    await pool.query(
      `DELETE FROM carrito_detalle WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    await pool.query(
      `UPDATE carrito SET total = 0 WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    res.json({ mensaje: 'Carrito vaciado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al vaciar carrito' });
  }
}

// GET /api/carrito/count - Contar items
async function contarItems(req, res) {
  const cliente_tel = req.session.cliente.telefono;

  try {
    const [result] = await pool.query(
      `SELECT SUM(cantidad) as count FROM carrito_detalle WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    res.json({ count: result[0].count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al contar items' });
  }
}

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  contarItems
};
