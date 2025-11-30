// public/js/admin-articulos.js

const formArticulo = document.getElementById('formArticulo');
const mensajeArticulo = document.getElementById('mensajeArticulo');
const tbodyArticulos = document.getElementById('tbodyArticulos');
const estadoTablaArticulos = document.getElementById('estadoTablaArticulos');
const buscadorArticulos = document.getElementById('buscadorArticulos');
const totalArticulosSpan = document.getElementById('totalArticulos');
const btnArticuloCancelar = document.getElementById('btnArticuloCancelar');
const formArticuloTitulo = document.getElementById('formArticuloTitulo');
const modoArticuloEtiqueta = document.getElementById('modoArticuloEtiqueta');
const btnArticuloGuardarTexto = document.getElementById('btnArticuloGuardarTexto');

const artCategoriaPadre = document.getElementById('artCategoriaPadre');
const artSubcategoria = document.getElementById('artSubcategoria');

let articuloIdEnEdicion = null;   // null = creación
let articulosData = [];
let articulosFiltrados = [];
let categoriasDataProductos = [];

// -------------------------
// Utilidades UI
// -------------------------

function mostrarMensajeArticulo(texto, tipo = 'ok') {
  mensajeArticulo.textContent = texto || '';
  mensajeArticulo.className = 'status ' + (tipo || '');
}

function formatearPrecio(valor) {
  const n = Number(valor);
  if (isNaN(n)) return valor;
  return '$ ' + n.toFixed(2);
}

function limpiarFormularioArticulo() {
  formArticulo.reset();
  articuloIdEnEdicion = null;
  formArticuloTitulo.textContent = 'Nuevo producto';
  modoArticuloEtiqueta.textContent = 'Modo creación';
  btnArticuloGuardarTexto.textContent = 'Guardar producto';
  mostrarMensajeArticulo('');

  if (artCategoriaPadre) artCategoriaPadre.value = '';
  if (artSubcategoria) {
    artSubcategoria.innerHTML = '<option value="">selecciona</option>';
    artSubcategoria.disabled = true;
  }
}

// -------------------------
// Cargar categorías y poblar selects
// -------------------------

function llenarSelectPadre() {
  artCategoriaPadre.innerHTML = '';
  const opcionDefault = document.createElement('option');
  opcionDefault.value = '';
  opcionDefault.textContent = 'selecciona';
  artCategoriaPadre.appendChild(opcionDefault);

  categoriasDataProductos
    .filter(c => c.parent_id === null)
    .forEach(c => {
      const op = document.createElement('option');
      op.value = c.id;
      op.textContent = c.nombre;
      artCategoriaPadre.appendChild(op);
    });

  // Inicializamos subcategorías
  artSubcategoria.innerHTML = '<option value="">selecciona</option>';
  artSubcategoria.disabled = true;
}

function llenarSelectSubcategorias(parentId) {
  artSubcategoria.innerHTML = '<option value="">selecciona</option>';

  const hijos = categoriasDataProductos.filter(c => c.parent_id === Number(parentId));

  if (!hijos.length) {
    artSubcategoria.disabled = true;
    return;
  }

  hijos.forEach(c => {
    const op = document.createElement('option');
    op.value = c.id;
    op.textContent = c.nombre;
    artSubcategoria.appendChild(op);
  });
  artSubcategoria.disabled = false;
}

async function cargarCategoriasParaProductos() {
  try {
    const res = await fetch('/api/categorias');
    if (!res.ok) {
      mostrarMensajeArticulo('No se pudieron cargar las categorías para el formulario de productos.', 'error');
      return;
    }
    categoriasDataProductos = await res.json();
    llenarSelectPadre();
  } catch (err) {
    console.error(err);
    mostrarMensajeArticulo('Error al cargar las categorías para el formulario de productos.', 'error');
  }
}

// Permite que otros módulos (como admin-categorias) refresquen las categorías del CRUD de productos
window.refrescarCategoriasProductos = async function () {
  try {
    await cargarCategoriasParaProductos();
    // Opcional: si quieres mostrar algo en consola para saber que se refrescó
    // console.log('Categorías de productos refrescadas');
  } catch (err) {
    console.error('Error al refrescar categorías de productos:', err);
  }
};


// Cuando cambia la categoría padre, recargamos subcategorías
artCategoriaPadre.addEventListener('change', () => {
  const parentId = artCategoriaPadre.value;
  if (!parentId) {
    artSubcategoria.innerHTML = '<option value="">selecciona</option>';
    artSubcategoria.disabled = true;
    return;
  }
  llenarSelectSubcategorias(parentId);
});

// -------------------------
// Tabla de artículos
// -------------------------

function pintarTablaArticulos() {
  tbodyArticulos.innerHTML = '';
  const lista = articulosFiltrados.length ? articulosFiltrados : articulosData;

  if (!lista.length) {
    estadoTablaArticulos.style.display = 'block';
    totalArticulosSpan.textContent = '0';
    return;
  }

  estadoTablaArticulos.style.display = 'none';
  totalArticulosSpan.textContent = lista.length.toString();

  lista.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="row-muted">${a.id}</td>
      <td>${a.codigo}</td>
      <td>${a.nombre}</td>
      <td class="row-muted">${formatearPrecio(a.precio)}</td>
      <td class="row-muted">${a.existencia}</td>
      <td>
        ${a.imagen_url
          ? `<img src="${a.imagen_url}" alt="${a.nombre}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;border:1px solid rgba(148,163,184,0.4);">`
          : '<span class="row-muted">Sin imagen</span>'
        }
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-table btn-edit" data-accion="editar" data-id="${a.id}">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="btn-table btn-delete" data-accion="eliminar" data-id="${a.id}">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    `;
    tbodyArticulos.appendChild(tr);
  });
}

async function cargarArticulos() {
  try {
    const res = await fetch('/api/articulos');
    if (!res.ok) {
      mostrarMensajeArticulo('No se pudieron obtener los productos desde el servidor', 'error');
      return;
    }
    articulosData = await res.json();
    articulosFiltrados = [];
    pintarTablaArticulos();
  } catch (err) {
    console.error(err);
    mostrarMensajeArticulo('Error de comunicación con el servidor', 'error');
  }
}

// -------------------------
// Validación
// -------------------------

function validarFormularioArticulo() {
  const nombre = document.getElementById('artNombre').value.trim();
  const precio = document.getElementById('artPrecio').value;
  const existencia = document.getElementById('artExistencia').value;
  const parentId = artCategoriaPadre.value;
  const subId = artSubcategoria.value;

  const errores = [];

  if (!nombre) errores.push('El nombre es obligatorio.');

  const numPrecio = Number(precio);
  if (isNaN(numPrecio) || numPrecio < 0) {
    errores.push('El precio debe ser un número mayor o igual a 0.');
  }

  const numExistencia = parseInt(existencia, 10);
  if (isNaN(numExistencia) || numExistencia < 0) {
    errores.push('La existencia debe ser un entero mayor o igual a 0.');
  }

  // Debe elegirse al menos la categoría padre
  const catElegida = subId || parentId;
  const catIdNum = parseInt(catElegida, 10);
  if (!catElegida || isNaN(catIdNum) || catIdNum <= 0) {
    errores.push('Debes seleccionar al menos una categoría.');
  }

  return errores;
}

// -------------------------
// Submit formulario
// -------------------------

formArticulo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const errores = validarFormularioArticulo();
  if (errores.length) {
    mostrarMensajeArticulo(errores.join(' '), 'error');
    return;
  }

  const nombre = document.getElementById('artNombre').value.trim();
  const descripcion = document.getElementById('artDescripcion').value.trim();
  const precio = document.getElementById('artPrecio').value;
  const existencia = document.getElementById('artExistencia').value;
  const parentId = artCategoriaPadre.value;
  const subId = artSubcategoria.value;
  const imagenFile = document.getElementById('artImagen').files[0] || null;

  // Si hay subcategoría, usamos esa. Si no, usamos el padre.
  const categoriaId = subId || parentId;

  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('descripcion', descripcion);
  formData.append('precio', precio);
  formData.append('existencia', existencia);
  formData.append('categoria_id', categoriaId);
  if (imagenFile) {
    formData.append('imagen', imagenFile);
  }

  let url = '/api/articulos';
  let method = 'POST';

  if (articuloIdEnEdicion !== null) {
    url += '/' + encodeURIComponent(articuloIdEnEdicion);
    method = 'PUT';
  }

  try {
    const res = await fetch(url, {
      method,
      body: formData
    });

    const data = await res.json();
    if (!res.ok) {
      const texto = data.errores ? data.errores.join(' ') : (data.mensaje || 'Error en la operación.');
      mostrarMensajeArticulo(texto, 'error');
      return;
    }

    mostrarMensajeArticulo(data.mensaje || 'Operación realizada correctamente', 'ok');
    await cargarArticulos();

    if (window.refrescarCategoriasAdmin) {
      window.refrescarCategoriasAdmin();
    }

    limpiarFormularioArticulo();
  } catch (err) {
    console.error(err);
    mostrarMensajeArticulo('Error de comunicación con el servidor', 'error');
  }
});

// -------------------------
// Eventos de tabla (editar / eliminar)
// -------------------------

tbodyArticulos.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-accion]');
  if (!btn) return;

  const accion = btn.dataset.accion;
  const id = btn.dataset.id;

  if (accion === 'editar') {
    try {
      const res = await fetch('/api/articulos/' + encodeURIComponent(id));
      if (!res.ok) {
        mostrarMensajeArticulo('No se pudo obtener la información del producto.', 'error');
        return;
      }
      const a = await res.json();

      articuloIdEnEdicion = a.id;
      document.getElementById('artNombre').value = a.nombre;
      document.getElementById('artDescripcion').value = a.descripcion || '';
      document.getElementById('artPrecio').value = a.precio;
      document.getElementById('artExistencia').value = a.existencia;
      document.getElementById('artImagen').value = '';

      // Resolver categoría padre / subcategoría a partir de a.categoria_id
      const cat = categoriasDataProductos.find(c => c.id === a.categoria_id);
      if (cat) {
        if (cat.parent_id) {
          // Es subcategoría
          artCategoriaPadre.value = String(cat.parent_id);
          llenarSelectSubcategorias(cat.parent_id);
          artSubcategoria.value = String(cat.id);
        } else {
          // Es categoría padre
          artCategoriaPadre.value = String(cat.id);
          artSubcategoria.innerHTML = '<option value="">Selecciona una subcategoría</option>';
          artSubcategoria.disabled = true;
        }
      } else {
        artCategoriaPadre.value = '';
        artSubcategoria.innerHTML = '<option value="">Selecciona una subcategoría</option>';
        artSubcategoria.disabled = true;
      }

      formArticuloTitulo.textContent = 'Editar producto';
      modoArticuloEtiqueta.textContent = 'Modo edición';
      btnArticuloGuardarTexto.textContent = 'Actualizar producto';

      mostrarMensajeArticulo('Editando producto ID ' + a.id, 'ok');
    } catch (err) {
      console.error(err);
      mostrarMensajeArticulo('Error de comunicación con el servidor', 'error');
    }
  }

  if (accion === 'eliminar') {
    if (!confirm('¿Seguro que deseas eliminar el producto ID ' + id + '?')) return;

    try {
      const res = await fetch('/api/articulos/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        mostrarMensajeArticulo(data.mensaje || 'No se pudo eliminar el producto', 'error');
        return;
      }
      mostrarMensajeArticulo(data.mensaje, 'ok');
      await cargarArticulos();
      
      if (window.refrescarCategoriasAdmin) {
        window.refrescarCategoriasAdmin();
      }

    } catch (err) {
      console.error(err);
      mostrarMensajeArticulo('Error de comunicación con el servidor', 'error');
    }
  }
});

// -------------------------
// Buscador
// -------------------------

buscadorArticulos.addEventListener('input', () => {
  const q = buscadorArticulos.value.trim().toLowerCase();
  if (!q) {
    articulosFiltrados = [];
    pintarTablaArticulos();
    return;
  }
  articulosFiltrados = articulosData.filter(a =>
    (a.codigo || '').toLowerCase().includes(q) ||
    (a.nombre || '').toLowerCase().includes(q)
  );
  pintarTablaArticulos();
});

// -------------------------
// Botón cancelar
// -------------------------

btnArticuloCancelar.addEventListener('click', () => {
  limpiarFormularioArticulo();
});

// -------------------------
// Inicialización
// -------------------------

(async function initArticulos() {
  await cargarCategoriasParaProductos();
  await cargarArticulos();
})();
