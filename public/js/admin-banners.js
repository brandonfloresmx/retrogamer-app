// public/js/admin-banners.js

const formBanner = document.getElementById('formBanner');
const mensajeBanner = document.getElementById('mensajeBanner');
const tbodyBanners = document.getElementById('tbodyBanners');
const estadoTablaBanners = document.getElementById('estadoTablaBanners');
const totalBannersSpan = document.getElementById('totalBanners');
const btnBannerCancelar = document.getElementById('btnBannerCancelar');
const formBannerTitulo = document.getElementById('formBannerTitulo');
const modoBannerEtiqueta = document.getElementById('modoBannerEtiqueta');
const btnBannerGuardarTexto = document.getElementById('btnBannerGuardarTexto');

const bannerImagenInput = document.getElementById('bannerImagen');
const bannerImagenPreview = document.getElementById('bannerImagenPreview');
const bannerImagenPreviewImg = document.getElementById('bannerImagenPreviewImg');

let bannerIdEnEdicion = null;
let bannersData = [];

// -------------------------
// Utilidades UI
// -------------------------

function mostrarMensajeBanner(texto, tipo = 'ok') {
  mensajeBanner.textContent = texto || '';
  mensajeBanner.className = 'status ' + (tipo || '');
}

function limpiarFormularioBanner() {
  formBanner.reset();
  bannerIdEnEdicion = null;
  formBannerTitulo.textContent = 'Nuevo banner';
  modoBannerEtiqueta.textContent = 'Modo creación';
  btnBannerGuardarTexto.textContent = 'Guardar banner';
  mostrarMensajeBanner('');
  
  if (bannerImagenPreview) bannerImagenPreview.style.display = 'none';
  if (bannerImagenPreviewImg) bannerImagenPreviewImg.src = '';
}

// Preview de imagen
if (bannerImagenInput) {
  bannerImagenInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (bannerImagenPreviewImg) {
          bannerImagenPreviewImg.src = ev.target.result;
          bannerImagenPreview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (bannerImagenPreview) bannerImagenPreview.style.display = 'none';
    }
  });
}

// -------------------------
// Cargar y renderizar banners
// -------------------------

async function cargarBanners() {
  try {
    const res = await fetch('/api/admin/banners', {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      mostrarMensajeBanner('Error al cargar banners', 'error');
      return;
    }
    bannersData = await res.json();
    renderizarBanners();
  } catch (err) {
    console.error(err);
    mostrarMensajeBanner('Error de comunicación con el servidor', 'error');
  }
}

function renderizarBanners() {
  if (!tbodyBanners) return;
  tbodyBanners.innerHTML = '';

  if (totalBannersSpan) totalBannersSpan.textContent = bannersData.length;

  if (bannersData.length === 0) {
    if (estadoTablaBanners) estadoTablaBanners.style.display = 'block';
    return;
  }

  if (estadoTablaBanners) estadoTablaBanners.style.display = 'none';

  bannersData.forEach(banner => {
    const tr = document.createElement('tr');

    // Preview
    const tdPreview = document.createElement('td');
    const img = document.createElement('img');
    img.src = banner.imagen_url;
    img.alt = banner.titulo || 'Banner';
    img.style.cssText = 'width:100px; height:50px; object-fit:cover; border-radius:4px;';
    img.onerror = () => { img.src = '/img/no-image.png'; };
    tdPreview.appendChild(img);

    // Título
    const tdTitulo = document.createElement('td');
    tdTitulo.textContent = banner.titulo || '(Sin título)';

    // Orden
    const tdOrden = document.createElement('td');
    tdOrden.textContent = banner.orden;

    // Estado
    const tdEstado = document.createElement('td');
    const spanEstado = document.createElement('span');
    const esActivo = parseInt(banner.activo) === 1;
    spanEstado.className = esActivo ? 'badge badge-success' : 'badge badge-secondary';
    spanEstado.textContent = esActivo ? 'Activo' : 'Inactivo';
    tdEstado.appendChild(spanEstado);

    // Acciones
    const tdAcciones = document.createElement('td');
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-table btn-edit';
    btnEditar.innerHTML = '<span class="material-symbols-outlined">edit</span>';
    btnEditar.title = 'Editar';
    btnEditar.addEventListener('click', () => editarBanner(banner.id));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-table btn-delete';
    btnEliminar.innerHTML = '<span class="material-symbols-outlined">delete</span>';
    btnEliminar.title = 'Eliminar';
    btnEliminar.addEventListener('click', () => eliminarBanner(banner.id));

    actionButtons.appendChild(btnEditar);
    actionButtons.appendChild(btnEliminar);
    tdAcciones.appendChild(actionButtons);

    tr.appendChild(tdPreview);
    tr.appendChild(tdTitulo);
    tr.appendChild(tdOrden);
    tr.appendChild(tdEstado);
    tr.appendChild(tdAcciones);

    tbodyBanners.appendChild(tr);
  });
}

// -------------------------
// Crear y actualizar banner
// -------------------------

if (formBanner) {
  formBanner.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('bannerTitulo').value.trim();
    const link = document.getElementById('bannerLink').value.trim();
    const orden = document.getElementById('bannerOrden').value;
    const activo = document.getElementById('bannerActivo').value;
    const imagen = bannerImagenInput.files[0];

    // Validación
    if (!bannerIdEnEdicion && !titulo.trim()) {
      mostrarMensajeBanner('El título del banner es obligatorio', 'error');
      return;
    }

    if (!bannerIdEnEdicion && !imagen) {
      mostrarMensajeBanner('La imagen es obligatoria para crear un banner', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo); // Siempre agregar
    formData.append('link', link); // Siempre agregar (puede estar vacío)
    formData.append('orden', orden);
    formData.append('activo', activo);
    if (imagen) formData.append('imagen', imagen);

    try {
      let url = '/api/admin/banners';
      let method = 'POST';

      if (bannerIdEnEdicion) {
        url = `/api/admin/banners/${bannerIdEnEdicion}`;
        method = 'PUT';
      }

      mostrarMensajeBanner('Guardando...', '');

      const res = await fetch(url, {
        method,
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarMensajeBanner(data.mensaje || 'Error al guardar banner', 'error');
        return;
      }

      mostrarMensajeBanner(data.mensaje || 'Banner guardado correctamente', 'ok');
      limpiarFormularioBanner();
      await cargarBanners();
    } catch (err) {
      console.error(err);
      mostrarMensajeBanner('Error de comunicación con el servidor', 'error');
    }
  });
}

// -------------------------
// Editar banner
// -------------------------

async function editarBanner(id) {
  const banner = bannersData.find(b => b.id === id);
  if (!banner) return;

  bannerIdEnEdicion = id;
  formBannerTitulo.textContent = 'Editar banner';
  modoBannerEtiqueta.textContent = 'Modo edición';
  btnBannerGuardarTexto.textContent = 'Actualizar banner';

  document.getElementById('bannerTitulo').value = banner.titulo || '';
  document.getElementById('bannerLink').value = banner.link || '';
  document.getElementById('bannerOrden').value = banner.orden;
  document.getElementById('bannerActivo').value = String(parseInt(banner.activo) === 1 ? '1' : '0');

  // Mostrar preview de la imagen actual
  if (bannerImagenPreviewImg && banner.imagen_url) {
    bannerImagenPreviewImg.src = banner.imagen_url;
    bannerImagenPreview.style.display = 'block';
  }

  mostrarMensajeBanner('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------
// Eliminar banner
// -------------------------

async function eliminarBanner(id) {
  const banner = bannersData.find(b => b.id === id);
  if (!banner) return;

  const titulo = banner.titulo || 'este banner';
  if (!confirm(`¿Eliminar ${titulo}?`)) return;

  try {
    mostrarMensajeBanner('Eliminando...', '');

    const res = await fetch(`/api/admin/banners/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensajeBanner(data.mensaje || 'Error al eliminar banner', 'error');
      return;
    }

    mostrarMensajeBanner(data.mensaje || 'Banner eliminado correctamente', 'ok');
    await cargarBanners();
  } catch (err) {
    console.error(err);
    mostrarMensajeBanner('Error de comunicación con el servidor', 'error');
  }
}

// -------------------------
// Cancelar edición
// -------------------------

if (btnBannerCancelar) {
  btnBannerCancelar.addEventListener('click', () => {
    limpiarFormularioBanner();
  });
}

// -------------------------
// Inicializar
// -------------------------

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('view-banners')) {
    cargarBanners();
  }
});
