<?php
require_once 'conexion.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $conexion->query("SELECT d.*, m.nombre AS mascota FROM diagnosticos d LEFT JOIN mascotas m ON d.id_mascota = m.id ORDER BY d.id DESC");
    echo json_encode($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("INSERT INTO diagnosticos (id_mascota, fecha, sintomas, diagnostico, tratamiento) VALUES (?,?,?,?,?)");
    $stmt->execute([$d['id_mascota'], $d['fecha'], $d['sintomas'], $d['diagnostico'], $d['tratamiento']]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'PUT') {
    $id = $_GET['id'] ?? 0;
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $conexion->prepare("UPDATE diagnosticos SET id_mascota=?, fecha=?, sintomas=?, diagnostico=?, tratamiento=? WHERE id=?");
    $stmt->execute([$d['id_mascota'], $d['fecha'], $d['sintomas'], $d['diagnostico'], $d['tratamiento'], $id]);
    echo json_encode(["ok" => true]);
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    $stmt = $conexion->prepare("DELETE FROM diagnosticos WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(["ok" => true]);
}
?>
