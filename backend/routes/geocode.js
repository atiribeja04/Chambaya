/**
 * @file Ruta para geocodificar direcciones mediante Nominatim (OpenStreetMap).
 * @module routes/geocode
 * @requires express
 */

const express = require('express');
const router = express.Router();

/**
 * POST /api/geocode
 *
 * Convierte una direccion en coordenadas (lat, lng) usando el servicio
 * de geocoding gratuito de Nominatim (OpenStreetMap).
 * Si no se encuentra la ubicacion, devuelve null en ambos campos.
 *
 * @name geocodeAddress
 * @memberof module:routes/geocode
 * @function
 * @param {string} [req.body.direccion] - Calle y numero (opcional)
 * @param {string} [req.body.barrio]    - Barrio o zona (opcional)
 * @param {string} [req.body.ubicacion] - Ciudad o zona (opcional)
 *
 * @returns {Object} 200
 * @returns {number} 200.lat - Latitud (o null si no se encontro)
 * @returns {number} 200.lng - Longitud (o null si no se encontro)
 *
 * @throws {500} Si ocurre un error de red con Nominatim
 *
 * @example
 * fetch('/api/geocode', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ direccion: 'Calle Serrano 45', barrio: 'Salamanca', ubicacion: 'Madrid' })
 * })
 */
router.post('/', async (req, res) => {
  try {
    const { direccion, barrio, ubicacion } = req.body;
    const parts = [direccion, barrio, ubicacion, 'Spain'].filter(Boolean);
    if (parts.length < 2) {
      return res.json({ lat: null, lng: null });
    }
    const query = parts.join(', ');

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'Chambaya/1.0' } }
    );
    const data = await response.json();

    if (data && data.length > 0) {
      res.json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } else {
      res.json({ lat: null, lng: null });
    }
  } catch (error) {
    console.error('Error en geocoding:', error);
    res.json({ lat: null, lng: null });
  }
});

module.exports = router;

// TODO: agregar límite de tasa por IP
