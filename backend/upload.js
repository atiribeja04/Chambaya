/**
 * @file Configuracion de multer para subida de archivos.
 * @requires multer
 * @requires path
 */

const multer = require('multer');
const path = require('path');

/**
 * Ruta absoluta al directorio donde se almacenan los archivos subidos.
 * @type {string}
 * @constant
 */
const uploadsPath = path.join(__dirname, '..', 'uploads');

/**
 * Configuracion de almacenamiento en disco para multer.
 * Los archivos se guardan en `uploads/` con un timestamp para evitar colisiones.
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

/**
 * Middleware de multer configurado para aceptar un unico archivo
 * con el nombre de campo `'imagen'`. Limite de 5 MB.
 *
 * @type {multer.Multer}
 * @name upload
 */
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { upload, uploadsPath };
