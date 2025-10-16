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
  <nav class="bg-white shadow-md p-4 flex justify-between items-center">
    <h1 class="text-xl font-bold text-blue-700">Veterinaria Matiz</h1>
    <div class="flex items-center gap-4">
      <span class="text-gray-700"><?= htmlspecialchars($_SESSION['usuario_nombre']) ?></span>
      <button id="cerrarSesion" class="bg-red-600 text-white px-3 py-1 rounded">Cerrar sesión</button>
    </div>
  </nav>

  <div class="flex">
    <aside class="w-64 bg-white p-4 shadow-lg min-h-screen">
      <ul class="space-y-3">
        <li><button data-seccion="inicio" class="btn-menu w-full text-left">Dashboard</button></li>
        <li><button data-seccion="clientes" class="btn-menu w-full text-left">Clientes</button></li>
        <li><button data-seccion="mascotas" class="btn-menu w-full text-left">Mascotas</button></li>
        <li><button data-seccion="citas" class="btn-menu w-full text-left">Citas</button></li>
        <li><button data-seccion="diagnosticos" class="btn-menu w-full text-left">Diagnósticos</button></li>
        <li><button data-seccion="inventario" class="btn-menu w-full text-left">Inventario</button></li>
      </ul>
    </aside>

    <main class="flex-1 p-6">
      <section id="inicio" class="seccion">
        <h2 class="text-2xl font-bold mb-4">Panel Principal</h2>
        <div id="tarjetas" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white p-4 shadow rounded">
            <h3 class="font-semibold mb-2">Citas mensuales</h3>
            <canvas id="graficoCitas"></canvas>
          </div>
          <div class="bg-white p-4 shadow rounded">
            <h3 class="font-semibold mb-2">Tipos de Mascotas</h3>
            <canvas id="graficoMascotas"></canvas>
          </div>
        </div>
      </section>

      <section id="clientes" class="seccion oculto">
        <div class="flex justify-between mb-4">
          <h2 class="text-2xl font-bold">Clientes</h2>
          <button id="agregarCliente" class="bg-blue-600 text-white px-4 py-2 rounded">Agregar Cliente</button>
        </div>
        <div class="bg-white p-4 shadow rounded">
          <input id="buscarCliente" class="w-full mb-3 px-3 py-2 border rounded" placeholder="Buscar cliente...">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr><th>Nombre</th><th>Teléfono</th><th>Documento</th><th>Dirección</th><th>Acciones</th></tr>
            </thead>
            <tbody id="tablaClientes"></tbody>
          </table>
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
      <div class="flex items-center gap-3">
        <button id="prevMes" class="text-gray-600 hover:text-gray-900 text-lg font-bold px-3 py-1 rounded">◀</button>
        <span id="tituloMes" class="font-semibold text-gray-700"></span>
        <button id="nextMes" class="text-gray-600 hover:text-gray-900 text-lg font-bold px-3 py-1 rounded">▶</button>
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
      <section id="inventario" class="seccion oculto"></section>
    </main>
  </div>

  <script src="recursos/app.js"></script>
</body>
</html>
