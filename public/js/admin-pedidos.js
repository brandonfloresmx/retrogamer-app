// public/js/admin-pedidos.js

let pedidosData = [];

async function cargarPedidos() {
  try {
    console.log('Cargando pedidos...');
    const res = await fetch('/api/pedidos/admin/todos', {
      credentials: 'include'
    });

    if (!res.ok) {
      console.error('Error al cargar pedidos:', res.status);
      return;
    }

    const data = await res.json();
    pedidosData = data.pedidos || [];
    console.log('Pedidos cargados:', pedidosData);
    renderizarTablaPedidos();
  } catch (err) {
    console.error('Error:', err);
  }
}

function renderizarTablaPedidos() {
  const tbody = document.getElementById('cuerpoTablaPedidos');
  const estadoDiv = document.getElementById('estadoTablaPedidos');

  if (!tbody) {
    console.error('No se encontró cuerpoTablaPedidos');
    return;
  }

  console.log('tbody encontrado:', tbody.className);
  console.log('tbody parent:', tbody.parentElement?.className);
  console.log('estadoDiv:', estadoDiv?.className);

  if (pedidosData.length === 0) {
    console.log('No hay pedidos');
    tbody.innerHTML = '';
    if (estadoDiv) estadoDiv.style.display = 'block';
    return;
  }

  if (estadoDiv) estadoDiv.style.display = 'none';
  tbody.innerHTML = '';
  console.log('Renderizando', pedidosData.length, 'pedidos');

  pedidosData.forEach((pedido, idx) => {
    const tr = document.createElement('tr');
    const clienteTel = pedido.cliente_tel || 'N/A';
    const fecha = new Date(pedido.creado_en).toLocaleString('es-MX');
    const total = parseFloat(pedido.total).toFixed(2);
    const estado = pedido.estado || 'pendiente';
    const estadoClass = `estado-${estado}`;

    tr.innerHTML = `
      <td><strong>#${pedido.id}</strong></td>
      <td>${clienteTel}</td>
      <td>${fecha}</td>
      <td>$${total}</td>
      <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
      <td>
        <button class="btn-table" onclick="verDetallePedido(${pedido.id})">
          <span class="material-symbols-outlined">visibility</span>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
    if (idx === 0) console.log('Primera fila agregada, tr:', tr.innerHTML.substring(0, 80));
  });
  
  console.log('Filas en tbody:', tbody.rows.length);
  console.log('tbody size:', tbody.offsetWidth, tbody.offsetHeight);
  console.log('table size:', tbody.parentElement?.parentElement?.offsetWidth, tbody.parentElement?.parentElement?.offsetHeight);
}

function filtrarPedidos() {
  const busqueda = document.getElementById('buscarPedidos')?.value.toLowerCase() || '';
  const estadoFiltro = document.getElementById('filtroEstadoPedidos')?.value || '';
  const ordenFiltro = document.getElementById('ordenPedidos')?.value || '';

  let filtrados = pedidosData.filter(p => {
    // Filtro por búsqueda (ID o teléfono)
    const id = String(p.id).toLowerCase();
    const tel = (p.cliente_tel || '').toLowerCase();
    const coincideBusqueda = id.includes(busqueda) || tel.includes(busqueda);
    
    // Filtro por estado
    const coincideEstado = !estadoFiltro || p.estado === estadoFiltro;
    
    return coincideBusqueda && coincideEstado;
  });

  // Aplicar ordenamiento
  if (ordenFiltro === 'fecha-desc') {
    filtrados.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
  } else if (ordenFiltro === 'fecha-asc') {
    filtrados.sort((a, b) => new Date(a.creado_en) - new Date(b.creado_en));
  } else if (ordenFiltro === 'total-desc') {
    filtrados.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
  } else if (ordenFiltro === 'total-asc') {
    filtrados.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
  }

  const tbody = document.getElementById('cuerpoTablaPedidos');
  const estadoDiv = document.getElementById('estadoTablaPedidos');
  
  if (!tbody) return;

  tbody.innerHTML = '';

  if (filtrados.length === 0) {
    if (estadoDiv) estadoDiv.style.display = 'block';
    return;
  }

  if (estadoDiv) estadoDiv.style.display = 'none';

  filtrados.forEach(pedido => {
    const tr = document.createElement('tr');
    const clienteTel = pedido.cliente_tel || 'N/A';
    const fecha = new Date(pedido.creado_en).toLocaleString('es-MX');
    const total = parseFloat(pedido.total).toFixed(2);
    const estado = pedido.estado || 'pendiente';
    const estadoClass = `estado-${estado}`;

    tr.innerHTML = `
      <td><strong>#${pedido.id}</strong></td>
      <td>${clienteTel}</td>
      <td>${fecha}</td>
      <td>$${total}</td>
      <td><span class="estado-badge ${estadoClass}">${estado}</span></td>
      <td>
        <button class="btn-table" onclick="verDetallePedido(${pedido.id})">
          <span class="material-symbols-outlined">visibility</span>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function verDetallePedido(pedidoId) {
  const pedido = pedidosData.find(p => p.id === pedidoId);
  if (!pedido) return;

  const modal = document.getElementById('modalPedido');
  const titulo = document.getElementById('modalPedidoTitulo');
  const body = document.getElementById('modalPedidoBody');

  if (!modal || !body) return;

  titulo.textContent = `Pedido #${pedido.id}`;

  const fecha = new Date(pedido.creado_en).toLocaleString('es-MX');
  const total = parseFloat(pedido.total).toFixed(2);
  const estado = pedido.estado || 'pendiente';
  const costoEnvio = parseFloat(pedido.costo_envio || 0).toFixed(2);

  // Definir transiciones válidas
  const transicionesValidas = {
    pendiente: ['pagado', 'cancelado'],
    pagado: ['enviado', 'cancelado'],
    enviado: ['entregado', 'cancelado'],
    entregado: [],
    cancelado: []
  };

  const estadosDisponibles = transicionesValidas[estado] || [];

  body.innerHTML = `
    <div class="modal-row">
      <div class="modal-card">
        <h4>Información General</h4>
        <div class="detail-row">
          <span class="detail-label">ID Pedido:</span>
          <strong>#${pedido.id}</strong>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span>${fecha}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total:</span>
          <strong>$${total}</strong>
        </div>
      </div>

      <div class="modal-card">
        <h4>Cliente</h4>
        <div class="detail-row">
          <span class="detail-label">Teléfono:</span>
          <span>${pedido.cliente_tel || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Correo:</span>
          <span>${pedido.cliente_email || 'N/A'}</span>
        </div>
      </div>

      <div class="modal-card">
        <h4>Envío</h4>
        <div class="detail-row">
          <span class="detail-label">Dirección:</span>
          <span>${pedido.direccion_completa || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Costo envío:</span>
          <span>$${costoEnvio}</span>
        </div>
      </div>

      <div class="modal-card">
        <h4>Pago</h4>
        <div class="detail-row">
          <span class="detail-label">Método:</span>
          <span class="chip-metodo ${(pedido.metodo_pago || '').toLowerCase()}">${pedido.metodo_pago || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado actual:</span>
          <span class="estado-badge estado-${estado}">${estado}</span>
        </div>
        ${estadosDisponibles.length > 0 ? `
        <div class="detail-row" style="margin-top: 10px;">
          <span class="detail-label">Cambiar a:</span>
          <select id="selectEstadoModal" class="select-control" style="width: 100%; margin-top: 4px;">
            <option value="">-- Seleccionar estado --</option>
            ${estadosDisponibles.map(est => `<option value="${est}">${est.charAt(0).toUpperCase() + est.slice(1)}</option>`).join('')}
          </select>
        </div>
        ` : `
        <div class="detail-row" style="margin-top: 10px; padding: 8px; background: rgba(148,163,184,0.1); border-radius: 6px; font-size: 0.85rem; color: var(--muted);">
          Este pedido no puede cambiar de estado
        </div>
        `}
      </div>
    </div>

    <div style="margin-top: 16px; padding: 12px; background: rgba(148,163,184,0.1); border-radius: 8px;">
      <h4 style="margin-bottom: 8px;">Artículos en el pedido</h4>
      <div id="articulosPedido" style="font-size: 0.9rem; color: var(--muted);">
        Cargando artículos...
      </div>
    </div>

    <div style="margin-top: 16px; padding: 12px; background: rgba(148,163,184,0.1); border-radius: 8px;">
      <h4 style="margin-bottom: 8px;">Información de Envío</h4>
      <div id="infoEnvio" style="font-size: 0.9rem; color: var(--muted);">
        Cargando información de envío...
      </div>
    </div>
  `;

  // Cargar artículos del pedido
  cargarArticulosPedido(pedidoId);

  // Cargar información de envío si existe
  cargarInfoEnvio(pedidoId);

  // Guardar referencia del pedido actual para cambios de estado
  modal.dataset.pedidoId = pedidoId;

  // Mostrar modal
  modal.classList.remove('hidden');
}

async function cargarArticulosPedido(pedidoId) {
  try {
    const res = await fetch(`/api/pedidos/admin/${pedidoId}`, {
      credentials: 'include'
    });

    if (!res.ok) {
      console.error('Error al cargar artículos:', res.status);
      document.getElementById('articulosPedido').innerHTML = 'Error al cargar artículos';
      return;
    }

    const data = await res.json();
    const articulos = data.pedido?.items || [];

    if (articulos.length === 0) {
      document.getElementById('articulosPedido').innerHTML = 'No hay artículos';
      return;
    }

    let html = `
      <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse;">
        <thead style="border-bottom: 2px solid rgba(148,163,184,0.3); background: rgba(148,163,184,0.05);">
          <tr>
            <th style="text-align: left; padding: 8px; color: var(--muted);">Artículo</th>
            <th style="text-align: center; padding: 8px; color: var(--muted);">Cantidad</th>
            <th style="text-align: right; padding: 8px; color: var(--muted);">Precio Unitario</th>
            <th style="text-align: right; padding: 8px; color: var(--muted);">Subtotal</th>
          </tr>
        </thead>
        <tbody>
    `;

    let totalArticulos = 0;

    articulos.forEach(item => {
      const precioUnit = parseFloat(item.precio).toFixed(2);
      const subtotal = (parseFloat(item.precio) * item.cantidad).toFixed(2);
      totalArticulos += parseFloat(subtotal);

      html += `
        <tr style="border-bottom: 1px solid rgba(148,163,184,0.1);">
          <td style="padding: 8px; color: var(--text);">${item.nombre}</td>
          <td style="text-align: center; padding: 8px; color: var(--text);">${item.cantidad}</td>
          <td style="text-align: right; padding: 8px; color: var(--text);">$${precioUnit}</td>
          <td style="text-align: right; padding: 8px; color: var(--text); font-weight: 500;">$${subtotal}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
        <tfoot style="border-top: 2px solid rgba(148,163,184,0.3); background: rgba(148,163,184,0.05);">
          <tr>
            <td colspan="3" style="text-align: right; padding: 8px; color: var(--muted); font-weight: 500;">Subtotal:</td>
            <td style="text-align: right; padding: 8px; color: var(--text); font-weight: 600;">$${totalArticulos.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `;

    document.getElementById('articulosPedido').innerHTML = html;
  } catch (err) {
    console.error('Error:', err);
    document.getElementById('articulosPedido').innerHTML = 'Error al cargar artículos';
  }
}

// Inicializar cuando se carga la vista
document.addEventListener('DOMContentLoaded', () => {
  const buscarInput = document.getElementById('buscarPedidos');
  const filtroEstado = document.getElementById('filtroEstadoPedidos');
  const filtroOrden = document.getElementById('ordenPedidos');
  const cerrarModalBtn = document.getElementById('cerrarModalPedido');
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  const btnGuardarEstado = document.getElementById('btnGuardarEstado');
  const btnImprimirPedido = document.getElementById('btnImprimirPedido');
  const btnDescargarPedido = document.getElementById('btnDescargarPedido');
  const modal = document.getElementById('modalPedido');

  if (buscarInput) {
    buscarInput.addEventListener('input', filtrarPedidos);
  }
  
  if (filtroEstado) {
    filtroEstado.addEventListener('change', filtrarPedidos);
  }
  
  if (filtroOrden) {
    filtroOrden.addEventListener('change', filtrarPedidos);
  }

  // Cerrar modal
  if (cerrarModalBtn) {
    cerrarModalBtn.addEventListener('click', cerrarModal);
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
  }

  // Guardar cambios de estado
  if (btnGuardarEstado) {
    btnGuardarEstado.addEventListener('click', guardarCambiosEstado);
  }

  // Imprimir y descargar
  if (btnImprimirPedido) {
    btnImprimirPedido.addEventListener('click', imprimirPedido);
  }

  if (btnDescargarPedido) {
    btnDescargarPedido.addEventListener('click', descargarPedidoPDF);
  }

  // Cerrar modal al hacer clic fuera del contenido
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModal();
      }
    });
  }

  // Cargar pedidos al iniciar
  cargarPedidos();
});

function cerrarModal() {
  const modal = document.getElementById('modalPedido');
  if (modal) {
    modal.classList.add('hidden');
    modal.dataset.pedidoId = '';
  }
}

async function guardarCambiosEstado() {
  const modal = document.getElementById('modalPedido');
  const pedidoId = modal.dataset.pedidoId;
  const selectEstado = document.getElementById('selectEstadoModal');
  
  if (!pedidoId || !selectEstado) return;

  const nuevoEstado = selectEstado.value;
  
  if (!nuevoEstado) {
    alert('Por favor selecciona un estado');
    return;
  }

  const pedidoAnterior = pedidosData.find(p => p.id == pedidoId);
  if (!pedidoAnterior) return;

  try {
    const res = await fetch(`/api/pedidos/admin/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.mensaje || 'Error al guardar cambios');
      return;
    }

    // Actualizar datos locales
    const pedido = pedidosData.find(p => p.id == pedidoId);
    if (pedido) {
      pedido.estado = nuevoEstado;
    }

    alert('✓ Estado actualizado correctamente');
    cerrarModal();
    renderizarTablaPedidos();
  } catch (err) {
    console.error('Error:', err);
    alert('Error al guardar cambios');
  }
}

function generarContenidoPDF(pedidoId) {
  const pedido = pedidosData.find(p => p.id == pedidoId);
  if (!pedido) return '';

  const fecha = new Date(pedido.creado_en).toLocaleString('es-MX');
  const total = parseFloat(pedido.total).toFixed(2);
  const estado = pedido.estado || 'pendiente';
  const costoEnvio = parseFloat(pedido.costo_envio || 0).toFixed(2);

  let html = `
    <html>
      <head>
        <title>Pedido #${pedido.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1 { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h3 { border-bottom: 1px solid #ddd; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
          table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .total-row { font-weight: bold; font-size: 1.2em; }
          .status { padding: 5px 10px; background: #e3f2fd; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <h1>Comprobante de Pedido #${pedido.id}</h1>
        
        <div class="header">
          <div>
            <strong>Fecha:</strong> ${fecha}
          </div>
          <div>
            <strong>Estado:</strong> <span class="status">${estado}</span>
          </div>
        </div>

        <div class="section">
          <h3>Información del Cliente</h3>
          <p><strong>Teléfono:</strong> ${pedido.cliente_tel || 'N/A'}</p>
          <p><strong>Correo:</strong> ${pedido.cliente_email || 'N/A'}</p>
        </div>

        <div class="section">
          <h3>Dirección de Envío</h3>
          <p>${pedido.direccion_completa || 'N/A'}</p>
        </div>

        <div class="section">
          <h3>Artículos</h3>
          <table>
            <thead>
              <tr>
                <th>Artículo</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio Unitario</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
  `;

  // Cargar artículos - esto requiere que los datos ya estén cargados
  // Por ahora mostramos una nota
  html += `
              <tr>
                <td colspan="4" style="text-align: center; color: #999;">Los artículos se mostrarán en el PDF generado</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Resumen</h3>
          <table>
            <tr>
              <td style="width: 70%; text-align: right;"><strong>Costo de envío:</strong></td>
              <td style="text-align: right;">$${costoEnvio}</td>
            </tr>
            <tr class="total-row">
              <td style="text-align: right;">TOTAL:</td>
              <td style="text-align: right;">$${total}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3>Método de Pago</h3>
          <p>${pedido.metodo_pago || 'N/A'}</p>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 0.9em;">
          <p>Gracias por su compra. Este es un comprobante de su pedido.</p>
          <p>Fecha de generación: ${new Date().toLocaleString('es-MX')}</p>
        </div>
      </body>
    </html>
  `;

  return html;
}

function imprimirPedido() {
  const modal = document.getElementById('modalPedido');
  const pedidoId = modal.dataset.pedidoId;
  
  if (!pedidoId) return;

  const contenido = generarContenidoPDF(pedidoId);
  const ventana = window.open('', '_blank');
  ventana.document.write(contenido);
  ventana.document.close();
  ventana.print();
}

async function cargarInfoEnvio(pedidoId) {
  const container = document.getElementById('infoEnvio');
  if (!container) return;

  try {
    const res = await fetch(`/api/admin/envios/${pedidoId}`, {
      credentials: 'include'
    });

    if (res.status === 404) {
      container.innerHTML = `
        <div style="padding: 8px; color: var(--muted); font-style: italic;">
          No hay información de envío registrada para este pedido.
        </div>
      `;
      return;
    }

    if (!res.ok) {
      container.innerHTML = `
        <div style="padding: 8px; color: #dc2626;">
          Error al cargar información de envío
        </div>
      `;
      return;
    }

    const envio = await res.json();
    
    const estadoEnvioClass = {
      'pendiente': 'chip-estado-pendiente',
      'recogido': 'chip-estado-pagado',
      'en_transito': 'chip-estado-enviado',
      'entregado': 'chip-estado-entregado',
      'incidencia': 'chip-estado-cancelado'
    }[envio.estado] || 'chip-estado-pendiente';

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 0.9rem;">
        <div>
          <div style="color: var(--muted); margin-bottom: 4px;">Carrier / Paquetería:</div>
          <div style="font-weight: 500;">${envio.carrier}</div>
        </div>
        <div>
          <div style="color: var(--muted); margin-bottom: 4px;">Número de guía:</div>
          <div style="font-family: monospace; font-weight: 500;">${envio.guia}</div>
        </div>
        <div>
          <div style="color: var(--muted); margin-bottom: 4px;">Costo de envío:</div>
          <div style="font-weight: 500;">$${parseFloat(envio.costo).toFixed(2)}</div>
        </div>
        <div>
          <div style="color: var(--muted); margin-bottom: 4px;">Estado del envío:</div>
          <span class="chip-estado ${estadoEnvioClass}" style="display: inline-block; margin-top: 4px; text-transform: capitalize;">
            ${envio.estado.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(148,163,184,0.2);">
        <button 
          onclick="editarEnvio(${pedidoId})" 
          class="btn btn-sm btn-secondary"
          style="font-size: 0.85rem; padding: 6px 12px;"
        >
          <span class="material-symbols-outlined" style="font-size: 16px;">edit</span>
          Editar envío
        </button>
      </div>
    `;
  } catch (err) {
    console.error('Error al cargar información de envío:', err);
    container.innerHTML = `
      <div style="padding: 8px; color: #dc2626;">
        Error al cargar información de envío
      </div>
    `;
  }
}


function descargarPedidoPDF() {
  const modal = document.getElementById('modalPedido');
  const pedidoId = modal.dataset.pedidoId;
  
  if (!pedidoId) return;

  alert('Nota: Esta función requiere una librería PDF como jsPDF.\nPor ahora usa la función de imprimir y guarda como PDF desde tu navegador.');
}
