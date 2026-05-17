/**
 * Script de siembra de datos para Chambaya.
 * 
 * Puebla la base de datos con datos de ejemplo para pruebas y desarrollo.
 * 
 * @module seed
 */

const bcrypt = require('bcryptjs');
const { db } = require('./db');

console.log('🌱 Sembrando datos de ejemplo para Chambaya...\n');

// Limpiar datos existentes (orden respetando FK)
db.exec('DELETE FROM notificaciones');
db.exec('DELETE FROM favoritos');
db.exec('DELETE FROM destacados');
db.exec('DELETE FROM valoraciones');
db.exec('DELETE FROM solicitudes');
db.exec('DELETE FROM ofertas');
db.exec('DELETE FROM categorias');
db.exec('DELETE FROM usuarios');

// Crear admin por defecto
const hash = bcrypt.hashSync('admin123', 10);
db.prepare(
  "INSERT INTO usuarios (nombre, email, password, tipo, telefono) VALUES (?, ?, ?, ?, ?)"
).run('Admin Chambaya', 'admin@chambaya.com', hash, 'admin', '+34 600 000 000');
console.log('✅ Admin creado: admin@chambaya.com / admin123');

const hashUser = bcrypt.hashSync('123456', 10);
const usuarioIds = [];

const usuarios = [
  { nombre: 'Carlos Martinez', email: 'carlos@email.com', telefono: '+34 611 111 111', tipo: 'ofertante', ubicacion: 'Madrid', barrio: 'Salamanca', latitud: 40.428, longitud: -3.680, direccion: 'Calle de Serrano 45', skills: null, disponibilidad: null, en_busqueda: 0 },
  { nombre: 'Maria Lopez', email: 'maria@email.com', telefono: '+34 622 222 222', tipo: 'demandante', ubicacion: 'Barcelona', barrio: 'Gràcia', latitud: 41.402, longitud: 2.158, direccion: 'Carrer de Verdi 12', skills: 'Limpieza, Cocina, Cuidado de niños', disponibilidad: 'Lunes a viernes de 9:00 a 18:00', en_busqueda: 1 },
  { nombre: 'Juan Perez', email: 'juan@email.com', telefono: '+34 633 333 333', tipo: 'ofertante', ubicacion: 'Valencia', barrio: 'Ruzafa', latitud: 39.462, longitud: -0.370, direccion: 'Calle de Cuba 28', skills: null, disponibilidad: null, en_busqueda: 0 },
  { nombre: 'Ana Garcia', email: 'ana@email.com', telefono: '+34 644 444 444', tipo: 'demandante', ubicacion: 'Sevilla', barrio: 'Triana', latitud: 37.386, longitud: -5.997, direccion: 'Calle Betis 15', skills: 'Informatica, Reparaciones, Clases particulares', disponibilidad: 'Fines de semana y tardes', en_busqueda: 1 },
  { nombre: 'Pedro Sanchez', email: 'pedro@email.com', telefono: '+34 655 555 555', tipo: 'ofertante', ubicacion: 'Bilbao', barrio: 'Abando', latitud: 43.259, longitud: -2.924, direccion: 'Gran Via 33', skills: null, disponibilidad: null, en_busqueda: 0 },
  { nombre: 'Laura Martin', email: 'laura@email.com', telefono: '+34 666 666 666', tipo: 'demandante', ubicacion: 'Madrid', barrio: 'Lavapiés', latitud: 40.409, longitud: -3.701, direccion: 'Calle de Argumosa 7', skills: 'Jardineria, Pintura, Montaje de muebles', disponibilidad: 'Martes a sabado', en_busqueda: 1 },
  { nombre: 'David Lopez', email: 'david@email.com', telefono: '+34 677 777 777', tipo: 'demandante', ubicacion: 'Barcelona', barrio: 'Barceloneta', latitud: 41.380, longitud: 2.192, direccion: 'Carrer de la Maquinista 3', skills: 'Cocina, Reparaciones, Informatica', disponibilidad: 'Horario flexible', en_busqueda: 1 },
  { nombre: 'Sofia Ruiz', email: 'sofia@email.com', telefono: '+34 688 888 888', tipo: 'demandante', ubicacion: 'Valencia', barrio: 'El Carmen', latitud: 39.476, longitud: -0.378, direccion: 'Calle dels Cavallers 10', skills: 'Cuidado de niños, Cuidado de mayores, Limpieza', disponibilidad: 'Lunes a domingo consultar', en_busqueda: 1 },
  { nombre: 'Miguel Angel Torres', email: 'miguel@email.com', telefono: '+34 699 999 999', tipo: 'ofertante', ubicacion: 'Alicante', barrio: 'Centro', latitud: 38.345, longitud: -0.481, direccion: 'Avda. de la Constitución 5', skills: null, disponibilidad: null, en_busqueda: 0 },
  { nombre: 'Elena Ramirez', email: 'elena@email.com', telefono: '+34 600 000 001', tipo: 'demandante', ubicacion: 'Malaga', barrio: 'Centro', latitud: 36.721, longitud: -4.420, direccion: 'Calle Larios 8', skills: 'Clases particulares, Traduccion, Informatica', disponibilidad: 'Tardes de lunes a viernes', en_busqueda: 1 }
];

const descripciones = [
  'Ofertante con experiencia en gestion de servicios domesticos. Serio y responsable.',
  'Demandante de empleo con amplia experiencia en limpieza, cocina y cuidado de niños. Referencias disponibles.',
  'Profesional polivalente con experiencia en mudanzas y transporte. Trabajo rapido y cuidadoso.',
  'Tecnica en informatica con habilidades en reparaciones y clases particulares. Paciente y didactica.',
  'Ofertante con experiencia en jardineria y mantenimiento del hogar. Trabajo garantizado.',
  'Apasionada de la jardineria, la pintura y el montaje de muebles. Creativa y manitas.',
  'Cocinero y tecnico informatico con amplia disponibilidad. Soluciono cualquier problema.',
  'Experta en cuidado de niños y mayores. Carino, paciencia y profesionalidad garantizadas.',
  'Empresario en el sector de la construccion y reformas. Busco profesionales para colaborar.',
  'Filologa y traductora con experiencia en clases particulares. Ensenanza personalizada.'
];

for (let i = 0; i < usuarios.length; i++) {
  const u = usuarios[i];
  const r = db.prepare(
    'INSERT INTO usuarios (nombre, email, password, tipo, telefono, ubicacion, descripcion, foto_perfil, skills, disponibilidad, en_busqueda, latitud, longitud, barrio, direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(u.nombre, u.email, hashUser, u.tipo, u.telefono, u.ubicacion, descripciones[i], null, u.skills, u.disponibilidad, u.en_busqueda, u.latitud, u.longitud, u.barrio, u.direccion);
  usuarioIds.push(r.lastInsertRowid);
  console.log(`✅ Usuario creado: ${u.email} / 123456`);
}

// Crear categorias
const categorias = [
  { nombre: 'Limpieza', descripcion: 'Servicios de limpieza del hogar y oficinas', icono: '🧹' },
  { nombre: 'Mudanzas', descripcion: 'Ayuda con mudanzas y transporte de muebles', icono: '📦' },
  { nombre: 'Cuidado de niños', descripcion: 'Canguros y cuidado infantil', icono: '👶' },
  { nombre: 'Jardineria', descripcion: 'Mantenimiento de jardines y espacios verdes', icono: '🌿' },
  { nombre: 'Reparaciones', descripcion: 'Reparaciones del hogar y bricolaje', icono: '🔧' },
  { nombre: 'Clases particulares', descripcion: 'Clases y tutoria de diversas materias', icono: '📚' },
  { nombre: 'Eventos', descripcion: 'Ayuda para organizacion de eventos y fiestas', icono: '🎉' },
  { nombre: 'Cuidado de mayores', descripcion: 'Asistencia y cuidado de personas mayores', icono: '👴' },
  { nombre: 'Informatica', descripcion: 'Soporte tecnico y servicios informaticos', icono: '💻' },
  { nombre: 'Otros', descripcion: 'Otros servicios diversos', icono: '📌' }
];

const catIds = [];
for (const c of categorias) {
  const r = db.prepare(
    'INSERT INTO categorias (nombre, descripcion, icono) VALUES (?, ?, ?)'
  ).run(c.nombre, c.descripcion, c.icono);
  catIds.push(r.lastInsertRowid);
}
console.log(`✅ ${categorias.length} categorias creadas`);

// Crear ofertas de ejemplo
const ofertas = [
  { titulo: 'Limpieza de piso 80m2', descripcion: 'Necesito alguien para limpiar un piso de 80m2 en el centro de Madrid. 3 horas de trabajo. Productos incluidos.', ubicacion: 'Madrid', barrio: 'Salamanca', latitud: 40.428, longitud: -3.680, precio: 45, tipo_precio: 'fijo', categoria_id: catIds[0], usuario_id: usuarioIds[0], imagen: '/uploads/oferta-1.jpg', direccion: 'Calle de Velázquez 15, Madrid' },
  { titulo: 'Ayuda con mudanza sabado', descripcion: 'Busco ayuda para mudanza este sabado. Cargar y descargar camion. Aprox 4 horas. Se valoran fuerzas.', ubicacion: 'Barcelona', barrio: 'Ruzafa', latitud: 39.462, longitud: -0.370, precio: 60, tipo_precio: 'por_hora', categoria_id: catIds[1], usuario_id: usuarioIds[2], imagen: '/uploads/oferta-2.jpg', estado: 'completada', direccion: 'Carrer de Pau Claris 80, Barcelona' },
  { titulo: 'Canguro para sabado noche', descripcion: 'Necesito canguro para cuidar a mi hijo de 5 años el sabado de 20:00 a 00:00. Experiencia recomendada.', ubicacion: 'Valencia', barrio: 'Salamanca', latitud: 40.428, longitud: -3.680, precio: 12, tipo_precio: 'por_hora', categoria_id: catIds[2], usuario_id: usuarioIds[0], imagen: '/uploads/oferta-3.jpg', direccion: 'Calle de Colón 22, Valencia' },
  { titulo: 'Podar arboles jardin', descripcion: 'Jardin de 100m2, podar arboles y setos. Material incluido. Se necesita experiencia.', ubicacion: 'Sevilla', barrio: 'Abando', latitud: 43.259, longitud: -2.924, precio: 80, tipo_precio: 'fijo', categoria_id: catIds[3], usuario_id: usuarioIds[4], imagen: '/uploads/oferta-4.jpg', direccion: 'Calle Sierpes 30, Sevilla' },
  { titulo: 'Arreglar grifo cocina', descripcion: 'Grifo de cocina que pierde agua. Reparacion sencilla. Herramientas incluidas.', ubicacion: 'Bilbao', barrio: 'Ruzafa', latitud: 39.462, longitud: -0.370, precio: 25, tipo_precio: 'fijo', categoria_id: catIds[4], usuario_id: usuarioIds[2], imagen: '/uploads/oferta-5.jpg', direccion: 'Gran Vía 50, Bilbao' },
  { titulo: 'Clases de ingles nivel B1', descripcion: 'Clases de ingles para nivel B1. 2 horas por semana. Preferiblemente online. Material incluido.', ubicacion: 'Madrid', barrio: 'Salamanca', latitud: 40.428, longitud: -3.680, precio: 15, tipo_precio: 'por_hora', categoria_id: catIds[5], usuario_id: usuarioIds[0], imagen: '/uploads/oferta-6.jpg', direccion: 'Calle de Alcalá 100, Madrid' },
  { titulo: 'Ayudante de cocina para evento', descripcion: 'Evento de 50 personas. Ayudante de cocina para preparacion y servicio. Sabado de 10:00 a 20:00.', ubicacion: 'Barcelona', barrio: 'Abando', latitud: 43.259, longitud: -2.924, precio: 100, tipo_precio: 'por_dia', categoria_id: catIds[6], usuario_id: usuarioIds[4], imagen: '/uploads/oferta-7.jpg', direccion: 'Rambla de Catalunya 25, Barcelona' },
  { titulo: 'Cuidador de mayor por las tardes', descripcion: 'Cuidador para señora mayor de 80 años. De lunes a viernes de 16:00 a 20:00. Referencias necesarias.', ubicacion: 'Valencia', barrio: 'Ruzafa', latitud: 39.462, longitud: -0.370, precio: 10, tipo_precio: 'por_hora', categoria_id: catIds[7], usuario_id: usuarioIds[2], imagen: '/uploads/oferta-8.jpg', direccion: 'Calle de Ruzafa 40, Valencia' },
  { titulo: 'Formatear e instalar Windows', descripcion: 'Portatil con virus. Formatear e instalar Windows 10 y programas basicos.', ubicacion: 'Madrid', barrio: 'Salamanca', latitud: 40.428, longitud: -3.680, precio: 40, tipo_precio: 'fijo', categoria_id: catIds[8], usuario_id: usuarioIds[0], imagen: '/uploads/oferta-9.jpg', direccion: 'Calle de Goya 55, Madrid' },
  { titulo: 'Pintar habitacion infantil', descripcion: 'Pintar habitacion de 12m2. La pintura la pongo yo. Se necesita material propio.', ubicacion: 'Bilbao', barrio: 'Abando', latitud: 43.259, longitud: -2.924, precio: 120, tipo_precio: 'fijo', categoria_id: catIds[9], usuario_id: usuarioIds[4], imagen: '/uploads/oferta-10.jpg', direccion: 'Calle de Ledesma 10, Bilbao' },
  { titulo: 'Recoger fruta temporada', descripcion: 'Necesito 2 personas para recoger naranjas. Temporada de recolecta. Pago por kilo.', ubicacion: 'Valencia', barrio: 'Centro', latitud: 38.345, longitud: -0.481, precio: 50, tipo_precio: 'por_dia', categoria_id: catIds[3], usuario_id: usuarioIds[8], imagen: '/uploads/oferta-11.jpg', direccion: 'Plaza del Ayuntamiento 5, Valencia' },
  { titulo: 'Reparar ordenador portatil', descripcion: 'Pantalla rota de portatil. Necesito cambiar pantalla. Modelo HP Pavilion.', ubicacion: 'Alicante', barrio: 'Centro', latitud: 38.345, longitud: -0.481, precio: 35, tipo_precio: 'fijo', categoria_id: catIds[8], usuario_id: usuarioIds[8], imagen: '/uploads/oferta-12.jpg', direccion: 'Avda. de la Constitución 20, Alicante' },
  { titulo: 'Limpieza oficina semanal', descripcion: 'Oficina de 150m2. Limpieza semanal los viernes por la tarde. Contrato mensual.', ubicacion: 'Madrid', barrio: 'Ruzafa', latitud: 39.462, longitud: -0.370, precio: 200, tipo_precio: 'fijo', categoria_id: catIds[0], usuario_id: usuarioIds[2], imagen: '/uploads/oferta-13.jpg', direccion: 'Calle de Atocha 30, Madrid' },
  { titulo: 'Canguro fines de semana', descripcion: 'Familia busca canguro para fines de semana alternos. Dos niños de 3 y 6 años.', ubicacion: 'Barcelona', barrio: 'Centro', latitud: 38.345, longitud: -0.481, precio: 14, tipo_precio: 'por_hora', categoria_id: catIds[2], usuario_id: usuarioIds[8], imagen: '/uploads/oferta-14.jpg', direccion: 'Plaça de Catalunya 1, Barcelona' },
  { titulo: 'Montar muebles IKEA', descripcion: 'Varios muebles IKEA para montar. Mesa, sillas y estanterias. Herramientas necesarias.', ubicacion: 'Madrid', barrio: 'Salamanca', latitud: 40.428, longitud: -3.680, precio: 90, tipo_precio: 'fijo', categoria_id: catIds[4], usuario_id: usuarioIds[0], imagen: '/uploads/oferta-15.jpg', direccion: 'Calle de Castelló 70, Madrid' },
  { titulo: 'Clases de guitarra principiantes', descripcion: 'Clases de guitarra para principiantes. 1 hora por sesion. Trae tu guitarra.', ubicacion: 'Sevilla', barrio: 'Abando', latitud: 43.259, longitud: -2.924, precio: 18, tipo_precio: 'por_hora', categoria_id: catIds[5], usuario_id: usuarioIds[4], imagen: '/uploads/oferta-16.jpg', direccion: 'Calle de San Fernando 15, Sevilla' }
];

const ofertaIds = [];
for (const o of ofertas) {
  const r = db.prepare(
    'INSERT INTO ofertas (titulo, descripcion, ubicacion, barrio, latitud, longitud, precio, tipo_precio, categoria_id, usuario_id, imagen, estado, direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(o.titulo, o.descripcion, o.ubicacion, o.barrio, o.latitud, o.longitud, o.precio, o.tipo_precio, o.categoria_id, o.usuario_id, o.imagen, o.estado || 'activa', o.direccion);
  ofertaIds.push(r.lastInsertRowid);
}
console.log(`✅ ${ofertas.length} ofertas creadas`);

// Crear valoraciones de ejemplo
const valoraciones = [
  { oferta_id: ofertaIds[0], origen: usuarioIds[1], destino: usuarioIds[0], puntuacion: 5, comentario: 'Muy buen trabajo, todo correcto.' },
  { oferta_id: ofertaIds[2], origen: usuarioIds[1], destino: usuarioIds[0], puntuacion: 5, comentario: 'Volveria a contratarlo sin dudas.' },
  { oferta_id: ofertaIds[4], origen: usuarioIds[3], destino: usuarioIds[2], puntuacion: 3, comentario: 'Bien pero llego un poco tarde.' },
  { oferta_id: ofertaIds[3], origen: usuarioIds[5], destino: usuarioIds[4], puntuacion: 5, comentario: 'Jardin perfecto, muy profesional.' },
  { oferta_id: ofertaIds[5], origen: usuarioIds[5], destino: usuarioIds[0], puntuacion: 4, comentario: 'Buen profesor, clases amenas.' },
  { oferta_id: ofertaIds[6], origen: usuarioIds[1], destino: usuarioIds[4], puntuacion: 5, comentario: 'Excelente ayudante de cocina, muy recomendable.' },
  { oferta_id: ofertaIds[10], origen: usuarioIds[1], destino: usuarioIds[8], puntuacion: 4, comentario: 'Buen trabajador, rapido recolectando.' },
  { oferta_id: ofertaIds[14], origen: usuarioIds[1], destino: usuarioIds[0], puntuacion: 5, comentario: 'Muebles montados perfectamente. Muy profesional.' }
];

for (const v of valoraciones) {
  db.prepare(
    'INSERT INTO valoraciones (oferta_id, usuario_origen_id, usuario_destino_id, puntuacion, comentario) VALUES (?, ?, ?, ?, ?)'
  ).run(v.oferta_id, v.origen, v.destino, v.puntuacion, v.comentario);
}
console.log(`✅ ${valoraciones.length} valoraciones creadas`);

// Crear solicitudes de ejemplo
const solicitudes = [
  { oferta_id: ofertaIds[0], usuario_id: usuarioIds[1], mensaje: 'Hola! Me interesa el trabajo de limpieza. Tengo experiencia y disponibilidad inmediata.', estado: 'aceptada' },
  { oferta_id: ofertaIds[0], usuario_id: usuarioIds[5], mensaje: 'Buenas, puedo hacer la limpieza este mismo jueves. Un saludo.', estado: 'pendiente' },
  { oferta_id: ofertaIds[1], usuario_id: usuarioIds[3], mensaje: 'Hola! Estoy disponible para la mudanza del sabado. Tengo vehiculo propio.', estado: 'aceptada' },
  { oferta_id: ofertaIds[2], usuario_id: usuarioIds[7], mensaje: 'Me encantan los niños! Tengo experiencia con niños de 5 años. Disponible el sabado.', estado: 'rechazada' },
  { oferta_id: ofertaIds[3], usuario_id: usuarioIds[5], mensaje: 'Se me da bien la jardineria. Puedo ir este finde.', estado: 'pendiente' },
  { oferta_id: ofertaIds[5], usuario_id: usuarioIds[9], mensaje: 'Hola! Soy profesora de ingles con nivel C2. Me interesan las clases.', estado: 'pendiente' },
  { oferta_id: ofertaIds[6], usuario_id: usuarioIds[1], mensaje: 'Tengo experiencia en cocina para eventos. Disponible todo el sabado.', estado: 'pendiente' },
  { oferta_id: ofertaIds[8], usuario_id: usuarioIds[3], mensaje: 'Soy tecnico informatico. Puedo formatear e instalar todo lo necesario.', estado: 'pendiente' },
  { oferta_id: ofertaIds[9], usuario_id: usuarioIds[5], mensaje: 'He pintado varias habitaciones. Tengo mi propio material.', estado: 'pendiente' },
  { oferta_id: ofertaIds[10], usuario_id: usuarioIds[1], mensaje: 'Tengo experiencia en recoleccion de fruta. Estoy disponible esta temporada.', estado: 'pendiente' }
];

for (const s of solicitudes) {
  try {
    db.prepare(
      'INSERT INTO solicitudes (oferta_id, usuario_id, mensaje, estado) VALUES (?, ?, ?, ?)'
    ).run(s.oferta_id, s.usuario_id, s.mensaje, s.estado);
  } catch (e) { /* ignorar duplicados */ }
}
console.log(`✅ ${solicitudes.length} solicitudes creadas`);

// Crear notificaciones de ejemplo
const notificaciones = [
  { usuario_id: usuarioIds[0], tipo: 'nueva_solicitud', mensaje: 'Maria Lopez se ha postulado a tu oferta "Limpieza de piso 80m2"', ref: ofertaIds[0] },
  { usuario_id: usuarioIds[0], tipo: 'nueva_solicitud', mensaje: 'Laura Martin se ha postulado a tu oferta "Limpieza de piso 80m2"', ref: ofertaIds[0] },
  { usuario_id: usuarioIds[2], tipo: 'nueva_solicitud', mensaje: 'Ana Garcia se ha postulado a tu oferta "Ayuda con mudanza sabado"', ref: ofertaIds[1] },
  { usuario_id: usuarioIds[1], tipo: 'solicitud_aceptada', mensaje: 'Carlos Martinez ha aceptado tu solicitud para "Limpieza de piso 80m2"', ref: ofertaIds[0] },
  { usuario_id: usuarioIds[7], tipo: 'solicitud_rechazada', mensaje: 'Carlos Martinez ha rechazado tu solicitud para "Canguro para sabado noche"', ref: ofertaIds[2] }
];
for (const n of notificaciones) {
  db.prepare(
    'INSERT INTO notificaciones (usuario_id, tipo, mensaje, referencia_id) VALUES (?, ?, ?, ?)'
  ).run(n.usuario_id, n.tipo, n.mensaje, n.ref);
}
console.log(`✅ ${notificaciones.length} notificaciones creadas`);

// Crear favoritos de ejemplo
const favoritos = [
  { usuario_id: usuarioIds[1], oferta_id: ofertaIds[1] },
  { usuario_id: usuarioIds[3], oferta_id: ofertaIds[0] },
  { usuario_id: usuarioIds[5], oferta_id: ofertaIds[3] }
];
for (const f of favoritos) {
  try {
    db.prepare(
      'INSERT INTO favoritos (usuario_id, oferta_id) VALUES (?, ?)'
    ).run(f.usuario_id, f.oferta_id);
  } catch (e) { /* ignorar duplicados */ }
}
console.log(`✅ ${favoritos.length} favoritos creados`);

// Crear destacados de ejemplo
const destacados = [
  { tipo: 'oferta', ref_id: ofertaIds[0], duracion: 14 },
  { tipo: 'oferta', ref_id: ofertaIds[5], duracion: 7 },
  { tipo: 'demandante', ref_id: usuarioIds[1], duracion: 30 }
];

for (const d of destacados) {
  db.prepare(
    "INSERT INTO destacados (tipo, ref_id, fecha_fin) VALUES (?, ?, datetime('now', '+' || ? || ' days'))"
  ).run(d.tipo, d.ref_id, d.duracion);
}
console.log(`✅ ${destacados.length} destacados creados`);

// Asignar fotos de perfil a demandantes
const fotosDemandantes = [
  { idx: 1, archivo: '/uploads/perfil-2.jpg' },
  { idx: 3, archivo: '/uploads/perfil-4.jpg' },
  { idx: 5, archivo: '/uploads/perfil-6.jpg' },
  { idx: 6, archivo: '/uploads/perfil-7.jpg' },
  { idx: 7, archivo: '/uploads/perfil-8.jpg' },
  { idx: 9, archivo: '/uploads/perfil-10.jpg' }
];
for (const f of fotosDemandantes) {
  db.prepare('UPDATE usuarios SET foto_perfil = ? WHERE id = ?').run(f.archivo, usuarioIds[f.idx]);
}
console.log(`✅ ${fotosDemandantes.length} fotos de perfil asignadas`);

console.log('\n🌱 Datos de ejemplo insertados correctamente.');
console.log('📝 Credenciales de prueba:');
console.log('   👑 Admin:      admin@chambaya.com / admin123');
console.log('   📢 Ofertante:  carlos@email.com / 123456');
console.log('   👷 Demandante: maria@email.com / 123456');
console.log('   📢 Ofertante:  juan@email.com / 123456');
console.log('   👷 Demandante: ana@email.com / 123456');
console.log('   📢 Ofertante:  pedro@email.com / 123456');
console.log('   📢 Ofertante:  miguel@email.com / 123456');
console.log('   👷 Demandante: laura@email.com / 123456');
console.log('   👷 Demandante: david@email.com / 123456');
console.log('   👷 Demandante: sofia@email.com / 123456');
console.log('   👷 Demandante: elena@email.com / 123456');
