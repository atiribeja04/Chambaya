# 🪜 Chambaya (Chamba Ya)

Plataforma web para conectar personas que buscan trabajos temporales o puntuales con aquellos que los ofrecen.

## 🎯 Objetivo

Desarrollar una plataforma funcional que permita la publicacion y busqueda de trabajos de corta duracion como limpieza, cuidado de ninos, mudanzas, eventos, etc.

## ✨ Caracteristicas

- **Registro y gestion de usuarios**: Ofertantes y demandantes con perfiles personalizados
- **Publicacion de ofertas**: Crear, editar y gestionar ofertas de trabajo
- **Busqueda por categoria y ubicacion**: Encuentra el trabajo perfecto cerca de ti
- **Sistema de valoraciones**: Construye tu reputacion con puntuaciones y comentarios
- **Panel de administracion**: Moderacion y gestion completa del contenido

## 🛠️ Tecnologias

| Componente | Tecnologia |
|------------|-----------|
| Frontend   | Vue.js 3 + Vite |
| Backend    | Node.js + Express |
| Base de datos | SQLite (desarrollo) / MariaDB (produccion) |
| Control de versiones | Git |
| Documentacion | JSDoc |

## 🚀 Instalacion y uso

### Requisitos

- Node.js 18+
- npm 9+

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd chambaya

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Sembrar datos de ejemplo
npm run seed

# 4. Iniciar el servidor
npm start

# 5. En otra terminal, instalar y construir el frontend
cd ../frontend
npm install
npm run build

# 6. Abrir en el navegador
# http://localhost:3000
```

### Credenciales de prueba

| Rol | Email | Contrasena |
|-----|-------|-----------|
| Admin | admin@chambaya.com | admin123 |
| Ofertante | carlos@email.com | 123456 |
| Demandante | maria@email.com | 123456 |

## 📁 Estructura del proyecto

```
chambaya/
├── backend/
│   ├── server.js          # Punto de entrada del servidor
│   ├── db.js              # Configuracion de base de datos
│   ├── seed.js            # Datos de ejemplo
│   ├── middleware/
│   │   └── auth.js        # Autenticacion JWT
│   └── routes/
│       ├── auth.js        # Rutas de autenticacion
│       ├── jobs.js        # Rutas de ofertas
│       ├── ratings.js     # Rutas de valoraciones
│       └── admin.js       # Rutas de administracion
├── frontend/
│   ├── src/
│   │   ├── main.js        # Punto de entrada Vue
│   │   ├── App.vue        # Componente raiz
│   │   ├── router/        # Configuracion de rutas
│   │   ├── views/         # Paginas de la aplicacion
│   │   └── components/    # Componentes reutilizables
├── setup.sql              # Esquema MariaDB para produccion
└── README.md
```

## 📚 Documentacion del codigo

El codigo esta documentado en espanol usando JSDoc.

```bash
cd backend
npm run docs
# La documentacion se genera en docs/api/
```

## 🐳 Despliegue a produccion

### Opcion 1: Servidor VPS (Hetzner)

```bash
# Configurar MariaDB
mysql -u root -p < setup.sql

# Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con los valores de produccion

# Iniciar con PM2
npm install -g pm2
cd backend
pm2 start server.js --name chambaya
pm2 save
```

### Opcion 2: CI/CD con GitHub Actions

El archivo `.github/workflows/deploy.yml` automatiza el despliegue al hacer push a la rama `main`.

## 📄 Licencia

Proyecto educativo - CIPFP Batoi
