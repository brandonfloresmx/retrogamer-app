// public/js/admin-shell.js
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.admin-nav-link');
  const views = {
    clientes: document.getElementById('view-clientes'),
    articulos: document.getElementById('view-articulos'),
    categorias: document.getElementById('view-categorias'),
  };
  const tituloVista = document.getElementById('adminTituloVista');

  function mostrarVista(nombre) {
    Object.values(views).forEach(v => v && v.classList.add('hidden'));
    const vista = views[nombre];
    if (vista) vista.classList.remove('hidden');

    if (tituloVista) {
      const capitalizado = nombre.charAt(0).toUpperCase() + nombre.slice(1);
      tituloVista.textContent = capitalizado;
    }
  }

  navLinks.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (!view) return;

      navLinks.forEach(b => b.classList.remove('admin-nav-link-active'));
      btn.classList.add('admin-nav-link-active');
      mostrarVista(view);
    });
  });

  // Vista por defecto
  mostrarVista('clientes');
});

document.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btnLogout');

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      const confirmLogout = confirm("¿Cerrar sesión?");
      if (!confirmLogout) return;

      await fetch('/admin/logout', {
        method: 'POST'
      });

      // Redirigir al login
      window.location.href = '/admin/login';
    });
  }
});

