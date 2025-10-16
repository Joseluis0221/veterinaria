<?php
session_start();
if (!empty($_SESSION['usuario_id'])) {
  header("Location: panel.php");
  exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veterinaria - Iniciar Sesión</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
  <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
    <h1 class="text-2xl font-bold text-center mb-6 text-blue-700">Centro Veterinario Matiz</h1>

    <div id="loginForm">
      <h2 class="text-xl font-semibold mb-4">Iniciar Sesión</h2>
      <input id="correoLogin" type="email" placeholder="Correo electrónico" class="w-full mb-3 px-3 py-2 border rounded" required>
      <input id="claveLogin" type="password" placeholder="Contraseña" class="w-full mb-3 px-3 py-2 border rounded" required>
      <button onclick="iniciarSesion()" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Entrar</button>
      <p class="text-sm mt-3 text-center">¿No tienes cuenta? 
        <a href="#" class="text-blue-600" onclick="mostrarRegistro()">Regístrate</a>
      </p>
      <p class="text-sm mt-2 text-center"><a href="#" class="text-gray-500 hover:text-blue-500">¿Olvidaste tu contraseña?</a></p>
    </div>

    <div id="registroForm" class="hidden">
      <h2 class="text-xl font-semibold mb-4">Crear cuenta</h2>
      <input id="nombreReg" type="text" placeholder="Nombre completo" class="w-full mb-3 px-3 py-2 border rounded">
      <input id="correoReg" type="email" placeholder="Correo electrónico" class="w-full mb-3 px-3 py-2 border rounded">
      <input id="claveReg" type="password" placeholder="Contraseña" class="w-full mb-3 px-3 py-2 border rounded">
      <button onclick="registrar()" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Registrarme</button>
      <p class="text-sm mt-3 text-center">¿Ya tienes cuenta? 
        <a href="#" class="text-blue-600" onclick="mostrarLogin()">Inicia sesión</a>
      </p>
    </div>
  </div>

  <script>
    function mostrarRegistro() {
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('registroForm').classList.remove('hidden');
    }
    function mostrarLogin() {
      document.getElementById('registroForm').classList.add('hidden');
      document.getElementById('loginForm').classList.remove('hidden');
    }

    async function iniciarSesion() {
      const correo = document.getElementById('correoLogin').value;
      const contrasena = document.getElementById('claveLogin').value;
      const res = await fetch('api/autenticacion.php?accion=login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({correo, contrasena})
      });
      const data = await res.json();
      if (data.ok) {
        window.location = 'panel.php';
      } else {
        alert(data.mensaje || 'Error al iniciar sesión');
      }
    }

    async function registrar() {
      const nombre = document.getElementById('nombreReg').value;
      const correo = document.getElementById('correoReg').value;
      const contrasena = document.getElementById('claveReg').value;
      const res = await fetch('api/autenticacion.php?accion=registrar', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nombre, correo, contrasena})
      });
      const data = await res.json();
      if (data.ok) {
        alert('Cuenta creada. Inicia sesión.');
        mostrarLogin();
      } else {
        alert(data.mensaje || 'Error al registrarse');
      }
    }
  </script>
</body>
</html>
