// tests/clientes.test.js
const request = require('supertest');
const app = require('../app');           // importa tu express app
const pool = require('../src/db/pool');  // importa el pool de MySQL

// Usaremos un "agente" para mantener la sesión (cookies) del admin
let agent;

beforeAll(async () => {
  agent = request.agent(app);

  // 1) Login como admin para poder acceder a las rutas protegidas
  const loginRes = await agent
    .post('/admin/login')
    .send('usuario=admin&password=retrogamer'); // 👈 credenciales que metiste en la BD

  // Esperamos un redirect (302) hacia /admin
  expect(loginRes.status).toBe(302);
  expect(loginRes.headers.location).toBe('/admin');
});

afterAll(async () => {
  // Cerramos el pool de MySQL al terminar los tests
  await pool.end();
});

describe('CRUD de clientes (tabla cliente)', () => {
  const telefonoTest = '9999999999';

  // Limpieza por si existe antes
  beforeAll(async () => {
    await pool.query('DELETE FROM cliente WHERE telefono = ?', [telefonoTest]);
  });

  test('Debería listar clientes (GET /api/clientes)', async () => {
    const res = await agent.get('/api/clientes');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Debería crear un cliente (POST /api/clientes)', async () => {
    const nuevoCliente = {
      telefono: telefonoTest,
      nombre: 'Cliente Test',
      correo: 'cliente.test@example.com',
      password: 'Test1234' // suponiendo que tu backend hace el MD5, etc.
    };

    const res = await agent
      .post('/api/clientes')
      .send(nuevoCliente);

    // Ajusta estos expects según cómo responda tu API
    expect(res.status).toBe(201);  // o 200 según lo que uses
    expect(res.body).toHaveProperty('mensaje');
  });

  test('Debería obtener un cliente específico (GET /api/clientes/:telefono)', async () => {
    const res = await agent.get(`/api/clientes/${telefonoTest}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('telefono', telefonoTest);
  });

  test('Debería actualizar un cliente (PUT /api/clientes/:telefono)', async () => {
    const actualizacion = {
      nombre: 'Cliente Test Actualizado',
      correo: 'cliente.test.actualizado@example.com'
      // (Si tu PUT requiere todos los campos, agrega los demás)
    };

    const res = await agent
      .put(`/api/clientes/${telefonoTest}`)
      .send(actualizacion);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');

    // Verificamos que en BD se haya actualizado
    const [rows] = await pool.query(
      'SELECT * FROM cliente WHERE telefono = ?',
      [telefonoTest]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].nombre).toBe('Cliente Test Actualizado');
  });

  test('Debería eliminar un cliente (DELETE /api/clientes/:telefono)', async () => {
    const res = await agent.delete(`/api/clientes/${telefonoTest}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');

    // Verificamos que ya no exista en BD
    const [rows] = await pool.query(
      'SELECT * FROM cliente WHERE telefono = ?',
      [telefonoTest]
    );

    expect(rows.length).toBe(0);
  });
});
