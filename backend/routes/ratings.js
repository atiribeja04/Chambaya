/**
 * @file Rutas de valoraciones para Chambaya.
 *
 * Implementa el sistema de reputacion entre usuarios. Permite crear
 * valoraciones tras completar un trabajo y consultar las valoraciones
 * recibidas por un usuario con su puntuacion media.
 *
 * @module routes/ratings
 * @requires express
 * @requires ../db
 * @requires ../middleware/auth
 */

const express = require('express');
const { db } = require('../db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/valoraciones
 *
 * Crea una valoracion para un usuario tras la realizacion de un trabajo.
 *
 * Cada usuario puede valorar una oferta una unica vez (hay un UNIQUE
 * constraint sobre `oferta_id` + `usuario_origen_id`). No esta permitido
 * valorarse a uno mismo. La puntuacion debe estar entre 1 y 5.
 *
 * @name createRating
 * @memberof module:routes/ratings
 * @function
 * @param {number}  req.body.oferta_id         - ID de la oferta realizada
 * @param {number}  req.body.usuario_destino_id - ID del usuario que recibira la valoracion
 * @param {number}  req.body.puntuacion        - Puntuacion del 1 al 5
 * @param {string}  [req.body.comentario]       - Comentario opcional
 *
 * @returns {Object} 201 - Valoracion creada
 * @returns {string} 201.mensaje - Confirmacion
 *
 * @throws {400} Si faltan campos requeridos
 * @throws {400} Si la puntuacion esta fuera del rango 1-5
 * @throws {400} Si el usuario intenta valorarse a si mismo
 * @throws {409} Si el usuario ya ha valorado esta oferta
 *
 * @example
 * fetch('/api/valoraciones', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({
 *     oferta_id: 1,
 *     usuario_destino_id: 2,
 *     puntuacion: 5,
 *     comentario: 'Excelente trabajo, muy recomendable.'
 *   })
 * })
 */
router.post('/', verificarToken, (req, res) => {
  try {
    const { oferta_id, usuario_destino_id, puntuacion, comentario } = req.body;

    if (!oferta_id || !usuario_destino_id || !puntuacion) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ error: 'La puntuacion debe ser entre 1 y 5.' });
    }

    if (req.usuario.id === usuario_destino_id) {
      return res.status(400).json({ error: 'No puedes valorarte a ti mismo.' });
    }

    const existente = db.prepare(
      'SELECT id FROM valoraciones WHERE oferta_id = ? AND usuario_origen_id = ?'
    ).get(oferta_id, req.usuario.id);

    if (existente) {
      return res.status(409).json({ error: 'Ya has valorado esta oferta.' });
    }

    db.prepare(`
      INSERT INTO valoraciones (oferta_id, usuario_origen_id, usuario_destino_id, puntuacion, comentario)
      VALUES (?, ?, ?, ?, ?)
    `).run(oferta_id, req.usuario.id, usuario_destino_id, puntuacion, comentario || null);

    res.status(201).json({ mensaje: 'Valoracion creada correctamente.' });
  } catch (error) {
    console.error('Error al crear valoracion:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * GET /api/valoraciones/usuario/:id
 *
 * Obtiene todas las valoraciones recibidas por un usuario, junto con
 * su puntuacion media y el numero total de valoraciones.
 *
 * La ruta es publica (no requiere autenticacion), pensada para mostrar
 * la reputacion de un ofertante o demandante en su perfil publico.
 *
 * @name getUserRatings
 * @memberof module:routes/ratings
 * @function
 * @param {number} req.params.id - ID del usuario destino
 *
 * @returns {Object} 200
 * @returns {Array}  200.valoraciones - Lista de valoraciones con nombre del origen y titulo de la oferta
 * @returns {Object} 200.estadisticas - Estadisticas: media (number) y total (number)
 *
 * @example
 * fetch('/api/valoraciones/usuario/1')
 *   .then(r => r.json())
 *   .then(d => console.log(d.estadisticas.media))
 */
router.get('/usuario/:id', (req, res) => {
  try {
    const valoraciones = db.prepare(`
      SELECT v.*, u.nombre as usuario_nombre, o.titulo as oferta_titulo
      FROM valoraciones v
      JOIN usuarios u ON v.usuario_origen_id = u.id
      LEFT JOIN ofertas o ON v.oferta_id = o.id
      WHERE v.usuario_destino_id = ?
      ORDER BY v.creado_en DESC
    `).all(req.params.id);

    const stats = db.prepare(`
      SELECT COALESCE(AVG(puntuacion), 0) as media, COUNT(*) as total
      FROM valoraciones WHERE usuario_destino_id = ?
    `).get(req.params.id);

    res.json({ valoraciones, estadisticas: stats });
  } catch (error) {
    console.error('Error al obtener valoraciones:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
