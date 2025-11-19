# 📄 Proyecto Retrogamer – README

Este documento explica cómo instalar las dependencias, crear la base de datos y ejecutar la aplicación correctamente.

---

## ✅ 1️⃣ Requisitos previos

Antes de iniciar, debes tener instalado:

| Herramienta | Versión recomendada |
|------------|-------------------|
| **Node.js** | 18 o superior |
| **MySQL / MariaDB** | Incluido en XAMPP |
| **Git** *(opcional)* | Última versión |

Asegúrate de tener **MySQL en ejecución** en XAMPP (puerto 3306 por defecto).

---

## ✅ 2️⃣ Instalar dependencias del proyecto

Ubícate dentro de la carpeta del proyecto:

```bash
cd C:\ruta\a\tu\proyecto
npm install
```

Este comando instalará todas las dependencias definidas en `package.json` automáticamente ✅  
Por si necesitas instalarlas una por una, aquí están los comandos:

```bash
npm install express                # Servidor web
npm install express-myconnection   # Conexión MySQL + Express
npm install mysql                  # Cliente MySQL
npm install morgan                 # Logger HTTP
npm install ejs                    # Motor de vistas
```

🍀 (Opcional para desarrollo)
```bash
npm install -D nodemon             # Reinicio automático del servidor
```

> Si instalas nodemon, puedes agregar scripts en package.json:
```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

---

## ✅ 3️⃣ Crear Base de Datos

Ejecutar el script SQL incluido en `/db/script.sql`:

```powershell
cd C:\xampp\mysql\bin
.\mysql -u root -p < C:\ruta\a\tu\proyecto\db\script.sql
```

✅ Esto creará la base **db_retrogamer** junto con todas sus tablas

---

## ✅ 4️⃣ Crear usuario para conectar la app

Puedes ejecutar manualmente este SQL o agregarlo al final del script de la base:

```sql
CREATE USER IF NOT EXISTS 'retrogamer'@'localhost' IDENTIFIED BY 'retro';
GRANT ALL PRIVILEGES ON db_retrogamer.* TO 'retrogamer'@'localhost';
FLUSH PRIVILEGES;
```

---

## ✅ 5️⃣ Configuración de conexión en la app

Ya está configurado en `app.js`, pero debe coincidir con MySQL:

```js
app.use(myConnection(mysql, {
  host: 'localhost',
  user: 'retrogamer',
  password: 'retro',
  port: 3306,
  database: 'db_retrogamer'
}, 'pool'));
```

Si tu MySQL usa otro puerto (p. ej. 3307), cámbialo ahí ✅

---

## ✅ 6️⃣ Ejecutar el servidor

Modo normal:
```bash
npm start
```

Modo desarrollo (si instalaste nodemon):
```bash
npm run dev
```

Abrir en navegador:
```
http://localhost:8080/
```

---

## 📌 Estructura del Proyecto

APP/
 ├─ controllers/          # Controladores de lógica
 ├─ db/
 │   ├─ diseño.mwb        # Modelo ER del proyecto
 │   └─ script.sql        # Script para crear la base de datos
 ├─ node_modules/         # Paquetes instalados con npm (NO se sube a Git)
 ├─ src/                  # (Reservado para futuras funciones o recursos)
 ├─ views/                # Archivos de vista (si usas EJS)
 ├─ public/               # Archivos estáticos (img, css, js cliente)
 ├─ routes/               # Rutas de Express
 ├─ .gitignore            # Archivos que se ignoran en Git
 ├─ app.js                # Punto de entrada de la aplicación
 ├─ create.bat            # Script opcional para creación rápida de entorno (NO se sube a Git)
 ├─ package.json          # Configuración del proyecto y dependencias
 ├─ package-lock.json     # Versión exacta instalada de dependencias
 └─ Readme.md             # Instrucciones del proyecto

## 📌 Repositorio del proyecto
https://github.com/brandonfloresmx/retrogamer-app