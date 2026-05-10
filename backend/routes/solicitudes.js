/**
 * @file Rutas de solicitudes (postulaciones) para Chambaya.
 *
 * Gestiona las solicitudes desde la perspectiva del demandante:
 * listar las propias postulaciones y verificar si ya se ha valorado la oferta.
 *
 * @module routes/solicitudes
 * @requires express
 * @requires ../db
 * @requires ../middleware/auth
 */

const express = require('express');
const { db } = require('../db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/solicitudes/mis-solicitudes
 *
 * Devuelve todas las solicitudes realizadas por el usuario autenticado,
 * incluyendo datos de la oferta y del ofertante, y si el usuario ya ha
 * valorado esa oferta.
 *
 * @name getMyApplications
 * @memberof module:routes/solicitudes
 * @function
 *
 * @returns {Object} 200
 * @returns {Array}  200.solicitudes - Lista de solicitudes con datos adjuntos
 *
 * @throws {401} Si no hay token valido
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/solicitudes/mis-solicitudes', {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * })
 */
router.get('/mis-solicitudes', verificarToken, (req, res) => {
  try {
    const solicitudes = db.prepare(`
      SELECT
        s.id, s.estado, s.mensaje, s.creado_en,
        o.id as oferta_id, o.titulo as oferta_titulo, o.estado as oferta_estado,
        o.precio, o.tipo_precio,
        u.id as ofertante_id, u.nombre as ofertante_nombre,
        CASE WHEN v.id IS NOT NULL THEN 1 ELSE 0 END as ya_valorado
      FROM solicitudes s
      JOIN ofertas o ON s.oferta_id = o.id
      JOIN usuarios u ON o.usuario_id = u.id
      LEFT JOIN valoraciones v ON v.oferta_id = s.oferta_id AND v.usuario_origen_id = ?
      WHERE s.usuario_id = ?
      ORDER BY s.creado_en DESC
    `).all(req.usuario.id, req.usuario.id);

    res.json({ solicitudes });
  } catch (error) {
    console.error('Error al obtener mis solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
