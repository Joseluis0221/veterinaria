<?php
require_once 'conexion.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $conexion->query("SELECT c.*, m.nombre AS mascota FROM citas c LEFT JOIN mascotas m ON c.id_mascota = m.id ORDER BY c.id DESC");
    echo json_encode($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("INSERT INTO citas (id_mascota, fecha, hora, motivo) VALUES (?,?,?,?)");
    $stmt->execute([$d['id_mascota'], $d['fecha'], $d['hora'], $d['motivo']]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? 0;
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("UPDATE citas SET id_mascota=?, fecha=?, hora=?, motivo=? WHERE id=?");
    $stmt->execute([$d['id_mascota'], $d['fecha'], $d['hora'], $d['motivo'], $id]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $conexion->prepare("DELETE FROM citas WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["ok" => true]);
}
?>


