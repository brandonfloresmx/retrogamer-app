// src/controllers/bannerController.js
const pool = require('../db/pool');

// GET /api/banners (público - solo activos)
async function listarBannersActivos(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, titulo, imagen_url, link, orden
       FROM banner
       WHERE activo = 1
       ORDER BY orden ASC, creado_en DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener banners' });
  }
}

// GET /api/admin/banners (todos) o /api/banners (solo activos, según la ruta)
async function listarBanners(req, res) {
  try {
    // Si hay sesión de admin, devolver todos los banners
    // Si no, devolver solo los activos
    const esAdmin = !!(req.session?.adminId);
    
    let query;
    if (esAdmin) {
      query = `SELECT id, titulo, imagen_url, link, orden, activo, creado_en
               FROM banner
               ORDER BY orden ASC, creado_en DESC`;
    } else {
      query = `SELECT id, titulo, imagen_url, link, orden
               FROM banner
               WHERE activo = 1
               ORDER BY orden ASC, creado_en DESC`;
    }

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('[Banner Error]', err);
    res.status(500).json({ mensaje: 'Error al obtener banners' });
  }
}

// POST /api/admin/banners
async function crearBanner(req, res) {
  const { titulo, link, orden, activo } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ mensaje: 'La imagen es obligatoria' });
  }

  const imagen_url = `/uploads/${req.file.filename}`;

  try {
    await pool.query(
      `INSERT INTO banner (titulo, imagen_url, link, orden, activo)
       VALUES (?, ?, ?, ?, ?)`,
      [
        titulo || null,
        imagen_url,
        link || null,
        parseInt(orden || 0, 10),
        activo === '1' || activo === 'true' ? 1 : 0
      ]
    );
    res.status(201).json({ mensaje: 'Banner creado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear banner' });
  }
}

// PUT /api/admin/banners/:id
async function actualizarBanner(req, res) {
  const { id } = req.params;
  const { titulo, link, orden, activo } = req.body;

  // Obtener el banner actual para verificar que existe
  try {
    const [bannerActual] = await pool.query('SELECT * FROM banner WHERE id = ?', [id]);
    if (bannerActual.length === 0) {
      return res.status(404).json({ mensaje: 'Banner no encontrado' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error al verificar banner' });
  }

  const campos = [];
  const valores = [];

  // Solo actualizar campos que fueron enviados y no estén vacíos (excepto link que puede estar vacío)
  if (titulo !== undefined && titulo !== null && String(titulo).trim() !== '') {
    campos.push('titulo = ?');
    valores.push(String(titulo).trim());
  }

  if (link !== undefined && link !== null) {
    campos.push('link = ?');
    valores.push(String(link).trim());
  }

  if (orden !== undefined && orden !== null) {
    campos.push('orden = ?');
    valores.push(parseInt(orden || 0, 10));
  }

  if (activo !== undefined && activo !== null) {
    campos.push('activo = ?');
    valores.push(activo === '1' || activo === 'true' || activo === 1 ? 1 : 0);
  }

  if (req.file) {
    campos.push('imagen_url = ?');
    valores.push(`/uploads/${req.file.filename}`);
  }

  if (campos.length === 0) {
    return res.status(400).json({ mensaje: 'No hay cambios para actualizar' });
  }

  valores.push(id);

  try {
    const [resultado] = await pool.query(
      `UPDATE banner SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Banner no encontrado' });
    }
    res.json({ mensaje: 'Banner actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar banner' });
  }
}

// DELETE /api/admin/banners/:id
async function eliminarBanner(req, res) {
  const { id } = req.params;
  try {
    const [resultado] = await pool.query(
      'DELETE FROM banner WHERE id = ?',
      [id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Banner no encontrado' });
    }
    res.json({ mensaje: 'Banner eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al eliminar banner' });
  }
}

module.exports = {
  listarBannersActivos,
  listarBanners,
  crearBanner,
  actualizarBanner,
  eliminarBanner
};
