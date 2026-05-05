-- ============================================================
-- Script de configuracion de MariaDB para Chambaya (Produccion)
-- ============================================================
-- Para usar MariaDB en lugar de SQLite:
-- 1. Crear la base de datos: mysql -u root -p < setup.sql
-- 2. Configurar variables de entorno en backend/.env:
--    DB_HOST=localhost
--    DB_USER=chambaya
--    DB_PASSWORD=tu_contraseña
--    DB_NAME=chambaya
-- 3. Modificar backend/db.js para usar mysql2 en vez de better-sqlite3
-- ============================================================

CREATE DATABASE IF NOT EXISTS chambaya
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'chambaya'@'localhost' IDENTIFIED BY 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON chambaya.* TO 'chambaya'@'localhost';
FLUSH PRIVILEGES;

USE chambaya;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  ubicacion VARCHAR(100),
  tipo ENUM('ofertante', 'demandante', 'admin') NOT NULL DEFAULT 'demandante',
  descripcion TEXT,
  foto_perfil VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de categorias
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  icono VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de ofertas
CREATE TABLE IF NOT EXISTS ofertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  ubicacion VARCHAR(100),
  precio DECIMAL(10,2),
  tipo_precio ENUM('por_hora', 'por_dia', 'fijo') DEFAULT 'fijo',
  categoria_id INT,
  usuario_id INT NOT NULL,
  estado ENUM('activa', 'completada', 'cancelada') DEFAULT 'activa',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_estado (estado),
  INDEX idx_categoria (categoria_id),
  INDEX idx_usuario (usuario_id),
  FULLTEXT idx_busqueda (titulo, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de valoraciones
CREATE TABLE IF NOT EXISTS valoraciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oferta_id INT NOT NULL,
  usuario_origen_id INT NOT NULL,
  usuario_destino_id INT NOT NULL,
  puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (oferta_id) REFERENCES ofertas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_origen_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_destino_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uk_valoracion (oferta_id, usuario_origen_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oferta_id INT NOT NULL,
  usuario_id INT NOT NULL,
  mensaje TEXT,
  estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (oferta_id) REFERENCES ofertas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uk_solicitud (oferta_id, usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
