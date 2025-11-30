// public/js/admin-categorias.js

const formCategoria = document.getElementById('formCategoria');
const mensajeCategoria = document.getElementById('mensajeCategoria');
const tbodyCategorias = document.getElementById('tbodyCategorias');
const estadoTablaCategorias = document.getElementById('estadoTablaCategorias');
const buscadorCategorias = document.getElementById('buscadorCategorias');
const totalCategoriasSpan = document.getElementById('totalCategorias');
const btnCategoriaCancelar = document.getElementById('btnCategoriaCancelar');
const formCategoriaTitulo = document.getElementById('formCategoriaTitulo');
const modoCategoriaEtiqueta = document.getElementById('modoCategoriaEtiqueta');
const btnCategoriaGuardarTexto = document.getElementById('btnCategoriaGuardarTexto');

const catNombreInput = document.getElementById('catNombre');
const catSlugInput = document.getElementById('catSlug');
const catParentSelect = document.getElementById('catParentId');

let categoriaIdEnEdicion = null; // null = creación
let categoriasData = [];
let categoriasFiltradas = [];

// Mensajes
function mostrarMensajeCategoria(texto, tipo = 'ok') {
  mensajeCategoria.textContent = texto || '';
  mensajeCategoria.className = 'status ' + (tipo || '');
}

function limpiarFormularioCategoria() {
  formCategoria.reset();
  categoriaIdEnEdicion = null;
  formCategoriaTitulo.textContent = 'Nueva categoría';
  modoCategoriaEtiqueta.textContent = 'Modo creación';
  btnCategoriaGuardarTexto.textContent = 'Guardar categoría';
  mostrarMensajeCategoria('');

  // resetear select padre
  if (catParentSelect) {
    catParentSelect.value = '';
  }
}

// Generar slug a partir del nombre
function generarSlug(texto) {
  return texto
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Auto-slug cuando se escribe el nombre
catNombreInput.addEventListener('input', () => {
  if (!catSlugInput.value.trim()) {
    catSlugInput.value = generarSlug(catNombreInput.value);
  }
});

// Si el usuario escribe el slug a mano, lo normalizamos
catSlugInput.addEventListener('blur', () => {
  catSlugInput.value = generarSlug(catSlugInput.value);
});

// Llenar el select de categoría padre con todas las categorías
function llenarSelectCategoriaPadre() {
  if (!catParentSelect) return;

  catParentSelect.innerHTML = '';

  // Opción "sin padre"
  const optRoot = document.createElement('option');
  optRoot.value = '';
  optRoot.textContent = 'Sin categoría padre';
  catParentSelect.appendChild(optRoot);

  // Todas las categorías como posibles padres
  categoriasData.forEach(c => {
    const op = document.createElement('option');
    op.value = c.id;

    // Si la categoría tiene padre, podemos mostrarlo para que sea más claro
    if (c.parent_id) {
      op.textContent = `${c.nombre} (hija de ID ${c.parent_id})`;
    } else {
      op.textContent = c.nombre;
    }

    catParentSelect.appendChild(op);
  });
}

function pintarTablaCategorias() {
  tbodyCategorias.innerHTML = '';

  const listaBase = categoriasFiltradas.length ? categoriasFiltradas : categoriasData;

  if (!listaBase.length) {
    estadoTablaCategorias.style.display = 'block';
    totalCategoriasSpan.textContent = '0';
    return;
  }

  estadoTablaCategorias.style.display = 'none';
  totalCategoriasSpan.textContent = listaBase.length.toString();

  const mapaPorId = new Map();
  categoriasData.forEach(c => mapaPorId.set(c.id, c));

  // Si hay filtro de búsqueda, mostramos plano (sin jerarquía)
  if (categoriasFiltradas.length) {
    listaBase.forEach(c => {
      const tr = document.createElement('tr');

      const nombreHtml = c.parent_id
        ? `<span class="cat-name-child">${c.nombre}</span>`
        : `<span class="cat-name-parent">${c.nombre}</span>`;

      tr.innerHTML = `
        <td>${nombreHtml}</td>
        <td class="row-muted">${c.total_productos ?? 0}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-table btn-edit" data-accion="editar" data-id="${c.id}">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn-table btn-delete" data-accion="eliminar" data-id="${c.id}">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </td>
      `;
      tbodyCategorias.appendChild(tr);
    });
    return;
  }

  // ---- MODO JERÁRQUICO (sin filtro) ----

  const padres = categoriasData.filter(c => c.parent_id === null);
  const hijosPorPadre = {};

  categoriasData.forEach(c => {
    if (c.parent_id !== null) {
      if (!hijosPorPadre[c.parent_id]) {
        hijosPorPadre[c.parent_id] = [];
      }
      hijosPorPadre[c.parent_id].push(c);
    }
  });

  function agregarFila(cat, esHijo = false, totalOverride = null) {
    const tr = document.createElement('tr');
    tr.className = esHijo ? 'cat-row-child' : 'cat-row-parent';

    const nombreHtml = esHijo
      ? `<span class="cat-name-child">${cat.nombre}</span>`
      : `<span class="cat-name-parent">${cat.nombre}</span>`;

    // Si nos pasan un totalOverride, usamos ese; si no, usamos el total directo
    const total = totalOverride !== null ? totalOverride : (cat.total_productos ?? 0);

    tr.innerHTML = `
      <td>${nombreHtml}</td>
      <td class="row-muted">${total}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-table btn-edit" data-accion="editar" data-id="${cat.id}">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="btn-table btn-delete" data-accion="eliminar" data-id="${cat.id}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    `;
    tbodyCategorias.appendChild(tr);
  }

  padres.forEach(p => {
    const hijos = hijosPorPadre[p.id] || [];

    // total del padre = sus propios productos + productos de todas sus hijas
    const totalPadre =
      (p.total_productos || 0) +
      hijos.reduce((acc, h) => acc + (h.total_productos || 0), 0);

    // pintamos el padre con el total agregando las hijas
    agregarFila(p, false, totalPadre);

    // las hijas se pintan con su propio total
    hijos.forEach(h => agregarFila(h, true));
  });

  // Categorías con parent_id pero cuyo padre no existe en la lista
  categoriasData
    .filter(c => c.parent_id !== null && !mapaPorId.get(c.parent_id))
    .forEach(c => agregarFila(c, false));
}


async function cargarCategorias() {
  try {
    const res = await fetch('/api/categorias');
    if (!res.ok) {
      mostrarMensajeCategoria('No se pudieron obtener las categorías desde el servidor', 'error');
      return;
    }
    categoriasData = await res.json();
    categoriasFiltradas = [];
    pintarTablaCategorias();
    llenarSelectCategoriaPadre();
  } catch (err) {
    console.error(err);
    mostrarMensajeCategoria('Error de comunicación con el servidor', 'error');
  }
}

// Permite que otros módulos (como el CRUD de productos) refresquen la tabla de categorías
window.refrescarCategoriasAdmin = async function () {
  try {
    await cargarCategorias();
    // console.log('Categorías (totales de productos) refrescadas');
  } catch (err) {
    console.error('Error al refrescar categorías (admin):', err);
  }
};

function validarFormularioCategoria() {
  const nombre = catNombreInput.value.trim();
  const parentId = catParentSelect.value;

  const errores = [];

  if (!nombre) errores.push('El nombre es obligatorio.');

  if (parentId !== '') {
    const pid = parseInt(parentId, 10);
    if (isNaN(pid) || pid <= 0) {
      errores.push('El ID de categoría padre no es válido.');
    }
  }

  return errores;
}


formCategoria.addEventListener('submit', async (e) => {
  e.preventDefault();

  const errores = validarFormularioCategoria();
  if (errores.length) {
    mostrarMensajeCategoria(errores.join(' '), 'error');
    return;
  }

const nombre = catNombreInput.value.trim();
let slug = catSlugInput.value.trim();
const parentId = catParentSelect.value;

// Si por alguna razón el campo se quedó vacío, generamos uno aquí
if (!slug) {
  slug = generarSlug(nombre);
  catSlugInput.value = slug;
}

const payload = {
  nombre,
  slug,
  parent_id: parentId === '' ? null : parentId
};


  let url = '/api/categorias';
  let method = 'POST';

  if (categoriaIdEnEdicion !== null) {
    url += '/' + encodeURIComponent(categoriaIdEnEdicion);
    method = 'PUT';
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const texto = data.errores ? data.errores.join(' ') : (data.mensaje || 'Error en la operación.');
      mostrarMensajeCategoria(texto, 'error');
      return;
    }

    mostrarMensajeCategoria(data.mensaje || 'Operación realizada correctamente', 'ok');
    await cargarCategorias();
    
    if (window.refrescarCategoriasProductos) {
      window.refrescarCategoriasProductos();
    }

    limpiarFormularioCategoria();
  } catch (err) {
    console.error(err);
    mostrarMensajeCategoria('Error de comunicación con el servidor', 'error');
  }
});

tbodyCategorias.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-accion]');
  if (!btn) return;

  const accion = btn.dataset.accion;
  const id = btn.dataset.id;

  if (accion === 'editar') {
    try {
      const res = await fetch('/api/categorias/' + encodeURIComponent(id));
      if (!res.ok) {
        mostrarMensajeCategoria('No se pudo obtener la información de la categoría.', 'error');
        return;
      }
      const c = await res.json();

      categoriaIdEnEdicion = c.id;
      catNombreInput.value = c.nombre || '';
      catSlugInput.value = c.slug || '';
      catParentSelect.value = c.parent_id || '';

      formCategoriaTitulo.textContent = 'Editar categoría';
      modoCategoriaEtiqueta.textContent = 'Modo edición';
      btnCategoriaGuardarTexto.textContent = 'Actualizar categoría';

      mostrarMensajeCategoria('Editando categoría ID ' + c.id, 'ok');
    } catch (err) {
      console.error(err);
      mostrarMensajeCategoria('Error de comunicación con el servidor', 'error');
    }
  }

  if (accion === 'eliminar') {
    if (!confirm('¿Seguro que deseas eliminar la categoría ID ' + id + '?')) return;

    try {
      const res = await fetch('/api/categorias/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        mostrarMensajeCategoria(data.mensaje || 'No se pudo eliminar la categoría', 'error');
        return;
      }
      mostrarMensajeCategoria(data.mensaje, 'ok');
      await cargarCategorias();
    
      if (window.refrescarCategoriasProductos) {
        window.refrescarCategoriasProductos();
      }
    } catch (err) {
      console.error(err);
      mostrarMensajeCategoria('Error de comunicación con el servidor', 'error');
    }
  }
});

buscadorCategorias.addEventListener('input', () => {
  const q = buscadorCategorias.value.trim().toLowerCase();
  if (!q) {
    categoriasFiltradas = [];
    pintarTablaCategorias();
    return;
  }
  categoriasFiltradas = categoriasData.filter(c =>
    (c.nombre || '').toLowerCase().includes(q) ||
    (c.slug || '').toLowerCase().includes(q)
  );
  pintarTablaCategorias();
});

btnCategoriaCancelar.addEventListener('click', () => {
  limpiarFormularioCategoria();
});

// Cargar inicialmente
cargarCategorias();
