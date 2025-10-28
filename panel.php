<?php
session_start();
if (empty($_SESSION['usuario_id'])) {
  header("Location: index.php");
  exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panel - Veterinaria Matiz</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="recursos/estilo.css">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
  <nav class="topbar p-4 flex justify-between items-center text-white">
    <div class="flex items-center gap-3">
      <button id="btnMenu" class="menu-btn w-9 h-9 rounded-md focus:outline-none" aria-label="Abrir menú" title="Menú">
        <div style="width: 100%; height: 100%; display: block; color: currentColor;">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;">
            <path d="M20 5H4a1 1 0 000 2h16a1 1 0 100-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Z"></path>
          </svg>
        </div>
      </button>
      <h1 class="text-xl font-extrabold">Veterinaria Matiz</h1>
    </div>
    <div class="flex items-center gap-2 sm:gap-3">
      <span class="hidden sm:inline-block px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/30 font-medium shadow-sm backdrop-blur-sm truncate max-w-[36vw]">
        <?= htmlspecialchars($_SESSION['usuario_nombre']) ?>
      </span>
      <button id="cerrarSesion" class="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full font-semibold shadow-sm hover:shadow-md active:shadow-lg active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-150" aria-label="Cerrar sesión">Cerrar Sesión</button>
    </div>
  </nav>

  <!-- Menú móvil -->
  <div id="menuMovil" class="fixed inset-0 z-50 hidden">
    <div id="menuMovilBackdrop" class="absolute inset-0 bg-black/40"></div>
    <div class="absolute top-0 left-0 w-72 max-w-[80vw] h-full bg-white shadow-2xl p-4 overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <span class="font-semibold text-gray-800">Menú</span>
        <button id="menuMovilCerrar" class="w-8 h-8 rounded-md hover:bg-gray-100" aria-label="Cerrar menú">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.225 4.811L4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811z"/></svg>
        </button>
      </div>
      <ul class="space-y-1">
        <li>
          <button data-seccion="inicio" class="btn-menu w-full text-left flex items-center gap-3 px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path>
            </svg>
            <span>Dashboard</span>
          </button>
        </li>
        <li>
          <button data-seccion="clientes" class="btn-menu w-full text-left flex items-center gap-3 px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            <span>Clientes</span>
          </button>
        </li>
        <li>
          <button data-seccion="mascotas" class="btn-menu w-full text-left flex items-center gap-3 px-4 py-2 rounded">
            <span class="icon-mask icon-paw" aria-hidden="true"></span>
            <span>Mascotas</span>
          </button>
        </li>
        <li>
          <button data-seccion="citas" class="btn-menu w-full text-left flex items-center gap-3 px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path>
            </svg>
            <span>Citas</span>
          </button>
        </li>
        <li>
          <button data-seccion="diagnosticos" class="btn-menu w-full text-left flex items-center gap-3 px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"></path>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>Diagnósticos</span>
          </button>
        </li>
        <li>
          <button data-seccion="inventario" class="btn-menu w-full text-left flex items-center gap-3 px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path>
              <path d="M6 10h2v2H6zm4 0h8v2h-8z"></path>
            </svg>
            <span>Inventario</span>
          </button>
        </li>
      </ul>
    </div>
  </div>

  <div class="flex">
    <aside id="sidebar" class="sidebar bg-white p-4 shadow-lg min-h-screen">
      <ul class="space-y-1">
        <li>
          <button data-seccion="inicio" class="btn-menu w-full text-left flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"></path>
            </svg>
            <span class="label hidden lg:inline">Dashboard</span>
          </button>
        </li>
        <li>
          <button data-seccion="clientes" class="btn-menu w-full text-left flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            <span class="label hidden lg:inline">Clientes</span>
          </button>
        </li>
        <li>
          <button data-seccion="mascotas" class="btn-menu w-full text-left flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-2 rounded">
            <span class="icon-mask icon-paw" aria-hidden="true"></span>
            <span class="label hidden lg:inline">Mascotas</span>
          </button>
        </li>
        <li>
          <button data-seccion="citas" class="btn-menu w-full text-left flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path>
            </svg>
            <span class="label hidden lg:inline">Citas</span>
          </button>
        </li>
        <li>
          <button data-seccion="diagnosticos" class="btn-menu w-full text-left flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"></path>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span class="label hidden lg:inline">Diagnósticos</span>
          </button>
        </li>
        <li>
          <button data-seccion="inventario" class="btn-menu w-full text-left flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-2 rounded">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"></path>
              <path d="M6 10h2v2H6zm4 0h8v2h-8z"></path>
            </svg>
            <span class="label hidden lg:inline">Inventario</span>
          </button>
        </li>
      </ul>
    </aside>

    <main class="flex-1 p-8">
      <section id="inicio" class="seccion">
        <h2 class="text-3xl font-bold text-gray-800 mb-8">Panel Principal</h2>
        <div id="tarjetas" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="chart-card">
            <h3 class="font-semibold mb-3 text-gray-800">Citas mensuales</h3>
            <canvas id="graficoCitas"></canvas>
          </div>
          <div class="chart-card">
            <h3 class="font-semibold mb-3 text-gray-800">Tipos de Mascotas</h3>
            <canvas id="graficoMascotas"></canvas>
          </div>
        </div>
      </section>

      <section id="clientes" class="seccion oculto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-gray-800">Gestión de Clientes</h2>
          <button id="agregarCliente" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <span class="text-xl leading-none">＋</span> Agregar Cliente
          </button>
        </div>

        <div class="mb-6">
          <div class="bg-white rounded-xl shadow p-4 flex gap-3 items-center">
            <input id="buscarCliente" class="flex-1 px-4 py-3 border rounded-lg" placeholder="Buscar cliente por nombre, teléfono o documento...">
            <button id="btnBuscarCliente" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Buscar</button>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow p-4">
          <div class="overflow-x-auto">
            <table class="w-full table-auto" id="tablaClientesContainer">
              <thead class="bg-gray-50">
                <tr class="text-left text-sm text-gray-600">
                  <th class="p-4">Nombre</th>
                  <th class="p-4">Teléfono</th>
                  <th class="p-4">Documento</th>
                  <th class="p-4">Dirección</th>
                  <th class="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody id="tablaClientes"></tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="mascotas" class="seccion oculto">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold text-gray-800">Gestión de Mascotas</h2>
    <button id="btnNuevaMascota" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
      <span class="text-xl leading-none">＋</span> Registrar Mascota
    </button>
  </div>

  <div id="listaMascotas" class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
</section>


      <!-- REEMPLAZAR la sección de citas por esto -->
<section id="citas" class="seccion oculto">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold text-gray-800">Gestión de Citas</h2>
    <button id="btnNuevaCita" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2">
      <span class="text-xl leading-none">＋</span> Agendar Cita
    </button>
  </div>

  <div class="bg-white rounded-xl shadow p-4 mb-6">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-lg font-semibold text-gray-700">Calendario de Citas</h3>
      <div class="flex items-center gap-4">
        <button id="prevMes" class="mes-btn" aria-label="Mes anterior">‹</button>
        <div id="tituloMes" class="mes-titulo"></div>
        <button id="nextMes" class="mes-btn" aria-label="Mes siguiente">›</button>
      </div>
    </div>

    <div id="calendarioCitas" class="grid grid-cols-7 gap-3 text-center text-gray-700"></div>
  </div>

  <div class="bg-white rounded-xl shadow p-4">
    <h3 class="text-lg font-semibold mb-3 text-gray-700">Próximas Citas</h3>
    <div id="listaCitas" class="space-y-3"></div>
  </div>
</section>

      <section id="diagnosticos" class="seccion oculto"></section>
      <section id="inventario" class="seccion oculto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-gray-800">Gestión de Inventario</h2>
          <button id="btnAgregarProducto" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <span class="text-xl leading-none">＋</span> Agregar Producto
          </button>
        </div>

        <div class="bg-gradient-to-b from-white/80 to-indigo-50 p-6 rounded-xl shadow-lg">
          <div class="overflow-x-auto bg-white rounded-lg shadow p-4">
            <table class="w-full table-auto">
              <thead class="bg-gray-50">
                <tr class="text-left text-sm text-gray-600">
                  <th class="p-4">Producto</th>
                  <th class="p-4">Categoría</th>
                  <th class="p-4">Cantidad</th>
                  <th class="p-4">Precio</th>
                  <th class="p-4">Estado</th>
                  <th class="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody id="tablaInventario"></tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script src="recursos/app.js"></script>
  <!-- Modal Agregar/Editar Producto -->
  <div id="modalProducto" class="fixed inset-0 hidden justify-center z-50">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md mx-auto z-10 overflow-hidden transform transition-all duration-200 scale-95">
      <div class="p-6">
        <h3 id="modalProductoTitulo" class="text-2xl font-extrabold mb-4 text-gray-800">Agregar Producto</h3>
        <form id="formProducto" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Nombre del Producto</label>
            <input id="inputProductoNombre" name="nombre" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" required>
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-1">Categoría</label>
            <select id="selectProductoCategoria" name="categoria" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="">Seleccionar categoría</option>
            </select>
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-1">Cantidad</label>
            <input id="inputProductoCantidad" name="cantidad" type="number" min="0" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-1">Precio</label>
            <input id="inputProductoPrecio" name="precio" type="number" step="0.01" min="0" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
          </div>

          <div class="flex justify-between items-center gap-4 mt-6">
            <button type="button" id="btnCancelarProducto" class="flex-1 px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700">Cancelar</button>
            <button type="submit" id="btnGuardarProducto" class="flex-1 px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Modal Agregar/Editar Cliente -->
  <div id="modalCliente" class="fixed inset-0 hidden justify-center z-50">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-xl mx-auto z-10 overflow-hidden transform transition-all duration-200 scale-95">
      <div class="p-6">
        <h3 id="modalTitulo" class="text-2xl font-extrabold mb-4 text-gray-800">Agregar Cliente</h3>
        <form id="formCliente" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-1">Nombre Completo</label>
            <input id="inputNombre" name="nombre" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" required>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Teléfono</label>
              <input id="inputTelefono" name="telefono" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">Documento</label>
              <input id="inputDocumento" name="documento" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
            </div>
          </div>
            
          <div>
            <label class="block text-sm text-gray-700 mb-1">Dirección</label>
            <textarea id="inputDireccion" name="direccion" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" rows="3"></textarea>
          </div>
          <div class="flex justify-between items-center gap-4 mt-6">
            <button type="button" id="btnCancelarCliente" class="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white">Cancelar</button>
            <button type="submit" id="btnGuardarCliente" class="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
      <!-- Modal Agregar/Editar Mascota -->
      <div id="modalMascota" class="fixed inset-0 hidden justify-center z-50">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md mx-auto z-10 overflow-hidden transform transition-all duration-200 scale-95">
          <div class="p-6">
            <h3 id="modalMascotaTitulo" class="text-2xl font-extrabold mb-4 text-gray-800">Registrar Mascota</h3>
            <form id="formMascota" class="space-y-4">
              <div>
                <label class="block text-sm text-gray-700 mb-1">Nombre de la Mascota</label>
                <input id="mascotaNombre" name="nombre" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" required>
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-1">Tipo</label>
                <select id="mascotaTipo" name="tipo" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Seleccionar tipo</option>
                  <option>Perro</option>
                  <option>Gato</option>
                  <option>Ave</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-1">Raza</label>
                <input id="mascotaRaza" name="raza" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-1">Edad</label>
                <input id="mascotaEdad" name="edad" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-1">Dueño</label>
                <select id="mascotaDueno" name="id_cliente" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Seleccionar dueño</option>
                </select>
              </div>

              <div class="flex justify-between items-center gap-4 mt-6">
                <button type="button" id="btnCancelarMascota" class="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white">Cancelar</button>
                <button type="submit" id="btnGuardarMascota" class="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <!-- Modal Agendar Cita -->
      <div id="modalCita" class="fixed inset-0 hidden justify-center z-50">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md mx-auto z-10 overflow-hidden transform transition-all duration-200 scale-95">
          <div class="p-6">
            <h3 id="modalCitaTitulo" class="text-2xl font-extrabold mb-4 text-gray-800">Agendar Cita</h3>
            <form id="formCita" class="space-y-4">
              <div>
                <label class="block text-sm text-gray-700 mb-1">Mascota</label>
                <select id="citaMascota" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Seleccionar mascota</option>
                </select>
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-1">Fecha</label>
                <input id="citaFecha" type="date" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-1">Hora</label>
                <input id="citaHora" type="time" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300">
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-1">Motivo</label>
                <textarea id="citaMotivo" rows="4" class="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"></textarea>
              </div>

              <div class="flex justify-between items-center gap-4 mt-6">
                <button type="button" id="btnCancelarCita" class="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white">Cancelar</button>
                <button type="submit" id="btnGuardarCita" class="flex-1 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Nuevo/Editar Diagnóstico -->
  <div id="modalDiagnostico" class="fixed inset-0 hidden justify-center z-50">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md mx-auto z-10 overflow-hidden transform transition-all duration-200 scale-95">
        <div class="p-6">
          <h3 id="modalDiagnosticoTitulo" class="text-xl font-extrabold mb-3 text-gray-800 text-center">Nuevo Diagnóstico</h3>
          <div class="dialog-content">
          <form id="formDiagnostico" class="space-y-3">
            <div class="form-row">
              <label class="block text-sm text-gray-700 mb-1">Mascota</label>
              <select id="diagMascota" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">Seleccionar mascota</option>
              </select>
            </div>
            <div class="form-row">
              <label class="block text-sm text-gray-700 mb-1">Fecha</label>
              <input id="diagFecha" type="date" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
            </div>
            <div class="form-row">
              <label class="block text-sm text-gray-700 mb-1">Síntomas</label>
              <textarea id="diagSintomas" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" rows="3"></textarea>
            </div>
            <div class="form-row">
              <label class="block text-sm text-gray-700 mb-1">Diagnóstico</label>
              <textarea id="diagDiagnostico" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" rows="2"></textarea>
            </div>
            <div class="form-row">
              <label class="block text-sm text-gray-700 mb-1">Tratamiento</label>
              <textarea id="diagTratamiento" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" rows="2"></textarea>
            </div>
            <div class="modal-footer mt-4">
              <button type="button" id="btnCancelarDiagnostico" class="btn btn-danger">Cancelar</button>
              <button type="submit" id="btnGuardarDiagnostico" class="btn btn-primary">Guardar</button>
            </div>
          </form>
          </div>
        </div>
    </div>
  </div>
  <!-- Modal Confirmar Eliminar Mascota -->
  <div id="modalConfirm" class="fixed inset-0 hidden justify-center z-50">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="bg-white rounded-2xl shadow-2xl w-11/12 max-w-md mx-auto z-10 overflow-hidden transform transition-all duration-200 scale-95">
      <div class="p-6">
        <h3 class="text-2xl font-extrabold mb-2 text-gray-800">Confirmar Acción</h3>
  <p id="modalConfirmTexto" class="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar esta mascota?</p>
          <div class="flex justify-between items-center gap-4 mt-6">
          <button id="btnCancelarEliminar" class="flex-1 px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white">Cancelar</button>
          <button id="btnConfirmarEliminar" class="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>