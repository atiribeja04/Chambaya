/**
 * @file Rutas de autenticacion para Chambaya.
 *
 * Gestiona el registro de nuevos usuarios, el inicio de sesion
 * y la consulta/actualizacion del perfil del usuario autenticado.
 *
 * @module routes/auth
 * @requires express
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires ../db
 * @requires ../middleware/auth
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { JWT_SECRET, verificarToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/registro
 *
 * Crea una cuenta nueva en la plataforma.
 *
 * Los campos obligatorios son `nombre`, `email`, `password` y `tipo`.
 * El email debe ser unico. La contrasena se almacena hasheada con
 * bcrypt. Devuelve un token JWT valido por 7 dias y los datos
 * basicos del usuario recien creado.
 *
 * @name register
 * @memberof module:routes/auth
 * @function
 * @param {string} req.body.nombre  - Nombre completo del usuario
 * @param {string} req.body.email   - Correo electronico (unico)
 * @param {string} req.body.password - Contrasena en texto plano
 * @param {string} req.body.tipo    - Tipo: `'ofertante'` | `'demandante'`
 * @param {string} [req.body.telefono]  - Telefono de contacto (opcional)
 * @param {string} [req.body.ubicacion] - Ciudad o zona (opcional)
 *
 * @returns {Object} 201 - Usuario creado con token JWT
 * @returns {string} 201.mensaje - Mensaje de exito
 * @returns {string} 201.token   - Token JWT (valido 7 dias)
 * @returns {Object} 201.usuario - Datos publicos del usuario
 *
 * @throws {400} Si faltan campos obligatorios
 * @throws {400} Si el tipo no es valido
 * @throws {409} Si el email ya esta registrado
 *
 * @example
 * // Peticion
 * fetch('/api/auth/registro', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     nombre: 'Juan Perez',
 *     email: 'juan@email.com',
 *     password: '123456',
 *     tipo: 'ofertante'
 *   })
 * })
 * // Respuesta
 * // {
 * //   "mensaje": "Usuario registrado correctamente.",
 * //   "token": "eyJ...",
 * //   "usuario": { "id": 1, "nombre": "Juan Perez", "email": "juan@email.com", "tipo": "ofertante" }
 * // }
 */
router.post('/registro', (req, res) => {
  try {
    const { nombre, email, password, tipo, telefono, ubicacion } = req.body;

    if (!nombre || !email || !password || !tipo) {
      return res.status(400).json({ error: 'Nombre, email, contrasena y tipo son requeridos.' });
    }

    if (!['ofertante', 'demandante'].includes(tipo)) {
      return res.status(400).json({ error: 'El tipo debe ser ofertante o demandante.' });
    }

    const existente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existente) {
      return res.status(409).json({ error: 'El email ya esta registrado.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const resultado = db.prepare(
      'INSERT INTO usuarios (nombre, email, password, tipo, telefono, ubicacion) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nombre, email, hash, tipo, telefono || null, ubicacion || null);

    const token = jwt.sign(
      { id: resultado.lastInsertRowid, nombre, email, tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente.',
      token,
      usuario: { id: resultado.lastInsertRowid, nombre, email, tipo }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * POST /api/auth/login
 *
 * Inicia sesion con credenciales existentes.
 *
 * Verifica que el email exista y que la contrasena coincida con el
 * hash almacenado. Devuelve un token JWT valido por 7 dias y los
 * datos completos del usuario (excepto la contrasena).
 *
 * @name login
 * @memberof module:routes/auth
 * @function
 * @param {string} req.body.email    - Correo electronico
 * @param {string} req.body.password - Contrasena en texto plano
 *
 * @returns {Object} 200 - Inicio de sesion exitoso
 * @returns {string} 200.mensaje - Mensaje de exito
 * @returns {string} 200.token   - Token JWT (valido 7 dias)
 * @returns {Object} 200.usuario - Datos del usuario (id, nombre, email, tipo, telefono, ubicacion, descripcion)
 *
 * @throws {400} Si faltan email o contrasena
 * @throws {401} Si las credenciales no coinciden
 *
 * @example
 * fetch('/api/auth/login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email: 'carlos@email.com', password: '123456' })
 * })
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contrasena son requeridos.' });
    }

    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    const valida = bcrypt.compareSync(password, usuario.password);
    if (!valida) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Inicio de sesion exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo: usuario.tipo,
        telefono: usuario.telefono,
        ubicacion: usuario.ubicacion,
        descripcion: usuario.descripcion,
        foto_perfil: usuario.foto_perfil,
        skills: usuario.skills,
        disponibilidad: usuario.disponibilidad,
        en_busqueda: usuario.en_busqueda,
        barrio: usuario.barrio,
        direccion: usuario.direccion
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * GET /api/auth/perfil
 *
 * Obtiene los datos del perfil del usuario autenticado.
 *
 * Requiere token JWT en el header `Authorization`.
 * Devuelve todos los campos publicos del usuario excepto la contrasena.
 *
 * @name getProfile
 * @memberof module:routes/auth
 * @function
 * @param {Object} req - Peticion (req.usuario.id del token)
 *
 * @returns {Object} 200 - Datos del perfil
 * @returns {Object} 200.usuario - Campos: id, nombre, email, telefono, ubicacion, tipo, descripcion, foto_perfil, creado_en
 *
 * @throws {401} Si no hay token valido
 * @throws {404} Si el usuario no existe
 *
 * @example
 * fetch('/api/auth/perfil', {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * })
 */
router.get('/perfil', verificarToken, (req, res) => {
  try {
    const usuario = db.prepare(
      'SELECT id, nombre, email, telefono, ubicacion, tipo, descripcion, foto_perfil, skills, disponibilidad, en_busqueda, barrio, latitud, longitud, direccion, creado_en FROM usuarios WHERE id = ?'
    ).get(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ usuario });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * PUT /api/auth/perfil
 *
 * Actualiza los datos del perfil del usuario autenticado.
 *
 * Solo se actualizan los campos enviados en el cuerpo de la peticion;
 * los campos omitidos mantienen su valor actual gracias a `COALESCE`.
 * No permite cambiar email ni tipo (se gestionan por separado).
 *
 * @name updateProfile
 * @memberof module:routes/auth
 * @function
 * @param {string} [req.body.nombre]     - Nuevo nombre (opcional)
 * @param {string} [req.body.telefono]   - Nuevo telefono (opcional)
 * @param {string} [req.body.ubicacion]  - Nueva ubicacion (opcional)
 * @param {string} [req.body.descripcion] - Nueva descripcion (opcional)
 *
 * @returns {Object} 200 - Perfil actualizado
 * @returns {string} 200.mensaje - Confirmacion
 *
 * @throws {401} Si no hay token valido
 *
 * @example
 * fetch('/api/auth/perfil', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({ nombre: 'Carlos Martinez', telefono: '+34 600 111 222' })
 * })
 */
router.put('/perfil', verificarToken, (req, res) => {
  try {
    const { nombre, telefono, ubicacion, descripcion, skills, disponibilidad, en_busqueda, barrio, latitud, longitud, direccion } = req.body;

    db.prepare(`
      UPDATE usuarios SET
        nombre = COALESCE(?, nombre),
        telefono = ?,
        ubicacion = ?,
        descripcion = COALESCE(?, descripcion),
        skills = COALESCE(?, skills),
        disponibilidad = COALESCE(?, disponibilidad),
        en_busqueda = COALESCE(?, en_busqueda),
        barrio = ?,
        latitud = COALESCE(?, latitud),
        longitud = COALESCE(?, longitud),
        direccion = ?,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nombre || null, telefono ?? null, ubicacion ?? null, descripcion || null,
      skills ?? null, disponibilidad ?? null, en_busqueda ?? null,
      barrio ?? null, latitud ?? null, longitud ?? null, direccion ?? null,
      req.usuario.id
    );

    res.json({ mensaje: 'Perfil actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * PUT /api/auth/cambiar-password
 *
 * Cambia la contrasena del usuario autenticado.
 *
 * @name changePassword
 * @memberof module:routes/auth
 * @function
 * @param {string} req.body.passwordActual - Contrasena actual del usuario
 * @param {string} req.body.passwordNueva  - Nueva contrasena a establecer
 *
 * @returns {Object} 200 - Contrasena actualizada correctamente
 *
 * @throws {400} Si faltan passwordActual o passwordNueva
 * @throws {401} Si la contrasena actual no coincide con la registrada
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/auth/cambiar-password', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({ passwordActual: 'old123', passwordNueva: 'new456' })
 * })
 */
router.put('/cambiar-password', verificarToken, (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Ambas contrasenas son requeridas.' });
    }
    const usuario = db.prepare('SELECT password FROM usuarios WHERE id = ?').get(req.usuario.id);
    if (!bcrypt.compareSync(passwordActual, usuario.password)) {
      return res.status(401).json({ error: 'La contrasena actual no es correcta.' });
    }
    const hash = bcrypt.hashSync(passwordNueva, 10);
    db.prepare('UPDATE usuarios SET password = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hash, req.usuario.id);
    res.json({ mensaje: 'Contrasena actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar contrasena:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
