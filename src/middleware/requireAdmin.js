function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    // Si es una petición AJAX/fetch, responde con JSON 401
    if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }
    // Si es una petición normal, redirige al login
    return res.redirect('/admin/login');
  }
  next();
}

module.exports = requireAdmin;
