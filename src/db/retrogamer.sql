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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  direccion_completa TEXT NULL,
  metodo_pago VARCHAR(50) NULL,
  costo_envio DECIMAL(10,2) NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS direccion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_tel CHAR(10) NOT NULL,
  alias VARCHAR(100) DEFAULT 'Mi direccion',
  calle VARCHAR(150) NOT NULL,
  colonia VARCHAR(120) NOT NULL,
  cp CHAR(5) NOT NULL,
  ciudad VARCHAR(120) NOT NULL,
  estado VARCHAR(120) NOT NULL,
  referencias VARCHAR(255) DEFAULT '',
  es_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_dir_cliente
    FOREIGN KEY (cliente_tel) REFERENCES cliente(telefono)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS metodo_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_tel CHAR(10) NOT NULL,
  alias VARCHAR(100) DEFAULT 'Mi pago',
  tipo VARCHAR(30) NOT NULL,
  titular VARCHAR(150) NOT NULL,
  ultimo4 VARCHAR(4) DEFAULT NULL,
  expiracion VARCHAR(7) DEFAULT NULL,
  es_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_tel) REFERENCES cliente(telefono) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorito (
  cliente_tel CHAR(10) NOT NULL,
  articulo_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cliente_tel, articulo_id),
  FOREIGN KEY (cliente_tel) REFERENCES cliente(telefono) ON DELETE CASCADE,
  FOREIGN KEY (articulo_id) REFERENCES articulo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  pedido_id INT UNSIGNED PRIMARY KEY, 
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

CREATE TABLE banner (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(150) NULL,
  imagen_url VARCHAR(255) NOT NULL,
  link VARCHAR(255) NULL,
  orden INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


INSERT INTO admin_user (usuario, password, nombre)
VALUES ('admin', MD5('retrogamer'), 'Administrador principal');

DROP USER IF EXISTS 'retrogamer'@'localhost';
CREATE USER 'retrogamer'@'localhost' IDENTIFIED WITH mysql_native_password BY 'retrogamer2025';
GRANT SELECT, INSERT, UPDATE, DELETE ON retrogamer.* TO 'retrogamer'@'localhost';
FLUSH PRIVILEGES;

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Consolas','consolas',NULL),(2,'Juegos','juegos',NULL),(3,'Accesorios','accesorios',NULL),(4,'PS2','ps2',2),(5,'PS3','ps3',2),(7,'Xbox 360','xbox-360',3),(8,'PlayStation 3','playstation-3',3),(9,'3DS','3ds',2),(10,'PlayStation','playstation',1),(11,'Nintendo','nintendo',1),(12,'Xbox','xbox',1);
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `articulo` WRITE;
/*!40000 ALTER TABLE `articulo` DISABLE KEYS */;
INSERT INTO `articulo` VALUES (1,'ART-00001','Gran Turismo 5','Te traemos la experiencia de conduccion virtual definitiva, con la ultima tecnologia y juego multijugador online.','https://i.ibb.co/TqkZNKPh/gt5.jpg',200.00,48,5,'2025-12-06 13:49:06','2025-12-06 17:23:01'),(2,'ART-00002','God Of War 2','La historia recoge donde los jugadores finalmente dejaron con Kratos. Sentado en su trono en el Olimpo, Kratos, el Guerrero una vez mortal se ha convertido en una amenaza mucho peor que su predecesor Ares, haya tenido. Kratos es un Dios cruel, cuya ira ataca a cualquiera que se cruza en su camino o la ruta de su amada Esparta.','https://i.ibb.co/HTJvmFH8/gow2.jpg',550.00,28,4,'2025-12-06 13:50:55','2025-12-06 18:32:51'),(3,'ART-00003','Legend Of Zelda: Ocarina Of Time','Remake del mítico The Legend of Zelda: Ocarina of Time para Nintendo 64, que se estrena en 3DS mejorando los gráficos e incluyendo pequeños avances jugables.','https://i.ibb.co/QFTbGLgf/lozocarina.jpg',600.00,38,9,'2025-12-06 13:52:50','2025-12-06 17:23:01'),(4,'ART-00004','Uncharted 3 Drake\'s Deception','UNCHARTED 3: La traición de Drake combinará la narración de la trama con dramáticas secuencias de acción y un ritmo trepidante, lo que te permitirá vivir una experiencia cinemática interactiva que difumina los límites entre los juegos y las películas de Hollywood. Nuevas ubicaciones, nuevos desafíos y entornos detallados al milímetro.','https://i.ibb.co/hxMdSdL5/uncharted3.jpg',80.00,58,5,'2025-12-06 16:29:34','2025-12-06 18:20:27'),(5,'ART-00005','Metal Gear Solid 4 Guns Of The Patriots','Metal Gear Solid 4: Guns of the Patriots es el primer juego de Kojima Productions para Playstation 3.','https://i.ibb.co/p6YQX2kg/mgs4.jpg',250.00,35,5,'2025-12-06 16:31:00','2025-12-06 16:31:00'),(6,'ART-00006','Dead Space 2','El ingeniero Isaac Clarke vuelve para otra sangrienta aventura en la secuela del aclamado Dead Space.','https://i.ibb.co/F4x21jBH/deadspace2.jpg',200.00,35,5,'2025-12-06 18:36:29','2025-12-06 18:36:29'),(7,'ART-00007','Uncharted 2 Among Thieves GOTY','El cazador de tesoros Nathan Drake vuelve en Uncharted 2: El Reino de los Ladrones, un impresionante juego de acción y aventura en tercera persona creado por el galardonado desarrollador Naughty Dog en exclusiva para Playstation 3.','https://i.ibb.co/3m134zM3/uncharted-2.jpg',80.00,24,5,'2025-12-06 18:37:36','2025-12-06 22:46:00'),(8,'ART-00008','Gran Turismo 4','La conducción virtual entra en una nueva era con el regreso del aplaudido Gran Turismo . Abarcando más de un siglo de la historia del motor, GT4 ofrece una cantidad de vehículos sin precedentes (más de 700 en total, incluidos 10 totalmente exclusivos para Europa), nuevas características increíbles y gráficos fotorrealistas que van más allá de tus sueños más salvajes.','https://i.ibb.co/XfCyyQrJ/gt4.jpg',300.00,15,4,'2025-12-06 18:41:55','2025-12-06 18:41:55'),(9,'ART-00009','Killzone','Una aventura epica inspirada en los escenarios belicos mas conocidos de los ultimos tiempos, Un potente arsenal de armas realistas, Unos espectaculares modos multijugador que permiten cmbatir online a otros jugadores o contra ellos.','https://i.ibb.co/xqLkFrYd/kz.jpg',250.00,15,4,'2025-12-06 18:56:49','2025-12-06 18:56:49'),(10,'ART-00010','Playstation 3 Slim 120GB','La PS3 Slim tiene un reproductor de discos Blu-Ray con todas las funciones para que las películas y los juegos se puedan disfrutar con una resolución de alta definición completa a través del puerto HDMI incorporado.','https://i.ibb.co/9RJDsqm/ps3.jpg',2900.00,10,10,'2025-12-06 23:33:30','2025-12-06 23:33:30'),(11,'ART-00011','Xbox 360 Slim 4GB',NULL,'https://i.ibb.co/LdP99Xx6/xbox360.jpg',2000.00,15,12,'2025-12-06 23:34:42','2025-12-06 23:34:42'),(12,'ART-00012','Nintendo 3DS XL Azul',NULL,'https://i.ibb.co/20WnFLSc/3ds.jpg',4200.00,35,11,'2025-12-06 23:36:01','2025-12-06 23:36:01'),(13,'ART-00013','Xbox360 Control Oficial',NULL,'https://i.ibb.co/RkVCbt4R/xbox360control.jpg',600.00,50,7,'2025-12-06 23:39:18','2025-12-06 23:39:18'),(14,'ART-00014','Control Dualshock3 Oficial',NULL,'https://i.ibb.co/R4cWDLFw/ps3control.jpg',800.00,25,8,'2025-12-06 23:40:50','2025-12-06 23:40:50');
/*!40000 ALTER TABLE `articulo` ENABLE KEYS */;
UNLOCK TABLES;



