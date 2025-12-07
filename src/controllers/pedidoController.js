// src/controllers/pedidoController.js
const pool = require('../db/pool');

// POST /api/pedidos - Crear pedido desde el carrito
async function crearPedido(req, res) {
  const cliente_tel = req.session.cliente.telefono;
  const { direccion, direccion_id, metodo_pago, metodo_id } = req.body;

  const connection = await pool.getConnection();

  try {
    let direccionPayload = direccion;
    let metodoPagoFinal = metodo_pago;

    // Resolver dirección guardada si llega id
    if (direccion_id) {
      const [rows] = await connection.query(
        `SELECT alias, calle, colonia, cp, ciudad, estado, referencias
         FROM direccion WHERE id = ? AND cliente_tel = ?`,
        [direccion_id, cliente_tel]
      );
      if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'La dirección seleccionada no existe' });
      }
      direccionPayload = rows[0];
    }

    // Validar datos de dirección
    if (!direccionPayload || !direccionPayload.calle || !direccionPayload.colonia || !direccionPayload.cp || !direccionPayload.ciudad || !direccionPayload.estado) {
      return res.status(400).json({ mensaje: 'Datos de dirección incompletos' });
    }

    // Resolver método de pago guardado si llega id
    if (metodo_id) {
      const [rows] = await connection.query(
        `SELECT tipo FROM metodo_pago WHERE id = ? AND cliente_tel = ?`,
        [metodo_id, cliente_tel]
      );
      if (rows.length === 0) {
        return res.status(404).json({ mensaje: 'El método de pago seleccionado no existe' });
      }
      metodoPagoFinal = rows[0].tipo;
    }

    // Validar método de pago
    if (!metodoPagoFinal || !['tarjeta'].includes(metodoPagoFinal)) {
      return res.status(400).json({ mensaje: 'Método de pago inválido' });
    }

    await connection.beginTransaction();

    // Obtener items del carrito
    const [items] = await connection.query(
      `SELECT cd.articulo_id, cd.cantidad, cd.precio_unit, a.nombre
       FROM carrito_detalle cd
       JOIN articulo a ON cd.articulo_id = a.id
       WHERE cd.cliente_tel = ?`,
      [cliente_tel]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }

    // Calcular total
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.cantidad * item.precio_unit;
    });

    const costoEnvio = subtotal >= 1200 ? 0 : 100;
    const total = subtotal + costoEnvio;

    // Estado según método de pago
    const estadoPedido = metodoPagoFinal === 'tarjeta' ? 'pagado' : 'pendiente';

    // Construir dirección completa como texto
    const direccionCompleta = `${direccionPayload.calle}, ${direccionPayload.colonia}, CP ${direccionPayload.cp}, ${direccionPayload.ciudad}, ${direccionPayload.estado}${direccionPayload.referencias ? ' - ' + direccionPayload.referencias : ''}`;

    // Validar stock suficiente para cada artículo ANTES de crear el pedido
    for (const item of items) {
      const [articulo] = await connection.query(
        `SELECT existencia FROM articulo WHERE id = ?`,
        [item.articulo_id]
      );

      if (articulo.length === 0) {
        await connection.rollback();
        return res.status(404).json({ mensaje: `Artículo con ID ${item.articulo_id} no encontrado` });
      }

      if (articulo[0].existencia < item.cantidad) {
        await connection.rollback();
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para ${item.nombre}. Disponible: ${articulo[0].existencia}, Solicitado: ${item.cantidad}` 
        });
      }
    }

    // Crear pedido con información completa
    const [result] = await connection.query(
      `INSERT INTO pedido (cliente_tel, total, estado, direccion_completa, metodo_pago, costo_envio, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [cliente_tel, total, estadoPedido, direccionCompleta, metodoPagoFinal, costoEnvio]
    );

    const pedido_id = result.insertId;

    // Insertar detalles del pedido
    for (const item of items) {
      await connection.query(
        `INSERT INTO pedido_detalle (pedido_id, articulo_id, nombre_snapshot, precio_unit, cantidad)
         VALUES (?, ?, ?, ?, ?)`,
        [pedido_id, item.articulo_id, item.nombre, item.precio_unit, item.cantidad]
      );

      // Descontar del inventario
      await connection.query(
        `UPDATE articulo SET existencia = existencia - ? WHERE id = ?`,
        [item.cantidad, item.articulo_id]
      );

      // Registrar movimiento de inventario (salida por venta)
      await connection.query(
        `INSERT INTO movimiento_inventario (articulo_id, tipo, cantidad, motivo)
         VALUES (?, 'salida', ?, ?)`,
        [item.articulo_id, item.cantidad, `Pedido #${pedido_id} - Venta`]
      );
    }

    // Vaciar carrito
    await connection.query(
      `DELETE FROM carrito_detalle WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    await connection.query(
      `DELETE FROM carrito WHERE cliente_tel = ?`,
      [cliente_tel]
    );

    await connection.commit();

    res.json({
      mensaje: 'Pedido creado exitosamente',
      pedido_id,
      total
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error creando pedido:', err);
    res.status(500).json({ mensaje: 'Error al crear el pedido' });
  } finally {
    connection.release();
  }
}

// GET /api/pedidos - Obtener pedidos del cliente
async function obtenerPedidos(req, res) {
  const cliente_tel = req.session.cliente.telefono;

  try {
    const [pedidos] = await pool.query(
      `SELECT id, total, estado, creado_en
       FROM pedido
       WHERE cliente_tel = ?
       ORDER BY creado_en DESC`,
      [cliente_tel]
    );

    res.json({ pedidos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener pedidos' });
  }
}

// GET /api/pedidos/:id - Obtener detalle de un pedido
async function obtenerDetallePedido(req, res) {
  const { id } = req.params;
  const cliente_tel = req.session.cliente.telefono;

  try {
    const [pedido] = await pool.query(
      `SELECT id, total, estado, creado_en, direccion_completa, metodo_pago, costo_envio
       FROM pedido
       WHERE id = ? AND cliente_tel = ?`,
      [id, cliente_tel]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    const [items] = await pool.query(
      `SELECT pd.articulo_id, pd.nombre_snapshot AS nombre, pd.precio_unit AS precio, pd.cantidad,
              a.imagen_url AS imagen
       FROM pedido_detalle pd
       LEFT JOIN articulo a ON pd.articulo_id = a.id
       WHERE pd.pedido_id = ?`,
      [id]
    );

    res.json({
      pedido: {
        ...pedido[0],
        items
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener detalle del pedido' });
  }
}

// GET /api/admin/pedidos - Obtener todos los pedidos (admin)
async function obtenerTodosPedidos(req, res) {
  try {
    const [pedidos] = await pool.query(
      `SELECT id, cliente_tel, total, estado, creado_en, direccion_completa, metodo_pago, costo_envio
       FROM pedido
       ORDER BY creado_en DESC`
    );

    res.json({ pedidos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener pedidos' });
  }
}

// GET /api/pedidos/admin/:id - Detalle completo (admin)
async function obtenerDetallePedidoAdmin(req, res) {
  const { id } = req.params;

  try {
    const [pedido] = await pool.query(
      `SELECT id, cliente_tel, total, estado, creado_en, direccion_completa, metodo_pago, costo_envio
       FROM pedido
       WHERE id = ?`,
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    const [items] = await pool.query(
      `SELECT pd.articulo_id, pd.nombre_snapshot AS nombre, pd.precio_unit AS precio, pd.cantidad,
              a.imagen_url AS imagen
       FROM pedido_detalle pd
       LEFT JOIN articulo a ON pd.articulo_id = a.id
       WHERE pd.pedido_id = ?`,
      [id]
    );

    res.json({
      pedido: {
        ...pedido[0],
        items
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener detalle del pedido' });
  }
}

// PATCH /api/pedidos/admin/:id/estado - Actualizar estado (admin)
async function actualizarEstadoPedidoAdmin(req, res) {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: 'Estado inválido' });
  }

  try {
    // Obtener estado actual del pedido
    const [pedidoActual] = await pool.query(
      `SELECT estado FROM pedido WHERE id = ?`,
      [id]
    );

    if (pedidoActual.length === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    const estadoAnterior = pedidoActual[0].estado;

    // Validar que solo se puedan cancelar pedidos en estado pendiente o pagado
    if (estado === 'cancelado' && !['pendiente', 'pagado'].includes(estadoAnterior)) {
      return res.status(400).json({ 
        mensaje: `No se puede cancelar un pedido en estado "${estadoAnterior}". Solo pedidos pendientes o pagados pueden cancelarse.` 
      });
    }

    // Si se está cancelando el pedido, devolver el stock
    if (estado === 'cancelado' && estadoAnterior !== 'cancelado') {
      // Obtener los artículos del pedido
      const [items] = await pool.query(
        `SELECT articulo_id, cantidad FROM pedido_detalle WHERE pedido_id = ?`,
        [id]
      );

      // Devolver stock de cada artículo
      for (const item of items) {
        await pool.query(
          `UPDATE articulo SET existencia = existencia + ? WHERE id = ?`,
          [item.cantidad, item.articulo_id]
        );

        // Registrar movimiento de inventario (entrada por cancelación)
        await pool.query(
          `INSERT INTO movimiento_inventario (articulo_id, tipo, cantidad, motivo)
           VALUES (?, 'entrada', ?, ?)`,
          [item.articulo_id, item.cantidad, `Pedido #${id} - Cancelación`]
        );
      }
    }

    // Si se está marcando como "enviado", crear registro de envío automáticamente
    if (estado === 'enviado' && estadoAnterior !== 'enviado') {
      // Verificar si ya existe un envío (por si acaso)
      const [envioExistente] = await pool.query(
        `SELECT pedido_id FROM envio WHERE pedido_id = ?`,
        [id]
      );

      if (envioExistente.length === 0) {
        // Crear envío con datos iniciales (el admin puede editarlo después)
        await pool.query(
          `INSERT INTO envio (pedido_id, carrier, guia, costo, estado, creado_en)
           VALUES (?, 'Por asignar', 'Pendiente', 0, 'pendiente', NOW())`,
          [id]
        );
      }
    }

    // Actualizar estado del pedido
    const [result] = await pool.query(
      `UPDATE pedido SET estado = ? WHERE id = ?`,
      [estado, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json({ mensaje: 'Estado actualizado correctamente', estado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar el estado' });
  }
}

module.exports = {
  crearPedido,
  obtenerPedidos,
  obtenerDetallePedido,
  obtenerTodosPedidos,
  obtenerDetallePedidoAdmin,
  actualizarEstadoPedidoAdmin
};
