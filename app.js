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
const bannerRoutes = require('./src/routes/bannerRoutes');
const carritoRoutes = require('./src/routes/carritoRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const direccionRoutes = require('./src/routes/direccionRoutes');
const metodoPagoRoutes = require('./src/routes/metodoPagoRoutes');
const favoritoRoutes = require('./src/routes/favoritoRoutes');
const envioRoutes = require('./src/routes/envioRoutes');

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

// Rutas públicas (sin autenticación)
app.use('/api/banners', bannerRoutes); // GET /api/banners (sin admin)
app.use('/api/public/articulos', articuloRoutes); // Usa las rutas /public dentro de articuloRoutes

// Middleware condicional para categorías: permite /public/padre/:slug sin auth, requiere admin para el resto
app.use('/api/categorias', (req, res, next) => {
  // Si es una ruta pública, permitir sin autenticación
  if (req.path.startsWith('/public/padre/')) {
    return next();
  }
  // Para todas las otras rutas, requerir admin
  if (!req.session || !req.session.adminId) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }
    return res.redirect('/admin/login');
  }
  next();
}, categoriaRoutes);

// Rutas API autenticadas
app.use('/api/auth', authRoutes);
app.use('/api/carrito', carritoRoutes); // Carrito requiere cliente logueado
app.use('/api/pedidos', pedidoRoutes); // Pedidos requiere cliente logueado
app.use('/api/direcciones', direccionRoutes); // Direcciones cliente
app.use('/api/metodos-pago', metodoPagoRoutes); // Métodos de pago cliente
app.use('/api/favoritos', favoritoRoutes); // Favoritos cliente
app.use('/api', envioRoutes); // Rutas de envío (admin protegidas internamente)

// Ruta admin para banners (la ruta con requireAdmin internamente)
app.use('/api/admin/banners', (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }
    return res.redirect('/admin/login');
  }
  next();
}, bannerRoutes);

app.use('/api/clientes', requireAdmin, clienteRoutes);
app.use('/api/articulos', requireAdmin, articuloRoutes);

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

