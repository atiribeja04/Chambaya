/**
 * @file Conexion a la base de datos SQLite para Chambaya.
 *
 * Proporciona una unica instancia de better-sqlite3 y la funcion de
 * inicializacion que crea todas las tablas del esquema si no existen.
 *
 * @module db
 * @requires better-sqlite3
 * @requires path
 */

const Database = require('better-sqlite3');
const path = require('path');

/**
 * Ruta absoluta al archivo de base de datos SQLite.
 *
 * El archivo se almacena en el mismo directorio que este modulo
 * con el nombre {@code chambaya.db}.
 *
 * @type {string}
 * @constant
 * @default
 */
const DB_PATH = path.join(__dirname, 'chambaya.db');

/**
 * Instancia unica de la base de datos SQLite.
 *
 * Se crea una unica instancia al cargar el modulo y se reutiliza
 * en toda la aplicacion mediante los exports.
 *
 * @type {Database}
 * @see {@link https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md}
 */
const db = new Database(DB_PATH);

/*
 * ─── Pragmas de rendimiento ────────────────────────────────────
 */

/**
 * Habilita Write-Ahead Logging para mejorar el rendimiento en lecturas
 * concurrentes.
 * @type {void}
 */
db.pragma('journal_mode = WAL');

/**
 * Activa la verificacion de claves foraneas a nivel de base de datos.
 * @type {void}
 */
db.pragma('foreign_keys = ON');

/**
 * Crea todas las tablas del esquema si no existen.
 *
 * Tablas creadas:
 * - `usuarios` — Cuentas de usuario (ofertantes, demandantes, admin)
 * - `categorias` — Categorias de ofertas de trabajo
 * - `ofertas` — Ofertas de trabajo publicadas por ofertantes
 * - `valoraciones` — Valoraciones entre usuarios tras un trabajo
 * - `solicitudes` — Solicitudes de postulacion a ofertas
 *
 * Cada tabla incluye sus restricciones CHECK, claves foraneas y valores
 * por defecto. Se ejecuta una unica vez al cargar el modulo.
 *
 * @function
 * @name inicializarBaseDeDatos
 * @memberof module:db
 * @returns {void}
 *
 * @example
 * // Uso tipico (se ejecuta automaticamente al importar el modulo)
 * const { db } = require('./db');
 */
function inicializarBaseDeDatos() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre        TEXT    NOT NULL,
      email         TEXT    UNIQUE NOT NULL,
      password      TEXT    NOT NULL,
      telefono      TEXT,
      ubicacion     TEXT,
      tipo          TEXT    NOT NULL CHECK(tipo IN ('ofertante','demandante','admin')) DEFAULT 'demandante',
      descripcion   TEXT,
      foto_perfil   TEXT,
      skills        TEXT,
      disponibilidad TEXT,
      en_busqueda   INTEGER DEFAULT 0,
      latitud       REAL,
      longitud      REAL,
      barrio        TEXT,
      direccion     TEXT,
      creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre      TEXT    UNIQUE NOT NULL,
      descripcion TEXT,
      icono       TEXT
    );

    CREATE TABLE IF NOT EXISTS ofertas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo        TEXT    NOT NULL,
      descripcion   TEXT    NOT NULL,
      ubicacion     TEXT,
      latitud       REAL,
      longitud      REAL,
      barrio        TEXT,
      direccion     TEXT,
      precio        REAL,
      tipo_precio   TEXT    CHECK(tipo_precio IN ('por_hora','por_dia','fijo')) DEFAULT 'fijo',
      imagen        TEXT,
      categoria_id  INTEGER,
      usuario_id    INTEGER NOT NULL,
      estado        TEXT    CHECK(estado IN ('activa','completada','cancelada')) DEFAULT 'activa',
      creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS valoraciones (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      oferta_id         INTEGER NOT NULL,
      usuario_origen_id INTEGER NOT NULL,
      usuario_destino_id INTEGER NOT NULL,
      puntuacion        INTEGER NOT NULL CHECK(puntuacion BETWEEN 1 AND 5),
      comentario        TEXT,
      creado_en         DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oferta_id)          REFERENCES ofertas(id),
      FOREIGN KEY (usuario_origen_id)  REFERENCES usuarios(id),
      FOREIGN KEY (usuario_destino_id) REFERENCES usuarios(id),
      UNIQUE(oferta_id, usuario_origen_id)
    );

    CREATE TABLE IF NOT EXISTS solicitudes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      oferta_id  INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      mensaje    TEXT,
      estado     TEXT    CHECK(estado IN ('pendiente','aceptada','rechazada')) DEFAULT 'pendiente',
      creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (oferta_id)  REFERENCES ofertas(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      UNIQUE(oferta_id, usuario_id)
    );

    CREATE TABLE IF NOT EXISTS notificaciones (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id   INTEGER NOT NULL,
      tipo         TEXT    NOT NULL,
      mensaje      TEXT    NOT NULL,
      referencia_id INTEGER,
      leida        INTEGER DEFAULT 0,
      creado_en    DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );

    CREATE TABLE IF NOT EXISTS favoritos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      oferta_id  INTEGER NOT NULL,
      creado_en  DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (oferta_id)  REFERENCES ofertas(id),
      UNIQUE(usuario_id, oferta_id)
    );

    CREATE TABLE IF NOT EXISTS destacados (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo          TEXT NOT NULL CHECK(tipo IN ('oferta','demandante')),
      ref_id        INTEGER NOT NULL,
      fecha_inicio  DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_fin     DATETIME NOT NULL,
      creado_en     DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Devuelve la instancia unica de la base de datos.
 *
 * Util para acceder a la base de datos desde modulos que no la
 * importaron directamente.
 *
 * @function
 * @name obtenerDB
 * @memberof module:db
 * @returns {Database} Instancia de better-sqlite3
 *
 * @example
 * const { obtenerDB } = require('./db');
 * const db = obtenerDB();
 * const usuarios = db.prepare('SELECT * FROM usuarios').all();
 */
function obtenerDB() {
  return db;
}

// Inicializar tablas al cargar el modulo
inicializarBaseDeDatos();

// Migraciones para columnas anadidas posteriormente
try { db.exec("ALTER TABLE ofertas ADD COLUMN direccion TEXT"); } catch (e) { /* ya existe */ }

module.exports = { db, obtenerDB, inicializarBaseDeDatos };

// FIXME: agregar migraciones automáticas
