// public/js/home.js

document.addEventListener('DOMContentLoaded', () => {
  // ====== HEADER ======
  const btnAccount   = document.getElementById('btnAccount');
  const accountLabel = document.getElementById('accountLabel');
  const btnCart      = document.getElementById('btnCart');
  const linkInicio   = document.getElementById('linkInicio');

  // Dropdown de cuenta
  const accountMenu        = document.getElementById('accountMenu');
  const accountMenuPerfil  = document.getElementById('accountMenuPerfil');
  const accountMenuLogout  = document.getElementById('accountMenuLogout');

  // ====== SECCIONES PRINCIPALES ======
  const homeSection     = document.getElementById('homeSection');
  const cuentaSection   = document.getElementById('cuentaSection');
  const carritoSection  = document.getElementById('carritoSection');
  const detalleSection  = document.getElementById('detalleSection');
  const categoriaSection = document.getElementById('categoriaSection');
  const checkoutSection = document.getElementById('checkoutSection');

  // Datos de la sección cuenta
  const saludoNombre  = document.getElementById('saludoNombre');
  const cuentaNumero  = document.getElementById('cuentaNumero');
  const datoNombre    = document.getElementById('datoNombre');
  const datoApellidos = document.getElementById('datoApellidos');
  const datoEmail     = document.getElementById('datoEmail');
  const datoTelefono  = document.getElementById('datoTelefono');
  const cuentaTitulo  = document.getElementById('cuentaTitulo');
  const panelCompras     = document.getElementById('panelCompras');
  const panelFavoritos   = document.getElementById('panelFavoritos');
  const panelPerfil      = document.getElementById('panelPerfil');
  const panelDirecciones = document.getElementById('panelDirecciones');
  const panelPagos       = document.getElementById('panelPagos');
  const menuCompras      = document.getElementById('menuCompras');
  const menuFavoritos    = document.getElementById('menuFavoritos');
  const menuPerfil       = document.getElementById('menuPerfil');
  const menuDirecciones  = document.getElementById('menuDirecciones');
  const menuPagos        = document.getElementById('menuPagos');
  const comprasLista     = document.getElementById('comprasLista');
  const favoritosLista   = document.getElementById('favoritosLista');
  const direccionesLista = document.getElementById('direccionesLista');
  const pagosLista       = document.getElementById('pagosLista');

  // Perfil editable
  const perfilNombre   = document.getElementById('perfilNombre');
  const perfilCorreo   = document.getElementById('perfilCorreo');
  const perfilTelefono = document.getElementById('perfilTelefono');
  const btnGuardarPerfil = document.getElementById('btnGuardarPerfil');
  const errorPerfilNombre = document.getElementById('errorPerfilNombre');
  const errorPerfilCorreo = document.getElementById('errorPerfilCorreo');

  // Direcciones
  const dirAlias = document.getElementById('dirAlias');
  const dirCalle = document.getElementById('dirCalle');
  const dirColonia = document.getElementById('dirColonia');
  const dirCP = document.getElementById('dirCP');
  const dirCiudad = document.getElementById('dirCiudad');
  const dirEstado = document.getElementById('dirEstado');
  const dirReferencias = document.getElementById('dirReferencias');
  const dirDefault = document.getElementById('dirDefault');
  const btnGuardarDireccion = document.getElementById('btnGuardarDireccion');
  const btnCancelarDireccion = document.getElementById('btnCancelarDireccion');
  const errorDirCalle = document.getElementById('errorDirCalle');
  const errorDirColonia = document.getElementById('errorDirColonia');
  const errorDirCP = document.getElementById('errorDirCP');
  const errorDirCiudad = document.getElementById('errorDirCiudad');
  const errorDirEstado = document.getElementById('errorDirEstado');

  // Pagos
  const pagoAlias = document.getElementById('pagoAlias');
  const pagoTipo = document.getElementById('pagoTipo');
  const pagoTitular = document.getElementById('pagoTitular');
  const pagoNumero = document.getElementById('pagoNumero');
  const pagoExpiracion = document.getElementById('pagoExpiracion');
  const pagoDefault = document.getElementById('pagoDefault');
  const btnGuardarPago = document.getElementById('btnGuardarPago');
  const btnCancelarPago = document.getElementById('btnCancelarPago');
  const errorPagoTipo = document.getElementById('errorPagoTipo');
  const errorPagoTitular = document.getElementById('errorPagoTitular');
  const btnSalirCuenta= document.getElementById('btnSalirCuenta');

  // ====== OVERLAY LOGIN ======
  const loginOverlay    = document.getElementById('loginOverlay');
  const overlayBackdrop = document.getElementById('overlayBackdrop');
  const btnCerrarLogin  = document.getElementById('btnCerrarLogin');

  // ====== LOGIN / REGISTRO ======
  const tabLogin     = document.getElementById('tabLogin');
  const tabRegistro  = document.getElementById('tabRegistro');
  const formLogin    = document.getElementById('formLogin');
  const formRegistro = document.getElementById('formRegistro');
  const tituloForm   = document.getElementById('tituloForm');
  const subtituloForm= document.getElementById('subtituloForm');
  const switchTexto  = document.getElementById('switchTexto');
  const mensaje      = document.getElementById('mensaje');

  const loginTelefono      = document.getElementById('loginTelefono');
  const loginPassword      = document.getElementById('loginPassword');
  const errorLoginTelefono = document.getElementById('errorLoginTelefono');
  const errorLoginPassword = document.getElementById('errorLoginPassword');

  const regNombre      = document.getElementById('regNombre');
  const regTelefono    = document.getElementById('regTelefono');
  const regCorreo      = document.getElementById('regCorreo');
  const regPassword    = document.getElementById('regPassword');
  const regPassword2   = document.getElementById('regPassword2');
  const errorRegNombre   = document.getElementById('errorRegNombre');
  const errorRegTelefono = document.getElementById('errorRegTelefono');
  const errorRegCorreo   = document.getElementById('errorRegCorreo');
  const errorRegPassword = document.getElementById('errorRegPassword');

  const regexTelefono = /^[0-9]{10}$/;
  const regexCorreo   = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  // Estado de sesión en memoria
  let isLogged = false;
  let clienteActual = null;
  let accountMenuOpen = false;
  let cuentaPanelActivo = 'perfil';
  let direcciones = [];
  let metodosPago = [];
  let favoritos = [];
  let pedidos = [];
  let direccionEditId = null;
  let pagoEditId = null;

  // ====== UI HELPERS ======
  function setStatus(texto, tipo) {
    if (!mensaje) return;
    mensaje.textContent = texto || '';
    mensaje.className = 'status' + (tipo ? ' ' + tipo : '');
  }

  function limpiarErrores() {
    [
      errorLoginTelefono,
      errorLoginPassword,
      errorRegNombre,
      errorRegTelefono,
      errorRegCorreo,
      errorRegPassword
    ].forEach(el => el && (el.textContent = ''));
    setStatus('', '');
  }

  function mostrarNotificacion(mensaje) {
    // Crear toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    // Mostrar con animación
    setTimeout(() => toast.classList.add('show'), 10);

    // Ocultar y eliminar
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function abrirLogin() {
    if (!loginOverlay) return;
    loginOverlay.classList.remove('hidden');
    limpiarErrores();
    cerrarAccountMenu();
  }

  function cerrarLogin() {
    if (!loginOverlay) return;
    loginOverlay.classList.add('hidden');
    limpiarErrores();
    if (formLogin) formLogin.reset();
    if (formRegistro) formRegistro.reset();
    irLogin();
  }

  function irLogin() {
    if (!tabLogin || !tabRegistro || !formLogin || !formRegistro) return;
    tabLogin.classList.add('active');
    tabRegistro.classList.remove('active');
    formLogin.classList.remove('hidden');
    formRegistro.classList.add('hidden');
    if (tituloForm) tituloForm.textContent = 'Bienvenido de vuelta';
    if (subtituloForm) {
      subtituloForm.textContent =
        'Ingresa con tu número de celular para continuar tu compra.';
    }
    if (switchTexto) {
      switchTexto.innerHTML =
        '¿No tienes cuenta? <button type="button" id="btnIrRegistro">Crear una cuenta</button>';
      const btnIrRegistro = document.getElementById('btnIrRegistro');
      if (btnIrRegistro) btnIrRegistro.addEventListener('click', irRegistro);
    }
    limpiarErrores();
  }

  function irRegistro() {
    if (!tabLogin || !tabRegistro || !formLogin || !formRegistro) return;
    tabRegistro.classList.add('active');
    tabLogin.classList.remove('active');
    formRegistro.classList.remove('hidden');
    formLogin.classList.add('hidden');
    if (tituloForm) tituloForm.textContent = 'Crear cuenta';
    if (subtituloForm) {
      subtituloForm.textContent =
        'Regístrate para guardar tu carrito y tu historial de compras.';
    }
    if (switchTexto) {
      switchTexto.innerHTML =
        '¿Ya tienes cuenta? <button type="button" id="btnIrLogin">Inicia sesión</button>';
      const btnIrLogin = document.getElementById('btnIrLogin');
      if (btnIrLogin) btnIrLogin.addEventListener('click', irLogin);
    }
    limpiarErrores();
  }

  if (tabLogin)   tabLogin.addEventListener('click', irLogin);
  if (tabRegistro)tabRegistro.addEventListener('click', irRegistro);

  // ====== HOME / CUENTA (SPA falso: misma página) ======
  function mostrarHome() {
    if (homeSection)     homeSection.classList.remove('hidden');
    if (cuentaSection)   cuentaSection.classList.add('hidden');
    if (carritoSection)  carritoSection.classList.add('hidden');
    if (detalleSection)  detalleSection.classList.add('hidden');
    if (categoriaSection) categoriaSection.classList.add('hidden');
    if (checkoutSection) checkoutSection.classList.add('hidden');
    if (linkInicio)      linkInicio.classList.add('rg-nav-link-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mostrarCuenta() {
    if (!isLogged || !clienteActual) {
      abrirLogin();
      return;
    }

    if (homeSection)     homeSection.classList.add('hidden');
    if (cuentaSection)   cuentaSection.classList.remove('hidden');
    if (carritoSection)  carritoSection.classList.add('hidden');
    if (detalleSection)  detalleSection.classList.add('hidden');
    if (categoriaSection) categoriaSection.classList.add('hidden');
    if (checkoutSection) checkoutSection.classList.add('hidden');
    if (linkInicio)      linkInicio.classList.remove('rg-nav-link-active');

    pintarCuenta();
    activarPanelCuenta(cuentaPanelActivo || 'perfil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mostrarCarrito() {
    if (homeSection)     homeSection.classList.add('hidden');
    if (cuentaSection)   cuentaSection.classList.add('hidden');
    if (detalleSection)  detalleSection.classList.add('hidden');
    if (categoriaSection) categoriaSection.classList.add('hidden');
    if (carritoSection)  carritoSection.classList.remove('hidden');
    if (checkoutSection) checkoutSection.classList.add('hidden');
    if (linkInicio)      linkInicio.classList.remove('rg-nav-link-active');

    renderizarCarrito();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function actualizarHeaderCuenta() {
    if (!accountLabel) return;
    accountLabel.textContent = isLogged ? 'Cuenta' : 'Iniciar sesión';
  }

  function pintarCuenta() {
    if (!clienteActual) return;
    const nombreMayus = (clienteActual.nombre || '').toUpperCase();

    if (saludoNombre) saludoNombre.textContent = nombreMayus || 'CLIENTE';
    if (cuentaNumero) cuentaNumero.textContent = clienteActual.telefono || '-';
    if (datoNombre)   datoNombre.textContent   = nombreMayus || '-';

    const partes = nombreMayus.split(' ').filter(Boolean);
    if (datoApellidos) {
      datoApellidos.textContent =
        partes.length > 1 ? partes.slice(1).join(' ') : '-';
    }

    if (datoEmail)    datoEmail.textContent    = clienteActual.correo || '-';
    if (datoTelefono) datoTelefono.textContent = clienteActual.telefono || '-';

    if (perfilNombre) perfilNombre.value = clienteActual.nombre || '';
    if (perfilCorreo) perfilCorreo.value = clienteActual.correo || '';
    if (perfilTelefono) perfilTelefono.value = clienteActual.telefono || '';
  }

  function activarPanelCuenta(seccion) {
    cuentaPanelActivo = seccion;
    const paneles = [
      { id: 'compras', el: panelCompras, menu: menuCompras, titulo: 'Tus compras' },
      { id: 'favoritos', el: panelFavoritos, menu: menuFavoritos, titulo: 'Favoritos' },
      { id: 'perfil', el: panelPerfil, menu: menuPerfil, titulo: 'Tu perfil' },
      { id: 'direcciones', el: panelDirecciones, menu: menuDirecciones, titulo: 'Tus direcciones' },
      { id: 'pagos', el: panelPagos, menu: menuPagos, titulo: 'Métodos de pago' }
    ];

    paneles.forEach(p => {
      p.el?.classList.toggle('hidden', p.id !== seccion);
      p.menu?.classList.toggle('cuenta-menu-item-activo', p.id === seccion);
    });
    if (cuentaTitulo) {
      const current = paneles.find(p => p.id === seccion);
      cuentaTitulo.textContent = current ? current.titulo : 'Tu cuenta';
    }

    // Carga diferida de datos
    if (seccion === 'compras') cargarPedidos();
    if (seccion === 'favoritos') cargarFavoritos();
    if (seccion === 'direcciones') cargarDirecciones();
    if (seccion === 'pagos') cargarMetodosPago();
  }

  async function cargarPedidos() {
    if (!isLogged || !comprasLista) return;
    try {
      const res = await fetch('/api/pedidos', { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar pedidos');
      const data = await res.json();
      pedidos = data.pedidos || [];
      renderPedidos();
    } catch (err) {
      console.error(err);
      comprasLista.innerHTML = '<p class="cuenta-label">No se pudieron cargar tus pedidos.</p>';
    }
  }

  function renderPedidos() {
    if (!comprasLista) return;
    if (!pedidos.length) {
      comprasLista.innerHTML = '<p class="cuenta-label">Aún no tienes compras.</p>';
      return;
    }
    comprasLista.innerHTML = '';
    pedidos.forEach(p => {
      const div = document.createElement('div');
      div.className = 'cuenta-pill cuenta-pill-clickable';
      div.innerHTML = `
        <div>
          <p class="pill-title">Pedido #${p.id}</p>
          <p class="pill-sub">${new Date(p.creado_en).toLocaleString('es-MX')}</p>
        </div>
        <div class="pill-meta">
          <span class="pill-estado pill-${p.estado}">${p.estado}</span>
          <span class="pill-total">$${parseFloat(p.total).toFixed(2)}</span>
          <span class="material-symbols-outlined">chevron_right</span>
        </div>
      `;
      div.addEventListener('click', () => abrirDetallePedido(p.id));
      comprasLista.appendChild(div);
    });
  }

  async function abrirDetallePedido(pedidoId) {
    const modal = document.getElementById('modalDetallePedido');
    const titulo = document.getElementById('modalPedidoTitulo');
    const body = document.getElementById('modalPedidoBody');
    if (!modal || !titulo || !body) return;

    try {
      body.innerHTML = '<p class="cuenta-label">Cargando detalle...</p>';
      modal.classList.remove('hidden');

      const res = await fetch(`/api/pedidos/${pedidoId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar detalle del pedido');
      const data = await res.json();
      const pedido = data.pedido;

      titulo.textContent = `Pedido #${pedido.id}`;

      // Calcular subtotal
      const subtotal = pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      const envio = parseFloat(pedido.costo_envio) || 0;

      body.innerHTML = `
        <div class="pedido-detalle">
          <div class="detalle-section">
            <h3>Información del pedido</h3>
            <p><strong>Fecha:</strong> ${new Date(pedido.creado_en).toLocaleString('es-MX')}</p>
            <p><strong>Estado:</strong> <span class="pill-estado pill-${pedido.estado}">${pedido.estado}</span></p>
          </div>

          <div class="detalle-section">
            <h3>Dirección de envío</h3>
            <p>${pedido.direccion_completa || '<em style="color: #9ca3af;">No disponible (pedido anterior)</em>'}</p>
          </div>

          <div class="detalle-section" id="seccionEnvio">
            <h3>Información de envío</h3>
            <p class="cuenta-label">Cargando información de envío...</p>
          </div>

          <div class="detalle-section">
            <h3>Método de pago</h3>
            <p>${pedido.metodo_pago ? pedido.metodo_pago.charAt(0).toUpperCase() + pedido.metodo_pago.slice(1) : '<em style="color: #9ca3af;">No disponible (pedido anterior)</em>'}</p>
          </div>

          <div class="detalle-section">
            <h3>Productos</h3>
            <div class="pedido-items">
              ${pedido.items.map(item => `
                <div class="pedido-item">
                  <img src="${item.imagen || '/img/placeholder.png'}" alt="${item.nombre}" class="pedido-item-img">
                  <div class="pedido-item-info">
                    <p class="pedido-item-nombre">${item.nombre}</p>
                    <p class="pedido-item-cantidad">Cantidad: ${item.cantidad}</p>
                  </div>
                  <div class="pedido-item-precio">
                    <p>$${parseFloat(item.precio).toFixed(2)}</p>
                    <p class="pedido-item-subtotal">$${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="detalle-section detalle-totales">
            <div class="detalle-total-line">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="detalle-total-line">
              <span>Envío:</span>
              <span>${envio === 0 ? 'GRATIS' : '$' + envio.toFixed(2)}</span>
            </div>
            <div class="detalle-total-line detalle-total-final">
              <span>Total:</span>
              <span>$${parseFloat(pedido.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;

      // Cargar información de envío si el pedido está enviado
      if (['enviado', 'entregado'].includes(pedido.estado)) {
        cargarInfoEnvioPedido(pedidoId);
      } else {
        const seccionEnvio = document.getElementById('seccionEnvio');
        if (seccionEnvio) {
          seccionEnvio.innerHTML = '<h3>Información de envío</h3><p><em style="color: #9ca3af;">El envío se generará cuando el pedido sea marcado como enviado.</em></p>';
        }
      }
    } catch (err) {
      console.error(err);
      body.innerHTML = '<p class="cuenta-label">No se pudo cargar el detalle del pedido.</p>';
    }
  }

  function cerrarModalDetallePedido() {
    const modal = document.getElementById('modalDetallePedido');
    if (modal) modal.classList.add('hidden');
  }

  async function cargarInfoEnvioPedido(pedidoId) {
    const seccionEnvio = document.getElementById('seccionEnvio');
    if (!seccionEnvio) return;

    try {
      const res = await fetch(`/api/admin/envios/${pedidoId}`, { credentials: 'include' });
      
      if (res.status === 404) {
        seccionEnvio.innerHTML = '<h3>Información de envío</h3><p><em style="color: #9ca3af;">El envío aún no ha sido procesado.</em></p>';
        return;
      }

      if (!res.ok) {
        seccionEnvio.innerHTML = '<h3>Información de envío</h3><p><em style="color: #9ca3af;">No se pudo cargar la información del envío.</em></p>';
        return;
      }

      const envio = await res.json();
      
      // Generar link de rastreo según el carrier
      const linksRastreo = {
        'DHL': `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${envio.guia}`,
        'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${envio.guia}`,
        'Estafeta': `https://www.estafeta.com/Rastreo/?wayb=${envio.guia}`,
        'Redpack': `https://www.redpack.com.mx/es/rastreo/?guias=${envio.guia}`,
      };

      const linkRastreo = linksRastreo[envio.carrier];

      const estadoEnvioTexto = {
        'pendiente': 'Pendiente de recolección',
        'recogido': 'Recogido por paquetería',
        'en_transito': 'En tránsito',
        'entregado': 'Entregado',
        'incidencia': 'Incidencia'
      }[envio.estado] || envio.estado;

      seccionEnvio.innerHTML = `
        <h3>Información de envío</h3>
        <div style="display: grid; gap: 12px; margin-top: 12px;">
          <div>
            <strong style="color: #9ca3af; font-size: 0.9rem;">Paquetería:</strong>
            <p style="margin-top: 4px;">${envio.carrier}</p>
          </div>
          <div>
            <strong style="color: #9ca3af; font-size: 0.9rem;">Número de guía:</strong>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <p style="font-family: monospace; font-size: 1.1rem; font-weight: 500;">${envio.guia}</p>
              <button onclick="copiarGuiaCliente('${envio.guia}')" class="btn-copiar-guia" title="Copiar número de guía">
                <span class="material-symbols-outlined" style="font-size: 18px;">content_copy</span>
              </button>
            </div>
          </div>
          <div>
            <strong style="color: #9ca3af; font-size: 0.9rem;">Estado del envío:</strong>
            <p style="margin-top: 4px;"><span class="pill-estado pill-${envio.estado.replace('_', '-')}">${estadoEnvioTexto}</span></p>
          </div>
          ${linkRastreo ? `
            <div style="margin-top: 8px;">
              <a href="${linkRastreo}" target="_blank" class="btn-rastrear-envio">
                <span class="material-symbols-outlined" style="font-size: 18px;">travel_explore</span>
                Rastrear envío
              </a>
            </div>
          ` : ''}
        </div>
      `;
    } catch (err) {
      console.error('Error al cargar envío:', err);
      seccionEnvio.innerHTML = '<h3>Información de envío</h3><p><em style="color: #9ca3af;">No se pudo cargar la información del envío.</em></p>';
    }
  }

  window.copiarGuiaCliente = function(guia) {
    navigator.clipboard.writeText(guia).then(() => {
      alert(`Número de guía copiado: ${guia}`);
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar el número de guía');
    });
  };

  async function cargarFavoritos() {
    if (!isLogged) return;
    try {
      const res = await fetch('/api/favoritos', { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar favoritos');
      const data = await res.json();
      favoritos = data.favoritos || [];
      renderFavoritos();
      renderizarProductos();
    } catch (err) {
      console.error(err);
      if (favoritosLista) {
        favoritosLista.innerHTML = '<p class="cuenta-label">No se pudieron cargar tus favoritos.</p>';
      }
    }
  }

  function esFavorito(id) {
    return favoritos.some(f => String(f.articulo_id) === String(id));
  }

  function renderFavoritos() {
    if (!favoritosLista) return;
    if (!favoritos.length) {
      favoritosLista.innerHTML = '<p class="cuenta-label">Aún no tienes favoritos guardados.</p>';
      return;
    }
    favoritosLista.innerHTML = '';
    favoritos.forEach(f => {
      const card = document.createElement('div');
      card.className = 'fav-card';
      card.innerHTML = `
        <img src="${f.imagen || '/img/no-image.png'}" alt="${f.nombre}" class="fav-img">
        <div class="fav-info">
          <p class="fav-title">${f.nombre}</p>
          <p class="fav-price">$${parseFloat(f.precio).toFixed(2)}</p>
        </div>
        <button type="button" class="fav-remove" data-id="${f.articulo_id}">Eliminar</button>
      `;
      card.querySelector('.fav-remove').addEventListener('click', () => eliminarFavorito(f.articulo_id));
      favoritosLista.appendChild(card);
    });
  }

  async function eliminarFavorito(articuloId) {
    try {
      const res = await fetch(`/api/favoritos/${articuloId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        favoritos = favoritos.filter(f => f.articulo_id !== articuloId);
        renderFavoritos();
        renderizarProductos();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleFavorito(articuloId) {
    if (!isLogged) {
      mostrarNotificacion('Inicia sesión para guardar favoritos');
      abrirLogin();
      return false;
    }

    try {
      if (esFavorito(articuloId)) {
        const res = await fetch(`/api/favoritos/${articuloId}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
          favoritos = favoritos.filter(f => String(f.articulo_id) !== String(articuloId));
          renderFavoritos();
          renderizarProductos();
          return false;
        }
      } else {
        const res = await fetch(`/api/favoritos/${articuloId}`, { method: 'POST', credentials: 'include' });
        if (res.ok) {
          await cargarFavoritos();
          return true;
        }
      }
    } catch (err) {
      console.error(err);
    }
    return esFavorito(articuloId);
  }

  async function cargarDirecciones() {
    if (!isLogged || !direccionesLista) return;
    try {
      const res = await fetch('/api/direcciones', { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar direcciones');
      const data = await res.json();
      direcciones = data.direcciones || [];
      renderDirecciones();
      sincronizarSelectDirecciones();
    } catch (err) {
      console.error(err);
      direccionesLista.innerHTML = '<p class="cuenta-label">No se pudieron cargar tus direcciones.</p>';
    }
  }

  function renderDirecciones() {
    if (!direccionesLista) return;
    if (!direcciones.length) {
      direccionesLista.innerHTML = '<p class="cuenta-label">Agrega tu primera dirección.</p>';
      return;
    }
    direccionesLista.innerHTML = '';
    direcciones.forEach(dir => {
      const div = document.createElement('div');
      div.className = 'cuenta-pill';
      div.innerHTML = `
        <div>
          <p class="pill-title">${dir.alias || 'Mi dirección'} ${dir.es_default ? '<span class="pill-default">Predeterminada</span>' : ''}</p>
          <p class="pill-sub">${dir.calle}, ${dir.colonia}, CP ${dir.cp}, ${dir.ciudad}, ${dir.estado}</p>
          <p class="pill-sub">${dir.referencias || ''}</p>
        </div>
        <div class="pill-actions">
          <button type="button" class="pill-btn" data-action="edit" data-id="${dir.id}">Editar</button>
          <button type="button" class="pill-btn pill-danger" data-action="del" data-id="${dir.id}">Eliminar</button>
        </div>
      `;
      div.querySelector('[data-action="edit"]').addEventListener('click', () => cargarDireccionEnFormulario(dir.id));
      div.querySelector('[data-action="del"]').addEventListener('click', () => eliminarDireccion(dir.id));
      direccionesLista.appendChild(div);
    });
  }

  function cargarDireccionEnFormulario(id) {
    const dir = direcciones.find(d => d.id === id);
    if (!dir) return;
    direccionEditId = id;
    if (dirAlias) dirAlias.value = dir.alias || '';
    if (dirCalle) dirCalle.value = dir.calle || '';
    if (dirColonia) dirColonia.value = dir.colonia || '';
    if (dirCP) dirCP.value = dir.cp || '';
    if (dirCiudad) dirCiudad.value = dir.ciudad || '';
    if (dirEstado) dirEstado.value = dir.estado || '';
    if (dirReferencias) dirReferencias.value = dir.referencias || '';
    if (dirDefault) dirDefault.checked = !!dir.es_default;
  }

  function limpiarFormularioDireccion() {
    direccionEditId = null;
    if (dirAlias) dirAlias.value = '';
    if (dirCalle) dirCalle.value = '';
    if (dirColonia) dirColonia.value = '';
    if (dirCP) dirCP.value = '';
    if (dirCiudad) dirCiudad.value = '';
    if (dirEstado) dirEstado.value = '';
    if (dirReferencias) dirReferencias.value = '';
    if (dirDefault) dirDefault.checked = false;
    [errorDirCalle, errorDirColonia, errorDirCP, errorDirCiudad, errorDirEstado].forEach(el => el && (el.textContent = ''));
  }

  async function eliminarDireccion(id) {
    if (!confirm('¿Eliminar esta dirección?')) return;
    try {
      const res = await fetch(`/api/direcciones/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        direcciones = direcciones.filter(d => d.id !== id);
        renderDirecciones();
        sincronizarSelectDirecciones();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function guardarDireccion() {
    let ok = true;
    [errorDirCalle, errorDirColonia, errorDirCP, errorDirCiudad, errorDirEstado].forEach(el => el && (el.textContent = ''));
    if (!dirCalle?.value.trim()) { errorDirCalle.textContent = 'Requerido'; ok = false; }
    if (!dirColonia?.value.trim()) { errorDirColonia.textContent = 'Requerido'; ok = false; }
    if (!/^\d{5}$/.test(dirCP?.value.trim() || '')) { if (errorDirCP) errorDirCP.textContent = 'CP inválido'; ok = false; }
    if (!dirCiudad?.value.trim()) { if (errorDirCiudad) errorDirCiudad.textContent = 'Requerido'; ok = false; }
    if (!dirEstado?.value.trim()) { if (errorDirEstado) errorDirEstado.textContent = 'Requerido'; ok = false; }
    if (!ok) return;

    const payload = {
      alias: dirAlias?.value.trim(),
      calle: dirCalle?.value.trim(),
      colonia: dirColonia?.value.trim(),
      cp: dirCP?.value.trim(),
      ciudad: dirCiudad?.value.trim(),
      estado: dirEstado?.value.trim(),
      referencias: dirReferencias?.value.trim(),
      es_default: dirDefault?.checked
    };

    const url = direccionEditId ? `/api/direcciones/${direccionEditId}` : '/api/direcciones';
    const method = direccionEditId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        mostrarNotificacion(data.mensaje || 'Error al guardar dirección');
        return;
      }
      mostrarNotificacion('Dirección guardada');
      await cargarDirecciones();
      limpiarFormularioDireccion();
    } catch (err) {
      console.error(err);
    }
  }

  async function cargarMetodosPago() {
    if (!isLogged || !pagosLista) return;
    try {
      const res = await fetch('/api/metodos-pago', { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar métodos');
      const data = await res.json();
      metodosPago = data.metodos || [];
      renderMetodosPago();
      sincronizarSelectMetodos();
    } catch (err) {
      console.error(err);
      pagosLista.innerHTML = '<p class="cuenta-label">No se pudieron cargar tus métodos de pago.</p>';
    }
  }

  function renderMetodosPago() {
    if (!pagosLista) return;
    if (!metodosPago.length) {
      pagosLista.innerHTML = '<p class="cuenta-label">Agrega un método de pago.</p>';
      return;
    }
    pagosLista.innerHTML = '';
    metodosPago.forEach(mp => {
      const div = document.createElement('div');
      div.className = 'cuenta-pill';
      const label = mp.tipo === 'tarjeta' ? `${mp.titular} · · · ${mp.ultimo4 || 'XXXX'}` : mp.tipo.toUpperCase();
      div.innerHTML = `
        <div>
          <p class="pill-title">${mp.alias || 'Mi pago'} ${mp.es_default ? '<span class="pill-default">Predeterminado</span>' : ''}</p>
          <p class="pill-sub">${label}</p>
        </div>
        <div class="pill-actions">
          <button type="button" class="pill-btn" data-action="edit" data-id="${mp.id}">Editar</button>
          <button type="button" class="pill-btn pill-danger" data-action="del" data-id="${mp.id}">Eliminar</button>
        </div>
      `;
      div.querySelector('[data-action="edit"]').addEventListener('click', () => cargarPagoEnFormulario(mp.id));
      div.querySelector('[data-action="del"]').addEventListener('click', () => eliminarPago(mp.id));
      pagosLista.appendChild(div);
    });
  }

  function cargarPagoEnFormulario(id) {
    const mp = metodosPago.find(m => m.id === id);
    if (!mp) return;
    pagoEditId = id;
    if (pagoAlias) pagoAlias.value = mp.alias || '';
    if (pagoTipo) pagoTipo.value = mp.tipo;
    if (pagoTitular) pagoTitular.value = mp.titular || '';
    if (pagoNumero) pagoNumero.value = mp.ultimo4 ? `**** **** **** ${mp.ultimo4}` : '';
    if (pagoExpiracion) pagoExpiracion.value = mp.expiracion || '';
    if (pagoDefault) pagoDefault.checked = !!mp.es_default;
  }

  function limpiarFormularioPago() {
    pagoEditId = null;
    if (pagoAlias) pagoAlias.value = '';
    if (pagoTipo) pagoTipo.value = '';
    if (pagoTitular) pagoTitular.value = '';
    if (pagoNumero) pagoNumero.value = '';
    if (pagoExpiracion) pagoExpiracion.value = '';
    if (pagoDefault) pagoDefault.checked = false;
    if (errorPagoTipo) errorPagoTipo.textContent = '';
    if (errorPagoTitular) errorPagoTitular.textContent = '';
  }

  async function eliminarPago(id) {
    if (!confirm('¿Eliminar este método de pago?')) return;
    try {
      const res = await fetch(`/api/metodos-pago/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        metodosPago = metodosPago.filter(m => m.id !== id);
        renderMetodosPago();
        sincronizarSelectMetodos();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function guardarPago() {
    if (errorPagoTipo) errorPagoTipo.textContent = '';
    if (errorPagoTitular) errorPagoTitular.textContent = '';
    let ok = true;
    if (!pagoTipo?.value) { errorPagoTipo.textContent = 'Selecciona un tipo'; ok = false; }
    if (!pagoTitular?.value.trim()) { errorPagoTitular.textContent = 'Titular requerido'; ok = false; }
    if (!ok) return;

    const payload = {
      alias: pagoAlias?.value.trim(),
      tipo: pagoTipo?.value,
      titular: pagoTitular?.value.trim(),
      numero: pagoNumero?.value.replace(/\s/g, ''),
      expiracion: pagoExpiracion?.value.trim(),
      es_default: pagoDefault?.checked
    };

    const url = pagoEditId ? `/api/metodos-pago/${pagoEditId}` : '/api/metodos-pago';
    const method = pagoEditId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        mostrarNotificacion(data.mensaje || 'Error al guardar método de pago');
        return;
      }
      mostrarNotificacion('Método de pago guardado');
      await cargarMetodosPago();
      limpiarFormularioPago();
    } catch (err) {
      console.error(err);
    }
  }

  async function guardarPerfil() {
    if (errorPerfilNombre) errorPerfilNombre.textContent = '';
    if (errorPerfilCorreo) errorPerfilCorreo.textContent = '';
    let ok = true;
    if (!perfilNombre?.value.trim()) { errorPerfilNombre.textContent = 'Nombre requerido'; ok = false; }
    if (!perfilCorreo?.value.trim()) { errorPerfilCorreo.textContent = 'Correo requerido'; ok = false; }
    if (!ok) return;

    try {
      const res = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre: perfilNombre.value.trim(), correo: perfilCorreo.value.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.mensaje || (data.errores ? data.errores.join(' ') : 'Error al guardar');
        mostrarNotificacion(msg);
        return;
      }
      clienteActual = data.cliente;
      pintarCuenta();
      mostrarNotificacion('Perfil actualizado');
    } catch (err) {
      console.error(err);
    }
  }

  // ====== ACCOUNT MENU (DROPDOWN) ======
  function abrirAccountMenu() {
    if (!accountMenu) return;
    accountMenu.classList.remove('hidden');
    accountMenuOpen = true;
  }

  function cerrarAccountMenu() {
    if (!accountMenu) return;
    accountMenu.classList.add('hidden');
    accountMenuOpen = false;
  }

  function toggleAccountMenu() {
    if (!accountMenu) return;
    if (accountMenuOpen) {
      cerrarAccountMenu();
    } else {
      abrirAccountMenu();
    }
  }

  // ====== VALIDACIONES ======
  function validarLoginCliente() {
    let ok = true;
    limpiarErrores();
    const tel  = loginTelefono ? loginTelefono.value.trim() : '';
    const pass = loginPassword ? loginPassword.value : '';

    if (!regexTelefono.test(tel)) {
      if (errorLoginTelefono) {
        errorLoginTelefono.textContent = 'El teléfono debe tener exactamente 10 dígitos.';
      }
      ok = false;
    }
    if (!pass || pass.length < 8) {
      if (errorLoginPassword) {
        errorLoginPassword.textContent =
          'La contraseña debe tener al menos 8 caracteres.';
      }
      ok = false;
    }
    return ok;
  }

  function validarRegistroCliente() {
    let ok = true;
    limpiarErrores();

    const nombre = regNombre ? regNombre.value.trim() : '';
    const tel    = regTelefono ? regTelefono.value.trim() : '';
    const correo = regCorreo ? regCorreo.value.trim() : '';
    const pass1  = regPassword ? regPassword.value : '';
    const pass2  = regPassword2 ? regPassword2.value : '';

    if (!nombre) {
      if (errorRegNombre) errorRegNombre.textContent = 'El nombre es obligatorio.';
      ok = false;
    } else if (nombre.length > 150) {
      if (errorRegNombre) errorRegNombre.textContent =
        'El nombre debe tener máximo 150 caracteres.';
      ok = false;
    }

    if (!regexTelefono.test(tel)) {
      if (errorRegTelefono) {
        errorRegTelefono.textContent = 'El teléfono debe tener exactamente 10 dígitos.';
      }
      ok = false;
    }

    if (!regexCorreo.test(correo)) {
      if (errorRegCorreo) errorRegCorreo.textContent = 'Correo electrónico inválido.';
      ok = false;
    } else if (correo.length > 120) {
      if (errorRegCorreo) {
        errorRegCorreo.textContent = 'El correo debe tener máximo 120 caracteres.';
      }
      ok = false;
    }

    if (!pass1 || pass1.length < 8) {
      if (errorRegPassword) {
        errorRegPassword.textContent =
          'La contraseña debe tener al menos 8 caracteres.';
      }
      ok = false;
    } else if (pass1 !== pass2) {
      if (errorRegPassword) {
        errorRegPassword.textContent = 'Las contraseñas no coinciden.';
      }
      ok = false;
    }

    return ok;
  }

  // ====== SESIÓN real con express-session ======
  async function actualizarSesionDesdeServidor() {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (!res.ok) {
        isLogged = false;
        clienteActual = null;
      } else {
        const data = await res.json();
        if (data.autenticado && data.cliente) {
          isLogged = true;
          clienteActual = data.cliente;
          await cargarFavoritos();
        } else {
          isLogged = false;
          clienteActual = null;
        }
      }
    } catch (err) {
      console.error('Error consultando sesión:', err);
      isLogged = false;
      clienteActual = null;
    }

    actualizarHeaderCuenta();
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error en logout:', err);
    }
    isLogged = false;
    clienteActual = null;
    direcciones = [];
    metodosPago = [];
    favoritos = [];
    pedidos = [];
    actualizarHeaderCuenta();
    await actualizarBadgeCarrito();
    // Si estás viendo el carrito, refresca a estado sin sesión
    if (carritoSection && !carritoSection.classList.contains('hidden')) {
      await renderizarCarrito();
    }
    cerrarAccountMenu();

    // En SPA siempre regresamos a la vista de inicio
    mostrarHome();
  }

  // ====== SUBMITS ======
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validarLoginCliente()) return;

      const payload = {
        telefono: loginTelefono.value.trim(),
        password: loginPassword.value
      };

      try {
        setStatus('Verificando credenciales...', '');
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus(data.mensaje || 'Error al iniciar sesión.', 'error');
          return;
        }

        setStatus('Login correcto.', 'ok');

        await actualizarSesionDesdeServidor();

        // Migrar carrito local a servidor si existe
        const carritoLocal = obtenerCarritoLocal();
        if (Object.keys(carritoLocal).length > 0) {
          console.log('Migrando carrito local al servidor...');
          await migraCarritoLocalAlServidor();
        }

        await actualizarBadgeCarrito();
        // Si el usuario está en la vista carrito, refrescarla al instante
        if (carritoSection && !carritoSection.classList.contains('hidden')) {
          await renderizarCarrito();
        }

        // No cambiamos de vista automáticamente, solo cerramos el modal
        setTimeout(() => {
          cerrarLogin();
        }, 500);
      } catch (err) {
        console.error(err);
        setStatus('Error de comunicación con el servidor.', 'error');
      }
    });
  }

  if (formRegistro) {
    formRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validarRegistroCliente()) return;

      const payload = {
        nombre: regNombre.value.trim(),
        telefono: regTelefono.value.trim(),
        correo: regCorreo.value.trim(),
        password: regPassword.value
      };

      try {
        setStatus('Creando cuenta...', '');
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
          const msg =
            data.mensaje ||
            (data.errores ? data.errores.join(' ') : 'Error al registrar.');
          setStatus(msg, 'error');
          return;
        }

        setStatus(data.mensaje || 'Cuenta creada correctamente.', 'ok');

        // Rellenar teléfono en login
        if (loginTelefono) loginTelefono.value = regTelefono.value.trim();
        if (loginPassword) loginPassword.value = '';
        if (regNombre) regNombre.value = '';
        if (regTelefono) regTelefono.value = '';
        if (regCorreo) regCorreo.value = '';
        if (regPassword) regPassword.value = '';
        if (regPassword2) regPassword2.value = '';

        irLogin();
      } catch (err) {
        console.error(err);
        setStatus('Error de comunicación con el servidor.', 'error');
      }
    });
  }

  // ====== EVENTOS HEADER / CUENTA / DROPDOWN ======
  if (btnAccount) {
    btnAccount.addEventListener('click', (e) => {
      e.stopPropagation(); // para que no cierre el menú inmediatamente
      if (!isLogged) {
        abrirLogin();
      } else {
        toggleAccountMenu();
      }
    });
  }

  if (accountMenuPerfil) {
    accountMenuPerfil.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarAccountMenu();
      mostrarCuenta(); // ahora SOLO cambia secciones, sin redirecciones
    });
  }

  if (accountMenuLogout) {
    accountMenuLogout.addEventListener('click', (e) => {
      e.stopPropagation();
      logout();
    });
  }

  // Cerrar dropdown si se hace click fuera
  document.addEventListener('click', () => {
    if (accountMenuOpen) {
      cerrarAccountMenu();
    }
  });

  if (btnSalirCuenta) {
    btnSalirCuenta.addEventListener('click', logout);
  }

  [
    { btn: menuCompras, section: 'compras' },
    { btn: menuFavoritos, section: 'favoritos' },
    { btn: menuPerfil, section: 'perfil' },
    { btn: menuDirecciones, section: 'direcciones' },
    { btn: menuPagos, section: 'pagos' }
  ].forEach(item => {
    item.btn?.addEventListener('click', () => activarPanelCuenta(item.section));
  });

  if (btnGuardarPerfil) {
    btnGuardarPerfil.addEventListener('click', guardarPerfil);
  }

  if (btnGuardarDireccion) {
    btnGuardarDireccion.addEventListener('click', guardarDireccion);
  }

  if (btnCancelarDireccion) {
    btnCancelarDireccion.addEventListener('click', limpiarFormularioDireccion);
  }

  if (btnGuardarPago) {
    btnGuardarPago.addEventListener('click', guardarPago);
  }

  if (btnCancelarPago) {
    btnCancelarPago.addEventListener('click', limpiarFormularioPago);
  }

  // Modal detalle pedido
  const btnCerrarModalPedido = document.getElementById('btnCerrarModalPedido');
  if (btnCerrarModalPedido) {
    btnCerrarModalPedido.addEventListener('click', cerrarModalDetallePedido);
  }
  const modalDetallePedido = document.getElementById('modalDetallePedido');
  if (modalDetallePedido) {
    modalDetallePedido.addEventListener('click', (e) => {
      if (e.target === modalDetallePedido) cerrarModalDetallePedido();
    });
  }

  if (btnCerrarLogin) {
    btnCerrarLogin.addEventListener('click', cerrarLogin);
  }

  if (overlayBackdrop) {
    overlayBackdrop.addEventListener('click', cerrarLogin);
  }

  if (linkInicio) {
    linkInicio.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarHome(); // siempre, ya no hay /cuenta ni otra página
    });
  }

  // ====== NAVEGACIÓN CATEGORÍAS ======
  const categoriasLinks = document.querySelectorAll('.rg-categoria-link');
  const categoriaTitulo = document.getElementById('categoriaTitulo');
  const btnVolverCategorias = document.getElementById('btnVolverCategorias');
  const categoriaFiltroContainer = document.getElementById('categoriaFiltroContainer');
  const productosCategoriaGrid = document.getElementById('productosCategoriaGrid');
  
  let categoriaPadreActual = null;
  let subcategoriaSeleccionada = null;
  let ordenActual = 'populares';
  let productosActualesAMostrar = [];

  function mostrarCategoria(slugCategoria) {
    console.log('mostrarCategoria:', { slugCategoria, homeSection, categoriaSection });
    
    if (homeSection) homeSection.classList.add('hidden');
    if (cuentaSection) cuentaSection.classList.add('hidden');
    if (carritoSection) carritoSection.classList.add('hidden');
    if (detalleSection) detalleSection.classList.add('hidden');
    if (checkoutSection) checkoutSection.classList.add('hidden');
    if (categoriaSection) categoriaSection.classList.remove('hidden');
    
    console.log('categoriaSection después:', categoriaSection?.className);
    
    cargarCategoriaPadre(slugCategoria);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function cargarCategoriaPadre(slug) {
    try {
      console.log('Cargando categoría padre:', slug);
      const res = await fetch(`/api/categorias/public/padre/${slug}`);
      console.log('Respuesta del servidor:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || 'Categoría no encontrada');
      }
      const data = await res.json();
      console.log('Datos de categoría:', data);
      
      categoriaPadreActual = data;
      
      if (categoriaTitulo) {
        categoriaTitulo.textContent = data.categoria.nombre;
      }
      
      // Renderizar filtro de subcategorías
      renderizarFiltroSubcategorias(data.subcategorias, data.productosDirectos);
      
      // Obtener todos los productos (combinando directos y de hijas)
      let todosLosProductos = [...data.productosDirectos];
      data.subcategorias.forEach(sub => {
        todosLosProductos = todosLosProductos.concat(sub.productos);
      });
      
      // Mostrar todos los productos de la categoría padre
      subcategoriaSeleccionada = null;
      ordenActual = 'populares';
      productosActualesAMostrar = todosLosProductos;
      renderizarProductosCategoría(todosLosProductos);
    } catch (err) {
      console.error('Error cargando categoría:', err);
      if (productosCategoriaGrid) {
        productosCategoriaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #dc2626;">Error: ' + err.message + '</p>';
      }
    }
  }

  function renderizarFiltroSubcategorias(subcategorias, productosDirectos) {
    console.log('Renderizando filtro:', { subcategorias, productosDirectos });
    console.log('categoriaFiltroContainer:', categoriaFiltroContainer);
    
    if (!categoriaFiltroContainer) {
      console.error('categoriaFiltroContainer es null');
      return;
    }
    
    categoriaFiltroContainer.innerHTML = '';
    
    // Botón "Todos" siempre aparece y está activo por defecto
    const btnTodos = document.createElement('button');
    btnTodos.className = 'categoria-filtro-btn categoria-filtro-btn-activo';
    btnTodos.textContent = 'Todos';
    btnTodos.addEventListener('click', () => {
      document.querySelectorAll('.categoria-filtro-btn').forEach(b => b.classList.remove('categoria-filtro-btn-activo'));
      btnTodos.classList.add('categoria-filtro-btn-activo');
      subcategoriaSeleccionada = null;
      
      // Combinar todos los productos
      let todosLosProductos = [...productosDirectos];
      subcategorias.forEach(sub => {
        todosLosProductos = todosLosProductos.concat(sub.productos);
      });
      productosActualesAMostrar = todosLosProductos;
      aplicarOrdenamiento();
    });
    categoriaFiltroContainer.appendChild(btnTodos);
    
    // Botones subcategorías
    subcategorias.forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'categoria-filtro-btn';
      btn.textContent = sub.nombre;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.categoria-filtro-btn').forEach(b => b.classList.remove('categoria-filtro-btn-activo'));
        btn.classList.add('categoria-filtro-btn-activo');
        subcategoriaSeleccionada = sub;
        productosActualesAMostrar = sub.productos;
        aplicarOrdenamiento();
      });
      categoriaFiltroContainer.appendChild(btn);
    });
  }

  function aplicarOrdenamiento() {
    let productosOrdenados = [...productosActualesAMostrar];
    
    switch (ordenActual) {
      case 'precio-asc':
        productosOrdenados.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
        break;
      case 'precio-desc':
        productosOrdenados.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
        break;
      case 'nombre-asc':
        productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        productosOrdenados.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'populares':
      default:
        // Mantener el orden original (más popular por defecto)
        break;
    }
    
    renderizarProductosCategoría(productosOrdenados);
  }

  function renderizarProductosCategoría(productos) {
    console.log('Renderizando productos:', { cantidad: productos.length, productosCategoriaGrid });
    
    if (!productosCategoriaGrid) {
      console.error('productosCategoriaGrid es null');
      return;
    }
    
    productosCategoriaGrid.innerHTML = '';
    
    if (productos.length === 0) {
      productosCategoriaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">No hay productos disponibles</p>';
      return;
    }
    
    productos.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'producto-card';
      card.dataset.id = producto.id;
      
      const favBtn = document.createElement('button');
      favBtn.className = 'fav-toggle-btn';
      favBtn.innerHTML = '<span class="material-symbols-outlined">favorite</span>';
      favBtn.classList.toggle('fav-on', esFavorito(producto.id));
      favBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const activo = await toggleFavorito(producto.id);
        favBtn.classList.toggle('fav-on', activo);
      });
      
      const imagenBox = document.createElement('div');
      imagenBox.className = 'producto-imagen-box';
      
      const img = document.createElement('img');
      img.className = 'producto-imagen';
      img.src = producto.imagen_url || '/img/no-image.png';
      img.alt = producto.nombre;
      img.onerror = () => { img.src = '/img/no-image.png'; };
      imagenBox.appendChild(img);
      
      const info = document.createElement('div');
      info.className = 'producto-info';
      
      const nombre = document.createElement('h3');
      nombre.className = 'producto-nombre';
      nombre.textContent = producto.nombre;
      
      const precio = document.createElement('p');
      precio.className = 'producto-precio';
      precio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;
      
      const existencia = document.createElement('p');
      existencia.className = producto.existencia > 0 ? 'producto-existencia' : 'producto-existencia sin-stock';
      existencia.textContent = producto.existencia > 0 ? 'Disponible' : 'Sin stock';
      
      info.appendChild(nombre);
      info.appendChild(precio);
      info.appendChild(existencia);
      
      card.appendChild(favBtn);
      card.appendChild(imagenBox);
      card.appendChild(info);
      
      card.addEventListener('click', () => mostrarDetalleProducto(producto.id));
      
      productosCategoriaGrid.appendChild(card);
    });
  }

  // Listener para el select de ordenamiento
  const selectOrdenamiento = document.getElementById('selectOrdenamiento');
  if (selectOrdenamiento) {
    selectOrdenamiento.addEventListener('change', (e) => {
      ordenActual = e.target.value;
      aplicarOrdenamiento();
    });
  }

  categoriasLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = link.dataset.categoriaSlug;
      
      // Actualizar navegación activa
      document.querySelectorAll('.rg-categoria-link, #linkInicio').forEach(l => {
        l.classList.remove('rg-nav-link-active');
      });
      link.classList.add('rg-nav-link-active');
      
      // Resetear ordenamiento
      if (selectOrdenamiento) selectOrdenamiento.value = 'populares';
      ordenActual = 'populares';
      
      mostrarCategoria(slug);
    });
  });

  if (btnVolverCategorias) {
    btnVolverCategorias.addEventListener('click', () => {
      mostrarHome();
      if (linkInicio) linkInicio.classList.add('rg-nav-link-active');
      document.querySelectorAll('.rg-categoria-link').forEach(l => {
        l.classList.remove('rg-nav-link-active');
      });
    });
  }

  // ====== BANNER CAROUSEL ======
  let banners = [];
  let currentBannerIndex = 0;
  let bannerInterval = null;

  const bannerSlides = document.getElementById('bannerSlides');
  const bannerDots = document.getElementById('bannerDots');
  const bannerPrev = document.getElementById('bannerPrev');
  const bannerNext = document.getElementById('bannerNext');

  async function cargarBanners() {
    try {
      const res = await fetch('/api/banners');
      if (!res.ok) {
        console.error('Error al cargar banners');
        return;
      }
      banners = await res.json();
      renderizarBanners();
      iniciarBannerAutoplay();
    } catch (err) {
      console.error('Error cargando banners:', err);
    }
  }

  function renderizarBanners() {
    if (!bannerSlides || !bannerDots || banners.length === 0) return;

    // Limpiar
    bannerSlides.innerHTML = '';
    bannerDots.innerHTML = '';

    // Crear slides
    banners.forEach((banner, index) => {
      const slide = document.createElement('div');
      slide.className = 'banner-slide';
      
      const img = document.createElement('img');
      img.src = banner.imagen_url;
      img.alt = banner.titulo || 'Banner';
      
      if (banner.link) {
        slide.style.cursor = 'pointer';
        slide.addEventListener('click', () => {
          window.open(banner.link, '_blank');
        });
      }
      
      slide.appendChild(img);
      bannerSlides.appendChild(slide);

      // Crear dot
      const dot = document.createElement('button');
      dot.className = 'banner-dot';
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => irABanner(index));
      bannerDots.appendChild(dot);
    });
  }

  function irABanner(index) {
    if (!bannerSlides) return;
    currentBannerIndex = index;
    const offset = -index * 100;
    bannerSlides.style.transform = `translateX(${offset}%)`;
    
    // Actualizar dots
    const dots = bannerDots?.querySelectorAll('.banner-dot');
    dots?.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function siguienteBanner() {
    if (banners.length === 0) return;
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    irABanner(currentBannerIndex);
  }

  function anteriorBanner() {
    if (banners.length === 0) return;
    currentBannerIndex = (currentBannerIndex - 1 + banners.length) % banners.length;
    irABanner(currentBannerIndex);
  }

  function iniciarBannerAutoplay() {
    if (bannerInterval) clearInterval(bannerInterval);
    if (banners.length > 1) {
      bannerInterval = setInterval(siguienteBanner, 5000);
    }
  }

  if (bannerPrev) bannerPrev.addEventListener('click', () => {
    anteriorBanner();
    iniciarBannerAutoplay();
  });

  if (bannerNext) bannerNext.addEventListener('click', () => {
    siguienteBanner();
    iniciarBannerAutoplay();
  });

  // ====== PRODUCTOS CAROUSEL ======
  let productos = [];
  const productosContainer = document.getElementById('productosContainer');
  const productoPrev = document.getElementById('productoPrev');
  const productoNext = document.getElementById('productoNext');

  async function cargarProductos() {
    try {
      const res = await fetch('/api/public/articulos/public');
      if (!res.ok) {
        console.error('Error al cargar productos');
        return;
      }
      productos = await res.json();
      renderizarProductos();
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
  }

  function renderizarProductos() {
    if (!productosContainer) return;
    
    productosContainer.innerHTML = '';

    if (productos.length === 0) {
      productosContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #6b7280;">No hay productos disponibles</p>';
      return;
    }

    productos.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'producto-card';
      card.dataset.id = producto.id;

      const favBtn = document.createElement('button');
      favBtn.className = 'fav-toggle-btn';
      favBtn.innerHTML = '<span class="material-symbols-outlined">favorite</span>';
      favBtn.classList.toggle('fav-on', esFavorito(producto.id));
      favBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const activo = await toggleFavorito(producto.id);
        favBtn.classList.toggle('fav-on', activo);
      });

      const imagenBox = document.createElement('div');
      imagenBox.className = 'producto-imagen-box';
      
      const img = document.createElement('img');
      img.className = 'producto-imagen';
      img.src = producto.imagen_url || '/img/no-image.png';
      img.alt = producto.nombre;
      img.onerror = () => { img.src = '/img/no-image.png'; };
      
      imagenBox.appendChild(img);

      const info = document.createElement('div');
      info.className = 'producto-info';
      
      const nombre = document.createElement('h3');
      nombre.className = 'producto-nombre';
      nombre.textContent = producto.nombre;
      
      const precio = document.createElement('p');
      precio.className = 'producto-precio';
      precio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;
      
      const existencia = document.createElement('p');
      existencia.className = producto.existencia > 0 ? 'producto-existencia' : 'producto-existencia sin-stock';
      existencia.textContent = producto.existencia > 0 ? 'Disponible' : 'Sin stock';

      info.appendChild(nombre);
      info.appendChild(precio);
      info.appendChild(existencia);

      card.appendChild(favBtn);
      card.appendChild(imagenBox);
      card.appendChild(info);

      card.addEventListener('click', () => mostrarDetalleProducto(producto.id));

      productosContainer.appendChild(card);
    });

    actualizarNavegacionProductos();
  }

  function actualizarNavegacionProductos() {
    if (!productosContainer || !productoPrev || !productoNext) return;
    const scrollable = productosContainer.scrollWidth > productosContainer.clientWidth + 5;
    productoPrev.classList.toggle('hidden', !scrollable);
    productoNext.classList.toggle('hidden', !scrollable);
  }

  function scrollProductos(direction) {
    if (!productosContainer) return;
    const firstCard = productosContainer.querySelector('.producto-card');
    const styles = productosContainer ? getComputedStyle(productosContainer) : null;
    const gap = styles ? parseInt(styles.columnGap || styles.gap || '0', 10) : 0;
    const cardWidth = firstCard ? firstCard.offsetWidth : productosContainer.clientWidth;
    const amount = cardWidth + gap;
    productosContainer.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  if (productoPrev) {
    productoPrev.addEventListener('click', () => scrollProductos(-1));
  }

  if (productoNext) {
    productoNext.addEventListener('click', () => scrollProductos(1));
  }

  if (productosContainer) {
    productosContainer.addEventListener('scroll', actualizarNavegacionProductos);
    window.addEventListener('resize', actualizarNavegacionProductos);
  }

  // ====== DETALLE PRODUCTO ======
  const btnVolverHome = document.getElementById('btnVolverHome');
  
  const detalleImagen = document.getElementById('detalleImagen');
  const detalleNombre = document.getElementById('detalleNombre');
  const detalleCodigo = document.getElementById('detalleCodigo');
  const detallePrecio = document.getElementById('detallePrecio');
  const detalleExistencia = document.getElementById('detalleExistencia');
  const detalleDescripcion = document.getElementById('detalleDescripcion');
  
  const inputCantidad = document.getElementById('inputCantidad');
  const btnRestarCantidad = document.getElementById('btnRestarCantidad');
  const btnSumarCantidad = document.getElementById('btnSumarCantidad');
  const btnAgregarCarrito = document.getElementById('btnAgregarCarrito');
  const btnFavDetalle = document.getElementById('btnFavDetalle');

  let productoActual = null;

  async function mostrarDetalleProducto(id) {
    try {
      const res = await fetch(`/api/public/articulos/public/${id}`);
      if (!res.ok) {
        alert('Error al cargar el producto');
        return;
      }
      productoActual = await res.json();
      
      // Ocultar home y cuenta, mostrar detalle
      if (homeSection) homeSection.classList.add('hidden');
      if (cuentaSection) cuentaSection.classList.add('hidden');
      if (categoriaSection) categoriaSection.classList.add('hidden');
      if (detalleSection) detalleSection.classList.remove('hidden');
      
      // Llenar datos
      if (detalleImagen) {
        detalleImagen.src = productoActual.imagen_url || '/img/no-image.png';
        detalleImagen.alt = productoActual.nombre;
        detalleImagen.onerror = () => { detalleImagen.src = '/img/no-image.png'; };
      }
      if (detalleNombre) detalleNombre.textContent = productoActual.nombre;
      if (detalleCodigo) detalleCodigo.textContent = `Código: ${productoActual.codigo}`;
      if (detallePrecio) detallePrecio.textContent = `$${parseFloat(productoActual.precio).toFixed(2)}`;
      
      if (detalleExistencia) {
        detalleExistencia.textContent = productoActual.existencia > 0 ? 'En stock' : 'Sin stock';
        detalleExistencia.className = productoActual.existencia > 0 ? 'detalle-existencia' : 'detalle-existencia sin-stock';
      }
      
      if (detalleDescripcion) {
        detalleDescripcion.textContent = productoActual.descripcion || 'Sin descripción disponible.';
      }
      
      if (inputCantidad) inputCantidad.value = 1;
      
      // Deshabilitar botón si no hay stock
      if (btnAgregarCarrito) {
        btnAgregarCarrito.disabled = productoActual.existencia <= 0;
      }

      if (btnFavDetalle) {
        btnFavDetalle.classList.toggle('fav-on', esFavorito(productoActual.id));
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error mostrando detalle:', err);
      alert('Error al cargar el producto');
    }
  }

  if (btnVolverHome) {
    btnVolverHome.addEventListener('click', () => {
      if (detalleSection) detalleSection.classList.add('hidden');
      if (homeSection) homeSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnRestarCantidad && inputCantidad) {
    btnRestarCantidad.addEventListener('click', () => {
      let val = parseInt(inputCantidad.value, 10);
      if (val > 1) inputCantidad.value = val - 1;
    });
  }

  if (btnSumarCantidad && inputCantidad) {
    btnSumarCantidad.addEventListener('click', () => {
      let val = parseInt(inputCantidad.value, 10);
      if (productoActual && val < productoActual.existencia) {
        inputCantidad.value = val + 1;
      }
    });
  }

  if (btnAgregarCarrito) {
    btnAgregarCarrito.addEventListener('click', async () => {
      const cantidad = parseInt(inputCantidad?.value || 1, 10);
      
      if (isLogged) {
        // Usuario logueado: agregar al servidor
        const exito = await agregarAlCarritoServidor(productoActual.id, cantidad);
        if (exito) {
          mostrarNotificacion('Producto agregado al carrito');
        }
      } else {
        // Usuario no logueado: agregar a localStorage
        agregarAlCarritoLocal(productoActual.id, cantidad, productoActual.nombre, productoActual.precio, productoActual.imagen_url);
        mostrarNotificacion('Producto agregado al carrito');
      }
      
      await actualizarBadgeCarrito();
    });
  }

  if (btnFavDetalle) {
    btnFavDetalle.addEventListener('click', async () => {
      if (!productoActual) return;
      const activo = await toggleFavorito(productoActual.id);
      btnFavDetalle.classList.toggle('fav-on', activo);
    });
  }

  // ====== CARRITO (localStorage para no logueados, servidor para logueados) ======
  
  function obtenerCarritoLocal() {
    const carrito = localStorage.getItem('carrito_temporal');
    return carrito ? JSON.parse(carrito) : {};
  }

  function guardarCarritoLocal(carrito) {
    localStorage.setItem('carrito_temporal', JSON.stringify(carrito));
  }

  function agregarAlCarritoLocal(id, cantidad, nombre, precio, imagen) {
    const carrito = obtenerCarritoLocal();
    
    if (carrito[id]) {
      carrito[id].cantidad += cantidad;
    } else {
      carrito[id] = {
        id,
        nombre,
        precio: parseFloat(precio),
        imagen: imagen || '/img/no-image.png',
        cantidad
      };
    }
    
    guardarCarritoLocal(carrito);
  }

  function eliminarDelCarritoLocal(id) {
    const carrito = obtenerCarritoLocal();
    delete carrito[id];
    guardarCarritoLocal(carrito);
  }

  function vaciarCarritoLocal() {
    localStorage.removeItem('carrito_temporal');
  }

  async function agregarAlCarritoServidor(articulo_id, cantidad) {
    try {
      const res = await fetch('/api/carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ articulo_id, cantidad })
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarNotificacion(data.mensaje || 'Error al agregar al carrito');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      mostrarNotificacion('Error de comunicación con el servidor');
      return false;
    }
  }

  async function eliminarDelCarritoServidor(articulo_id) {
    try {
      const res = await fetch(`/api/carrito/${articulo_id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        console.error('Error al eliminar del carrito');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error:', err);
      return false;
    }
  }

  async function actualizarCantidadServidor(articulo_id, cantidad) {
    try {
      const res = await fetch(`/api/carrito/${articulo_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cantidad })
      });

      if (!res.ok) {
        console.error('Error al actualizar cantidad');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error:', err);
      return false;
    }
  }

  async function actualizarBadgeCarrito() {
    if (!btnCart) return;

    if (isLogged) {
      // Obtener del servidor
      try {
        const res = await fetch('/api/carrito', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          const totalItems = data.items.reduce((sum, item) => sum + item.cantidad, 0);
          const badge = btnCart.querySelector('.cart-badge');
          if (totalItems > 0) {
            if (badge) {
              badge.textContent = totalItems;
            } else {
              const newBadge = document.createElement('span');
              newBadge.className = 'cart-badge';
              newBadge.textContent = totalItems;
              btnCart.appendChild(newBadge);
            }
          } else if (badge) {
            badge.remove();
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Obtener del localStorage
      const carrito = obtenerCarritoLocal();
      const totalItems = Object.values(carrito).reduce((sum, item) => sum + item.cantidad, 0);
      const badge = btnCart.querySelector('.cart-badge');
      
      if (totalItems > 0) {
        if (badge) {
          badge.textContent = totalItems;
        } else {
          const newBadge = document.createElement('span');
          newBadge.className = 'cart-badge';
          newBadge.textContent = totalItems;
          btnCart.appendChild(newBadge);
        }
      } else if (badge) {
        badge.remove();
      }
    }
  }

  async function migraCarritoLocalAlServidor() {
    const carritoLocal = obtenerCarritoLocal();
    
    for (const [id, item] of Object.entries(carritoLocal)) {
      await agregarAlCarritoServidor(parseInt(id), item.cantidad);
    }
    
    vaciarCarritoLocal();
  }

  async function renderizarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    const carritoVacio = document.getElementById('carritoVacio');
    const carritoResumen = document.getElementById('carritoResumen');
    const resumenSubtotal = document.getElementById('resumenSubtotal');
    const resumenEnvio = document.getElementById('resumenEnvio');
    const resumenTotal = document.getElementById('resumenTotal');

    let carrito = {};
    let total = 0;

    if (isLogged) {
      // Obtener carrito del servidor
      try {
        const res = await fetch('/api/carrito', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Carrito del servidor:', data);
          carrito = {};
          data.items.forEach(item => {
            carrito[item.articulo_id] = {
              id: item.articulo_id,
              nombre: item.nombre,
              precio: parseFloat(item.precio_unit),
              imagen: item.imagen_url || '/img/no-image.png',
              cantidad: item.cantidad
            };
            total += parseFloat(item.precio_unit) * item.cantidad;
          });
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Obtener carrito del localStorage
      carrito = obtenerCarritoLocal();
      console.log('Carrito del localStorage:', carrito);
      Object.values(carrito).forEach(item => {
        const precio = parseFloat(item.precio);
        total += precio * item.cantidad;
      });
    }

    // Mostrar/ocultar carrito vacío
    const hayItems = Object.keys(carrito).length > 0;
    if (carritoVacio) {
      carritoVacio.classList.toggle('hidden', hayItems);
    }
    if (carritoResumen) {
      carritoResumen.classList.toggle('hidden', !hayItems);
    }

    // Renderizar items
    if (carritoItems) {
      carritoItems.innerHTML = '';
      Object.values(carrito).forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'carrito-item';
        const precio = parseFloat(item.precio);
        itemEl.innerHTML = `
          <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-imagen">
          <div class="carrito-item-info">
            <div class="carrito-item-nombre">${item.nombre}</div>
            <div class="carrito-item-precio">$${precio.toFixed(2)}</div>
          </div>
          <div class="carrito-item-cantidad">
            <button type="button" class="btn-cantidad-menos" data-id="${item.id}">-</button>
            <input type="number" value="${item.cantidad}" min="1" data-id="${item.id}" class="input-cantidad">
            <button type="button" class="btn-cantidad-mas" data-id="${item.id}">+</button>
          </div>
          <div class="carrito-item-subtotal">
            <div class="carrito-item-subtotal-valor">$${(precio * item.cantidad).toFixed(2)}</div>
            <button type="button" class="carrito-item-eliminar" data-id="${item.id}">Eliminar</button>
          </div>
        `;

        // Event listeners para los botones del item
        itemEl.querySelector('.btn-cantidad-menos').addEventListener('click', () => {
          actualizarCantidadItem(item.id, item.cantidad - 1);
        });

        itemEl.querySelector('.btn-cantidad-mas').addEventListener('click', () => {
          actualizarCantidadItem(item.id, item.cantidad + 1);
        });

        itemEl.querySelector('.input-cantidad').addEventListener('change', (e) => {
          const nuevaCantidad = parseInt(e.target.value, 10);
          if (nuevaCantidad > 0) {
            actualizarCantidadItem(item.id, nuevaCantidad);
          } else {
            e.target.value = item.cantidad;
          }
        });

        itemEl.querySelector('.carrito-item-eliminar').addEventListener('click', () => {
          eliminarItemCarrito(item.id);
        });

        carritoItems.appendChild(itemEl);
      });
    }

    // Actualizar resumen (sin envío en el carrito)
    if (resumenTotal) resumenTotal.textContent = `$${total.toFixed(2)}`;
  }

  async function actualizarCantidadItem(id, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
      eliminarItemCarrito(id);
      return;
    }

    if (isLogged) {
      await actualizarCantidadServidor(id, nuevaCantidad);
    } else {
      const carrito = obtenerCarritoLocal();
      if (carrito[id]) {
        carrito[id].cantidad = nuevaCantidad;
        guardarCarritoLocal(carrito);
      }
    }

    actualizarBadgeCarrito();
    await renderizarCarrito();
  }

  async function eliminarItemCarrito(id) {
    if (isLogged) {
      await eliminarDelCarritoServidor(id);
    } else {
      eliminarDelCarritoLocal(id);
    }

    actualizarBadgeCarrito();
    await renderizarCarrito();
  }

  if (btnCart) {
    btnCart.addEventListener('click', () => {
      mostrarCarrito();
    });
  }

  // ====== CARRITO BUTTONS ======
  const btnVolverDelCarrito = document.getElementById('btnVolverDelCarrito');
  const btnVolverAlShopDesdeVacio = document.getElementById('btnVolverAlShopDesdeVacio');
  const btnCheckout = document.getElementById('btnCheckout');

  if (btnVolverDelCarrito) {
    btnVolverDelCarrito.addEventListener('click', () => {
      mostrarHome();
    });
  }

  if (btnVolverAlShopDesdeVacio) {
    btnVolverAlShopDesdeVacio.addEventListener('click', () => {
      mostrarHome();
    });
  }

  if (btnCheckout) {
    btnCheckout.addEventListener('click', async () => {
      if (!isLogged) {
        mostrarNotificacion('Inicia sesión para continuar con tu compra');
        setTimeout(() => abrirLogin(), 500);
        return;
      }

      // Verificar que hay productos en el carrito
      const carrito = isLogged ? await obtenerCarritoServidor() : obtenerCarritoLocal();
      if (!carrito || Object.keys(carrito).length === 0) {
        mostrarNotificacion('Tu carrito está vacío');
        return;
      }

      mostrarCheckout();
    });
  }

  // ====== CHECKOUT ======
  const btnVolverDelCheckout = document.getElementById('btnVolverDelCheckout');
  const btnConfirmarPedido = document.getElementById('btnConfirmarPedido');
  const checkoutDireccionGuardada = document.getElementById('checkoutDireccionGuardada');
  const checkoutMetodoGuardado = document.getElementById('checkoutMetodoGuardado');
  const checkoutMetodoPago = document.getElementById('checkoutMetodoPago');
  const tarjetaFields = document.getElementById('tarjetaFields');

  async function obtenerCarritoServidor() {
    try {
      const res = await fetch('/api/carrito', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const carrito = {};
        data.items.forEach(item => {
          carrito[item.articulo_id] = {
            id: item.articulo_id,
            nombre: item.nombre,
            precio: parseFloat(item.precio_unit),
            imagen: item.imagen_url || '/img/no-image.png',
            cantidad: item.cantidad
          };
        });
        return carrito;
      }
    } catch (err) {
      console.error(err);
    }
    return {};
  }

  function sincronizarSelectDirecciones() {
    if (!checkoutDireccionGuardada) return;
    checkoutDireccionGuardada.innerHTML = '<option value="">-- Selecciona --</option><option value="nueva">Nueva dirección</option>';
    direcciones.forEach(dir => {
      const opt = document.createElement('option');
      opt.value = dir.id;
      opt.textContent = `${dir.alias || 'Dirección'} · ${dir.cp}`;
      checkoutDireccionGuardada.appendChild(opt);
    });
  }

  function sincronizarSelectMetodos() {
    if (!checkoutMetodoGuardado) return;
    checkoutMetodoGuardado.innerHTML = '<option value="">-- Selecciona --</option><option value="nueva">Nuevo método</option>';
    metodosPago.forEach(mp => {
      const opt = document.createElement('option');
      opt.value = mp.id;
      const label = mp.tipo === 'tarjeta' ? `${mp.alias || 'Tarjeta'} ··· ${mp.ultimo4 || 'XXXX'}` : `${mp.alias || mp.tipo}`;
      opt.textContent = label;
      checkoutMetodoGuardado.appendChild(opt);
    });
  }

  function mostrarCheckout() {
    if (homeSection) homeSection.classList.add('hidden');
    if (cuentaSection) cuentaSection.classList.add('hidden');
    if (detalleSection) detalleSection.classList.add('hidden');
    if (categoriaSection) categoriaSection.classList.add('hidden');
    if (carritoSection) carritoSection.classList.add('hidden');
    if (checkoutSection) checkoutSection.classList.remove('hidden');
    if (linkInicio) linkInicio.classList.remove('rg-nav-link-active');

    cargarDirecciones();
    cargarMetodosPago();
    renderizarCheckout();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function renderizarCheckout() {
    const carrito = isLogged ? await obtenerCarritoServidor() : obtenerCarritoLocal();
    const items = Object.values(carrito);

    if (isLogged) {
      sincronizarSelectDirecciones();
      sincronizarSelectMetodos();
    }
    
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.precio * item.cantidad;
    });

    const costoEnvio = subtotal >= 1200 ? 0 : 100;
    const total = subtotal + costoEnvio;

    // Renderizar lista de productos
    const checkoutItemsList = document.getElementById('checkoutItemsList');
    if (checkoutItemsList) {
      checkoutItemsList.innerHTML = '';
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
          <img src="${item.imagen}" alt="${item.nombre}" class="checkout-item-img">
          <div class="checkout-item-info">
            <div class="checkout-item-nombre">${item.nombre}</div>
            <div class="checkout-item-cantidad">Cantidad: ${item.cantidad}</div>
          </div>
          <div class="checkout-item-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
        `;
        checkoutItemsList.appendChild(div);
      });
    }

    // Actualizar totales
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutEnvio = document.getElementById('checkoutEnvio');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const checkoutEnvioGratis = document.getElementById('checkoutEnvioGratis');

    if (checkoutSubtotal) checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (checkoutEnvio) checkoutEnvio.textContent = costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toFixed(2)}`;
    if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
    
    if (checkoutEnvioGratis) {
      checkoutEnvioGratis.classList.toggle('hidden', costoEnvio > 0);
    }
  }

  if (checkoutMetodoPago) {
    checkoutMetodoPago.addEventListener('change', () => {
      if (tarjetaFields) {
        tarjetaFields.classList.toggle('hidden', checkoutMetodoPago.value !== 'tarjeta');
      }
    });
  }

  function aplicarDireccionSeleccionada() {
    if (!checkoutDireccionGuardada) return;
    const valor = checkoutDireccionGuardada.value;
    if (!valor || valor === 'nueva') {
      return;
    }
    const dir = direcciones.find(d => String(d.id) === String(valor));
    if (!dir) return;
    document.getElementById('checkoutCalle').value = dir.calle || '';
    document.getElementById('checkoutColonia').value = dir.colonia || '';
    document.getElementById('checkoutCP').value = dir.cp || '';
    document.getElementById('checkoutCiudad').value = dir.ciudad || '';
    document.getElementById('checkoutEstado').value = dir.estado || '';
    document.getElementById('checkoutReferencias').value = dir.referencias || '';
  }

  function aplicarMetodoSeleccionado() {
    if (!checkoutMetodoGuardado) return;
    const valor = checkoutMetodoGuardado.value;
    if (!valor || valor === 'nueva') {
      checkoutMetodoPago.disabled = false;
      tarjetaFields?.classList.toggle('hidden', checkoutMetodoPago.value !== 'tarjeta');
      return;
    }
    const mp = metodosPago.find(m => String(m.id) === String(valor));
    if (!mp) return;
    checkoutMetodoPago.value = mp.tipo;
    checkoutMetodoPago.disabled = true;
    tarjetaFields?.classList.add('hidden');
  }

  if (checkoutDireccionGuardada) {
    checkoutDireccionGuardada.addEventListener('change', aplicarDireccionSeleccionada);
  }

  if (checkoutMetodoGuardado) {
    checkoutMetodoGuardado.addEventListener('change', aplicarMetodoSeleccionado);
  }

  // Auto-formato de campos de tarjeta
  const checkoutNumeroTarjeta = document.getElementById('checkoutNumeroTarjeta');
  const checkoutVencimiento = document.getElementById('checkoutVencimiento');
  const checkoutCVV = document.getElementById('checkoutCVV');

  if (checkoutNumeroTarjeta) {
    checkoutNumeroTarjeta.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = value;
    });
  }

  if (pagoNumero) {
    pagoNumero.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = value;
    });
  }

  if (checkoutVencimiento) {
    checkoutVencimiento.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  if (pagoExpiracion) {
    pagoExpiracion.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  if (checkoutCVV) {
    checkoutCVV.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });
  }

  if (btnVolverDelCheckout) {
    btnVolverDelCheckout.addEventListener('click', () => {
      mostrarCarrito();
    });
  }

  function validarCheckout() {
    let ok = true;
    
    // Limpiar errores
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

    // Validar dirección
    const dirGuardada = checkoutDireccionGuardada?.value;
    if (!dirGuardada || dirGuardada === 'nueva') {
      const calle = document.getElementById('checkoutCalle').value.trim();
      const colonia = document.getElementById('checkoutColonia').value.trim();
      const cp = document.getElementById('checkoutCP').value.trim();
      const ciudad = document.getElementById('checkoutCiudad').value.trim();
      const estado = document.getElementById('checkoutEstado').value.trim();

      if (!calle) {
        document.getElementById('errorCalle').textContent = 'Campo requerido';
        ok = false;
      }
      if (!colonia) {
        document.getElementById('errorColonia').textContent = 'Campo requerido';
        ok = false;
      }
      if (!cp || !/^\d{5}$/.test(cp)) {
        document.getElementById('errorCP').textContent = 'Código postal de 5 dígitos';
        ok = false;
      }
      if (!ciudad) {
        document.getElementById('errorCiudad').textContent = 'Campo requerido';
        ok = false;
      }
      if (!estado) {
        document.getElementById('errorEstado').textContent = 'Campo requerido';
        ok = false;
      }
    }

    // Validar método de pago
    const metodoGuardado = checkoutMetodoGuardado?.value;
    const metodoPago = metodoGuardado && metodoGuardado !== 'nueva'
      ? (metodosPago.find(m => String(m.id) === String(metodoGuardado))?.tipo || '')
      : document.getElementById('checkoutMetodoPago').value;

    if (!metodoPago) {
      document.getElementById('errorMetodoPago').textContent = 'Selecciona un método de pago';
      ok = false;
    }

    // Si es tarjeta y no es método guardado, validar campos
    if (metodoPago === 'tarjeta' && (!metodoGuardado || metodoGuardado === 'nueva')) {
      const numeroTarjeta = document.getElementById('checkoutNumeroTarjeta').value.replace(/\s/g, '');
      const vencimiento = document.getElementById('checkoutVencimiento').value;
      const cvv = document.getElementById('checkoutCVV').value;

      if (!numeroTarjeta || !/^\d{16}$/.test(numeroTarjeta)) {
        document.getElementById('errorNumeroTarjeta').textContent = 'Número de tarjeta inválido';
        ok = false;
      }
      if (!vencimiento || !/^\d{2}\/\d{2}$/.test(vencimiento)) {
        document.getElementById('errorVencimiento').textContent = 'Formato MM/AA';
        ok = false;
      }
      if (!cvv || !/^\d{3}$/.test(cvv)) {
        document.getElementById('errorCVV').textContent = 'CVV de 3 dígitos';
        ok = false;
      }
    }

    return ok;
  }

  if (btnConfirmarPedido) {
    btnConfirmarPedido.addEventListener('click', async () => {
      if (!validarCheckout()) {
        mostrarNotificacion('Completa todos los campos requeridos');
        return;
      }

      const direccion = {
        calle: document.getElementById('checkoutCalle').value.trim(),
        colonia: document.getElementById('checkoutColonia').value.trim(),
        cp: document.getElementById('checkoutCP').value.trim(),
        ciudad: document.getElementById('checkoutCiudad').value.trim(),
        estado: document.getElementById('checkoutEstado').value.trim(),
        referencias: document.getElementById('checkoutReferencias').value.trim()
      };

      const dirGuardada = checkoutDireccionGuardada?.value;
      const metodoGuardado = checkoutMetodoGuardado?.value;
      const metodo_pago = metodoGuardado && metodoGuardado !== 'nueva'
        ? (metodosPago.find(m => String(m.id) === String(metodoGuardado))?.tipo || '')
        : document.getElementById('checkoutMetodoPago').value;

      const payload = {
        direccion,
        metodo_pago
      };

      if (dirGuardada && dirGuardada !== 'nueva') {
        payload.direccion_id = dirGuardada;
      }
      if (metodoGuardado && metodoGuardado !== 'nueva') {
        payload.metodo_id = metodoGuardado;
      }

      try {
        btnConfirmarPedido.disabled = true;
        btnConfirmarPedido.textContent = 'Procesando...';

        const res = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
          mostrarNotificacion(data.mensaje || 'Error al crear el pedido');
          btnConfirmarPedido.disabled = false;
          btnConfirmarPedido.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Confirmar y pagar';
          return;
        }
        // Mensaje según método de pago
        if (metodo_pago === 'tarjeta') {
          mostrarNotificacion('Pago confirmado. ¡Pedido creado exitosamente!');
        } else {
          mostrarNotificacion('Pedido generado. Tu pago queda pendiente de confirmación.');
        }
        
        // Actualizar badge del carrito
        await actualizarBadgeCarrito();

        // Limpiar formulario
        document.getElementById('checkoutCalle').value = '';
        document.getElementById('checkoutColonia').value = '';
        document.getElementById('checkoutCP').value = '';
        document.getElementById('checkoutCiudad').value = '';
        document.getElementById('checkoutEstado').value = '';
        document.getElementById('checkoutReferencias').value = '';
        document.getElementById('checkoutMetodoPago').value = '';
        if (checkoutDireccionGuardada) checkoutDireccionGuardada.value = '';
        if (checkoutMetodoGuardado) checkoutMetodoGuardado.value = '';
        if (checkoutMetodoPago) checkoutMetodoPago.disabled = false;
        if (tarjetaFields) tarjetaFields.classList.add('hidden');

        // Regresar al home después de 2 segundos
        setTimeout(() => {
          mostrarHome();
        }, 2000);

      } catch (err) {
        console.error('Error al crear pedido:', err);
        mostrarNotificacion('Error de comunicación con el servidor');
      } finally {
        btnConfirmarPedido.disabled = false;
        btnConfirmarPedido.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Confirmar y pagar';
      }
    });
  }

  // ====== INIT ======
  (async function init() {
    await actualizarSesionDesdeServidor();
    await cargarBanners();
    await cargarProductos();
    
    // Si el usuario acaba de iniciar sesión y tenía carrito local, migrar
    if (isLogged && clienteActual) {
      const carritoLocal = obtenerCarritoLocal();
      if (Object.keys(carritoLocal).length > 0) {
        console.log('Migrando carrito local al servidor...');
        await migraCarritoLocalAlServidor();
      }
    }
    
    actualizarBadgeCarrito();
    mostrarHome();
  })();
});
