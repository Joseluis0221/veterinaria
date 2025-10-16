const api = {
  clientes: 'api/clientes.php',
  mascotas: 'api/mascotas.php',
  citas: 'api/citas.php',
  diagnosticos: 'api/diagnosticos.php',
  inventario: 'api/inventario.php',
  auth: 'api/autenticacion.php'
};

document.addEventListener('DOMContentLoaded', () => {
  // Menú lateral
  document.querySelectorAll('.btn-menu').forEach(btn => {
    btn.addEventListener('click', e => {
      const seccion = e.target.getAttribute('data-seccion');
      mostrarSeccion(seccion);
    });
  });

  // Cerrar sesión
  document.getElementById('cerrarSesion').onclick = async () => {
    await fetch(api.auth + '?accion=cerrar', { method: 'POST' });
    window.location = 'index.php';
  };

  // Inicializar dashboard
  cargarDashboard();
  cargarClientes();
});

// Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.add('oculto'));
  document.getElementById(id).classList.remove('oculto');

  if (id === 'clientes') cargarClientes();
  if (id === 'mascotas') cargarMascotas();
  if (id === 'citas') cargarCitas();
  if (id === 'diagnosticos') cargarDiagnosticos();
  if (id === 'inventario') cargarInventario();
  if (id === 'inicio') cargarDashboard();
}

/* ===========================================
   CLIENTES
=========================================== */
async function cargarClientes() {
  const res = await fetch(api.clientes);
  const data = await res.json();
  const cuerpo = document.getElementById('tablaClientes');
  if (!cuerpo) return;
  cuerpo.innerHTML = '';

  data.forEach(c => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${c.nombre}</td>
      <td>${c.telefono || '-'}</td>
      <td>${c.documento || '-'}</td>
      <td>${c.direccion || '-'}</td>
      <td>
        <button class="text-blue-600" onclick="editarCliente(${c.id})">Editar</button>
        <button class="text-red-600 ml-2" onclick="eliminarCliente(${c.id})">Eliminar</button>
      </td>`;
    cuerpo.appendChild(fila);
  });
}

document.getElementById('agregarCliente').onclick = async () => {
  const nombre = prompt('Nombre del cliente:');
  if (!nombre) return;
  const telefono = prompt('Teléfono:');
  const documento = prompt('Documento:');
  const direccion = prompt('Dirección:');
  await fetch(api.clientes, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, telefono, documento, direccion })
  });
  cargarClientes();
};

async function editarCliente(id) {
  const res = await fetch(api.clientes);
  const data = await res.json();
  const c = data.find(x => x.id == id);
  const nombre = prompt('Nombre:', c.nombre);
  if (nombre === null) return;
  const telefono = prompt('Teléfono:', c.telefono);
  const documento = prompt('Documento:', c.documento);
  const direccion = prompt('Dirección:', c.direccion);
  await fetch(api.clientes + '?id=' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, telefono, documento, direccion })
  });
  cargarClientes();
}

async function eliminarCliente(id) {
  if (!confirm('¿Eliminar cliente definitivamente?')) return;
  await fetch(api.clientes + '?id=' + id, { method: 'DELETE' });
  cargarClientes();
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
    card.className =
      'bg-white rounded-xl p-4 shadow hover:shadow-lg transition border border-gray-100 relative';

    card.innerHTML = `
      <div class="absolute top-2 right-2 flex gap-2">
        <button class="text-blue-600 hover:text-blue-800" title="Editar" onclick="editarMascota(${m.id})">✏️</button>
        <button class="text-red-600 hover:text-red-800" title="Eliminar" onclick="eliminarMascota(${m.id})">🗑️</button>
      </div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">${m.nombre}</h3>
      <p><span class="font-semibold">Tipo:</span> ${m.tipo || '-'}</p>
      <p><span class="font-semibold text-gray-700">Raza:</span> ${m.raza || '-'}</p>
      <p><span class="font-semibold text-gray-700">Edad:</span> ${m.edad || '-'}</p>
      <p><span class="font-semibold text-gray-700">Dueño:</span> ${m.cliente || 'Sin asignar'}</p>
    `;
    contenedor.appendChild(card);
  });
}

// Botón para crear nueva mascota
document.getElementById('btnNuevaMascota').onclick = agregarMascota;

// CRUD: agregar, editar y eliminar
async function agregarMascota() {
  const nombre = prompt('Nombre de la mascota:');
  if (!nombre) return;
  const tipo = prompt('Tipo (Perro, Gato, etc):');
  const raza = prompt('Raza:');
  const edad = prompt('Edad:');
  const id_cliente = prompt('ID del cliente dueño (ver en lista de clientes):');
  await fetch(api.mascotas, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, tipo, raza, edad, id_cliente })
  });
  cargarMascotas();
}

async function editarMascota(id) {
  const res = await fetch(api.mascotas);
  const data = await res.json();
  const m = data.find(x => x.id == id);
  const nombre = prompt('Nombre:', m.nombre);
  if (nombre === null) return;
  const tipo = prompt('Tipo:', m.tipo);
  const raza = prompt('Raza:', m.raza);
  const edad = prompt('Edad:', m.edad);
  const id_cliente = prompt('ID cliente:', m.id_cliente);
  await fetch(api.mascotas + '?id=' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, tipo, raza, edad, id_cliente })
  });
  cargarMascotas();
}

async function eliminarMascota(id) {
  if (!confirm('¿Eliminar mascota definitivamente?')) return;
  await fetch(api.mascotas + '?id=' + id, { method: 'DELETE' });
  cargarMascotas();
}


/* ===========================
   MÓDULO DE CITAS - CALENDARIO
   Reemplaza/pega todo este bloque en recursos/app.js
   =========================== */

let mesSeleccionado = new Date().getMonth();
let anioSeleccionado = new Date().getFullYear();
let citasGlobal = [];
let calendarioInit = false;

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
  cont.innerHTML = `<div class="mb-2 font-semibold text-gray-700">Citas del ${fechaYMD}</div>`;
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
      <div class="text-sm text-gray-600">${c.fecha} a las ${c.hora || ''}</div>
      <div class="text-sm text-gray-500">${c.motivo || ''}</div>
    `;
    const acciones = document.createElement('div');
    acciones.className = 'flex gap-2';
    acciones.innerHTML = `
      <button class="text-blue-600 hover:text-blue-800" title="Editar" onclick="editarCita(${c.id})">✏️</button>
      <button class="text-red-600 hover:text-red-800" title="Eliminar" onclick="eliminarCita(${c.id})">🗑️</button>
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
      <div class="text-sm text-gray-600">${c.fecha} a las ${c.hora || ''}</div>
      <div class="text-sm text-gray-500">${c.motivo || ''}</div>
    `;
    const acciones = document.createElement('div');
    acciones.className = 'flex gap-2';
    acciones.innerHTML = `
      <button class="text-blue-600 hover:text-blue-800" title="Editar" onclick="editarCita(${c.id})">✏️</button>
      <button class="text-red-600 hover:text-red-800" title="Eliminar" onclick="eliminarCita(${c.id})">🗑️</button>
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
    await agregarCitaModalSimple();
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

async function editarCita(id) {
  const res = await fetch(api.citas);
  const datos = await res.json();
  const c = datos.find(x => x.id == id);
  if (!c) return alert('Cita no encontrada');
  const id_mascota = prompt('ID mascota:', c.id_mascota);
  const fecha = prompt('Fecha:', c.fecha);
  const hora = prompt('Hora:', c.hora);
  const motivo = prompt('Motivo:', c.motivo);
  await fetch(api.citas + '?id=' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_mascota, fecha, hora, motivo })
  });
  await fetchAndRenderCitas();
}

async function eliminarCita(id) {
  if (!confirm('¿Eliminar cita definitivamente?')) return;
  await fetch(api.citas + '?id=' + id, { method: 'DELETE' });
  await fetchAndRenderCitas();
}

/* ---- Inicializar módulo cuando corresponda ---- */
function initCitasModuleIfNeeded() {
  inicializarNavMeses();
  fetchAndRenderCitas();
}

/* ---- Reemplaza / actualiza la función mostrarSeccion para llamar al calendario ---- */
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.add('oculto'));
  const elemento = document.getElementById(id);
  if (elemento) elemento.classList.remove('oculto');

  // cargar secciones específicas
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
  cont.innerHTML = `<h2 class="text-2xl font-bold mb-4">Diagnósticos</h2>
    <button onclick="agregarDiagnostico()" class="bg-blue-600 text-white px-4 py-2 rounded mb-3">Agregar Diagnóstico</button>
    <div class="bg-white p-4 shadow rounded">
      <table class="w-full">
        <thead class="bg-gray-100"><tr><th>Mascota</th><th>Fecha</th><th>Síntomas</th><th>Diagnóstico</th><th>Tratamiento</th><th>Acciones</th></tr></thead>
        <tbody id="tablaDiagnosticos"></tbody>
      </table>
    </div>`;

  const res = await fetch(api.diagnosticos);
  const data = await res.json();
  const cuerpo = document.getElementById('tablaDiagnosticos');
  cuerpo.innerHTML = '';

  data.forEach(d => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${d.mascota || '-'}</td>
      <td>${d.fecha}</td>
      <td>${d.sintomas}</td>
      <td>${d.diagnostico}</td>
      <td>${d.tratamiento}</td>
      <td>
        <button class="text-blue-600" onclick="editarDiagnostico(${d.id})">Editar</button>
        <button class="text-red-600 ml-2" onclick="eliminarDiagnostico(${d.id})">Eliminar</button>
      </td>`;
    cuerpo.appendChild(fila);
  });
}

async function agregarDiagnostico() {
  const id_mascota = prompt('ID de la mascota:');
  const fecha = prompt('Fecha (AAAA-MM-DD):');
  const sintomas = prompt('Síntomas:');
  const diagnostico = prompt('Diagnóstico:');
  const tratamiento = prompt('Tratamiento:');
  await fetch(api.diagnosticos, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_mascota, fecha, sintomas, diagnostico, tratamiento })
  });
  cargarDiagnosticos();
}

async function editarDiagnostico(id) {
  const res = await fetch(api.diagnosticos);
  const data = await res.json();
  const d = data.find(x => x.id == id);
  const id_mascota = prompt('ID mascota:', d.id_mascota);
  const fecha = prompt('Fecha:', d.fecha);
  const sintomas = prompt('Síntomas:', d.sintomas);
  const diagnostico = prompt('Diagnóstico:', d.diagnostico);
  const tratamiento = prompt('Tratamiento:', d.tratamiento);
  await fetch(api.diagnosticos + '?id=' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_mascota, fecha, sintomas, diagnostico, tratamiento })
  });
  cargarDiagnosticos();
}

async function eliminarDiagnostico(id) {
  if (!confirm('¿Eliminar diagnóstico?')) return;
  await fetch(api.diagnosticos + '?id=' + id, { method: 'DELETE' });
  cargarDiagnosticos();
}

/* ===========================================
   INVENTARIO
=========================================== */
async function cargarInventario() {
  const cont = document.getElementById('inventario');
  cont.innerHTML = `<h2 class="text-2xl font-bold mb-4">Inventario</h2>
    <button onclick="agregarProducto()" class="bg-blue-600 text-white px-4 py-2 rounded mb-3">Agregar Producto</button>
    <div class="bg-white p-4 shadow rounded">
      <table class="w-full">
        <thead class="bg-gray-100"><tr><th>Nombre</th><th>Categoría</th><th>Cantidad</th><th>Precio</th><th>Acciones</th></tr></thead>
        <tbody id="tablaInventario"></tbody>
      </table>
    </div>`;

  const res = await fetch(api.inventario);
  const productos = await res.json();
  const cuerpo = document.getElementById('tablaInventario');
  cuerpo.innerHTML = '';

  productos.forEach(p => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${p.cantidad}</td>
      <td>$${p.precio}</td>
      <td>
        <button class="text-blue-600" onclick="editarProducto(${p.id})">Editar</button>
        <button class="text-red-600 ml-2" onclick="eliminarProducto(${p.id})">Eliminar</button>
      </td>`;
    cuerpo.appendChild(fila);
  });
}

async function agregarProducto() {
  const nombre = prompt('Nombre del producto:');
  const categoria = prompt('Categoría:');
  const cantidad = prompt('Cantidad:');
  const precio = prompt('Precio:');
  await fetch(api.inventario, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, categoria, cantidad, precio })
  });
  cargarInventario();
}

async function editarProducto(id) {
  const res = await fetch(api.inventario);
  const data = await res.json();
  const p = data.find(x => x.id == id);
  const nombre = prompt('Nombre:', p.nombre);
  const categoria = prompt('Categoría:', p.categoria);
  const cantidad = prompt('Cantidad:', p.cantidad);
  const precio = prompt('Precio:', p.precio);
  await fetch(api.inventario + '?id=' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, categoria, cantidad, precio })
  });
  cargarInventario();
}

async function eliminarProducto(id) {
  if (!confirm('¿Eliminar producto?')) return;
  await fetch(api.inventario + '?id=' + id, { method: 'DELETE' });
  cargarInventario();
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
    { titulo: 'Clientes', valor: clientes.length },
    { titulo: 'Mascotas', valor: mascotas.length },
    { titulo: 'Citas', valor: citas.length },
    { titulo: 'Productos', valor: inventario.length }
  ];

  const contenedor = document.getElementById('tarjetas');
  contenedor.innerHTML = '';
  tarjetas.forEach(t => {
    const div = document.createElement('div');
    div.className = 'bg-white p-4 rounded shadow text-center';
    div.innerHTML = `<div class="text-sm text-gray-500">${t.titulo}</div><div class="text-2xl font-bold">${t.valor}</div>`;
    contenedor.appendChild(div);
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
