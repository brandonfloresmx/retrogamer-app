// tests/categorias.test.js
const request = require('supertest');
const app = require('../app');
const pool = require('../src/db/pool');

let agent;
let categoriaTestId;

beforeAll(async () => {
  agent = request.agent(app);

  // Login como admin (mismas credenciales que ya usas)
  const loginRes = await agent
    .post('/admin/login')
    .send('usuario=admin&password=retrogamer');

  expect(loginRes.status).toBe(302);
  expect(loginRes.headers.location).toBe('/admin');

  // Limpieza preventiva por si quedó basura de ejecuciones anteriores
  const nombreCat = 'Categoria Jest Root';
  await pool.query('DELETE FROM categoria WHERE nombre = ?', [nombreCat]);
});

afterAll(async () => {
  // Limpieza de la categoría de prueba si aún existe
  if (categoriaTestId) {
    await pool.query('DELETE FROM categoria WHERE id = ?', [categoriaTestId]);
  }

  // Si este es el único test que cierra el pool, déjalo;
  // si ya lo cierras en otros tests y te da error, puedes comentar esta línea.
  // await pool.end();
});

describe('CRUD de categorías', () => {
  test('Debería listar categorías (GET /api/categorias)', async () => {
    const res = await agent.get('/api/categorias');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Debería crear una categoría (POST /api/categorias)', async () => {
    const nuevaCategoria = {
      nombre: 'Categoria Jest Root',
      parent_id: '' // sin padre (null)
    };

    const res = await agent
      .post('/api/categorias')
      .send(nuevaCategoria);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('mensaje');

    // Buscar la categoría en BD por nombre
    const [rows] = await pool.query(
      'SELECT * FROM categoria WHERE nombre = ?',
      [nuevaCategoria.nombre]
    );

    expect(rows.length).toBe(1);
    categoriaTestId = rows[0].id;
  });

  test('Debería obtener una categoría específica (GET /api/categorias/:id)', async () => {
    const res = await agent.get(`/api/categorias/${categoriaTestId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', categoriaTestId);
    expect(res.body).toHaveProperty('nombre', 'Categoria Jest Root');
    // opcional: podrías checar que tenga slug y parent_id
  });

  test('Debería actualizar una categoría (PUT /api/categorias/:id)', async () => {
    const actualizacion = {
      nombre: 'Categoria Jest Root Actualizada',
      parent_id: '' // sigue sin padre
    };

    const res = await agent
      .put(`/api/categorias/${categoriaTestId}`)
      .send(actualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');

    // Verificar en BD
    const [rows] = await pool.query(
      'SELECT * FROM categoria WHERE id = ?',
      [categoriaTestId]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].nombre).toBe(actualizacion.nombre);
    // El slug se regenera automáticamente, pero no es obligatorio comprobarlo
  });

  test('Debería eliminar una categoría (DELETE /api/categorias/:id)', async () => {
    const res = await agent.delete(`/api/categorias/${categoriaTestId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');

    const [rows] = await pool.query(
      'SELECT * FROM categoria WHERE id = ?',
      [categoriaTestId]
    );

    expect(rows.length).toBe(0);
    categoriaTestId = null; // para que el afterAll no intente borrarla otra vez
  });
});
