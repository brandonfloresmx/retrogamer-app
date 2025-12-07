// src/controllers/categoriaController.js
const pool = require('../db/pool');

function logErrorCategoria(err) {
  console.error('ERROR en categoriaController:', err.code, err.message);
}

function generarSlug(nombre) {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validarCategoria(datos) {
  const errores = [];
  const { nombre, parent_id } = datos;

  if (!nombre || !nombre.trim()) {
    errores.push('El nombre es obligatorio.');
  }

  if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
    const pid = parseInt(parent_id, 10);
    if (isNaN(pid) || pid <= 0) {
      errores.push('El ID de categoría padre no es válido.');
    }
  }
  return errores;
}

async function listarCategorias(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id,
              c.nombre,
              c.slug,
              c.parent_id,
              COUNT(a.id) AS total_productos
       FROM categoria c
       LEFT JOIN articulo a ON a.categoria_id = c.id
       GROUP BY c.id
       ORDER BY c.nombre`
    );
    res.json(rows);
  } catch (err) {
    logErrorCategoria(err);
    res.status(500).json({
      mensaje: 'Error al obtener categorías',
      error: err.message
    });
  }
}

async function obtenerCategoria(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, slug, parent_id FROM categoria WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    logErrorCategoria(err);
    res.status(500).json({ mensaje: 'Error al obtener categoría' });
  }
}

async function crearCategoria(req, res) {
  let { nombre, parent_id } = req.body;

  const errores = validarCategoria(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  nombre = nombre.trim();
  const slug = generarSlug(nombre);

  let parentValue = null;
  if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
    parentValue = parseInt(parent_id, 10);
  }

  try {
    await pool.query(
      'INSERT INTO categoria (nombre, slug, parent_id) VALUES (?, ?, ?)',
      [nombre, slug, parentValue]
    );
    res.status(201).json({ mensaje: 'Categoría creada correctamente' });
  } catch (err) {
    logErrorCategoria(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ mensaje: 'El slug ya está en uso. Usa uno diferente.' });
    }
    res.status(500).json({ mensaje: 'Error al crear categoría' });
  }
}

async function actualizarCategoria(req, res) {
  const { id } = req.params;
  let { nombre, parent_id } = req.body;

  const errores = validarCategoria(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  nombre = nombre.trim();
  const slug = generarSlug(nombre);

  let parentValue = null;
  if (parent_id !== undefined && parent_id !== null && parent_id !== '') {
    parentValue = parseInt(parent_id, 10);
  }

  try {
    const [resultado] = await pool.query(
      'UPDATE categoria SET nombre = ?, slug = ?, parent_id = ? WHERE id = ?',
      [nombre, slug, parentValue, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría actualizada correctamente' });
  } catch (err) {
    logErrorCategoria(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ mensaje: 'El slug ya está en uso. Usa uno diferente.' });
    }
    res.status(500).json({ mensaje: 'Error al actualizar categoría' });
  }
}

async function eliminarCategoria(req, res) {
  const { id } = req.params;
  try {
    const [resultado] = await pool.query(
      'DELETE FROM categoria WHERE id = ?',
      [id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (err) {
    logErrorCategoria(err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        mensaje: 'No se puede eliminar la categoría porque tiene productos asociados.'
      });
    }
    res.status(500).json({ mensaje: 'Error al eliminar categoría' });
  }
}

// GET /api/public/categorias/padre/:slug - Obtener categoría padre con sus hijas
async function obtenerCategoriaPadreConHijas(req, res) {
  const { slug } = req.params;
  console.log('Buscando categoría padre con slug:', slug);
  try {
    // Obtener categoría padre
    const [padreRows] = await pool.query(
      `SELECT id, nombre, slug FROM categoria 
       WHERE slug = ? AND parent_id IS NULL`,
      [slug]
    );
    
    console.log('Categoría padre encontrada:', padreRows);
    
    if (padreRows.length === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    
    const padre = padreRows[0];
    
    // Obtener categorías hijas
    const [hijasRows] = await pool.query(
      `SELECT id, nombre, slug FROM categoria 
       WHERE parent_id = ?
       ORDER BY nombre`,
      [padre.id]
    );
    
    // Para cada hija, obtener sus productos
    const hijasConProductos = await Promise.all(
      hijasRows.map(async (hija) => {
        const [productos] = await pool.query(
          `SELECT id, codigo, nombre, imagen_url, precio, existencia 
           FROM articulo 
           WHERE categoria_id = ? 
           ORDER BY nombre`,
          [hija.id]
        );
        return {
          ...hija,
          productos
        };
      })
    );
    
    // Si no hay hijas, obtener productos directamente de la categoría padre
    let productosDirectos = [];
    if (hijasRows.length === 0) {
      const [prodDirectos] = await pool.query(
        `SELECT id, codigo, nombre, imagen_url, precio, existencia 
         FROM articulo 
         WHERE categoria_id = ? 
         ORDER BY nombre`,
        [padre.id]
      );
      productosDirectos = prodDirectos;
    }
    
    res.json({
      categoria: padre,
      subcategorias: hijasConProductos,
      productosDirectos
    });
  } catch (err) {
    logErrorCategoria(err);
    res.status(500).json({ mensaje: 'Error al obtener categoría' });
  }
}

module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerCategoriaPadreConHijas
};

