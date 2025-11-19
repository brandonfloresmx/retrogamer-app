// app.js
const express = require('express');
const path = require('path');
const app = express();

const clienteRoutes = require('./src/routes/clienteRoutes');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// estáticos (frontend, admin, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// rutas API
app.use('/api/clientes', clienteRoutes);

// (opcional) página de admin básica para probar
app.get('/admin/clientes', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-clientes.html'));
});

// puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor escuchando en http://localhost:' + PORT);
});
