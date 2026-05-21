/**
 * @file Servidor principal de Chambaya.
 *
 * Punto de entrada de la aplicacion. Configura Express, sirve el frontend
 * estatico, monta todas las rutas de la API y la documentacion JSDoc.
 *
 * @module server
 * @requires express
 * @requires cors
 * @requires path
 * @requires ./db
 * @requires ./routes/auth
 * @requires ./routes/jobs
 * @requires ./routes/ratings
 * @requires ./routes/admin
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./db');
const { upload, uploadsPath } = require('./upload');

const authRoutes = require('./routes/auth');
const solicitudesRoutes = require('./routes/solicitudes');
const jobsRoutes = require('./routes/jobs');
const ratingsRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');
const { router: notifRoutes } = require('./routes/notifications');
const usersRoutes = require('./routes/users');
const demandantesRoutes = require('./routes/demandantes');
const destacadosRoutes = require('./routes/destacados');
const geocodeRoutes = require('./routes/geocode');

/**
 * Instancia de la aplicacion Express.
 * @type {Express}
 */
const app = express();

/**
 * Puerto en el que escucha el servidor.
 * @type {number}
 * @default 3000
 */
const PORT = process.env.PPORT || 3000;

/*
 * ─── Middleware global ──────────────────────────────────────────
 */

/**
 * Habilita CORS para peticiones desde origenes cruzados.
 * @name cors
 * @memberof module:server
 * @function
 */
app.use(cors());

/**
 * Parsea el cuerpo de las peticiones con Content-Type application/json.
 * @name jsonParser
 * @memberof module:server
 * @function
 */
app.use(express.json());

/**
 * Parsea el cuerpo de las peticiones con Content-Type application/x-www-form-urlencoded.
 * @name urlencodedParser
 * @memberof module:server
 * @function
 */
app.use(express.urlencoded({ extended: true }));

/*
 * ─── Archivos estaticos ────────────────────────────────────────
 */

/**
 * Ruta al directorio del frontend compilado (Vite).
 * @type {string}
 */
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');

/**
 * Sirve el frontend compilado como estatico.
 * @name frontendStatic
 * @memberof module:server
 * @function
 */
app.use(express.static(frontendPath));

/**
 * Ruta al directorio de documentacion generada con JSDoc.
 * @type {string}
 */
const docsPath = path.join(__dirname, '..', 'docs', 'api');

/**
 * Sirve la documentacion JSDoc en /docs.
 * @name docsStatic
 * @memberof module:server
 * @function
 * @see {@link http://localhost:3000/docs}
 */
app.use('/docs', express.static(docsPath));

/**
 * Sirve los archivos subidos (imagenes de perfil, ofertas) en /uploads.
 * @name uploadsStatic
 * @memberof module:server
 * @function
 */
app.use('/uploads', express.static(uploadsPath));

/*
 * ─── Rutas de la API ───────────────────────────────────────────
 */

/**
 * Monta las rutas de autenticacion en /api/auth.
 * @name authRoutes
 * @memberof module:server
 * @function
 * @see module:routes/auth
 */
app.use('/api/auth', authRoutes);

/**
 * Monta las rutas de ofertas en /api/ofertas.
 * @name jobsRoutes
 * @memberof module:server
 * @function
 * @see module:routes/jobs
 */
app.use('/api/ofertas', jobsRoutes);

/**
 * Monta las rutas de valoraciones en /api/valoraciones.
 * @name ratingsRoutes
 * @memberof module:server
 * @function
 * @see module:routes/ratings
 */
app.use('/api/valoraciones', ratingsRoutes);

/**
 * Monta las rutas de administracion en /api/admin.
 * @name adminRoutes
 * @memberof module:server
 * @function
 * @see module:routes/admin
 */
/**
 * Monta las rutas de administracion en /api/admin.
 * @name adminRoutes
 * @memberof module:server
 * @function
 * @see module:routes/admin
 */
app.use('/api/admin', adminRoutes);

/**
 * Monta las rutas de notificaciones en /api/notificaciones.
 * @name notifRoutes
 * @memberof module:server
 * @function
 * @see module:routes/notifications
 */
app.use('/api/notificaciones', notifRoutes);

/**
 * Monta las rutas de usuarios en /api/usuarios.
 * @name usersRoutes
 * @memberof module:server
 * @function
 * @see module:routes/users
 */
app.use('/api/usuarios', usersRoutes);

/**
 * Monta las rutas de perfiles de demandantes en /api/demandantes.
 * @name demandantesRoutes
 * @memberof module:server
 * @function
 * @see module:routes/demandantes
 */
app.use('/api/demandantes', demandantesRoutes);

/**
 * Monta las rutas de destacados (boost) en /api/destacados.
 * @name destacadosRoutes
 * @memberof module:server
 * @function
 * @see module:routes/destacados
 */
app.use('/api/destacados', destacadosRoutes);

/**
 * Monta las rutas de solicitudes en /api/solicitudes.
 * @name solicitudesRoutes
 * @memberof module:server
 * @function
 * @see module:routes/solicitudes
 */
app.use('/api/solicitudes', solicitudesRoutes);

/**
 * Monta las rutas de geocoding en /api/geocode.
 * @name geocodeRoutes
 * @memberof module:server
 * @function
 * @see module:routes/geocode
 */
app.use('/api/geocode', geocodeRoutes);

/*
 * ─── Rutas publicas ────────────────────────────────────────────
 */

/**
 * GET /api
 *
 * Muestra informacion basica de la API y enlace a la documentacion.
 *
 * @name apiRoot
 * @memberof module:server
 * @function
 * @param {Object} req - Objeto de peticion
 * @param {Object} res - Objeto de respuesta
 * @returns {void} Responde con JSON con metadatos de la API
 */
app.get('/api', (req, res) => {
  res.json({
    nombre: 'Chambaya API',
    version: '1.0.0',
    descripcion: 'API REST de la plataforma Chambaya para trabajos temporales',
    docs: '/docs'
  });
});

/**
 * GET *
 *
 * Ruta comodin para el frontend SPA (Vue Router).
 * Redirige cualquier ruta no coincidente con las anteriores
 * al index.html del frontend para que Vue Router maneje la navegacion.
 *
 * @name spaFallback
 * @memberof module:server
 * @function
 * @param {Object} req - Objeto de peticion
 * @param {Object} res - Objeto de respuesta
 * @returns {void} Envia el archivo index.html del frontend
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

/*
 * ─── Inicio del servidor ───────────────────────────────────────
 */

/**
 * Inicia el servidor HTTP en el puerto configurado.
 *
 * Escucha en 0.0.0.0 para aceptar conexiones desde cualquier interfaz
 * de red (localhost, IP local, contenedores Docker, etc.).
 *
 * @name listen
 * @memberof module:server
 * @function
 * @param {number} PORT - Puerto de escucha
 * @param {string} '0.0.0.0' - Direccion de escucha (todas las interfaces)
 * @param {Function} callback - Funcion ejecutada al iniciar el servidor
 * @returns {void}
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de Chambaya iniciado en http://0.0.0.0:${PORT}`);
  console.log(`📚 API disponible en http://0.0.0.0:${PORT}/api`);
});

module.exports = app;

// FIXME: extraer middlewares a archivo aparte

// FIXME: extraer middlewares a archivo aparte
