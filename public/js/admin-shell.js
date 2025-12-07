// public/js/admin-shell.js
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.admin-nav-link');
  const views = {
    clientes: document.getElementById('view-clientes'),
    articulos: document.getElementById('view-articulos'),
    categorias: document.getElementById('view-categorias'),
    banners: document.getElementById('view-banners'),
    pedidos: document.getElementById('view-pedidos'),
    envios: document.getElementById('view-envios'),
  };
  const tituloVista = document.getElementById('adminTituloVista');

  function mostrarVista(nombre) {
    Object.values(views).forEach(v => v && v.classList.add('hidden'));
    const vista = views[nombre];
    if (vista) {
      vista.classList.remove('hidden');
      console.log(`Vista ${nombre} mostrada:`, vista.className);
    }

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

      // Cargar datos específicos por vista
      if (view === 'pedidos') {
        // Ejecutar cargarPedidos de forma asíncrona para asegurar que esté definida
        setTimeout(() => {
          if (typeof cargarPedidos === 'function') {
            cargarPedidos();
          }
        }, 0);
      }

      if (view === 'envios') {
        setTimeout(() => {
          if (typeof cargarEnvios === 'function') {
            cargarEnvios();
          }
        }, 0);
      }
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

