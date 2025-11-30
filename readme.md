# 🕹️ RetroGamer 

Este proyecto es una aplicación web desarrollada con **Node.js, Express, MySQL y JavaScript Vanilla**.
Incluye:

* 🛍️ **Frontend Storefront** (tienda para usuarios)
* 🛠️ **Panel de administración** con autenticación
* 📦 CRUD completos:

  * Clientes
  * Categorías y subcategorías
  * Productos (con subida de imágenes)
* 🧪 Tests automatizados con Jest + Supertest
* 🗃️ Base de datos estructurada con relaciones reales (carrito, pedidos, inventario)

---

## 🚀 Características principales

| Módulo                | Funciones                                                    | Estado         |
| --------------------- | ------------------------------------------------------------ | -------------- |
| 🛒 Storefront         | Registro/Login, carrito, navegación                          | ✔ Implementado |
| 🔐 Admin Login        | Sesión con `express-session` y protección con middleware     | ✔ Implementado |
| 👥 Clientes CRUD      | Crear, listar, actualizar, eliminar                          | ✔              |
| 🏷️ Categorías CRUD   | Jerarquía padre/hijo, slug automático, contador de productos | ✔              |
| 🎮 Productos CRUD     | Imagen, precio, existencia, categorías dinámicas             | ✔              |
| 🧪 Testing            | Automatizado para todos los CRUD usando Jest + Supertest     | ✔              |
| 📂 Subida de imágenes | Con Multer (carpeta `/public/uploads`)                       | ✔              |

---

## ⚙️ Tecnologías utilizadas

* **Backend**

  * Node.js
  * Express
  * Express-session
  * MySQL2
  * Multer

* **Frontend**

  * HTML, CSS, JavaScript Vanilla
  * Diseño responsivo estilo dashboard

* **Database**

  * MySQL
  * Relacionado con claves foráneas, triggers básicos opcionales

* **Testing**

  * Jest
  * Supertest

---

## 📁 Estructura del proyecto

```
📦 Proyecto
├── app.js
├── package.json
├── package-lock.json
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── login-admin.html
│   └── uploads/   ← imágenes (ignorada por git)
│       └── .gitkeep
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── db/pool.js
└── tests/
    ├── clientes.test.js
    ├── articulos.test.js
    └── categorias.test.js
```

---

## 🧰 Requisitos

* Node.js v16+
* MySQL 8+
* npm

---

## 🛠️ Instalación y configuración

### 1️⃣ Instalar dependencias

```bash
npm install
```

### 2️⃣ Crear base de datos

Ejecuta el archivo SQL incluido en `/db` o el script del README:

```sql
SOURCE retrogamer.sql;
```

Esto también creará un usuario MySQL:

```
usuario: retrogamer
password: retrogamer2025
```

### 3️⃣ Configurar variables opcionales (.env)

> (Opcional pero recomendado)

```
DB_HOST=localhost
DB_USER=retrogamer
DB_PASS=retrogamer2025
DB_NAME=retrogamer
SESSION_SECRET=retrogamer-super-secreto-2025
```

### 4️⃣ Ejecutar el servidor

```bash
npm start
```

Servidor disponible en:

```
http://localhost:3000
```

### 5️⃣ Usuario administrador

El SQL incluye un admin por defecto:

| Usuario | Contraseña   |
| ------- | ------------ |
| `admin` | `retrogamer` |

Acceso al panel:

```
http://localhost:3000/admin
```

---

## 🧪 Ejecutar pruebas

```bash
npm test
```

Ejecuta pruebas automatizadas para:

* Clientes
* Categorías
* Productos

---

## 📦 Carpeta de imágenes

Las imágenes cargadas se guardan en:

```
public/uploads
```

Esta carpeta está incluida en `.gitignore`, excepto `.gitkeep`, para mantener el folder sin almacenar archivos reales.

---

## 🔒 Seguridad implementada

* Middleware `requireAdmin` para restringir rutas
* Sesiones seguras mediante express-session
* Contraseñas admin almacenadas con hash MD5 (mejorable a bcrypt en producción)



