<?php
require_once 'conexion.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $conexion->query("SELECT * FROM inventario ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("INSERT INTO inventario (nombre, categoria, cantidad, precio) VALUES (?,?,?,?)");
    $stmt->execute([$d['nombre'], $d['categoria'], $d['cantidad'], $d['precio']]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? 0;
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("UPDATE inventario SET nombre=?, categoria=?, cantidad=?, precio=? WHERE id=?");
    $stmt->execute([$d['nombre'], $d['categoria'], $d['cantidad'], $d['precio'], $id]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $conexion->prepare("DELETE FROM inventario WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["ok" => true]);
}
?>

