<?php
require_once 'conexion.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $conexion->query("SELECT * FROM clientes ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("INSERT INTO clientes (nombre, telefono, documento, direccion) VALUES (?,?,?,?)");
    $stmt->execute([$d['nombre'], $d['telefono'], $d['documento'], $d['direccion']]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? 0;
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("UPDATE clientes SET nombre=?, telefono=?, documento=?, direccion=? WHERE id=?");
    $stmt->execute([$d['nombre'], $d['telefono'], $d['documento'], $d['direccion'], $id]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $conexion->prepare("DELETE FROM clientes WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["ok" => true]);
}
?>

