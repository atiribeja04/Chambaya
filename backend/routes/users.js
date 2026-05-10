/**
 * @file Rutas de perfiles publicos de usuarios para Chambaya.
 *
 * Permite consultar la informacion publica de cualquier usuario,
 * sus valoraciones recibidas y ofertas activas (si es ofertante).
 *
 * @module routes/users
 * @requires express
 * @requires ../db
 */

const express = require('express');
const { db } = require('../db');
const router = express.Router();

/**
 * GET /api/usuarios/:id/perfil
 *
 * Obtiene el perfil publico de un usuario: datos personales, media
 * de puntuacion, valoraciones recibidas y ofertas activas (si es
 * ofertante).
 *
 * @name getPublicProfile
 * @memberof module:routes/users
 * @function
 * @param {number} req.params.id - ID del usuario
 *
 * @returns {Object} 200
 * @returns {Object} 200.usuario - Datos del usuario (nombre, email, tipo, telefono, ubicacion, descripcion)
 * @returns {Object} 200.valoracionesStats - Estadisticas de valoracion
 * @returns {number} 200.valoracionesStats.media - Puntuacion media
 * @returns {number} 200.valoracionesStats.total - Total de valoraciones
 * @returns {Array}  200.valoraciones - Lista de valoraciones recibidas
 * @returns {Array}  200.ofertas - Ofertas activas del usuario (solo si es ofertante)
 *
 * @throws {404} Si el usuario no existe
 *
 * @example
 * fetch('/api/usuarios/3/perfil')
 */
router.get('/:id/perfil', (req, res) => {
  try {
    const usuario = db.prepare(`
      SELECT id, nombre, email, tipo, telefono, ubicacion, descripcion, creado_en
      FROM usuarios WHERE id = ?
    `).get(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const valoracionesStats = db.prepare(`
      SELECT COALESCE(AVG(puntuacion), 0) as media, COUNT(*) as total
      FROM valoraciones WHERE usuario_destino_id = ?
    `).get(req.params.id);

    const valoraciones = db.prepare(`
      SELECT v.*, u.nombre as usuario_nombre, o.titulo as oferta_titulo
      FROM valoraciones v
      JOIN usuarios u ON v.usuario_origen_id = u.id
      LEFT JOIN ofertas o ON v.oferta_id = o.id
      WHERE v.usuario_destino_id = ?
      ORDER BY v.creado_en DESC
    `).all(req.params.id);

    let ofertas = [];
    if (usuario.tipo === 'ofertante') {
      ofertas = db.prepare(`
        SELECT o.*, c.nombre as categoria_nombre
        FROM ofertas o
        LEFT JOIN categorias c ON o.categoria_id = c.id
        WHERE o.usuario_id = ? AND o.estado = 'activa'
        ORDER BY o.creado_en DESC
      `).all(req.params.id);
    }

    res.json({ usuario, valoracionesStats, valoraciones, ofertas });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
