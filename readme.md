# 🕹️ RetroGamer

Aplicación web con **Node.js + Express + MySQL + JS vanilla** que incluye storefront y panel de administración.

* 🛍️ Tienda con banners, carrusel y detalle de producto
* 🛠️ Panel admin con autenticación y CRUD de clientes, categorías, productos y banners
* 📂 Subida de imágenes con Multer (carpeta `public/uploads/`)
* 🧪 Pruebas con Jest + Supertest

---

## 🚀 Inicio rápido

1) Clonar e instalar dependencias
```bash
git clone https://github.com/brandonfloresmx/retrogamer-app.git
cd retrogamer-app
npm install
```

2) Importar base de datos (incluye schema + datos + usuario y admin)
```bash
# MySQL en localhost:3307
mysql -u root -p -P 3307 < src/db/retrogamer.sql
```
El script crea la base `retrogamer`, el usuario `retrogamer`/`retrogamer2025` y datos de categorías, productos y admin.

3) Imágenes
```
public/uploads/
```
Copia aquí tus imágenes (la carpeta está en `.gitignore`). Si no tienes imágenes, mantén el placeholder `.gitkeep` o sube URLs externas en la BD.

4) Ejecutar
```bash
npm run dev
```
* Tienda: http://localhost:3000
* Admin: http://localhost:3000/admin/login (usuario `admin`, contraseña `retrogamer`)

---

## 🧰 Requisitos

* Node.js 16+
* MySQL 8+ (escuchando en puerto 3307 o ajusta `src/db/pool.js`)
* npm

---

## 📁 Estructura

```
📦 Proyecto
├── app.js
├── package.json
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── login-admin.html
│   └── uploads/   (ignorada por git)
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── db/
│       ├── pool.js
│       └── retrogamer.sql
└── test/
    ├── articulos.test.js
    ├── categorias.test.js
    └── clientes.test.js
```

---

## 🔑 Credenciales incluidas

* Admin: `admin` / `retrogamer`
* Usuario MySQL creado por el script: `retrogamer` / `retrogamer2025`

---

## 🧪 Pruebas

```bash
npm test
```

---

## Notas

* `public/uploads/` está en `.gitignore` para no versionar imágenes.
* Si tu MySQL usa otro puerto/host/usuario, ajusta `src/db/pool.js` o usa variables de entorno equivalentes.



