// src/controllers/envioController.js
const pool = require('../db/pool');

// POST /api/admin/envios - Crear envío para un pedido
async function crearEnvio(req, res) {
  const { pedido_id, carrier, guia, costo } = req.body;

  if (!pedido_id || !carrier || !guia) {
    return res.status(400).json({ mensaje: 'pedido_id, carrier y guia son requeridos' });
  }

  try {
    // Verificar que el pedido existe y está en estado enviado
    const [pedido] = await pool.query(
      `SELECT id, estado FROM pedido WHERE id = ?`,
      [pedido_id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    // Verificar que no existe ya un envío para este pedido
    const [envioExistente] = await pool.query(
      `SELECT pedido_id FROM envio WHERE pedido_id = ?`,
      [pedido_id]
    );

    if (envioExistente.length > 0) {
      return res.status(400).json({ mensaje: 'Ya existe un envío registrado para este pedido' });
    }

    // Crear envío
    await pool.query(
      `INSERT INTO envio (pedido_id, carrier, guia, costo, estado, creado_en)
       VALUES (?, ?, ?, ?, 'pendiente', NOW())`,
      [pedido_id, carrier, guia, costo || 0]
    );

    res.json({ mensaje: 'Envío creado exitosamente' });
  } catch (err) {
    console.error('Error al crear envío:', err);
    res.status(500).json({ mensaje: 'Error al crear envío' });
  }
}

// GET /api/admin/envios/:pedido_id - Obtener envío de un pedido
async function obtenerEnvio(req, res) {
  const { pedido_id } = req.params;

  try {
    const [envio] = await pool.query(
      `SELECT pedido_id, carrier, guia, costo, estado, creado_en
       FROM envio WHERE pedido_id = ?`,
      [pedido_id]
    );

    if (envio.length === 0) {
      return res.status(404).json({ mensaje: 'No hay envío registrado para este pedido' });
    }

    res.json(envio[0]);
  } catch (err) {
    console.error('Error al obtener envío:', err);
    res.status(500).json({ mensaje: 'Error al obtener envío' });
  }
}

// PATCH /api/admin/envios/:pedido_id - Actualizar envío
async function actualizarEnvio(req, res) {
  const { pedido_id } = req.params;
  const { carrier, guia, estado } = req.body;

  try {
    const campos = [];
    const valores = [];

    if (carrier) {
      campos.push('carrier = ?');
      valores.push(carrier);
    }
    if (guia) {
      campos.push('guia = ?');
      valores.push(guia);
    }
    if (estado && ['pendiente', 'recogido', 'en_transito', 'entregado', 'incidencia'].includes(estado)) {
      campos.push('estado = ?');
      valores.push(estado);

      // Si el envío llega a "entregado", actualizar el pedido también
      if (estado === 'entregado') {
        await pool.query(
          `UPDATE pedido SET estado = 'entregado' WHERE id = ?`,
          [pedido_id]
        );
      }
    }

    if (campos.length === 0) {
      return res.status(400).json({ mensaje: 'No hay campos para actualizar' });
    }

    valores.push(pedido_id);

    const [result] = await pool.query(
      `UPDATE envio SET ${campos.join(', ')} WHERE pedido_id = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Envío no encontrado' });
    }

    res.json({ mensaje: 'Envío actualizado exitosamente' });
  } catch (err) {
    console.error('Error al actualizar envío:', err);
    res.status(500).json({ mensaje: 'Error al actualizar envío' });
  }
}

// GET /api/admin/envios - Listar todos los envíos con info del pedido
async function listarEnvios(req, res) {
  try {
    const [envios] = await pool.query(
      `SELECT e.pedido_id, e.carrier, e.guia, e.costo, e.estado, e.creado_en,
              p.cliente_tel, p.total, p.estado AS pedido_estado, p.creado_en AS pedido_creado
       FROM envio e
       JOIN pedido p ON e.pedido_id = p.id
       ORDER BY e.creado_en DESC`
    );

    res.json(envios);
  } catch (err) {
    console.error('Error al listar envíos:', err);
    res.status(500).json({ mensaje: 'Error al listar envíos' });
  }
}

module.exports = {
  crearEnvio,
  obtenerEnvio,
  actualizarEnvio,
  listarEnvios
};
