
const regexTelefono = /^[0-9]{10}$/;
const regexCorreo  = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const form = document.getElementById('formCliente');
const mensaje = document.getElementById('mensaje');
const tbody = document.getElementById('tbodyClientes');
const estadoTabla = document.getElementById('estadoTabla');
const buscador = document.getElementById('buscador');
const totalClientesSpan = document.getElementById('totalClientes');
const btnCancelar = document.getElementById('btnCancelar');
const formTitulo = document.getElementById('formTitulo');
const modoEtiqueta = document.getElementById('modoEtiqueta');
const btnGuardarTexto = document.getElementById('btnGuardarTexto');
const telInput = document.getElementById('telefono');

let telefonoEnEdicion = null;      // null = creación
let clientesData = [];             // todos los clientes
let clientesFiltrados = [];        // para búsqueda

function mostrarMensaje(texto, tipo = 'ok') {
mensaje.textContent = texto || '';
mensaje.className = 'status ' + (tipo || '');
}

function limpiarFormulario() {
form.reset();
telefonoEnEdicion = null;
telInput.disabled = false;
formTitulo.textContent = 'Nuevo cliente';
modoEtiqueta.textContent = 'Modo creación';
btnGuardarTexto.textContent = 'Guardar cliente';
mostrarMensaje('');
}

function formatearFecha(fechaIso) {
if (!fechaIso) return '-';
const fecha = new Date(fechaIso);
if (isNaN(fecha.getTime())) return fechaIso;
return fecha.toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
});
}

function pintarTabla() {
tbody.innerHTML = '';
const lista = clientesFiltrados.length ? clientesFiltrados : clientesData;

if (!lista.length) {
    estadoTabla.style.display = 'block';
    totalClientesSpan.textContent = '0';
    return;
}

estadoTabla.style.display = 'none';
totalClientesSpan.textContent = lista.length.toString();

lista.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td class="row-muted">${c.telefono}</td>
    <td>${c.nombre}</td>
    <td class="row-muted">${c.correo}</td>
    <td class="row-muted">${formatearFecha(c.creado_en)}</td>
    <td>
        <div class="action-buttons">
        <button class="btn-table btn-edit" data-accion="editar" data-tel="${c.telefono}">
            <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="btn-table btn-delete" data-accion="eliminar" data-tel="${c.telefono}">
            <span class="material-symbols-outlined">delete</span>
        </button>
        </div>
    </td>
    `;
    tbody.appendChild(tr);
});
}

async function cargarClientes() {
try {
    const res = await fetch('/api/clientes');
    if (!res.ok) {
    mostrarMensaje('No se pudieron obtener los clientes desde el servidor', 'error');
    return;
    }
    clientesData = await res.json();
    clientesFiltrados = [];
    pintarTabla();
} catch (err) {
    console.error(err);
    mostrarMensaje('Error de comunicación con el servidor', 'error');
}
}

function validarFormulario() {
const telefono = telInput.value.trim();
const nombre   = document.getElementById('nombre').value.trim();
const correo   = document.getElementById('correo').value.trim();
const password = document.getElementById('password').value;
const password2= document.getElementById('password2').value;

const errores = [];

if (!regexTelefono.test(telefono)) {
    errores.push('Teléfono inválido (deben ser 10 dígitos).');
}
if (!nombre) {
    errores.push('El nombre es obligatorio.');
}
if (!regexCorreo.test(correo)) {
    errores.push('Correo electrónico inválido.');
}

const esCreacion = telefonoEnEdicion === null;

if (esCreacion || password || password2) {
    if (password.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres.');
    }
    if (password !== password2) {
    errores.push('Las contraseñas no coinciden.');
    }
}

return errores;
}

form.addEventListener('submit', async (e) => {
e.preventDefault();
const errores = validarFormulario();
if (errores.length) {
    mostrarMensaje(errores.join(' '), 'error');
    return;
}

const telefono = telInput.value.trim();
const nombre   = document.getElementById('nombre').value.trim();
const correo   = document.getElementById('correo').value.trim();
const password = document.getElementById('password').value;

const payload = { nombre, correo };
let url = '/api/clientes';
let method = 'POST';

if (telefonoEnEdicion === null) {
    payload.telefono = telefono;
    payload.password = password;
} else {
    url += '/' + encodeURIComponent(telefonoEnEdicion);
    method = 'PUT';
    if (password) {
    payload.password = password;
    }
}

try {
    const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
    const texto = data.errores ? data.errores.join(' ') : (data.mensaje || 'Error en la operación.');
    mostrarMensaje(texto, 'error');
    return;
    }

    mostrarMensaje(data.mensaje || 'Operación realizada correctamente', 'ok');
    await cargarClientes();
    limpiarFormulario();
} catch (err) {
    console.error(err);
    mostrarMensaje('Error de comunicación con el servidor', 'error');
}
});

tbody.addEventListener('click', async (e) => {
const btn = e.target.closest('button[data-accion]');
if (!btn) return;

const accion = btn.dataset.accion;
const tel = btn.dataset.tel;

if (accion === 'editar') {
    try {
    const res = await fetch('/api/clientes/' + encodeURIComponent(tel));
    if (!res.ok) {
        mostrarMensaje('No se pudo obtener la información del cliente.', 'error');
        return;
    }
    const c = await res.json();
    telInput.value = c.telefono;
    telInput.disabled = true;
    document.getElementById('nombre').value = c.nombre;
    document.getElementById('correo').value = c.correo;
    document.getElementById('password').value = '';
    document.getElementById('password2').value = '';
    telefonoEnEdicion = c.telefono;
    formTitulo.textContent = 'Editar cliente';
    modoEtiqueta.textContent = 'Modo edición';
    btnGuardarTexto.textContent = 'Actualizar datos';
    mostrarMensaje('Editando cliente ' + c.telefono, 'ok');
    } catch (err) {
    console.error(err);
    mostrarMensaje('Error de comunicación con el servidor', 'error');
    }
}

if (accion === 'eliminar') {
    if (!confirm('¿Seguro que deseas eliminar al cliente ' + tel + '?')) return;

    try {
    const res = await fetch('/api/clientes/' + encodeURIComponent(tel), {
        method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) {
        mostrarMensaje(data.mensaje || 'No se pudo eliminar el cliente', 'error');
        return;
    }
    mostrarMensaje(data.mensaje, 'ok');
    await cargarClientes();
    } catch (err) {
    console.error(err);
    mostrarMensaje('Error de comunicación con el servidor', 'error');
    }
}
});

buscador.addEventListener('input', () => {
const q = buscador.value.trim().toLowerCase();
if (!q) {
    clientesFiltrados = [];
    pintarTabla();
    return;
}
clientesFiltrados = clientesData.filter(c =>
    c.telefono.toLowerCase().includes(q) ||
    (c.nombre || '').toLowerCase().includes(q) ||
    (c.correo || '').toLowerCase().includes(q)
);
pintarTabla();
});

btnCancelar.addEventListener('click', () => {
limpiarFormulario();
});

cargarClientes();
