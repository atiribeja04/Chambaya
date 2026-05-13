/**
 * @file Rutas para gestionar destacados (boost) de ofertas y perfiles.
 * @module routes/destacados
 * @requires express
 * @requires ../db
 * @requires ../middleware/auth
 */

const express = require('express');
const { db } = require('../db');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/destacados
 *
 * Crea un destacado (boost) para una oferta o perfil de demandante.
 * Elimina cualquier destacado previo del mismo elemento antes de insertar el nuevo.
 *
 * @name createDestacado
 * @memberof module:routes/destacados
 * @function
 * @param {string}  req.body.tipo     - Tipo de elemento: `'oferta'` o `'demandante'`
 * @param {number}  req.body.ref_id   - ID del elemento a destacar
 * @param {number}  req.body.duracion - Duracion en dias: 2, 7, 14 o 30
 *
 * @returns {Object} 201 - Destacado creado
 * @returns {string} 201.mensaje - Confirmacion
 * @returns {Object} 201.destacado - Datos del destacado creado
 *
 * @throws {400} Si falta tipo, ref_id o duracion, o si los valores no son validos
 * @throws {401} Si no hay token valido
 * @throws {404} Si la oferta o usuario referenciado no existe
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/destacados', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({ tipo: 'oferta', ref_id: 3, duracion: 7 })
 * })
 */
router.post('/', verificarToken, (req, res) => {
  try {
    const { tipo, ref_id, duracion } = req.body;

    if (!tipo || !ref_id || !duracion) {
      return res.status(400).json({ error: 'tipo, ref_id y duracion son requeridos.' });
    }
    if (!['oferta', 'demandante'].includes(tipo)) {
      return res.status(400).json({ error: 'tipo debe ser oferta o demandante.' });
    }
    if (![2, 7, 14, 30].includes(duracion)) {
      return res.status(400).json({ error: 'duracion debe ser 2, 7, 14 o 30 dias.' });
    }

    // Verify the ref exists
    if (tipo === 'oferta') {
      const o = db.prepare('SELECT id FROM ofertas WHERE id = ?').get(ref_id);
      if (!o) return res.status(404).json({ error: 'Oferta no encontrada.' });
    } else {
      const u = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(ref_id);
      if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Remove existing destacado for the same ref
    db.prepare('DELETE FROM destacados WHERE tipo = ? AND ref_id = ?').run(tipo, ref_id);

    db.prepare(
      "INSERT INTO destacados (tipo, ref_id, fecha_fin) VALUES (?, ?, datetime('now', '+' || ? || ' days'))"
    ).run(tipo, ref_id, duracion);

    const destacado = db.prepare('SELECT * FROM destacados WHERE tipo = ? AND ref_id = ? ORDER BY id DESC LIMIT 1').get(tipo, ref_id);

    res.status(201).json({ mensaje: 'Perfil destacado activado correctamente.', destacado });
  } catch (error) {
    console.error('Error al crear destacado:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;

// TODO: agregar niveles de destacado (bronce, plata, oro)
