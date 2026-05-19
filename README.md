# Chambaya

Plataforma web para conectar personas que buscan trabajos temporales con quienes los ofrecen.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Frontend | Vue.js 3 + Vite |
| Backend | Node.js + Express |
| Base de datos | SQLite |
| Autenticación | JWT |
| Mapas | Leaflet + OpenStreetMap |
| Despliegue | AWS EC2 + nginx + PM2 |
| CI/CD | GitHub Actions |

## Instalación

```bash
git clone https://github.com/atiribeja04/Chambaya.git
cd Chambaya

# Backend
cd backend
npm install
npm run seed
npm start

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

## Estructura

```
chambaya/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── db.js              # Base de datos SQLite
│   ├── seed.js            # Datos de ejemplo
│   ├── middleware/auth.js  # Autenticación JWT
│   └── routes/            # Endpoints de la API
├── frontend/
│   └── src/
│       ├── views/         # Páginas de la aplicación
│       ├── components/    # Componentes reutilizables
│       ├── router/        # Rutas de navegación
│       └── store/         # Estado global
├── docs/api/              # Documentación JSDoc
└── .github/workflows/     # CI/CD
```

## Licencia

Proyecto educativo
