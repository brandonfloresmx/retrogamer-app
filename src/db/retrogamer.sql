SET SESSION sql_mode = 'STRICT_ALL_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ZERO_DATE,NO_ZERO_IN_DATE';

CREATE DATABASE IF NOT EXISTS retrogamer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE retrogamer;

CREATE TABLE categoria (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  slug   VARCHAR(120) NOT NULL,
  parent_id INT UNSIGNED NULL,

  UNIQUE KEY uq_categoria_slug (slug),
  UNIQUE KEY uq_categoria_nombre_por_padre (parent_id, nombre),
  KEY idx_categoria_parent (parent_id),

  CONSTRAINT fk_categoria_parent
    FOREIGN KEY (parent_id) REFERENCES categoria(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE articulo (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50)  NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  imagen_url VARCHAR(255) NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  existencia INT NOT NULL DEFAULT 0 CHECK (existencia >= 0),
  categoria_id INT UNSIGNED NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_articulo_codigo (codigo),
  KEY idx_articulo_categoria (categoria_id),

  CONSTRAINT fk_articulo_categoria
    FOREIGN KEY (categoria_id) REFERENCES categoria(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE cliente (
  telefono CHAR(10) PRIMARY KEY,           
  nombre   VARCHAR(150) NOT NULL,
  correo   VARCHAR(120) NOT NULL,
  password CHAR(32) NOT NULL,              
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_cliente_correo (correo),

  CHECK (REGEXP_LIKE(telefono, '^[0-9]{10}$')),
  CHECK (REGEXP_LIKE(correo,   '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')),
  CHECK (REGEXP_LIKE(password, '^[0-9a-fA-F]{32}$'))  
) ENGINE=InnoDB;

CREATE TABLE carrito (
  cliente_tel CHAR(10) PRIMARY KEY,  
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  estado ENUM('abierto','convertido','cancelado') NOT NULL DEFAULT 'abierto',

  CONSTRAINT fk_carrito_cliente
    FOREIGN KEY (cliente_tel) REFERENCES cliente(telefono)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carrito_detalle (
  cliente_tel CHAR(10) NOT NULL,
  articulo_id INT UNSIGNED NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unit DECIMAL(10,2) NOT NULL CHECK (precio_unit >= 0),

  PRIMARY KEY (cliente_tel, articulo_id),
  KEY idx_cd_articulo (articulo_id),

  CONSTRAINT fk_cd_carrito
    FOREIGN KEY (cliente_tel) REFERENCES carrito(cliente_tel)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_cd_articulo
    FOREIGN KEY (articulo_id) REFERENCES articulo(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE pedido (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  cliente_tel CHAR(10) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente','pagado','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_pedido_cliente
    FOREIGN KEY (cliente_tel) REFERENCES cliente(telefono)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE pedido_detalle (
  pedido_id  INT UNSIGNED NOT NULL,
  articulo_id INT UNSIGNED NOT NULL,
  nombre_snapshot VARCHAR(150) NOT NULL,  
  precio_unit DECIMAL(10,2) NOT NULL,    
  cantidad INT NOT NULL CHECK (cantidad > 0),

  PRIMARY KEY (pedido_id, articulo_id),

  CONSTRAINT fk_ped_det_pedido
    FOREIGN KEY (pedido_id)  REFERENCES pedido(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_ped_det_articulo
    FOREIGN KEY (articulo_id) REFERENCES articulo(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE direccion (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  cliente_tel CHAR(10) NOT NULL,
  tipo ENUM('envio','facturacion') NOT NULL,
  nombre_contacto VARCHAR(150) NOT NULL,
  calle VARCHAR(150) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  colonia VARCHAR(120) NOT NULL,
  ciudad VARCHAR(120) NOT NULL,
  estado VARCHAR(120) NOT NULL,
  cp CHAR(5) NOT NULL,
  pais VARCHAR(80) NOT NULL DEFAULT 'México',
  telefono CHAR(10) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_dir_cliente
    FOREIGN KEY (cliente_tel) REFERENCES cliente(telefono)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pago (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  pedido_id INT UNSIGNED NOT NULL,
  proveedor ENUM('stripe','paypal','oxxo','transferencia','otro') NOT NULL,
  referencia VARCHAR(100) NOT NULL,  
  monto DECIMAL(12,2) NOT NULL,
  estado ENUM('iniciado','aprobado','rechazado','reembolsado') NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_pago_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedido(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE envio (
  pedido_id INT UNSIGNED PRIMARY KEY, -- PK y FK
  carrier VARCHAR(50) NOT NULL,
  guia VARCHAR(60) NOT NULL,
  costo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estado ENUM('pendiente','recogido','en_transito','entregado','incidencia') NOT NULL DEFAULT 'pendiente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_envio_pedido
    FOREIGN KEY (pedido_id) REFERENCES pedido(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE movimiento_inventario (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  articulo_id INT UNSIGNED NOT NULL,
  tipo ENUM('entrada','salida','ajuste') NOT NULL,
  cantidad INT NOT NULL,
  motivo VARCHAR(200) NULL,               
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_mov_articulo
    FOREIGN KEY (articulo_id) REFERENCES articulo(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE admin_user (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password CHAR(32) NOT NULL,                
  nombre   VARCHAR(100) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO admin_user (usuario, password, nombre)
VALUES ('admin', MD5('retrogamer'), 'Administrador principal');

DROP USER IF EXISTS 'retrogamer'@'localhost';
CREATE USER 'retrogamer'@'localhost' IDENTIFIED WITH mysql_native_password BY 'retrogamer2025';
GRANT SELECT, INSERT, UPDATE, DELETE ON retrogamer.* TO 'retrogamer'@'localhost';
FLUSH PRIVILEGES;



