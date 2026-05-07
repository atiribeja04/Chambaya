/**
 * @file Rutas de administracion para Chambaya.
 *
 * Panel de control interno para moderacion y gestion del contenido.
 * Todas las rutas requieren autenticacion y permisos de administrador.
 *
 * @module routes/admin
 * @requires express
 * @requires ../db
 * @requires ../middleware/auth
 */

const express = require('express');
const { db } = require('../db');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/dashboard
 *
 * Obtiene estadisticas generales de la plataforma para el panel
 * de administracion: total de usuarios, ofertas, valoraciones,
 * distribucion por tipo de usuario y por estado de oferta, y
 * listados compactos de los ultimos registros.
 *
 * @name dashboard
 * @memberof module:routes/admin
 * @function
 *
 * @returns {Object} 200
 * @returns {Object} 200.estadisticas - Datos agregados
 * @returns {number} 200.estadisticas.totalUsuarios - Numero total de usuarios
 * @returns {number} 200.estadisticas.totalOfertas - Numero total de ofertas
 * @returns {number} 200.estadisticas.ofertasActivas - Ofertas con estado 'activa'
 * @returns {number} 200.estadisticas.totalValoraciones - Numero total de valoraciones
 * @returns {Array}  200.estadisticas.usuariosPorTipo - Conteo agrupado por tipo (admin, ofertante, demandante)
 * @returns {Array}  200.estadisticas.ofertasPorEstado - Conteo agrupado por estado (activa, completada, cancelada)
 * @returns {Array}  200.ofertasRecientes - Ultimas 10 ofertas creadas
 * @returns {Array}  200.usuariosRecientes - Ultimos 10 usuarios registrados
 *
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 *
 * @example
 * fetch('/api/admin/dashboard', {
 *   headers: { 'Authorization': `Bearer ${adminToken}` }
 * })
 */
router.get('/dashboard', verificarToken, verificarAdmin, (req, res) => {
  try {
    const totalUsuarios = db.prepare('SELECT COUNT(*) as total FROM usuarios').get();
    const totalOfertas = db.prepare('SELECT COUNT(*) as total FROM ofertas').get();
    const ofertasActivas = db.prepare("SELECT COUNT(*) as total FROM ofertas WHERE estado = 'activa'").get();
    const totalValoraciones = db.prepare('SELECT COUNT(*) as total FROM valoraciones').get();
    const totalSolicitudes = db.prepare('SELECT COUNT(*) as total FROM solicitudes').get();
    const solicitudesPendientes = db.prepare("SELECT COUNT(*) as total FROM solicitudes WHERE estado = 'pendiente'").get();
    const usuariosPorTipo = db.prepare('SELECT tipo, COUNT(*) as total FROM usuarios GROUP BY tipo').all();
    const ofertasPorEstado = db.prepare('SELECT estado, COUNT(*) as total FROM ofertas GROUP BY estado').all();
    const ofertasRecientes = db.prepare(`
      SELECT o.*, u.nombre as usuario_nombre, c.nombre as categoria_nombre
      FROM ofertas o
      JOIN usuarios u ON o.usuario_id = u.id
      LEFT JOIN categorias c ON o.categoria_id = c.id
      ORDER BY o.creado_en DESC LIMIT 10
    `).all();
    const usuariosRecientes = db.prepare(
      'SELECT id, nombre, email, tipo, creado_en FROM usuarios ORDER BY creado_en DESC LIMIT 10'
    ).all();

    res.json({
      estadisticas: {
        totalUsuarios: totalUsuarios.total,
        totalOfertas: totalOfertas.total,
        ofertasActivas: ofertasActivas.total,
        totalValoraciones: totalValoraciones.total,
        totalSolicitudes: totalSolicitudes.total,
        solicitudesPendientes: solicitudesPendientes.total,
        usuariosPorTipo,
        ofertasPorEstado
      },
      ofertasRecientes,
      usuariosRecientes
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * GET /api/admin/usuarios
 *
 * Obtiene el listado completo de usuarios del sistema.
 *
 * @name listUsers
 * @memberof module:routes/admin
 * @function
 *
 * @returns {Object} 200
 * @returns {Array} 200.usuarios - Lista de usuarios (id, nombre, email, tipo, ubicacion, creado_en, actualizado_en)
 *
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 */
router.get('/usuarios', verificarToken, verificarAdmin, (req, res) => {
  try {
    const usuarios = db.prepare(
      'SELECT id, nombre, email, tipo, telefono, ubicacion, creado_en, actualizado_en FROM usuarios ORDER BY creado_en DESC'
    ).all();
    res.json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * DELETE /api/admin/usuarios/:id
 *
 * Elimina un usuario del sistema.
 *
 * No permite eliminar usuarios con tipo `'admin'` para evitar
 * la auto-destruccion del unico administrador.
 *
 * @name deleteUser
 * @memberof module:routes/admin
 * @function
 * @param {number} req.params.id - ID del usuario a eliminar
 *
 * @returns {Object} 200 - Usuario eliminado
 * @returns {string} 200.mensaje - Confirmacion
 *
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 *
 * @example
 * fetch('/api/admin/usuarios/5', {
 *   method: 'DELETE',
 *   headers: { 'Authorization': `Bearer ${adminToken}` }
 * })
 */
router.delete('/usuarios/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM usuarios WHERE id = ? AND tipo != ?').run(req.params.id, 'admin');
    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * GET /api/admin/ofertas
 *
 * Obtiene el listado completo de ofertas del sistema.
 *
 * @name listOffers
 * @memberof module:routes/admin
 * @function
 *
 * @returns {Object} 200
 * @returns {Array} 200.ofertas - Ofertas con datos del usuario creador y categoria
 *
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 */
router.get('/ofertas', verificarToken, verificarAdmin, (req, res) => {
  try {
    const ofertas = db.prepare(`
      SELECT o.*, u.nombre as usuario_nombre, c.nombre as categoria_nombre
      FROM ofertas o
      JOIN usuarios u ON o.usuario_id = u.id
      LEFT JOIN categorias c ON o.categoria_id = c.id
      ORDER BY o.creado_en DESC
    `).all();
    res.json({ ofertas });
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * PUT /api/admin/ofertas/:id/estado
 *
 * Cambia el estado de moderacion de una oferta.
 *
 * Permite al administrador activar, completar o cancelar cualquier
 * oferta del sistema, independientemente de su creador.
 *
 * @name updateOfferStatus
 * @memberof module:routes/admin
 * @function
 * @param {number} req.params.id - ID de la oferta
 * @param {string} req.body.estado - Nuevo estado: `'activa'` | `'completada'` | `'cancelada'`
 *
 * @returns {Object} 200 - Estado actualizado
 * @returns {string} 200.mensaje - Confirmacion
 *
 * @throws {400} Si el estado no es valido
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 *
 * @example
 * fetch('/api/admin/ofertas/3/estado', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
 *   body: JSON.stringify({ estado: 'cancelada' })
 * })
 */
router.put('/ofertas/:id/estado', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { estado } = req.body;
    if (!['activa', 'completada', 'cancelada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado invalido.' });
    }
    db.prepare('UPDATE ofertas SET estado = ? WHERE id = ?').run(estado, req.params.id);
    res.json({ mensaje: 'Estado actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * POST /api/admin/categorias
 *
 * Crea una nueva categoria de ofertas de trabajo.
 *
 * @name createCategory
 * @memberof module:routes/admin
 * @function
 * @param {string} req.body.nombre      - Nombre de la categoria (obligatorio, unico)
 * @param {string} [req.body.descripcion] - Descripcion breve
 * @param {string} [req.body.icono]       - Emoji o icono representativo
 *
 * @returns {Object} 201 - Categoria creada
 * @returns {string} 201.mensaje - Confirmacion
 *
 * @throws {400} Si el nombre no se proporciona
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 */
router.post('/categorias', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { nombre, descripcion, icono } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido.' });

    db.prepare('INSERT INTO categorias (nombre, descripcion, icono) VALUES (?, ?, ?)')
      .run(nombre, descripcion || null, icono || null);

    res.status(201).json({ mensaje: 'Categoria creada correctamente.' });
  } catch (error) {
    console.error('Error al crear categoria:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * DELETE /api/admin/categorias/:id
 *
 * Elimina una categoria del sistema.
 *
 * @name deleteCategory
 * @memberof module:routes/admin
 * @function
 * @param {number} req.params.id - ID de la categoria
 *
 * @returns {Object} 200 - Categoria eliminada
 * @returns {string} 200.mensaje - Confirmacion
 *
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 */
router.delete('/categorias/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM categorias WHERE id = ?').run(req.params.id);
    res.json({ mensaje: 'Categoria eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar categoria:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * GET /api/admin/solicitudes
 *
 * Obtiene todas las solicitudes de postulacion del sistema, con
 * datos del solicitante y titulo de la oferta asociada.
 *
 * @name listApplications
 * @memberof module:routes/admin
 * @function
 *
 * @returns {Object} 200
 * @returns {Array} 200.solicitudes - Solicitudes con datos de usuario y oferta
 *
 * @throws {401} Si no hay token
 * @throws {403} Si el usuario no es admin
 *
 * @example
 * fetch('/api/admin/solicitudes', {
 *   headers: { 'Authorization': `Bearer ${adminToken}` }
 * })
 */
router.get('/solicitudes', verificarToken, verificarAdmin, (req, res) => {
  try {
    const solicitudes = db.prepare(`
      SELECT s.*, u.nombre, u.email, u.telefono, o.titulo as oferta_titulo
      FROM solicitudes s
      JOIN usuarios u ON s.usuario_id = u.id
      JOIN ofertas o ON s.oferta_id = o.id
      ORDER BY s.creado_en DESC
    `).all();
    res.json({ solicitudes });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * PUT /api/admin/ofertas/:id
 *
 * Actualiza los datos de una oferta (admin).
 *
 * @name adminUpdateOffer
 * @memberof module:routes/admin
 * @function
 * @param {number} req.params.id - ID de la oferta
 * @param {string} [req.body.titulo] - Nuevo titulo
 * @param {string} [req.body.descripcion] - Nueva descripcion
 * @param {number} [req.body.precio] - Nuevo precio
 * @param {string} [req.body.tipo_precio] - Tipo de precio (por_hora, por_dia, fijo)
 * @param {number} [req.body.categoria_id] - Nueva categoria
 * @param {string} [req.body.ubicacion] - Nueva ubicacion
 *
 * @returns {Object} 200 - Oferta actualizada
 * @returns {string} 200.mensaje - Confirmacion
 *
 * @throws {400} Si no se envian campos para actualizar
 * @throws {401} Si no hay token valido
 * @throws {403} Si el usuario no es admin
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/admin/ofertas/3', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({ titulo: 'Nuevo titulo', precio: 50 })
 * })
 */
router.put('/ofertas/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const { titulo, descripcion, precio, tipo_precio, categoria_id, ubicacion } = req.body;
    const campos = [];
    const valores = [];
    if (titulo !== undefined) { campos.push('titulo = ?'); valores.push(titulo); }
    if (descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(descripcion); }
    if (precio !== undefined) { campos.push('precio = ?'); valores.push(precio); }
    if (tipo_precio !== undefined) { campos.push('tipo_precio = ?'); valores.push(tipo_precio); }
    if (categoria_id !== undefined) { campos.push('categoria_id = ?'); valores.push(categoria_id); }
    if (ubicacion !== undefined) { campos.push('ubicacion = ?'); valores.push(ubicacion); }
    if (!campos.length) return res.status(400).json({ error: 'Ningun campo para actualizar.' });
    valores.push(req.params.id);
    db.prepare(`UPDATE ofertas SET ${campos.join(', ')} WHERE id = ?`).run(...valores);
    res.json({ mensaje: 'Oferta actualizada correctamente.' });
  } catch (error) {
    console.error('Error al actualizar oferta:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * PUT /api/admin/usuarios/:id
 *
 * Actualiza los datos de un usuario (admin).
 *
 * @name adminUpdateUser
 * @memberof module:routes/admin
 * @function
 * @param {number} req.params.id - ID del usuario
 * @param {string} [req.body.nombre] - Nuevo nombre
 * @param {string} [req.body.email] - Nuevo email
 * @param {string} [req.body.tipo] - Nuevo tipo (ofertante, demandante, admin)
 * @param {string} [req.body.telefono] - Nuevo telefono
 * @param {string} [req.body.ubicacion] - Nueva ubicacion
 *
 * @returns {Object} 200 - Usuario actualizado
 * @returns {string} 200.mensaje - Confirmacion
 *
 * @throws {400} Si no se envian campos para actualizar
 * @throws {401} Si no hay token valido
 * @throws {403} Si el usuario no es admin
 * @throws {500} Si ocurre un error interno
 *
 * @example
 * fetch('/api/admin/usuarios/5', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({ nombre: 'Nuevo nombre', tipo: 'ofertante' })
 * })
 */
router.put('/usuarios/:id', verificarToken, verificarAdmin, (req, res) => {
  try {
    const campos = [];
    const valores = [];
    ['nombre', 'email', 'tipo', 'telefono', 'ubicacion', 'descripcion'].forEach(c => {
      if (req.body[c] !== undefined) { campos.push(`${c} = ?`); valores.push(req.body[c]); }
    });
    if (!campos.length) return res.status(400).json({ error: 'Ningun campo para actualizar.' });
    valores.push(req.params.id);
    db.prepare(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`).run(...valores);
    res.json({ mensaje: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
