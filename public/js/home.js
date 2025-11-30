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
  const homeSection   = document.getElementById('homeSection');
  const cuentaSection = document.getElementById('cuentaSection'); // ahora SÍ existe en la misma página

  // Datos de la sección cuenta
  const saludoNombre  = document.getElementById('saludoNombre');
  const cuentaNumero  = document.getElementById('cuentaNumero');
  const datoNombre    = document.getElementById('datoNombre');
  const datoApellidos = document.getElementById('datoApellidos');
  const datoEmail     = document.getElementById('datoEmail');
  const datoTelefono  = document.getElementById('datoTelefono');
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
    if (homeSection)   homeSection.classList.remove('hidden');
    if (cuentaSection) cuentaSection.classList.add('hidden');
    if (linkInicio)    linkInicio.classList.add('rg-nav-link-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mostrarCuenta() {
    if (!isLogged || !clienteActual) {
      abrirLogin();
      return;
    }

    if (homeSection)   homeSection.classList.add('hidden');
    if (cuentaSection) cuentaSection.classList.remove('hidden');
    if (linkInicio)    linkInicio.classList.remove('rg-nav-link-active');

    pintarCuenta();
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
    actualizarHeaderCuenta();
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

  if (btnCart) {
    btnCart.addEventListener('click', () => {
      alert('La cesta se implementará más adelante');
    });
  }

  if (btnSalirCuenta) {
    btnSalirCuenta.addEventListener('click', logout);
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

  // ====== INIT ======
  (async function init() {
    await actualizarSesionDesdeServidor();
    // Siempre arrancamos mostrando el home en la SPA
    mostrarHome();
  })();
});
