// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();

const clienteRoutes = require('./src/routes/clienteRoutes');
const authRoutes = require('./src/routes/authRoutes');

// ====== Middlewares globales ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones (para login real)
app.use(
  session({
    secret: 'retrogamer-super-secreto-2025', // cambia esta cadena en producción
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
  })
);

// Archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/clientes', clienteRoutes);
app.use('/api/auth', authRoutes);

// páginas de admin
app.get('/admin/clientes', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-clientes.html'));
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor escuchando en http://localhost:' + PORT);
});

