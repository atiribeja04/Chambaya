/**
 * @file Rutas de perfiles de demandantes publicados.
 * @module routes/demandantes
 * @requires express
 * @requires ../db
 * @requires ../middleware/auth
 */

const express = require('express');
const { db } = require('../db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/demandantes
 *
 * Lista perfiles de demandantes publicados (en_busqueda = 1) con paginacion,
 * busqueda por texto y ordenacion por destacados y puntuacion.
 *
 * @name listDemandantes
 * @memberof module:routes/demandantes
 * @function
 * @param {number} [req.query.page=1]     - Numero de pagina
 * @param {number} [req.query.limit=12]    - Resultados por pagina (max 50)
 * @param {string} [req.query.busqueda]    - Texto a buscar en nombre, skills, barrio
 *
 * @returns {Object} 200
 * @returns {Array}  200.demandantes    - Lista de perfiles
 * @returns {number} 200.total           - Total de resultados
 * @returns {number} 200.totalPages      - Total de paginas
 * @returns {number} 200.page            - Pagina actual
 * @returns {number} 200.limit           - Limite por pagina
 *
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/demandantes?page=1&limit=6&busqueda=jardineria')
 */
router.get('/', (req, res) => {
  try {
    const { busqueda, page = 1, limit = 12 } = req.query;
    const pagina = Math.max(1, parseInt(page) || 1);
    const limite = Math.min(50, Math.max(1, parseInt(limit) || 12));

    let whereSql = "WHERE u.en_busqueda = 1 AND u.tipo = 'demandante'";
    const params = [];

    if (busqueda) {
      whereSql += ' AND (u.nombre LIKE ? OR u.skills LIKE ? OR u.descripcion LIKE ? OR u.barrio LIKE ?)';
      params.push(`%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`);
    }

    const total = db.prepare(`
      SELECT COUNT(*) as total FROM usuarios u ${whereSql}
    `).get(...params).total;

    const totalPages = Math.ceil(total / limite);

    const demandantes = db.prepare(`
      SELECT u.id, u.nombre, u.foto_perfil, u.skills, u.disponibilidad,
             u.barrio, u.ubicacion, u.latitud, u.longitud, u.descripcion,
             u.creado_en,
             COALESCE(AVG(v.puntuacion), 0) as puntuacion_media,
             COUNT(v.id) as total_valoraciones,
             (SELECT fecha_fin FROM destacados WHERE tipo = 'demandante' AND ref_id = u.id AND fecha_fin > datetime('now') LIMIT 1) as destacado_hasta
      FROM usuarios u
      LEFT JOIN valoraciones v ON v.usuario_destino_id = u.id
      ${whereSql}
      GROUP BY u.id
      ORDER BY destacado_hasta IS NOT NULL DESC, puntuacion_media DESC, u.creado_en DESC
      LIMIT ? OFFSET ?
    `).all(...params, limite, (pagina - 1) * limite);

    res.json({ demandantes, total, totalPages, page: pagina, limit: limite });
  } catch (error) {
    console.error('Error al obtener demandantes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * GET /api/demandantes/:id
 *
 * Perfil publico completo de un demandante, incluyendo puntuacion media
 * y lista de valoraciones recibidas.
 *
 * @name getDemandante
 * @memberof module:routes/demandantes
 * @function
 * @param {number} req.params.id - ID del demandante
 *
 * @returns {Object} 200
 * @returns {Object} 200.usuario     - Datos del demandante
 * @returns {Array}  200.valoraciones - Valoraciones recibidas
 *
 * @throws {404} Si el usuario no existe o no es demandante
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/demandantes/5')
 */
router.get('/:id', (req, res) => {
  try {
    const usuario = db.prepare(`
      SELECT u.id, u.nombre, u.foto_perfil, u.skills, u.disponibilidad,
             u.barrio, u.ubicacion, u.descripcion, u.creado_en,
             COALESCE(AVG(v.puntuacion), 0) as puntuacion_media,
             COUNT(v.id) as total_valoraciones,
             (SELECT fecha_fin FROM destacados WHERE tipo = 'demandante' AND ref_id = u.id AND fecha_fin > datetime('now') LIMIT 1) as destacado_hasta
      FROM usuarios u
      LEFT JOIN valoraciones v ON v.usuario_destino_id = u.id
      WHERE u.id = ?
      GROUP BY u.id
    `).get(req.params.id);

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const valoraciones = db.prepare(`
      SELECT v.*, u.nombre as usuario_nombre, o.titulo as oferta_titulo
      FROM valoraciones v
      JOIN usuarios u ON v.usuario_origen_id = u.id
      LEFT JOIN ofertas o ON v.oferta_id = o.id
      WHERE v.usuario_destino_id = ?
      ORDER BY v.creado_en DESC
    `).all(req.params.id);

    res.json({ usuario, valoraciones });
  } catch (error) {
    console.error('Error al obtener demandante:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
