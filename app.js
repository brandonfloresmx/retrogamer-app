// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');

const app = express();

const clienteRoutes = require('./src/routes/clienteRoutes');
const authRoutes = require('./src/routes/authRoutes');
const articuloRoutes = require('./src/routes/articuloRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');

const requireAdmin = require('./src/middleware/requireAdmin');
const pool = require('./src/db/pool'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'retrogamer-super-secreto-2025', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);

app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', authRoutes);

app.use('/api/clientes', requireAdmin, clienteRoutes);
app.use('/api/articulos', requireAdmin, articuloRoutes); 
app.use('/api/categorias', requireAdmin, categoriaRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin/login', (req, res) => {
  if (req.session.adminId) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'public', 'login-admin.html'));
});

app.post('/admin/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    // Puedes agregar ?error=1 y mostrar mensaje con JS en login-admin.html
    return res.redirect('/admin/login?error=1');
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM admin_user WHERE usuario = ?',
      [usuario]
    );

    if (rows.length === 0) {
      return res.redirect('/admin/login?error=1');
    }

    const admin = rows[0];

    // Comparar usando MD5, porque en tu SQL definimos admin_user.password como CHAR(32)
    const hash = crypto.createHash('md5').update(password).digest('hex');

    if (admin.password !== hash) {
      return res.redirect('/admin/login?error=1');
    }

    // Login correcto: guardamos datos en sesión
    req.session.adminId = admin.id;
    req.session.adminUsuario = admin.usuario;
    req.session.adminNombre = admin.nombre;

    res.redirect('/admin');
  } catch (err) {
    console.error('Error en /admin/login:', err);
    res.redirect('/admin/login?error=1');
  }
});

app.post('/admin/logout', (req, res) => {
  req.session.adminId = null;
  req.session.adminUsuario = null;
  req.session.adminNombre = null;
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
// Solo levantar servidor si se ejecuta directamente con `node app.js`
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Servidor escuchando en http://localhost:' + PORT);
  });
}

// Exportar app para usarla en los tests
module.exports = app;

