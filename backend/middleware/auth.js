/**
 * @file Middleware de autenticacion para Chambaya.
 *
 * Proporciona dos middlewares de Express:
 * - `verificarToken` —  extrae y valida el JWT del header Authorization.
 * - `verificarAdmin` —  comprueba que el usuario autenticado sea admin.
 *
 * @module middleware/auth
 * @requires jsonwebtoken
 */

const jwt = require('jsonwebtoken');

/**
 * Clave secreta usada para firmar y verificar los tokens JWT.
 *
 * En produccion debe definirse mediante la variable de entorno
 * `JWT_SECRET`. En desarrollo se usa un valor por defecto.
 *
 * @type {string}
 * @constant
 * @default 'chambaya_secret_key_2024'
 *
 * @example
 * // En produccion, configurar antes de arrancar:
 * process.env.JWT_SECRET = 'una-frase-muy-segura';
 */
const JWT_SECRET = process.env.JWT_SECRET || 'chambaya_secret_key_2024';

/**
 * Verifica que la peticion incluya un token JWT valido en el header
 * `Authorization` con formato `Bearer <token>`.
 *
 * Si el token es valido, decodifica su payload y lo asigna a
 * `req.usuario` para que los siguientes middlewares o rutas puedan
 * acceder a los datos del usuario autenticado.
 *
 * @function
 * @name verificarToken
 * @memberof module:middleware/auth
 * @param {Object} req  - Objeto de peticion
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Siguiente middleware
 * @returns {void}
 *
 * @throws {401} Si no se proporciona token
 * @throws {403} Si el token es invalido o ha expirado
 *
 * @example
 * router.get('/perfil', verificarToken, (req, res) => {
 *   res.json({ usuario: req.usuario });
 * });
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalido o expirado.' });
  }
}

/**
 * Verifica que el usuario autenticado tenga el tipo `'admin'`.
 *
 * Debe ejecutarse **despues** de `verificarToken`, ya que necesita
 * los datos del usuario decodificados en `req.usuario`.
 *
 * @function
 * @name verificarAdmin
 * @memberof module:middleware/auth
 * @param {Object} req  - Objeto de peticion
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Siguiente middleware
 * @returns {void}
 *
 * @throws {403} Si el usuario no es administrador
 *
 * @example
 * router.delete('/usuarios/:id', verificarToken, verificarAdmin, (req, res) => {
 *   // Solo admins pueden eliminar usuarios
 * });
 */
function verificarAdmin(req, res, next) {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
}

module.exports = { verificarToken, verificarAdmin, JWT_SECRET };
