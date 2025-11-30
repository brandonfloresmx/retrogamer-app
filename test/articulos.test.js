// tests/articulos.test.js
const request = require('supertest');
const app = require('../app');
const pool = require('../src/db/pool');

let agent;
let categoriaTestId;
let articuloTestId;

beforeAll(async () => {
  agent = request.agent(app);

  // 1) Login como admin
  const loginRes = await agent
    .post('/admin/login')
    .send('usuario=admin&password=retrogamer');

  expect(loginRes.status).toBe(302);
  expect(loginRes.headers.location).toBe('/admin');

  // 2) Crear categoría de prueba
  const nombreCat = 'Categoria Test Jest';
  const slugCat = 'categoria-test-jest';

  await pool.query('DELETE FROM categoria WHERE slug = ?', [slugCat]);

  const [catResult] = await pool.query(
    'INSERT INTO categoria (nombre, slug, parent_id) VALUES (?, ?, NULL)',
    [nombreCat, slugCat]
  );
  categoriaTestId = catResult.insertId;
});

afterAll(async () => {
  // Limpiar artículo y categoría de prueba
  if (articuloTestId) {
    await pool.query('DELETE FROM articulo WHERE id = ?', [articuloTestId]);
  }

  if (categoriaTestId) {
    await pool.query('DELETE FROM articulo WHERE categoria_id = ?', [categoriaTestId]);
    await pool.query('DELETE FROM categoria WHERE id = ?', [categoriaTestId]);
  }

  //await pool.end();
});

describe('CRUD de artículos (productos)', () => {
  test('Debería listar artículos (GET /api/articulos)', async () => {
    const res = await agent.get('/api/articulos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Debería crear un artículo (POST /api/articulos)', async () => {
    const nuevoArticulo = {
      // OJO: NO mandamos "codigo" porque el backend lo genera solo
      nombre: 'Juego Test Jest',
      descripcion: 'Artículo de prueba creado por Jest',
      precio: 999.99,
      existencia: 5,
      categoria_id: categoriaTestId
    };

    const res = await agent
      .post('/api/articulos')
      .send(nuevoArticulo);

    expect(res.status).toBe(201); // así lo tienes en el controlador
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body).toHaveProperty('codigo');

    const codigoCreado = res.body.codigo;

    // Buscar en BD por ese código
    const [rows] = await pool.query(
      'SELECT * FROM articulo WHERE codigo = ?',
      [codigoCreado]
    );

    expect(rows.length).toBe(1);
    articuloTestId = rows[0].id;
  });

  test('Debería obtener un artículo específico (GET /api/articulos/:id)', async () => {
    const res = await agent.get(`/api/articulos/${articuloTestId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', articuloTestId);
    expect(res.body).toHaveProperty('nombre', 'Juego Test Jest');
  });

  test('Debería actualizar un artículo (PUT /api/articulos/:id)', async () => {
    const actualizacion = {
      nombre: 'Juego Test Jest Actualizado',
      descripcion: 'Descripción actualizada por Jest',
      precio: 749.5,
      existencia: 10,
      categoria_id: categoriaTestId
    };

    const res = await agent
      .put(`/api/articulos/${articuloTestId}`)
      .send(actualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');

    const [rows] = await pool.query(
      'SELECT * FROM articulo WHERE id = ?',
      [articuloTestId]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].nombre).toBe(actualizacion.nombre);
    expect(Number(rows[0].precio)).toBeCloseTo(actualizacion.precio);
    expect(rows[0].existencia).toBe(actualizacion.existencia);
  });

  test('Debería eliminar un artículo (DELETE /api/articulos/:id)', async () => {
    const res = await agent
      .delete(`/api/articulos/${articuloTestId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');

    const [rows] = await pool.query(
      'SELECT * FROM articulo WHERE id = ?',
      [articuloTestId]
    );
    expect(rows.length).toBe(0);

    // Para que el afterAll no intente borrarlo otra vez
    articuloTestId = null;
  });
});
