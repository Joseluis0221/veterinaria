CREATE DATABASE IF NOT EXISTS veterinaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(50),
  documento VARCHAR(100),
  direccion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mascotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(100),
  raza VARCHAR(150),
  edad INT,
  id_cliente INT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE TABLE citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_mascota INT,
  fecha DATE,
  hora TIME,
  motivo TEXT,
  FOREIGN KEY (id_mascota) REFERENCES mascotas(id) ON DELETE CASCADE
);

CREATE TABLE diagnosticos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_mascota INT,
  fecha DATE,
  sintomas TEXT,
  diagnostico TEXT,
  tratamiento TEXT,
  FOREIGN KEY (id_mascota) REFERENCES mascotas(id) ON DELETE CASCADE
);

CREATE TABLE inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200),
  categoria VARCHAR(100),
  cantidad INT DEFAULT 0,
  precio DECIMAL(10,2) DEFAULT 0.00
);

INSERT INTO usuarios (nombre, correo, contrasena) VALUES
('Administrador', 'admin@veterinaria.local', SHA2('password123',256));

INSERT INTO clientes (nombre, telefono, documento, direccion) VALUES
('Ana García','555-0123','12345678','Calle Principal 123'),
('Carlos López','555-0456','87654321','Avenida Central 456'),
('María Rodríguez','555-0789','11223344','Plaza Mayor 789');

INSERT INTO mascotas (nombre, tipo, raza, edad, id_cliente) VALUES
('Max','Perro','Golden Retriever',3,1),
('Luna','Gato','Siamés',2,2),
('Rocky','Perro','Bulldog',5,3);

INSERT INTO citas (id_mascota, fecha, hora, motivo) VALUES
(1,'2025-10-10','10:00','Vacunación anual'),
(2,'2025-10-11','14:30','Revisión general');

INSERT INTO diagnosticos (id_mascota, fecha, sintomas, diagnostico, tratamiento) VALUES
(1,'2025-10-01','Letargo, fiebre','Infección viral leve','Medicamento y reposo'),
(2,'2025-09-28','Tos','Resfriado leve','Jarabe expectorante');

INSERT INTO inventario (nombre, categoria, cantidad, precio) VALUES
('Vacuna Antirrábica','Medicamento',30,15.50),
('Alimento Premium Perros','Alimento',50,45.00),
('Collar Antipulgas','Accesorio',15,12.75),
('Shampoo Medicado','Higiene',8,18.25);
