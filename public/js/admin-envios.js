// public/js/admin-envios.js
(function() {
  let enviosCache = [];
  let pedidoActualEnvio = null;

  async function cargarEnvios() {
    try {
      const res = await fetch('/api/admin/envios');
      if (!res.ok) {
        console.error('Error al cargar envíos:', res.status);
        return;
      }

      const envios = await res.json();
      enviosCache = envios;
      aplicarFiltros();
    } catch (err) {
      console.error('Error al cargar envíos:', err);
    }
  }

  function aplicarFiltros() {
    const busqueda = document.getElementById('buscarEnvios')?.value.toLowerCase() || '';
    const estadoFiltro = document.getElementById('filtroEstadoEnvios')?.value || '';
    const carrierFiltro = document.getElementById('filtroCarrier')?.value || '';

    let enviosFiltrados = enviosCache.filter(envio => {
      const cumpleBusqueda = !busqueda || 
        envio.pedido_id.toString().includes(busqueda) ||
        envio.guia.toLowerCase().includes(busqueda) ||
        envio.cliente_tel.includes(busqueda);
      
      const cumpleEstado = !estadoFiltro || envio.estado === estadoFiltro;
      const cumpleCarrier = !carrierFiltro || envio.carrier === carrierFiltro;

      return cumpleBusqueda && cumpleEstado && cumpleCarrier;
    });

    renderizarEnvios(enviosFiltrados);
  }

  function renderizarEnvios(envios) {
    const tbody = document.getElementById('tbodyEnvios');
    const estadoTabla = document.getElementById('estadoTablaEnvios');
    if (!tbody) return;

    if (envios.length === 0) {
      tbody.innerHTML = '';
      if (estadoTabla) estadoTabla.style.display = 'block';
      return;
    }

    if (estadoTabla) estadoTabla.style.display = 'none';

    tbody.innerHTML = envios.map(envio => {
      const estadoEnvioClass = {
        'pendiente': 'chip-estado-pendiente',
        'recogido': 'chip-estado-pagado',
        'en_transito': 'chip-estado-enviado',
        'entregado': 'chip-estado-entregado',
        'incidencia': 'chip-estado-cancelado'
      }[envio.estado] || 'chip-estado-pendiente';

      const estadoPedidoClass = {
        'pendiente': 'chip-estado-pendiente',
        'pagado': 'chip-estado-pagado',
        'enviado': 'chip-estado-enviado',
        'entregado': 'chip-estado-entregado',
        'cancelado': 'chip-estado-cancelado'
      }[envio.pedido_estado] || 'chip-estado-pendiente';

      return `
        <tr>
          <td style="font-weight: 500;">#${envio.pedido_id}</td>
          <td>${envio.cliente_tel}</td>
          <td style="font-weight: 500;">$${parseFloat(envio.total).toFixed(2)}</td>
          <td>${envio.carrier}</td>
          <td style="font-family: monospace;">${envio.guia}</td>
          <td>
            <span class="chip-estado ${estadoEnvioClass}">${envio.estado.replace('_', ' ')}</span>
          </td>
          <td>
            <span class="chip-estado ${estadoPedidoClass}">${envio.pedido_estado}</span>
          </td>
          <td>
            <div style="display: flex; gap: 4px;">
              <button class="btn-table btn-edit" onclick="editarEnvio(${envio.pedido_id})" title="Editar envío">
                <span class="material-symbols-outlined" style="font-size: 14px;">edit</span>
              </button>
              <button class="btn-table btn-edit" onclick="copiarGuia('${envio.guia}')" title="Copiar guía">
                <span class="material-symbols-outlined" style="font-size: 14px;">content_copy</span>
              </button>
              ${generarLinkRastreo(envio.carrier, envio.guia)}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function generarLinkRastreo(carrier, guia) {
    const links = {
      'DHL': `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${guia}`,
      'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${guia}`,
      'Estafeta': `https://www.estafeta.com/Rastreo/?wayb=${guia}`,
      'Redpack': `https://www.redpack.com.mx/es/rastreo/?guias=${guia}`,
    };

    const url = links[carrier];
    if (!url) return '';

    return `
      <a href="${url}" target="_blank" class="btn-table btn-edit" title="Rastrear envío" style="text-decoration: none;">
        <span class="material-symbols-outlined" style="font-size: 14px;">travel_explore</span>
      </a>
    `;
  }

  window.cargarEnvios = cargarEnvios;

  window.copiarGuia = function(guia) {
    navigator.clipboard.writeText(guia).then(() => {
      alert(`Guía copiada: ${guia}`);
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  };

  window.editarEnvio = async function(pedido_id) {
    try {
      const res = await fetch(`/api/admin/envios/${pedido_id}`);
      if (!res.ok) {
        alert('Error al obtener el envío');
        return;
      }

      const envio = await res.json();
      pedidoActualEnvio = pedido_id;

      document.getElementById('modalEnvioPedidoId').textContent = pedido_id;
      document.getElementById('envioCarrier').value = envio.carrier;
      document.getElementById('envioGuia').value = envio.guia;
      document.getElementById('envioEstado').value = envio.estado;

      // Actualizar link de rastreo
      actualizarLinkRastreo(envio.carrier, envio.guia);

      document.getElementById('modalEditarEnvio').style.display = 'flex';
    } catch (err) {
      console.error('Error al cargar envío:', err);
      alert('Error al cargar envío');
    }
  };

  document.getElementById('btnGuardarEnvio')?.addEventListener('click', async () => {
    if (!pedidoActualEnvio) return;

    const carrier = document.getElementById('envioCarrier').value.trim();
    const guia = document.getElementById('envioGuia').value.trim();
    const estado = document.getElementById('envioEstado').value;

    if (!carrier || !guia) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      const res = await fetch(`/api/admin/envios/${pedidoActualEnvio}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier, guia, estado })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.mensaje || 'Error al actualizar envío');
        return;
      }

      alert('Envío actualizado correctamente');
      document.getElementById('modalEditarEnvio').style.display = 'none';
      cargarEnvios();
    } catch (err) {
      console.error('Error al actualizar envío:', err);
      alert('Error al actualizar envío');
    }
  });

  document.getElementById('btnCerrarModalEnvio')?.addEventListener('click', () => {
    document.getElementById('modalEditarEnvio').style.display = 'none';
    pedidoActualEnvio = null;
  });

  // Cerrar modal al hacer clic fuera de él
  document.getElementById('modalEditarEnvio')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalEditarEnvio') {
      document.getElementById('modalEditarEnvio').style.display = 'none';
      pedidoActualEnvio = null;
    }
  });

  // Event listeners para filtros
  document.getElementById('buscarEnvios')?.addEventListener('input', aplicarFiltros);
  document.getElementById('filtroEstadoEnvios')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtroCarrier')?.addEventListener('change', aplicarFiltros);

  // Botón copiar guía en modal
  document.getElementById('btnCopiarGuia')?.addEventListener('click', () => {
    const guia = document.getElementById('envioGuia').value;
    if (guia) {
      navigator.clipboard.writeText(guia).then(() => {
        alert(`Guía copiada: ${guia}`);
      });
    }
  });

  // Actualizar link de rastreo cuando cambia carrier o guía
  document.getElementById('envioCarrier')?.addEventListener('change', actualizarLinkRastreoDinamico);
  document.getElementById('envioGuia')?.addEventListener('input', actualizarLinkRastreoDinamico);

  function actualizarLinkRastreoDinamico() {
    const carrier = document.getElementById('envioCarrier').value;
    const guia = document.getElementById('envioGuia').value;
    actualizarLinkRastreo(carrier, guia);
  }

  function actualizarLinkRastreo(carrier, guia) {
    const linkContainer = document.getElementById('linkRastreo');
    const linkUrl = document.getElementById('linkRastreoUrl');
    
    const links = {
      'DHL': `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${guia}`,
      'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${guia}`,
      'Estafeta': `https://www.estafeta.com/Rastreo/?wayb=${guia}`,
      'Redpack': `https://www.redpack.com.mx/es/rastreo/?guias=${guia}`,
    };

    if (links[carrier] && guia) {
      linkUrl.href = links[carrier];
      linkUrl.textContent = `Ver rastreo en ${carrier} →`;
      linkContainer.style.display = 'block';
    } else {
      linkContainer.style.display = 'none';
    }
  }
})();
