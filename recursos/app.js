const api = {
  clientes: 'api/clientes.php',
  mascotas: 'api/mascotas.php',
  citas: 'api/citas.php',
  diagnosticos: 'api/diagnosticos.php',
  inventario: 'api/inventario.php',
  auth: 'api/autenticacion.php'
};

// Helper: formatear fecha y hora para UI (DD/MM/YYYY y 12 horas con a. m./p. m.)
function formatFechaDMY(ymd) {
  if (!ymd || typeof ymd !== 'string') return '';
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

function formatHora12(hms) {
  if (!hms || typeof hms !== 'string') return '';
  const parts = hms.split(':');
  if (parts.length < 2) return hms; // no tiene formato esperado
  let hh = parseInt(parts[0], 10);
  const mm = parts[1];
  if (isNaN(hh)) return hms;
  const esPM = hh >= 12;
  hh = hh % 12;
  if (hh === 0) hh = 12;
  // usar estilo español: 'a. m.' / 'p. m.'
  const sufijo = esPM ? 'p. m.' : 'a. m.';
  return `${hh}:${mm} ${sufijo}`;
}

// Helper: crea un efecto ripple dentro de un botón
function createButtonRipple(el, event) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${(event.clientX - rect.left) - radius}px`;
  ripple.style.top = `${(event.clientY - rect.top) - radius}px`;
  const prev = el.querySelector('.ripple');
  if (prev) prev.remove();
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// Datos cacheados de clientes para filtrado en el cliente
let clientesGlobal = [];

document.addEventListener('DOMContentLoaded', () => {
  // Menú lateral
  document.querySelectorAll('.btn-menu').forEach(btn => {
    btn.addEventListener('click', e => {
      const targetBtn = e.currentTarget; // asegura que siempre sea el botón
      const seccion = targetBtn.dataset.seccion;
      if (!seccion) return;
      // marcar activo
      document.querySelectorAll('.btn-menu').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.btn-menu').forEach(b => {
        if (b.dataset.seccion === seccion) b.classList.add('active');
      });
      mostrarSeccion(seccion);
    });
  });

  // Menú móvil: abrir/cerrar
  const btnMenu = document.getElementById('btnMenu');
  const menuMovil = document.getElementById('menuMovil');
  const sidebar = document.getElementById('sidebar');
  const menuBackdrop = document.getElementById('menuMovilBackdrop');
  const menuCerrar = document.getElementById('menuMovilCerrar');

  const abrirMenuMovil = () => { if (menuMovil) menuMovil.classList.remove('hidden'); };
  const cerrarMenuMovil = () => { if (menuMovil) menuMovil.classList.add('hidden'); };

  if (btnMenu) btnMenu.addEventListener('click', () => {
    // En pantallas grandes, colapsar/expandir sidebar; en chicas, abrir menú móvil
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop && sidebar) {
      sidebar.classList.toggle('collapsed');
      // marcar visualmente el botón cuando esté colapsado
      if (sidebar.classList.contains('collapsed')) btnMenu.classList.add('is-open');
      else btnMenu.classList.remove('is-open');
    } else if (menuMovil) {
      const opening = menuMovil.classList.contains('hidden');
      opening ? abrirMenuMovil() : cerrarMenuMovil();
      // estado visual para móvil
      if (opening) btnMenu.classList.add('is-open');
      else btnMenu.classList.remove('is-open');
    }
  });
  const cerrarYResetBtn = () => { cerrarMenuMovil(); if (btnMenu) btnMenu.classList.remove('is-open'); };
  if (menuBackdrop) menuBackdrop.addEventListener('click', cerrarYResetBtn);
  if (menuCerrar) menuCerrar.addEventListener('click', cerrarYResetBtn);
  if (menuMovil) {
    menuMovil.querySelectorAll('.btn-menu').forEach(b => b.addEventListener('click', cerrarYResetBtn));
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarYResetBtn(); });

  // Perfil: abrir/cerrar menú al estilo YouTube
  const btnPerfil = document.getElementById('btnPerfil');
  const menuPerfil = document.getElementById('menuPerfil');
  const perfilWrapper = document.getElementById('perfilWrapper');
  const togglePerfil = (open) => {
    if (!menuPerfil || !btnPerfil) return;
    const willOpen = open !== undefined ? open : menuPerfil.classList.contains('hidden');
    if (willOpen) {
      menuPerfil.classList.remove('hidden');
      btnPerfil.setAttribute('aria-expanded', 'true');
    } else {
      menuPerfil.classList.add('hidden');
      btnPerfil.setAttribute('aria-expanded', 'false');
    }
  };
  if (btnPerfil && menuPerfil) {
    btnPerfil.addEventListener('click', (e) => { e.stopPropagation(); togglePerfil(); });
    document.addEventListener('click', (e) => {
      if (!menuPerfil || menuPerfil.classList.contains('hidden')) return;
      if (perfilWrapper && !perfilWrapper.contains(e.target)) togglePerfil(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') togglePerfil(false); });
  }

  // marcar por defecto el dashboard como activo al cargar
  document.querySelectorAll('.btn-menu[data-seccion="inicio"]').forEach(b => b.classList.add('active'));

  // Inicializar sección actual con la visible para animaciones suaves
  const visibleSection = document.querySelector('.seccion:not(.oculto)');
  seccionActual = visibleSection ? visibleSection.id : 'inicio';

  // Cerrar sesión con efecto ripple
  const btnCerrar = document.getElementById('cerrarSesion');
  if (btnCerrar) {
    btnCerrar.addEventListener('click', async (e) => {
      createButtonRipple(btnCerrar, e);
      // pequeña pausa para que el ripple se perciba antes de salir
      await new Promise(r => setTimeout(r, 120));
      await fetch(api.auth + '?accion=cerrar', { method: 'POST' });
      window.location = 'index.php';
    });
  }

  // Inicializar dashboard
  cargarDashboard();
  cargarClientes();

  // Añadir funcionalidad de búsqueda (botón y Enter)
  const btnBuscar = document.getElementById('btnBuscarCliente');
  const inputBuscar = document.getElementById('buscarCliente');
  if (btnBuscar && inputBuscar) {
    btnBuscar.onclick = () => cargarClientes(inputBuscar.value.trim());
    inputBuscar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') cargarClientes(inputBuscar.value.trim());
    });
  }

  // Modal Agregar/Editar Cliente: eventos
  const btnAgregar = document.getElementById('agregarCliente');
  const modal = document.getElementById('modalCliente');
  const btnCancelar = document.getElementById('btnCancelarCliente');
  const formCliente = document.getElementById('formCliente');

  if (btnAgregar && modal) {
    btnAgregar.addEventListener('click', () => openModalCliente());
  }
  if (btnCancelar && modal) btnCancelar.addEventListener('click', closeModalCliente);
  if (formCliente) formCliente.addEventListener('submit', handleSubmitCliente);
});

// Nota: la función mostrarSeccion se define más abajo con inicialización de módulo de citas

/* ===========================================
   CLIENTES
=========================================== */
async function cargarClientes(filtro = '') {
  // Si aún no tenemos datos o se solicita recarga, traerlos
  try {
    const res = await fetch(api.clientes);
    const data = await res.json();
    clientesGlobal = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error cargando clientes', e);
    clientesGlobal = [];
  }

  // Aplicar filtro (nombre, teléfono, documento)
  const q = (filtro || '').toLowerCase();
  const lista = q ? clientesGlobal.filter(c => {
    return (c.nombre || '').toLowerCase().includes(q) ||
           (c.telefono || '').toLowerCase().includes(q) ||
           (c.documento || '').toLowerCase().includes(q);
  }) : clientesGlobal;

  renderClientes(lista);
}

function renderClientes(lista) {
  const cuerpo = document.getElementById('tablaClientes');
  if (!cuerpo) return;
  cuerpo.innerHTML = '';

  if (lista.length === 0) {
    const fila = document.createElement('tr');
    fila.innerHTML = `<td class="p-4" colspan="5"><div class="text-center text-gray-500 py-6">No se encontraron clientes.</div></td>`;
    cuerpo.appendChild(fila);
    return;
  }

  lista.forEach(c => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td class="p-4 font-medium text-gray-800">${c.nombre}</td>
      <td class="p-4 text-gray-600">${c.telefono || '-'}</td>
      <td class="p-4 text-gray-600">${c.documento || '-'}</td>
      <td class="p-4 text-gray-600">${c.direccion || '-'}</td>
      <td class="p-4">
        <button class="text-blue-600" onclick="editarCliente(${c.id})">Editar</button>
        <button class="text-red-600 ml-2" onclick="eliminarCliente(${c.id})">Eliminar</button>
      </td>`;
    cuerpo.appendChild(fila);
  });
}

// Modal helpers and submit
function openModalCliente(editId = null) {
  const modal = document.getElementById('modalCliente');
  const titulo = document.getElementById('modalTitulo');
  const inputNombre = document.getElementById('inputNombre');
  const inputTelefono = document.getElementById('inputTelefono');
  const inputDocumento = document.getElementById('inputDocumento');
  const inputDireccion = document.getElementById('inputDireccion');
  if (!modal) return;
  // mostrar modal usando clases para animación
  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.editId = editId ? String(editId) : '';
  const dialog = modal.querySelector('div.z-10 > div') || modal.querySelector('.bg-white');
  if (dialog) {
    dialog.classList.add('modal-enter');
    // forzar reflow para que la transición funcione
    void dialog.offsetWidth;
    dialog.classList.add('modal-enter-active');
    dialog.classList.remove('modal-leave-active');
  }

  if (editId) {
    titulo.textContent = 'Editar Cliente';
    const c = clientesGlobal.find(x => x.id == editId);
    if (c) {
      inputNombre.value = c.nombre || '';
      inputTelefono.value = c.telefono || '';
      inputDocumento.value = c.documento || '';
      inputDireccion.value = c.direccion || '';
    }
  } else {
    titulo.textContent = 'Agregar Cliente';
    inputNombre.value = '';
    inputTelefono.value = '';
    inputDocumento.value = '';
    inputDireccion.value = '';
  }
  // aplicar foco
  setTimeout(() => { inputNombre.focus(); }, 120);
}

function closeModalCliente() {
  const modal = document.getElementById('modalCliente');
  if (!modal) return;
  const dialog = modal.querySelector('div.z-10 > div') || modal.querySelector('.bg-white');
  if (dialog) {
    dialog.classList.remove('modal-enter-active');
    dialog.classList.add('modal-leave-active');
    setTimeout(() => {
      modal.classList.remove('items-center');
      modal.classList.add('hidden');
      modal.dataset.editId = '';
      if (dialog) { dialog.classList.remove('modal-enter', 'modal-leave-active'); }
    }, 160);
  } else {
    modal.classList.remove('items-center');
    modal.classList.add('hidden');
    modal.dataset.editId = '';
  }
}

async function handleSubmitCliente(e) {
  e.preventDefault();
  const modal = document.getElementById('modalCliente');
  const editId = modal ? modal.dataset.editId : '';
  const nombre = document.getElementById('inputNombre').value.trim();
  const telefono = document.getElementById('inputTelefono').value.trim();
  const documento = document.getElementById('inputDocumento').value.trim();
  const direccion = document.getElementById('inputDireccion').value.trim();

  if (!nombre) {
    alert('El nombre es obligatorio');
    return;
  }

  try {
    if (editId) {
      await fetch(api.clientes + '?id=' + editId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, documento, direccion })
      });
    } else {
      await fetch(api.clientes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, documento, direccion })
      });
    }
  } catch (err) {
    console.error('Error guardando cliente', err);
    alert('Ocurrió un error al guardar.');
  }

  closeModalCliente();
  cargarClientes();
}

async function editarCliente(id) {
  // Abrir modal con datos para editar
  openModalCliente(id);
}

async function eliminarCliente(id) {
  const modal = document.getElementById('modalConfirm');
  if (!modal) {
    if (!confirm('¿Eliminar cliente definitivamente?')) return;
    await fetch(api.clientes + '?id=' + id, { method: 'DELETE' });
    cargarClientes();
    return;
  }

  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.deleteId = String(id);
  modal.dataset.deleteType = 'cliente';
  const texto = document.getElementById('modalConfirmTexto');
  if (texto) texto.textContent = '¿Estás seguro de que deseas eliminar este cliente?';
}

/* ===========================================
   NUEVA SECCIÓN: MASCOTAS (Tarjetas modernas)
=========================================== */
async function cargarMascotas() {
  const contenedor = document.getElementById('listaMascotas');
  contenedor.innerHTML = '';

  const res = await fetch(api.mascotas);
  const mascotas = await res.json();

  if (mascotas.length === 0) {
    contenedor.innerHTML = `<p class="text-gray-500 text-center">No hay mascotas registradas.</p>`;
    return;
  }

  mascotas.forEach(m => {
    const card = document.createElement('div');
    card.className = 'pet-card relative shadow-sm hover:shadow-md transition';

    // usar SVGs para los iconos y estructura similar a la imagen
    card.innerHTML = `
      <div class="actions">
        <button class="icon-btn edit" title="Editar" onclick="editarMascota(${m.id})">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
          </svg>
        </button>
        <button class="icon-btn delete" title="Eliminar" onclick="eliminarMascota(${m.id})">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <h3>${m.nombre}</h3>
      <div class="meta">
        <p><span class="label">Tipo:</span> <span>${m.tipo || '-'}</span></p>
        <p><span class="label">Raza:</span> <span>${m.raza || '-'}</span></p>
        <p><span class="label">Edad:</span> <span>${m.edad || '-'}</span></p>
        <p><span class="label">Dueño:</span> <span>${m.cliente || 'Sin asignar'}</span></p>
      </div>
    `;
    contenedor.appendChild(card);
  });
}

// Botón para crear nueva mascota (asegurar que exista antes de asignar)
const btnMascota = document.getElementById('btnNuevaMascota');
if (btnMascota) {
  // usar addEventListener y log para depurar
  console.log('DBG: btnNuevaMascota encontrado y enlazado');
  btnMascota.addEventListener('click', () => {
    console.log('DBG: btnNuevaMascota click -> abrir modal');
    agregarMascota();
  });
} else {
  console.log('DBG: btnNuevaMascota NO encontrado');
}

// CRUD: agregar, editar y eliminar
async function agregarMascota() {
  openModalMascota();
}

async function editarMascota(id) {
  openModalMascota(id);
}

async function eliminarMascota(id) {
  // Mostrar modal de confirmación y almacenar id a eliminar
  const modal = document.getElementById('modalConfirm');
  if (!modal) {
    // fallback: confirm clásico
    if (!confirm('¿Eliminar mascota definitivamente?')) return;
    await fetch(api.mascotas + '?id=' + id, { method: 'DELETE' });
    cargarMascotas();
    return;
  }

  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.deleteId = String(id);
}

// Handlers para modal de confirmación
document.addEventListener('DOMContentLoaded', () => {
  const modalConfirm = document.getElementById('modalConfirm');
  const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
  const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

  if (btnCancelarEliminar) btnCancelarEliminar.addEventListener('click', () => {
    if (!modalConfirm) return;
    modalConfirm.classList.remove('items-center');
    modalConfirm.classList.add('hidden');
    modalConfirm.dataset.deleteId = '';
  });

  if (btnConfirmarEliminar) btnConfirmarEliminar.addEventListener('click', async () => {
    if (!modalConfirm) return;
    const id = modalConfirm.dataset.deleteId;
    const tipo = modalConfirm.dataset.deleteType || 'mascota';
    if (!id) return;
    try {
      if (tipo === 'cita') {
        await fetch(api.citas + '?id=' + id, { method: 'DELETE' });
        // cerrar modal
        modalConfirm.classList.remove('items-center');
        modalConfirm.classList.add('hidden');
        modalConfirm.dataset.deleteId = '';
        modalConfirm.dataset.deleteType = '';
        await fetchAndRenderCitas();
      } else if (tipo === 'cliente') {
        await fetch(api.clientes + '?id=' + id, { method: 'DELETE' });
        // cerrar modal
        modalConfirm.classList.remove('items-center');
        modalConfirm.classList.add('hidden');
        modalConfirm.dataset.deleteId = '';
        modalConfirm.dataset.deleteType = '';
        cargarClientes();
      } else if (tipo === 'diagnostico') {
        await fetch(api.diagnosticos + '?id=' + id, { method: 'DELETE' });
        // cerrar modal
        modalConfirm.classList.remove('items-center');
        modalConfirm.classList.add('hidden');
        modalConfirm.dataset.deleteId = '';
        modalConfirm.dataset.deleteType = '';
        cargarDiagnosticos();
      } else if (tipo === 'producto') {
        await fetch(api.inventario + '?id=' + id, { method: 'DELETE' });
        // cerrar modal
        modalConfirm.classList.remove('items-center');
        modalConfirm.classList.add('hidden');
        modalConfirm.dataset.deleteId = '';
        modalConfirm.dataset.deleteType = '';
        cargarInventario();
      } else {
        // por defecto: mascota
        await fetch(api.mascotas + '?id=' + id, { method: 'DELETE' });
        // cerrar modal
        modalConfirm.classList.remove('items-center');
        modalConfirm.classList.add('hidden');
        modalConfirm.dataset.deleteId = '';
        modalConfirm.dataset.deleteType = '';
        cargarMascotas();
      }
    } catch (err) {
      console.error('Error eliminando', err);
      alert('Ocurrió un error al eliminar el elemento');
    }
  });
  });


/* ===========================
   MÓDULO DE CITAS - CALENDARIO
   Reemplaza/pega todo este bloque en recursos/app.js
   =========================== */

let mesSeleccionado = new Date().getMonth();
let anioSeleccionado = new Date().getFullYear();
let citasGlobal = [];
let calendarioInit = false;
let seccionActual = null;
let _sectionTransitionLock = false;

// Función que descarga citas y renderiza calendario + lista
async function fetchAndRenderCitas() {
  try {
    const res = await fetch(api.citas);
    citations = await res.json();
    // Normalizar nombres de campo: algunos endpoints devuelven "mascota" o "mascota" ya unido
    citasGlobal = Array.isArray(citations) ? citations : [];
  } catch (e) {
    console.error('Error al obtener citas:', e);
    citasGlobal = [];
  }
  renderizarCalendario();
  renderizarProximasCitas();
}

// Renderiza calendario para mesSeleccionado/anioSeleccionado
function renderizarCalendario() {
  const calendario = document.getElementById('calendarioCitas');
  const titulo = document.getElementById('tituloMes');
  if (!calendario || !titulo) return;

  const nombresMes = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const nombresDias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  titulo.textContent = `${nombresMes[mesSeleccionado]} ${anioSeleccionado}`;
  calendario.innerHTML = '';

  // Cabecera días
  nombresDias.forEach(d => {
    const head = document.createElement('div');
    head.className = 'text-sm font-semibold text-indigo-700';
    head.textContent = d;
    calendario.appendChild(head);
  });

  const primerDia = new Date(anioSeleccionado, mesSeleccionado, 1).getDay(); // 0..6
  const diasMes = new Date(anioSeleccionado, mesSeleccionado + 1, 0).getDate();

  // celdas vacías para alinear primer dia
  for (let i = 0; i < primerDia; i++) {
    const vacio = document.createElement('div');
    calendario.appendChild(vacio);
  }

  // crear celdas de dias
  for (let d = 1; d <= diasMes; d++) {
    const y = anioSeleccionado;
    const m = String(mesSeleccionado + 1).padStart(2,'0');
    const day = String(d).padStart(2,'0');
    const fechaYMD = `${y}-${m}-${day}`;

    const count = citasGlobal.filter(c => (c.fecha || '') === fechaYMD).length;

    const celda = document.createElement('div');
    celda.className = 'relative p-3 rounded min-h-[64px] flex flex-col items-start bg-white border border-gray-100';
    celda.style.cursor = 'pointer';

    const numero = document.createElement('div');
    numero.className = 'text-sm text-gray-700';
    numero.textContent = d;
    celda.appendChild(numero);

    if (count > 0) {
      const badge = document.createElement('div');
      badge.className = 'absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full';
      badge.textContent = count;
      celda.appendChild(badge);
      celda.classList.add('bg-purple-50');
    } else {
      celda.classList.add('hover:bg-gray-50');
    }

    // click sobre el día -> mostrar citas del día
    celda.addEventListener('click', () => {
      mostrarCitasDelDia(fechaYMD);
    });

    calendario.appendChild(celda);
  }
}

// Muestra en la lista las citas de un día específico
function mostrarCitasDelDia(fechaYMD) {
  const cont = document.getElementById('listaCitas');
  if (!cont) return;
  const citasDia = citasGlobal.filter(c => (c.fecha || '') === fechaYMD).sort((a,b) => (a.hora||'').localeCompare(b.hora||''));
  cont.innerHTML = `<div class="mb-2 font-semibold text-gray-700">Citas del ${formatFechaDMY(fechaYMD)}</div>`;
  if (citasDia.length === 0) {
    cont.innerHTML += `<p class="text-gray-500">No hay citas para esta fecha.</p>`;
    return;
  }
  citasDia.forEach(c => {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded-lg p-3 flex justify-between items-start shadow-sm hover:shadow-md transition';
    const info = document.createElement('div');
    info.innerHTML = `
      <div class="font-semibold text-gray-800">${c.mascota || c.nombre_mascota || 'Mascota'}</div>
      <div class="text-sm text-gray-600">${formatFechaDMY(c.fecha)} a las ${formatHora12(c.hora || '')}</div>
      <div class="text-sm text-gray-500">${c.motivo || ''}</div>
    `;
    const acciones = document.createElement('div');
    acciones.className = 'flex gap-2';
    // usar SVGs para consistencia visual
    acciones.innerHTML = `
      <button class="icon-btn edit" title="Editar" onclick="editarCita(${c.id})">
        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
        </svg>
      </button>
      <button class="icon-btn delete" title="Eliminar" onclick="eliminarCita(${c.id})">
        <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
      </button>
    `;
    card.appendChild(info);
    card.appendChild(acciones);
    cont.appendChild(card);
  });
}

// Renderiza la lista de próximas citas (por defecto muestra 6 próximas)
function renderizarProximasCitas() {
  const cont = document.getElementById('listaCitas');
  if (!cont) return;
  const proximas = citasGlobal.slice().sort((a,b) => {
    if (a.fecha === b.fecha) return (a.hora||'').localeCompare(b.hora||'');
    return new Date(a.fecha) - new Date(b.fecha);
  }).slice(0,6);

  cont.innerHTML = '';
  if (proximas.length === 0) {
    cont.innerHTML = `<p class="text-gray-500 text-center">No hay citas registradas.</p>`;
    return;
  }
  proximas.forEach(c => {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded-lg p-3 flex justify-between items-start shadow-sm hover:shadow-md transition';
    const info = document.createElement('div');
    info.innerHTML = `
      <div class="font-semibold text-gray-800">${c.mascota || c.nombre_mascota || 'Mascota'}</div>
      <div class="text-sm text-gray-600">${formatFechaDMY(c.fecha)} a las ${formatHora12(c.hora || '')}</div>
      <div class="text-sm text-gray-500">${c.motivo || ''}</div>
    `;
    const acciones = document.createElement('div');
    acciones.className = 'flex gap-2';
    acciones.innerHTML = `
      <button class="icon-btn edit" title="Editar" onclick="editarCita(${c.id})">
        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
        </svg>
      </button>
      <button class="icon-btn delete" title="Eliminar" onclick="eliminarCita(${c.id})">
        <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
      </button>
    `;
    card.appendChild(info);
    card.appendChild(acciones);
    cont.appendChild(card);
  });
}

/* ---- Navegación meses ---- */
function inicializarNavMeses() {
  if (calendarioInit) return;
  const prev = document.getElementById('prevMes');
  const next = document.getElementById('nextMes');
  const nuevo = document.getElementById('btnNuevaCita');

  if (prev) prev.addEventListener('click', () => {
    mesSeleccionado--;
    if (mesSeleccionado < 0) { mesSeleccionado = 11; anioSeleccionado--; }
    renderizarCalendario();
  });

  if (next) next.addEventListener('click', () => {
    mesSeleccionado++;
    if (mesSeleccionado > 11) { mesSeleccionado = 0; anioSeleccionado++; }
    renderizarCalendario();
  });

  if (nuevo) nuevo.addEventListener('click', async () => {
    // abrir modal para crear cita en lugar de usar prompts
    openModalCita();
  });

  calendarioInit = true;
}

/* ---- CRUD simple (prompt) y refresco ---- */
async function agregarCitaModalSimple() {
  const id_mascota = prompt('ID de la mascota:');
  const fecha = prompt('Fecha (AAAA-MM-DD):');
  const hora = prompt('Hora (HH:MM):');
  const motivo = prompt('Motivo:');
  if (!id_mascota || !fecha || !hora) return alert('Datos incompletos');
  await fetch(api.citas, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_mascota, fecha, hora, motivo })
  });
  await fetchAndRenderCitas();
}

/* ======================================
   MODAL CITA (Nuevo/Editar)
====================================== */
async function poblarSelectMascotas() {
  try {
    const res = await fetch(api.mascotas);
    const data = await res.json();
    const sel = document.getElementById('citaMascota');
    if (!sel) return;
    sel.innerHTML = '<option value="">Seleccionar mascota</option>';
    (Array.isArray(data) ? data : []).forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.nombre} - ${m.cliente || 'Sin dueño'}`;
      sel.appendChild(opt);
    });
  } catch (e) { console.error('Error cargando mascotas para cita', e); }
}

function openModalCita(editId = null) {
  const modal = document.getElementById('modalCita');
  if (!modal) return;
  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.editId = editId ? String(editId) : '';
  const titulo = document.getElementById('modalCitaTitulo');
  if (titulo) titulo.textContent = editId ? 'Editar Cita' : 'Agendar Cita';
  poblarSelectMascotas();

  if (editId) {
    // cargar datos de la cita
    fetch(api.citas).then(r => r.json()).then(list => {
      const c = (Array.isArray(list) ? list : []).find(x => x.id == editId);
      if (!c) return;
      document.getElementById('citaMascota').value = c.id_mascota || '';
      document.getElementById('citaFecha').value = c.fecha || '';
      document.getElementById('citaHora').value = c.hora || '';
      document.getElementById('citaMotivo').value = c.motivo || '';
    }).catch(e => console.error(e));
  } else {
    const form = document.getElementById('formCita'); if (form) form.reset();
  }
}

function closeModalCita() {
  const modal = document.getElementById('modalCita');
  if (!modal) return;
  modal.classList.remove('items-center');
  modal.classList.add('hidden');
  modal.dataset.editId = '';
}

// manejar submit del formCita
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formCita');
  const btnCancelar = document.getElementById('btnCancelarCita');
  if (btnCancelar) btnCancelar.addEventListener('click', closeModalCita);

  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const modal = document.getElementById('modalCita');
    const editId = modal ? modal.dataset.editId : '';
    const id_mascota = document.getElementById('citaMascota').value;
    const fecha = document.getElementById('citaFecha').value;
    const hora = document.getElementById('citaHora').value;
    const motivo = document.getElementById('citaMotivo').value.trim();

    if (!id_mascota) return alert('Selecciona una mascota');
    if (!fecha) return alert('Selecciona una fecha');
    if (!hora) return alert('Selecciona una hora');

    const payload = { id_mascota, fecha, hora, motivo };
    try {
      if (editId) {
        await fetch(api.citas + '?id=' + editId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(api.citas, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      closeModalCita();
      await fetchAndRenderCitas();
    } catch (err) {
      console.error('Error guardando cita', err);
      alert('Ocurrió un error al guardar la cita');
    }
  });
});

async function editarCita(id) {
  // Abrir modal con datos precargados
  openModalCita(id);
}

async function eliminarCita(id) {
  const modal = document.getElementById('modalConfirm');
  if (!modal) {
    if (!confirm('¿Eliminar cita definitivamente?')) return;
    await fetch(api.citas + '?id=' + id, { method: 'DELETE' });
    await fetchAndRenderCitas();
    return;
  }

  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.deleteId = String(id);
  modal.dataset.deleteType = 'cita';
  const texto = document.getElementById('modalConfirmTexto');
  if (texto) texto.textContent = '¿Estás seguro de que deseas eliminar esta cita?';
}

/* ---- Inicializar módulo cuando corresponda ---- */
function initCitasModuleIfNeeded() {
  inicializarNavMeses();
  fetchAndRenderCitas();
}

/* ---- Reemplaza / actualiza la función mostrarSeccion para llamar al calendario ---- */
function mostrarSeccion(id) {
  const next = document.getElementById(id);
  if (!next) return;

  // Detectar actual visible la primera vez
  if (!seccionActual) {
    const visible = document.querySelector('.seccion:not(.oculto)');
    seccionActual = visible ? visible.id : 'inicio';
  }

  if (_sectionTransitionLock || id === seccionActual) return;

  const current = document.getElementById(seccionActual);
  const LEAVE_MS = 300; // debe empatar con CSS
  const ENTER_MS = 380; // debe empatar con CSS
  _sectionTransitionLock = true;
  const proceedEnter = () => {
    // Mostrar nueva sección con animación de entrada
    next.classList.remove('oculto');
    next.classList.add('section-enter');
    // Forzar reflow para activar transición
    void next.offsetWidth;
    next.classList.add('section-enter-active');
    setTimeout(() => {
      next.classList.remove('section-enter', 'section-enter-active');
      _sectionTransitionLock = false;
    }, ENTER_MS + 40);
  };

  // Animación de salida de la sección actual
  if (current) {
    current.classList.add('section-leave-active');
    // Ocultar tras la transición, y recién entonces entrar la nueva
    setTimeout(() => {
      current.classList.add('oculto');
      current.classList.remove('section-leave-active');
      proceedEnter();
    }, LEAVE_MS + 20);
  }
  else {
    // No hay sección actual: mostrar directamente
    proceedEnter();
  }

  seccionActual = id;

  // cargar secciones específicas (mantener comportamiento anterior)
  if (id === 'clientes') cargarClientes();
  if (id === 'mascotas') cargarMascotas();
  if (id === 'citas') {
    initCitasModuleIfNeeded();
  }
  if (id === 'diagnosticos') cargarDiagnosticos();
  if (id === 'inventario') cargarInventario();
  if (id === 'inicio') cargarDashboard();
}

/* ===========================================
   DIAGNÓSTICOS
=========================================== */
async function cargarDiagnosticos() {
  const cont = document.getElementById('diagnosticos');
  cont.innerHTML = `<div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Gestión de Diagnósticos</h2>
      <button id="btnNuevoDiagnostico" class="ml-auto">＋ Nuevo Diagnóstico</button>
    </div>
    <div id="listaDiagnosticos"></div>`;

  const res = await fetch(api.diagnosticos);
  const data = await res.json();
  const lista = document.getElementById('listaDiagnosticos');
  lista.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    lista.innerHTML = `<p class="text-gray-500">No hay diagnósticos registrados.</p>`;
    return;
  }

  data.forEach(d => {
    const card = document.createElement('div');
    card.className = 'diagnosis-card';
    card.innerHTML = `
      <div class="actions">
        <button class="icon-btn edit" title="Editar" onclick="editarDiagnostico(${d.id})">
          <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
          </svg>
        </button>
        <button class="icon-btn delete" title="Eliminar" onclick="eliminarDiagnostico(${d.id})">
          <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <h4>${d.mascota || '-'}${d.nombre_cliente ? ' - ' + d.nombre_cliente : ''}</h4>
      <div class="meta"><b>Fecha:</b> ${formatFechaDMY(d.fecha)}</div>
      <div class="meta"><b>Síntomas:</b> ${d.sintomas}</div>
      <div class="meta"><b>Diagnóstico:</b> ${d.diagnostico}</div>
      <div class="meta"><b>Tratamiento:</b> ${d.tratamiento}</div>
    `;
    lista.appendChild(card);
  });

  // asignar evento al botón de nuevo diagnóstico
  const btnNuevo = document.getElementById('btnNuevoDiagnostico');
  if (btnNuevo) btnNuevo.addEventListener('click', agregarDiagnostico);
}

async function agregarDiagnostico() {
  abrirModalDiagnostico();
}

async function editarDiagnostico(id) {
  abrirModalDiagnostico(id);
}

async function eliminarDiagnostico(id) {
  const modal = document.getElementById('modalConfirm');
  if (!modal) {
    if (!confirm('¿Eliminar diagnóstico?')) return;
    await fetch(api.diagnosticos + '?id=' + id, { method: 'DELETE' });
    cargarDiagnosticos();
    return;
  }

  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.deleteId = String(id);
  modal.dataset.deleteType = 'diagnostico';
  const texto = document.getElementById('modalConfirmTexto');
  if (texto) texto.textContent = '¿Estás seguro de que deseas eliminar este diagnóstico?';
}

/* ===========================================
   INVENTARIO
=========================================== */
async function cargarInventario() {
  // renderiza la tabla existente (markup provisto en panel.php)
  const res = await fetch(api.inventario);
  const productos = await res.json();
  const cuerpo = document.getElementById('tablaInventario');
  if (!cuerpo) return;
  cuerpo.innerHTML = '';

  if (!Array.isArray(productos) || productos.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td class="p-4 text-center text-gray-500" colspan="6">No hay productos en el inventario.</td>`;
    cuerpo.appendChild(row);
    return;
  }

  productos.forEach(p => {
    const estado = (Number(p.cantidad) || 0) > 10 ? 'En Stock' : 'Bajo Stock';
    const badgeClass = estado === 'En Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const fila = document.createElement('tr');
    fila.className = 'border-b';
    // formatear precio para mostrar con separador de miles (ej. 10.000) sin decimales
    const displayPrecio = formatPriceForDisplay(String(Math.round(parsePriceToNumber(p.precio))));
    fila.innerHTML = `
      <td class="p-4 font-medium text-gray-800">${p.nombre}</td>
      <td class="p-4 text-gray-600">${p.categoria}</td>
      <td class="p-4 text-gray-700">${p.cantidad}</td>
      <td class="p-4 text-gray-700">${displayPrecio}</td>
      <td class="p-4"><span class="px-3 py-1 rounded-full text-sm ${badgeClass}">${estado}</span></td>
      <td class="p-4">
        <button class="text-blue-600 hover:underline mr-4" onclick="editarProducto(${p.id})">Editar</button>
        <button class="text-red-600 hover:underline" onclick="eliminarProducto(${p.id})">Eliminar</button>
      </td>`;
    cuerpo.appendChild(fila);
  });

  // enlazar botón agregar producto si existe
  const btnAgregar = document.getElementById('btnAgregarProducto');
  if (btnAgregar) {
    btnAgregar.removeEventListener && btnAgregar.removeEventListener('click', agregarProducto);
    btnAgregar.addEventListener('click', agregarProducto);
  }
}

async function agregarProducto() {
  openModalProducto();
}

  function openModalProducto(editId = null) {
    const modal = document.getElementById('modalProducto');
    if (!modal) return;
    modal.classList.add('items-center');
    modal.classList.remove('hidden');
    modal.dataset.editId = editId ? String(editId) : '';
    const titulo = document.getElementById('modalProductoTitulo');
    if (titulo) titulo.textContent = editId ? 'Editar Producto' : 'Agregar Producto';
    // reset form or populate when editing
    poblarCategorias();
    if (editId) {
      // cargar datos del producto
      fetch(api.inventario).then(r => r.json()).then(list => {
        const p = (Array.isArray(list) ? list : []).find(x => x.id == editId);
        if (!p) return;
        document.getElementById('inputProductoNombre').value = p.nombre || '';
        // si la categoria es un id o texto, intentar asignar
        const sel = document.getElementById('selectProductoCategoria');
        if (sel) {
          // si option existe seleccionarla, sino añadir opción temporal
          let opt = Array.from(sel.options).find(o => o.value == p.categoria || o.text === p.categoria);
          if (!opt) {
            opt = document.createElement('option');
            opt.value = p.categoria || '';
            opt.text = p.categoria || '';
            sel.appendChild(opt);
          }
          sel.value = opt.value;
        }
        document.getElementById('inputProductoCantidad').value = p.cantidad || 0;
    // formatear precio para que el usuario lo vea con separadores de miles (ej. 10.000)
    document.getElementById('inputProductoPrecio').value = formatPriceForDisplay(String(p.precio || '0'));
      }).catch(e => console.error(e));
    } else {
      const form = document.getElementById('formProducto'); if (form) form.reset();
    }
    setTimeout(() => { const el = document.getElementById('inputProductoNombre'); if (el) el.focus(); }, 120);
  }

  function closeModalProducto() {
    const modal = document.getElementById('modalProducto');
    if (!modal) return;
    modal.classList.remove('items-center');
    modal.classList.add('hidden');
    modal.dataset.editId = '';
  }

  async function poblarCategorias() {
    const sel = document.getElementById('selectProductoCategoria');
    if (!sel) return;
    sel.innerHTML = '<option value="">Seleccionar categoría</option>';
    try {
      // Intentar obtener categorías desde el backend (si está implementado)
      const res = await fetch(api.inventario + '?categorias=1');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(c => {
          const opt = document.createElement('option');
          // si el backend devuelve objetos con id/nombre o solo strings
          if (typeof c === 'object') {
            opt.value = c.id ?? c.nombre ?? c.value ?? '';
            opt.textContent = c.nombre ?? c.value ?? c.id ?? '';
          } else {
            opt.value = c; opt.textContent = c;
          }
          sel.appendChild(opt);
        });
        return;
      }
    } catch (e) {
      // si falla, continuar con categorías por defecto
      console.warn('No se pudieron cargar categorías desde la API', e);
    }

    // Categorías por defecto
    ['Medicamento','Alimento','Accesorio','Otro'].forEach(name => {
      const opt = document.createElement('option'); opt.value = name; opt.textContent = name; sel.appendChild(opt);
    });
  }

  // Helper: formatea una cadena numérica para display con separador de miles '.' y decimal ','
  function formatPriceForDisplay(input) {
    if (input === null || input === undefined) return '';
    let s = String(input).trim();
    if (s === '') return '';
    // Normalizar: reemplazar comas por ',' y puntos temporales
    // Detectar separator decimal
    const hasComma = s.indexOf(',') !== -1;
    const dotCount = (s.match(/\./g) || []).length;
    let intPart = s;
    let decPart = '';
    if (hasComma) {
      const parts = s.split(',');
      intPart = parts[0].replace(/\./g, '');
      decPart = parts[1] || '';
    } else if (dotCount > 1) {
      // multiple dots -> likely thousand separators
      intPart = s.replace(/\./g, '');
    } else if (dotCount === 1) {
      const parts = s.split('.');
      // si la parte decimal tiene 1-2 dígitos, tratar como decimal
      if ((parts[1] || '').length <= 2) {
        intPart = parts[0].replace(/\./g, '');
        decPart = parts[1] || '';
      } else {
        // dot as thousand separator
        intPart = s.replace(/\./g, '');
      }
    }

    // remover cualquier caracter no numérico en intPart
    intPart = intPart.replace(/[^0-9]/g, '');
    if (intPart === '') intPart = '0';
    // aplicar separador de miles '.'
    const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    if (decPart) return withThousands + ',' + decPart;
    return withThousands;
  }

  // Helper: parsea una cadena que puede usar '.' como miles y ',' o '.' como decimal
  function parsePriceToNumber(input) {
    if (input === null || input === undefined) return 0;
    let s = String(input).trim();
    if (s === '') return 0;
    // quitar espacios
    s = s.replace(/\s+/g, '');
    const hasComma = s.indexOf(',') !== -1;
    const dotCount = (s.match(/\./g) || []).length;

    let thousandsSep = '';
    let decimalSep = '';
    if (hasComma) {
      decimalSep = ',';
      thousandsSep = '.';
    } else if (dotCount > 1) {
      thousandsSep = '.';
      decimalSep = ',';
    } else if (dotCount === 1) {
      const after = s.split('.')[1] || '';
      if (after.length <= 2) {
        decimalSep = '.';
        thousandsSep = ',';
      } else {
        thousandsSep = '.';
        decimalSep = ',';
      }
    }

    if (thousandsSep) {
      const rx = new RegExp('\\' + thousandsSep, 'g');
      s = s.replace(rx, '');
    }
    if (decimalSep) {
      if (decimalSep === ',') s = s.replace(',', '.');
    }
    // eliminar todo lo que no sea dígito o punto
    s = s.replace(/[^0-9\.\-]/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  // Formateo en tiempo real al tipear en el input de precio
  document.addEventListener('DOMContentLoaded', () => {
    const precioInput = document.getElementById('inputProductoPrecio');
    if (precioInput) {
      precioInput.addEventListener('input', (e) => {
        // preservar solo mientras formateamos: convertimos y volvemos a formatear
        const val = e.target.value || '';
        const parsed = parsePriceToNumber(val);
        // si el usuario está borrando, permitir campo vacío
        if (val.trim() === '') { e.target.value = ''; return; }
        e.target.value = formatPriceForDisplay(String(parsed));
      });
    }
  });

  // manejar submit del formProducto
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formProducto');
    const btnCancelar = document.getElementById('btnCancelarProducto');
    if (btnCancelar) btnCancelar.addEventListener('click', closeModalProducto);

    if (form) form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const modal = document.getElementById('modalProducto');
      const editId = modal ? modal.dataset.editId : '';
      const nombre = document.getElementById('inputProductoNombre').value.trim();
      const categoria = document.getElementById('selectProductoCategoria').value;
      const cantidad = document.getElementById('inputProductoCantidad').value;
      const precio = document.getElementById('inputProductoPrecio').value;

      if (!nombre) return alert('El nombre del producto es obligatorio');

  const payload = { nombre, categoria, cantidad: Number(cantidad) || 0, precio: parsePriceToNumber(precio) || 0 };

      try {
        if (editId) {
          await fetch(api.inventario + '?id=' + editId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch(api.inventario, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
        closeModalProducto();
        cargarInventario();
      } catch (err) {
        console.error('Error guardando producto', err);
        alert('Ocurrió un error al guardar el producto');
      }
    });
  });

async function editarProducto(id) {
  openModalProducto(id);
}

async function eliminarProducto(id) {
  const modal = document.getElementById('modalConfirm');
  if (!modal) {
    if (!confirm('¿Eliminar producto?')) return;
    await fetch(api.inventario + '?id=' + id, { method: 'DELETE' });
    cargarInventario();
    return;
  }

  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.deleteId = String(id);
  modal.dataset.deleteType = 'producto';
  const texto = document.getElementById('modalConfirmTexto');
  if (texto) texto.textContent = '¿Estás seguro de que deseas eliminar este producto?';
}

/* ===========================================
   DASHBOARD (DATOS REALES)
=========================================== */
async function cargarDashboard() {
  // Obtener datos de todas las entidades
  const [clientes, mascotas, citas, inventario] = await Promise.all([
    fetch(api.clientes).then(r => r.json()),
    fetch(api.mascotas).then(r => r.json()),
    fetch(api.citas).then(r => r.json()),
    fetch(api.inventario).then(r => r.json())
  ]);

  // Crear tarjetas resumen
  const tarjetas = [
    {
      titulo: 'Total Clientes',
      valor: Array.isArray(clientes) ? clientes.length : 0,
      border: 'border-blue-500',
      circle: 'bg-blue-100',
      icon: `<svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>`
    },
    {
      titulo: 'Mascotas Registradas',
      valor: Array.isArray(mascotas) ? mascotas.length : 0,
      border: 'border-green-500',
      circle: 'bg-green-100',
      icon: `<img src="https://img.icons8.com/ios-filled/50/cat-footprint.png" alt="Mascotas" width="24" height="24" style="display:block" />`
    },
    {
      titulo: 'Citas Programadas',
      valor: Array.isArray(citas) ? citas.length : 0,
      border: 'border-purple-500',
      circle: 'bg-purple-100',
      icon: `<svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>`
    },
    {
      titulo: 'Productos en Stock',
      valor: Array.isArray(inventario) ? inventario.length : 0,
      border: 'border-orange-500',
      circle: 'bg-orange-100',
      icon: `<svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9a1 1 0 112 0v6a1 1 0 11-2 0V9zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V9z" clip-rule="evenodd"></path></svg>`
    }
  ];

  const contenedor = document.getElementById('tarjetas');
  contenedor.innerHTML = '';
  tarjetas.forEach(t => {
    const card = document.createElement('div');
    card.className = `bg-white rounded-xl shadow-lg p-6 border-l-4 ${t.border}`;
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm">${t.titulo}</p>
          <p class="text-3xl font-bold text-gray-800">${t.valor}</p>
        </div>
        <div class="w-12 h-12 ${t.circle} rounded-full flex items-center justify-center">
          ${t.icon}
        </div>
      </div>`;
    contenedor.appendChild(card);
  });

  /* ---- Gráfico de Citas Mensuales ---- */
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const citasPorMes = new Array(12).fill(0);

  citas.forEach(c => {
    const mes = new Date(c.fecha).getMonth(); // 0-11
    citasPorMes[mes]++;
  });

  const ctx1 = document.getElementById('graficoCitas').getContext('2d');
  new Chart(ctx1, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Citas',
        data: citasPorMes,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });

  /* ---- Gráfico de Tipos de Mascotas ---- */
  // Contar cuántas mascotas hay de cada tipo
  const tipos = {};
  mascotas.forEach(m => {
    const tipo = m.tipo ? m.tipo.trim().toLowerCase() : 'otro';
    if (!tipos[tipo]) tipos[tipo] = 0;
    tipos[tipo]++;
  });

  // Organizar para el gráfico
  const etiquetas = Object.keys(tipos).map(t => t.charAt(0).toUpperCase() + t.slice(1));
  const valores = Object.values(tipos);

  const colores = ['#3b82f6', '#f97316', '#a855f7', '#22c55e', '#eab308'];

  const ctx2 = document.getElementById('graficoMascotas').getContext('2d');
  new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: etiquetas,
      datasets: [{
        data: valores,
        backgroundColor: colores.slice(0, etiquetas.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 14 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.formattedValue} mascota(s)`;
            }
          }
        }
      }
    }
  });
}

// Modal Diagnóstico helpers
async function abrirModalDiagnostico(editId = null) {
  const modal = document.getElementById('modalDiagnostico');
  const titulo = document.getElementById('modalDiagnosticoTitulo');
  if (!modal) return;

  // cargar mascotas en select
  try {
    const res = await fetch(api.mascotas);
    const mascotas = await res.json();
    const sel = document.getElementById('diagMascota');
    if (sel) {
      sel.innerHTML = '<option value="">Seleccionar mascota</option>';
      mascotas.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.nombre} - ${m.cliente || 'Sin dueño'}`;
        sel.appendChild(opt);
      });
    }
  } catch (e) { console.error('Error cargando mascotas', e); }

  // abrir modal
  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.editId = editId ? String(editId) : '';

  // prefijar fecha hoy
  const fechaInput = document.getElementById('diagFecha');
  if (fechaInput) {
    if (!editId) {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      fechaInput.value = `${yyyy}-${mm}-${dd}`;
    }
  }

  if (editId) {
    titulo.textContent = 'Editar Diagnóstico';
    // cargar datos
    try {
      const r = await fetch(api.diagnosticos);
      const data = await r.json();
      const d = data.find(x => x.id == editId);
      if (d) {
        document.getElementById('diagMascota').value = d.id_mascota || '';
        document.getElementById('diagFecha').value = d.fecha || '';
        document.getElementById('diagSintomas').value = d.sintomas || '';
        document.getElementById('diagDiagnostico').value = d.diagnostico || '';
        document.getElementById('diagTratamiento').value = d.tratamiento || '';
      }
    } catch (e) { console.error(e); }
  } else {
    titulo.textContent = 'Nuevo Diagnóstico';
    const form = document.getElementById('formDiagnostico');
    if (form) form.reset();
    // volver a poner fecha hoy si existe
    if (fechaInput) {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      fechaInput.value = `${yyyy}-${mm}-${dd}`;
    }
  }
}

function closeModalDiagnostico() {
  const modal = document.getElementById('modalDiagnostico');
  if (!modal) return;
  modal.classList.remove('items-center');
  modal.classList.add('hidden');
  modal.dataset.editId = '';
}

// manejar submit del formDiagnostico
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formDiagnostico');
  const btnCancelar = document.getElementById('btnCancelarDiagnostico');
  if (btnCancelar) btnCancelar.addEventListener('click', closeModalDiagnostico);

  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const modal = document.getElementById('modalDiagnostico');
    const editId = modal ? modal.dataset.editId : '';
    const id_mascota = document.getElementById('diagMascota').value;
    const fecha = document.getElementById('diagFecha').value;
    const sintomas = document.getElementById('diagSintomas').value.trim();
    const diagnostico = document.getElementById('diagDiagnostico').value.trim();
    const tratamiento = document.getElementById('diagTratamiento').value.trim();

    if (!id_mascota) return alert('Selecciona una mascota');
    if (!fecha) return alert('Selecciona una fecha');

    const payload = { id_mascota, fecha, sintomas, diagnostico, tratamiento };

    try {
      if (editId) {
        await fetch(api.diagnosticos + '?id=' + editId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(api.diagnosticos, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      closeModalDiagnostico();
      cargarDiagnosticos();
    } catch (err) {
      console.error('Error guardando diagnóstico', err);
      alert('Error al guardar diagnóstico');
    }
  });
});

/* ======================================
   MODAL MASCOTA (Nuevo/Editar)
====================================== */
async function poblarSelectDueños() {
  try {
    const res = await fetch(api.clientes);
    const data = await res.json();
    clientesGlobal = Array.isArray(data) ? data : clientesGlobal;
    const sel = document.getElementById('mascotaDueno');
    if (!sel) return;
    sel.innerHTML = '<option value="">Seleccionar dueño</option>';
    clientesGlobal.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.error('Error cargando dueños', e);
  }
}

function openModalMascota(editId = null) {
  console.log('DBG: openModalMascota called', editId);
  const modal = document.getElementById('modalMascota');
  if (!modal) return;
  modal.classList.add('items-center');
  modal.classList.remove('hidden');
  modal.dataset.editId = editId ? String(editId) : '';
  const titulo = document.getElementById('modalMascotaTitulo');
  if (titulo) titulo.textContent = editId ? 'Editar Mascota' : 'Registrar Mascota';
  // poblar dueños
  poblarSelectDueños();

  // si editId, cargar datos
  if (editId) {
    fetch(api.mascotas).then(r => r.json()).then(list => {
      const m = (Array.isArray(list) ? list : []).find(x => x.id == editId);
      if (!m) return;
      document.getElementById('mascotaNombre').value = m.nombre || '';
      document.getElementById('mascotaTipo').value = m.tipo || '';
      document.getElementById('mascotaRaza').value = m.raza || '';
      document.getElementById('mascotaEdad').value = m.edad || '';
      document.getElementById('mascotaDueno').value = m.id_cliente || '';
    }).catch(e => console.error(e));
  } else {
    const form = document.getElementById('formMascota');
    if (form) form.reset();
  }
  setTimeout(() => { const el = document.getElementById('mascotaNombre'); if (el) el.focus(); }, 120);
}

function closeModalMascota() {
  const modal = document.getElementById('modalMascota');
  if (!modal) return;
  modal.classList.remove('items-center');
  modal.classList.add('hidden');
  modal.dataset.editId = '';
}

// manejar submit del formMascota y cancelar
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formMascota');
  const btnCancelar = document.getElementById('btnCancelarMascota');
  if (btnCancelar) btnCancelar.addEventListener('click', closeModalMascota);

  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const modal = document.getElementById('modalMascota');
    const editId = modal ? modal.dataset.editId : '';
    const nombre = document.getElementById('mascotaNombre').value.trim();
    const tipo = document.getElementById('mascotaTipo').value.trim();
    const raza = document.getElementById('mascotaRaza').value.trim();
    const edad = document.getElementById('mascotaEdad').value.trim();
    const id_cliente = document.getElementById('mascotaDueno').value;

    if (!nombre) return alert('El nombre de la mascota es obligatorio');

    const payload = { nombre, tipo, raza, edad, id_cliente };
    try {
      if (editId) {
        await fetch(api.mascotas + '?id=' + editId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(api.mascotas, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      closeModalMascota();
      cargarMascotas();
    } catch (err) {
      console.error('Error guardando mascota', err);
      alert('Ocurri\u00f3 un error al guardar la mascota');
    }
  });
});