USE gestion_prestamos;

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  condicion VARCHAR(100) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla Prestamos
CREATE TABLE IF NOT EXISTS prestamos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipo_id INT NOT NULL,
  usuario_id INT NOT NULL,
  prestatario VARCHAR(150) NOT NULL,
  fecha_prestamo DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_prevista DATETIME NOT NULL,
  fecha_devolucion DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Datos de prueba ficticios
INSERT INTO usuarios (nombre, correo, contrasena) VALUES
('Darwin Uzuriaga', 'darwin@senati.pe', '$2a$10$e8w.x7W/m.K0TqgR3.mO..1wJzO/61P0u6z0B1B3M1.5E0.b0.b0G');

INSERT INTO equipos (codigo, nombre, categoria, condicion) VALUES
('EQ-001', 'Multímetro Digital Fluke 117', 'Medición', 'Bueno'),
('EQ-002', 'Osciloscopio Digital Rigol', 'Electrónica', 'Nuevo');