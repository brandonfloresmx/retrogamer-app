// src/controllers/articuloController.js
const pool = require('../db/pool');

// Genera un código tipo ART-00001, ART-00002, ...
async function generarCodigoArticulo() {
  const [rows] = await pool.query('SELECT MAX(id) AS maxId FROM articulo');
  const nextId = (rows[0].maxId || 0) + 1;
  return 'ART-' + String(nextId).padStart(5, '0');
}

// Validaciones (ya NO se valida codigo)
function validarArticulo(datos) {
  const errores = [];
  const { nombre, precio, existencia, categoria_id } = datos;

  if (!nombre || !nombre.trim()) {
    errores.push('El nombre es obligatorio.');
  }

  const numPrecio = Number(precio);
  if (isNaN(numPrecio) || numPrecio < 0) {
    errores.push('El precio debe ser un número mayor o igual a 0.');
  }

  const numExistencia = parseInt(existencia, 10);
  if (isNaN(numExistencia) || numExistencia < 0) {
    errores.push('La existencia debe ser un entero mayor o igual a 0.');
  }

  const catId = parseInt(categoria_id, 10);
  if (isNaN(catId) || catId <= 0) {
    errores.push('La categoría no es válida.');
  }

  return errores;
}

// GET /api/articulos
async function listarArticulos(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, codigo, nombre, descripcion, precio,
              existencia, categoria_id, imagen_url, creado_en, actualizado_en
       FROM articulo
       ORDER BY creado_en DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener artículos' });
  }
}

// GET /api/articulos/:id
async function obtenerArticulo(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id, codigo, nombre, descripcion, precio,
              existencia, categoria_id, imagen_url, creado_en, actualizado_en
       FROM articulo
       WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Artículo no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener artículo' });
  }
}

// POST /api/articulos  (creación, código autogenerado)
async function crearArticulo(req, res) {
  const { nombre, descripcion, precio, existencia, categoria_id } = req.body;

  const errores = validarArticulo(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const codigo = await generarCodigoArticulo();

    await pool.query(
      `INSERT INTO articulo
       (codigo, nombre, descripcion, precio, existencia, categoria_id, imagen_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        nombre.trim(),
        descripcion || null,
        Number(precio),
        parseInt(existencia, 10),
        parseInt(categoria_id, 10),
        imagen_url
      ]
    );
    res.status(201).json({ mensaje: 'Artículo creado correctamente', codigo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear artículo' });
  }
}

// PUT /api/articulos/:id  (actualizar, SIN tocar codigo)
async function actualizarArticulo(req, res) {
  const { id } = req.params;
  const { nombre, descripcion, precio, existencia, categoria_id } = req.body;

  const errores = validarArticulo(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  const campos = [
    'nombre = ?',
    'descripcion = ?',
    'precio = ?',
    'existencia = ?',
    'categoria_id = ?'
  ];
  const valores = [
    nombre.trim(),
    descripcion || null,
    Number(precio),
    parseInt(existencia, 10),
    parseInt(categoria_id, 10)
  ];

  if (req.file) {
    campos.push('imagen_url = ?');
    valores.push(`/uploads/${req.file.filename}`);
  }

  valores.push(id);

  try {
    const [resultado] = await pool.query(
      `UPDATE articulo SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Artículo no encontrado' });
    }
    res.json({ mensaje: 'Artículo actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar artículo' });
  }
}

// DELETE /api/articulos/:id
async function eliminarArticulo(req, res) {
  const { id } = req.params;
  try {
    const [resultado] = await pool.query(
      'DELETE FROM articulo WHERE id = ?',
      [id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Artículo no encontrado' });
    }
    res.json({ mensaje: 'Artículo eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar artículo' });
  }
}

module.exports = {
  listarArticulos,
  obtenerArticulo,
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo
};

