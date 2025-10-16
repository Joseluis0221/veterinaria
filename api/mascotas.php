<?php
require_once 'conexion.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $conexion->query("SELECT m.*, c.nombre AS cliente FROM mascotas m LEFT JOIN clientes c ON m.id_cliente = c.id ORDER BY m.id DESC");
    echo json_encode($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("INSERT INTO mascotas (nombre, tipo, raza, edad, id_cliente) VALUES (?,?,?,?,?)");
    $stmt->execute([$d['nombre'], $d['tipo'], $d['raza'], $d['edad'], $d['id_cliente']]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? 0;
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("UPDATE mascotas SET nombre=?, tipo=?, raza=?, edad=?, id_cliente=? WHERE id=?");
    $stmt->execute([$d['nombre'], $d['tipo'], $d['raza'], $d['edad'], $d['id_cliente'], $id]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $conexion->prepare("DELETE FROM mascotas WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["ok" => true]);
}
?>

