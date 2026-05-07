/**
 * @file Rutas de notificaciones para Chambaya.
 *
 * Gestiona las notificaciones internas de la plataforma:
 * - Notificar al ofertante cuando alguien se postula
 * - Notificar al demandante cuando su solicitud es aceptada/rechazada
 * - Marcar notificaciones como leidas
 *
 * @module routes/notifications
 * @requires express
 * @requires ../db
 * @requires ../middleware/auth
 */

const express = require('express');
const { db } = require('../db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Crea una notificacion interna para un usuario.
 * Usada por otros modulos del backend (jobs, solicitudes, etc.).
 *
 * @function
 * @name crearNotificacion
 * @param {number} usuarioId    - ID del usuario destinatario
 * @param {string} tipo         - Tipo de notificacion
 * @param {string} mensaje      - Texto de la notificacion
 * @param {number} [referenciaId] - ID opcional de la oferta relacionada
 * @returns {void}
 *
 * @example
 * crearNotificacion(3, 'nueva_solicitud', 'Maria se ha postulado a tu oferta', 5);
 */
function crearNotificacion(usuarioId, tipo, mensaje, referenciaId) {
  db.prepare(
    'INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)'
  ).run(usuarioId, tipo, mensaje, referenciaId || null);
}

/**
 * GET /api/notificaciones
 *
 * Obtiene las notificaciones del usuario autenticado, ordenadas
 * por fecha de creacion descendente. Incluye el conteo de no leidas.
 *
 * @name getNotifications
 * @memberof module:routes/notifications
 * @function
 * @returns {Object} 200
 * @returns {Array}  200.notificaciones - Lista de notificaciones
 * @returns {number} 200.noLeidas       - Cantidad de notificaciones sin leer
 *
 * @throws {401} Si no hay token valido
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/notificaciones', {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * })
 */
router.get('/', verificarToken, (req, res) => {
  try {
    const notificaciones = db.prepare(`
      SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY creado_en DESC LIMIT 50
    `).all(req.usuario.id);
    const noLeidas = db.prepare(
      'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = 0'
    ).get(req.usuario.id);
    res.json({ notificaciones, noLeidas: noLeidas.total });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * PUT /api/notificaciones/leer
 *
 * Marca todas las notificaciones del usuario autenticado como leidas.
 *
 * @name markNotificationsRead
 * @memberof module:routes/notifications
 * @function
 * @returns {Object} 200
 * @returns {string} 200.mensaje - Confirmacion
 *
 * @throws {401} Si no hay token valido
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/notificaciones/leer', {
 *   method: 'PUT',
 *   headers: { 'Authorization': `Bearer ${token}` }
 * })
 */
router.put('/leer', verificarToken, (req, res) => {
  try {
    db.prepare('UPDATE notificaciones SET leida = 1 WHERE usuario_id = ?').run(req.usuario.id);
    res.json({ mensaje: 'Notificaciones marcadas como leidas.' });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = { router, crearNotificacion };
