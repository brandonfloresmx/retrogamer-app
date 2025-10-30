

-- 1) Crear Base
CREATE DATABASE IF NOT EXISTS db_retrogamer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_retrogamer;

-- 2) Tabla categoria
CREATE TABLE categoria (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_categoria_nombre (nombre)
);

-- 3) Tabla articulo
CREATE TABLE articulo (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  precio DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,
  existencia INT UNSIGNED NOT NULL DEFAULT 0,
  categoria_id INT UNSIGNED NOT NULL,
  CONSTRAINT uq_articulo_codigo UNIQUE (codigo),
  INDEX idx_articulo_nombre (nombre),
  CONSTRAINT fk_articulo_categoria
    FOREIGN KEY (categoria_id) REFERENCES categoria(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 4) Tabla cliente
CREATE TABLE cliente (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(20),
  rfc VARCHAR(13)
);

-- 5) Tabla carrito (1:1 con cliente)
CREATE TABLE carrito (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  importe DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_carrito_cliente
    FOREIGN KEY (cliente_id) REFERENCES cliente(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_carrito_cliente UNIQUE (cliente_id),
  INDEX idx_carrito_fecha (fecha)
);

-- 6) Tabla carrito_detalle
CREATE TABLE carrito_detalle (
  carrito_id INT UNSIGNED NOT NULL,
  articulo_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  precio DECIMAL(10,2) UNSIGNED NOT NULL,
  PRIMARY KEY (carrito_id, articulo_id),
  CONSTRAINT fk_detalle_carrito
    FOREIGN KEY (carrito_id) REFERENCES carrito(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detalle_articulo
    FOREIGN KEY (articulo_id) REFERENCES articulo(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT ck_cantidad_pos CHECK (cantidad > 0),
  CONSTRAINT ck_precio_pos CHECK (precio >= 0)
);

-- === Usuario de aplicación ===
-- Conexión esperada por la app (host/user/pass/db/port):
-- host=localhost, user=retrogamer, password=retro, db=db_retrogamer, port=3306

CREATE USER IF NOT EXISTS 'retrogamer'@'localhost' IDENTIFIED BY 'retro';
GRANT ALL PRIVILEGES ON db_retrogamer.* TO 'retrogamer'@'localhost';
FLUSH PRIVILEGES;
