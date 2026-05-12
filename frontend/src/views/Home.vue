<template>
  <div class="pagina-inicio">
    <!-- Hero section con imagen de fondo -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="contenedor hero-contenido">
        <div class="hero-texto fade-in">
          <span class="hero-badge">Encuentra trabajo cerca de ti</span>
          <h1 class="hero-titulo">El trabajo <span class="text-destacado">perfecto</span> para hoy</h1>
          <p class="hero-subtitulo">
            Chambaya conecta a personas que buscan trabajos temporales con quienes los ofrecen.
            Limpieza, mudanzas, cuidado de niños, reparaciones y mucho más.
          </p>
          <div class="hero-acciones">
            <router-link to="/ofertas" class="btn btn-primario btn-lg">
              🔍 Buscar trabajos
            </router-link>
            <router-link to="/registro" class="btn btn-outline btn-lg btn-hero-outline">
              📢 Publicar oferta
            </router-link>
          </div>
          <div class="hero-stats">
            <div class="hero-stat" v-if="stats.totalUsuarios">
              <span class="hero-stat-num">{{ stats.totalUsuarios }}+</span>
              <span class="hero-stat-label">Usuarios</span>
            </div>
            <div class="hero-stat" v-if="stats.totalOfertas">
              <span class="hero-stat-num">{{ stats.totalOfertas }}+</span>
              <span class="hero-stat-label">Ofertas</span>
            </div>
            <div class="hero-stat" v-if="stats.totalValoraciones">
              <span class="hero-stat-num">{{ stats.totalValoraciones }}+</span>
              <span class="hero-stat-label">Valoraciones</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Como funciona -->
    <section class="seccion">
      <div class="contenedor">
        <div class="seccion-header-centrado">
          <span class="seccion-badge">Cómo funciona</span>
          <h2 class="seccion-titulo">Tres pasos para empezar</h2>
          <p class="seccion-desc">Ya sea que busques trabajo o necesites contratar, el proceso es sencillo.</p>
        </div>
        <div class="grid-3">
          <div class="paso tarjeta fade-in">
            <div class="paso-icono">📝</div>
            <div class="paso-numero">1</div>
            <h3>Regístrate</h3>
            <p>Crea tu cuenta como ofertante o demandante en menos de un minuto. Solo necesitas tu email.</p>
          </div>
          <div class="paso tarjeta fade-in">
            <div class="paso-icono">🤝</div>
            <div class="paso-numero">2</div>
            <h3>Conecta</h3>
            <p>Publica ofertas o encuentra trabajos cerca de ti por categoría y ubicación con un solo clic.</p>
          </div>
          <div class="paso tarjeta fade-in">
            <div class="paso-icono">⭐</div>
            <div class="paso-numero">3</div>
            <h3>Valora</h3>
            <p>Después del trabajo, valora a la otra persona y construye tu reputación dentro de la comunidad.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Categorias -->
    <section class="seccion seccion-alt">
      <div class="contenedor">
        <div class="seccion-header-centrado">
          <span class="seccion-badge">Categorías</span>
          <h2 class="seccion-titulo">Explora por categoría</h2>
          <p class="seccion-desc">Encuentra exactamente lo que necesitas en nuestras categorías.</p>
        </div>
        <div class="grid-4">
          <div v-for="cat in categorias" :key="cat.id" class="categoria-tarjeta tarjeta"
               @click="irACategoria(cat.id)">
            <span class="categoria-icono">{{ cat.icono }}</span>
            <h3 class="categoria-nombre">{{ cat.nombre }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Ofertas recientes -->
    <section class="seccion">
      <div class="contenedor">
        <div class="seccion-header">
          <div>
            <span class="seccion-badge">Trabajos recientes</span>
            <h2 class="seccion-titulo">Últimas ofertas</h2>
          </div>
          <router-link to="/ofertas" class="btn btn-outline btn-sm">Ver todas →</router-link>
        </div>
        <div v-if="cargando" class="cargando">
          <div class="spinner"></div>
          <p>Cargando ofertas...</p>
        </div>
        <div v-else class="grid-2">
          <div v-for="oferta in ofertas" :key="oferta.id" class="tarjeta oferta-tarjeta fade-in"
               @click="$router.push(`/ofertas/${oferta.id}`)">
            <div class="oferta-destacado" v-if="oferta.destacado_hasta">⭐ DESTACADO</div>
            <div class="oferta-header">
              <span class="badge badge-azul">{{ oferta.categoria_nombre || 'Sin categoría' }}</span>
              <span class="oferta-precio">{{ formatearPrecio(oferta.precio, oferta.tipo_precio) }}</span>
            </div>
            <h3 class="oferta-titulo">{{ oferta.titulo }}</h3>
            <p class="oferta-descripcion">{{ truncarTexto(oferta.descripcion, 120) }}</p>
            <div class="oferta-footer">
              <span class="oferta-usuario">👤 {{ oferta.usuario_nombre }}</span>
              <span class="oferta-ubicacion">📍 {{ oferta.barrio || oferta.ubicacion || oferta.usuario_ubicacion || 'No especificada' }}</span>
              <span class="oferta-rating">⭐ {{ Number(oferta.puntuacion_media).toFixed(1) }}</span>
            </div>
          </div>
        </div>
        <div v-if="!cargando && ofertas.length === 0" class="vacio">
          <p>No hay ofertas disponibles actualmente.</p>
          <router-link to="/registro" class="btn btn-primario" style="margin-top:1rem">Publica la primera oferta</router-link>
        </div>
      </div>
    </section>

    <!-- Candidatos destacados -->
    <section class="seccion seccion-alt" v-if="demandantes.length">
      <div class="contenedor">
        <div class="seccion-header">
          <div>
            <span class="seccion-badge">Profesionales</span>
            <h2 class="seccion-titulo">Candidatos destacados</h2>
            <p class="seccion-desc">Personas disponibles para trabajar cerca de ti</p>
          </div>
          <router-link to="/candidatos" class="btn btn-outline btn-sm">Ver todos →</router-link>
        </div>
        <div class="grid-3">
          <div v-for="d in demandantes" :key="d.id" class="candidato-card tarjeta fade-in"
               @click="$router.push(`/perfil/${d.id}`)">
            <div class="candidato-destacado" v-if="d.destacado_hasta">⭐ DESTACADO</div>
            <div class="candidato-avatar">
              <img :src="d.foto_perfil || '/placeholder.svg'" :alt="d.nombre" />
            </div>
            <h3 class="candidato-nombre">{{ d.nombre }}</h3>
            <div class="candidato-barrio" v-if="d.barrio">📍 {{ d.barrio }}</div>
            <div class="candidato-rating" v-if="d.total_valoraciones > 0">
              ⭐ {{ Number(d.puntuacion_media).toFixed(1) }}
              <span>({{ d.total_valoraciones }})</span>
            </div>
            <div class="candidato-skills" v-if="d.skills">
              <span v-for="s in d.skills.split(',').slice(0, 3)" :key="s" class="skill-tag">{{ s.trim() }}</span>
            </div>
            <div class="candidato-footer">
              <span v-if="d.disponibilidad" class="disponibilidad-badge" :class="d.disponibilidad">
                {{ d.disponibilidad === 'completa' ? 'Disponible' : d.disponibilidad === 'fines_de_semana' ? 'Fines de semana' : 'Horario laboral' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Llamada a la accion -->
    <section class="seccion cta-section">
      <div class="contenedor">
        <div class="cta-contenido tarjeta">
          <h2>¿Listo para empezar?</h2>
          <p>Únete a Chambaya hoy y encuentra el trabajo perfecto o contrata al mejor profesional.</p>
          <div class="cta-acciones">
            <router-link to="/registro" class="btn btn-primario btn-lg">Crear cuenta gratis</router-link>
            <router-link to="/ofertas" class="btn btn-outline btn-lg">Explorar ofertas</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
/**
 * Pagina de inicio de Chambaya.
 * Muestra el hero, como funciona, categorias, ofertas recientes y CTA.
 */
const API = '/api'

export default {
  name: 'HomeView',
  data() {
    return {
      ofertas: [],
      categorias: [],
      demandantes: [],
      stats: {},
      cargando: true
    }
  },
  mounted() {
    this.cargarDatos()
  },
  methods: {
    async cargarDatos() {
      try {
        const [resOfertas, resCategorias, resDemandantes, resStats] = await Promise.all([
          fetch(`${API}/ofertas`),
          fetch(`${API}/ofertas/categorias`),
          fetch(`${API}/demandantes?limit=6`),
          fetch(`${API}/admin/dashboard`).catch(() => ({ json: () => ({}) }))
        ])
        const dataOfertas = await resOfertas.json()
        const dataCategorias = await resCategorias.json()
        const dataDemandantes = await resDemandantes.json()
        const dataStats = await resStats.json().catch(() => ({}))
        this.ofertas = (dataOfertas.ofertas || []).slice(0, 4)
        this.categorias = dataCategorias.categorias || []
        this.demandantes = dataDemandantes.demandantes || []
        this.stats = dataStats.estadisticas || {}
      } catch (e) {
        console.error('Error al cargar datos:', e)
      } finally {
        this.cargando = false
      }
    },
    formatearPrecio(precio, tipo) {
      if (!precio) return 'A convenir'
      const etiquetas = { por_hora: '/hora', por_dia: '/dia', fijo: '' }
      return `${precio}€${etiquetas[tipo] || ''}`
    },
    truncarTexto(texto, max) {
      if (!texto || texto.length <= max) return texto
      return texto.substring(0, max) + '...'
    },
    irACategoria(id) {
      this.$router.push(`/ofertas?categoria=${id}`)
    }
  }
}
</script>

<style scoped>
/* Hero */
.hero {
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 100%),
    url('https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1400&q=80') center/cover fixed;
  color: var(--color-blanco);
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 60%);
}

.hero-contenido {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 4rem 0;
}

.hero-texto {
  max-width: 720px;
}

.hero-badge {
  display: inline-block;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(10px);
  padding: 0.4rem 1.2rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255,255,255,0.15);
}

.hero-titulo {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.2rem;
  letter-spacing: -0.02em;
}

.text-destacado {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitulo {
  font-size: 1.2rem;
  color: #cbd5e1;
  margin-bottom: 2.5rem;
  line-height: 1.7;
  max-width: 600px;
}

.hero-acciones {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-lg {
  padding: 0.9rem 2rem;
  font-size: 1.05rem;
  border-radius: 12px;
}

.btn-hero-outline {
  border-color: rgba(255,255,255,0.5) !important;
  color: var(--color-blanco) !important;
}

.btn-hero-outline:hover {
  background: rgba(255,255,255,0.12) !important;
  border-color: var(--color-blanco) !important;
}

.hero-stats {
  display: flex;
  gap: 3rem;
}

.hero-stat {
  display: flex;
  flex-direction: column;
}

.hero-stat-num {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-blanco);
}

.hero-stat-label {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Secciones */
.seccion {
  padding: 5rem 0;
}

.seccion-alt {
  background-color: var(--color-fondo-alt);
}

.seccion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.seccion-header-centrado {
  text-align: center;
  margin-bottom: 3rem;
}

.seccion-badge {
  display: inline-block;
  background: var(--color-primario-claro);
  color: var(--color-primario-oscuro);
  padding: 0.3rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.seccion-titulo {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-texto);
  letter-spacing: -0.01em;
}

.seccion-desc {
  color: var(--color-texto-claro);
  font-size: 1.05rem;
  max-width: 500px;
  margin: 0.5rem auto 0;
}

/* Pasos */
.paso {
  text-align: center;
  padding: 2.5rem 2rem;
  position: relative;
}

.paso-icono {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.paso-numero {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  background: var(--color-primario-claro);
  color: var(--color-primario);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
}

.paso h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.paso p {
  color: var(--color-texto-claro);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Categorias */
.categoria-tarjeta {
  cursor: pointer;
  text-align: center;
  padding: 1.75rem 1rem;
  transition: all 0.3s ease;
  border: 1px solid var(--color-borde);
}

.categoria-tarjeta:hover {
  transform: translateY(-4px);
  box-shadow: var(--sombra-lg);
  border-color: var(--color-primario-claro);
}

.categoria-icono {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.categoria-nombre {
  font-size: 0.95rem;
  font-weight: 600;
}

/* Ofertas */
.oferta-tarjeta {
  cursor: pointer;
  padding: 1.25rem;
  border: 1px solid var(--color-borde);
  position: relative;
}

.oferta-tarjeta:hover {
  transform: translateY(-3px);
  box-shadow: var(--sombra-lg);
  border-color: var(--color-primario-claro);
}

.oferta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.oferta-precio {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-secundario);
}

.oferta-titulo {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
  color: var(--color-texto);
}

.oferta-descripcion {
  color: var(--color-texto-claro);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.oferta-footer {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-texto-claro);
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-borde);
}

/* CTA */
.cta-section {
  padding: 3rem 0;
}

.cta-contenido {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, var(--color-primario-claro), #ede9fe);
  border: none;
}

.cta-contenido h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.cta-contenido p {
  color: var(--color-texto-claro);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.cta-acciones {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-borde);
  border-top: 3px solid var(--color-primario);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cargando, .vacio {
  text-align: center;
  padding: 3rem;
  color: var(--color-texto-claro);
}

/* Candidatos destacados */
.candidato-card {
  cursor: pointer;
  text-align: center;
  padding: 2rem 1.5rem;
  border: 1px solid var(--color-borde);
  position: relative;
  transition: all 0.3s ease;
}

.candidato-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--sombra-lg);
  border-color: var(--color-primario-claro);
}

.oferta-destacado, .candidato-destacado {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.candidato-barrio {
  color: var(--color-texto-claro);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.candidato-rating {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.candidato-rating span {
  color: var(--color-texto-claro);
  font-size: 0.8rem;
}

.candidato-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.skill-tag {
  background: var(--color-primario-claro);
  color: var(--color-primario-oscuro);
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.candidato-nombre {
  font-size: 1.1rem;
  margin: 0.75rem 0 0.25rem;
}

.candidato-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primario-claro);
}

.disponibilidad-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
}

.disponibilidad-badge.completa {
  background: #d1fae5;
  color: #065f46;
}

.disponibilidad-badge.fines_de_semana {
  background: #dbeafe;
  color: #1e40af;
}

.disponibilidad-badge.horario_laboral {
  background: #fef3c7;
  color: #92400e;
}

.candidato-footer {
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero { min-height: 70vh; background-attachment: scroll; }
  .hero-titulo { font-size: 2.2rem; }
  .hero-acciones { flex-direction: column; }
  .hero-stats { gap: 1.5rem; }
  .btn-lg { width: 100%; }
  .seccion-titulo { font-size: 1.6rem; }
  .oferta-footer { flex-wrap: wrap; gap: 0.5rem; }
  .cta-acciones { flex-direction: column; }
  .grid-3 { grid-template-columns: 1fr; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}
</style>

<!-- TODO: sección de candidatos destacados -->

<!-- TODO: sección de candidatos destacados -->
