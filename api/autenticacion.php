<?php
require_once 'conexion.php';
session_start();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $accion = $_GET['accion'] ?? '';

    // Iniciar sesión
    if ($accion === 'login') {
        $datos = json_decode(file_get_contents("php://input"), true);
        $correo = $datos['correo'] ?? '';
        $clave = $datos['contrasena'] ?? '';

        $stmt = $conexion->prepare("SELECT * FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && hash_equals($usuario['contrasena'], hash('sha256', $clave))) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nombre'] = $usuario['nombre'];
            echo json_encode(["ok" => true]);
        } else {
            echo json_encode(["ok" => false, "mensaje" => "Credenciales incorrectas"]);
        }
        exit;
    }

    // Registro
    if ($accion === 'registrar') {
        $datos = json_decode(file_get_contents("php://input"), true);
        $nombre = $datos['nombre'];
        $correo = $datos['correo'];
        $clave = $datos['contrasena'];

        $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            echo json_encode(["ok" => false, "mensaje" => "El correo ya está registrado"]);
            exit;
        }

        $hash = hash('sha256', $clave);
        $stmt = $conexion->prepare("INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?,?,?)");
        $stmt->execute([$nombre, $correo, $hash]);
        echo json_encode(["ok" => true]);
        exit;
    }

    // Cerrar sesión
    if ($accion === 'cerrar') {
        session_destroy();
        echo json_encode(["ok" => true]);
        exit;
    }
}
?>



