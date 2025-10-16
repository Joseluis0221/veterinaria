<?php
$servidor = "localhost";
$usuario = "root";
$contrasena = "";
$base_datos = "veterinaria";

try {
    $conexion = new PDO("mysql:host=$servidor;dbname=$base_datos;charset=utf8mb4", $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo json_encode(["error" => "Error al conectar: " . $e->getMessage()]);
    exit;
}
?>
