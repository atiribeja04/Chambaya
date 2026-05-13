<template>
  <div class="pagina-perfil-publico">
    <div class="contenedor">
      <div v-if="cargando" class="cargando"><div class="spinner"></div><p>Cargando perfil...</p></div>
      <div v-else-if="error" class="alerta alerta-error">{{ error }}</div>

      <template v-else-if="usuario">
        <!-- Cabecera -->
        <div class="perfil-cabecera tarjeta">
          <div class="perfil-avatar">
            <img v-if="usuario.foto_perfil" :src="usuario.foto_perfil" class="avatar-img" alt="" />
            <span v-else>{{ iniciales(usuario.nombre) }}</span>
          </div>
          <div class="perfil-info-principal">
            <h1>{{ usuario.nombre }}</h1>
            <span class="badge-tipo" :class="usuario.tipo">{{ usuario.tipo === 'ofertante' ? 'Ofertante' : 'Demandante' }}</span>
            <p v-if="usuario.ubicacion" class="perfil-ubicacion">📍 {{ usuario.ubicacion }}</p>
            <p v-if="usuario.barrio" class="perfil-ubicacion">🏘️ {{ usuario.barrio }}</p>
            <p v-if="usuario.skills" class="perfil-skills"><strong>Habilidades:</strong> {{ usuario.skills }}</p>
            <p v-if="usuario.disponibilidad" class="perfil-skills"><strong>Disponibilidad:</strong> {{ usuario.disponibilidad }}</p>
            <p v-if="usuario.descripcion" class="perfil-descripcion">{{ usuario.descripcion }}</p>
            <p class="perfil-miembro">Miembro desde {{ formatearFecha(usuario.creado_en) }}</p>
          </div>
          <div class="perfil-rating" v-if="valoracionesStats">
            <span class="rating-numero">{{ Number(valoracionesStats.media).toFixed(1) }}</span>
            <span class="rating-estrellas">{{ '⭐'.repeat(Math.round(valoracionesStats.media)) }}</span>
            <span class="rating-total">{{ valoracionesStats.total }} valoraciones</span>
          </div>
        </div>

        <div class="perfil-grid">
          <!-- Ofertas activas del ofertante -->
          <div v-if="usuario.tipo === 'ofertante' && ofertas.length" class="tarjeta">
            <h2>Ofertas activas ({{ ofertas.length }})</h2>
            <div v-for="o in ofertas" :key="o.id" class="oferta-item" @click="$router.push(`/ofertas/${o.id}`)">
              <div class="oferta-item-header">
                <strong>{{ o.titulo }}</strong>
                <span class="badge badge-azul">{{ o.categoria_nombre }}</span>
              </div>
              <p class="oferta-item-meta">{{ o.ubicacion }} · {{ formatearPrecio(o.precio, o.tipo_precio) }}</p>
            </div>
          </div>

          <!-- Valoraciones recibidas -->
          <div class="tarjeta">
            <h2>Valoraciones ({{ valoraciones.length }})</h2>
            <div v-if="valoraciones.length === 0" class="vacio">Aun no tiene valoraciones.</div>
            <div v-for="v in valoraciones" :key="v.id" class="valoracion-item">
              <div class="valoracion-header">
                <strong>{{ v.usuario_nombre }}</strong>
                <span>{{ '⭐'.repeat(v.puntuacion) }}</span>
              </div>
              <p v-if="v.comentario">{{ v.comentario }}</p>
              <small v-if="v.oferta_titulo">Oferta: {{ v.oferta_titulo }}</small>
              <small class="valoracion-fecha">{{ formatearFecha(v.creado_en) }}</small>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
const API = '/api'

export default {
  name: 'PublicProfileView',
  data() {
    return {
      usuario: null,
      valoracionesStats: null,
      valoraciones: [],
      ofertas: [],
      cargando: true,
      error: ''
    }
  },
  mounted() { this.cargarPerfil() },
  methods: {
    async cargarPerfil() {
      try {
        const res = await fetch(`${API}/usuarios/${this.$route.params.id}/perfil`)
        const data = await res.json()
        if (!res.ok) { this.error = data.error; return }
        this.usuario = data.usuario
        this.valoracionesStats = data.valoracionesStats
        this.valoraciones = data.valoraciones || []
        this.ofertas = data.ofertas || []
      } catch (e) { this.error = 'Error al cargar el perfil' }
      finally { this.cargando = false }
    },
    iniciales(nombre) { return nombre ? nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : '??' },
    formatearFecha(f) { return f ? new Date(f).toLocaleDateString('es-ES') : '' },
    formatearPrecio(precio, tipo) {
      if (!precio) return 'A convenir'
      const etiquetas = { por_hora: '/hora', por_dia: '/dia', fijo: '' }
      return `${precio}€${etiquetas[tipo] || ''}`
    }
  }
}
</script>

<style scoped>
.perfil-cabecera { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 1.5rem; }
.perfil-avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--color-primario); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; flex-shrink: 0; overflow: hidden; }
.perfil-avatar img { width: 100%; height: 100%; object-fit: cover; }
.perfil-info-principal { flex: 1; }
.perfil-info-principal h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
.perfil-ubicacion { color: var(--color-texto-claro); margin: 0.25rem 0; font-size: 0.95rem; }
.perfil-descripcion { color: var(--color-texto); margin: 0.5rem 0; line-height: 1.6; }
.perfil-skills { color: var(--color-texto-claro); margin: 0.25rem 0; font-size: 0.9rem; line-height: 1.5; }
.perfil-miembro { color: var(--color-texto-claro); font-size: 0.85rem; margin-top: 0.5rem; }
.perfil-rating { text-align: center; flex-shrink: 0; }
.rating-numero { display: block; font-size: 2rem; font-weight: 800; color: var(--color-primario); }
.rating-estrellas { font-size: 1.1rem; }
.rating-total { display: block; font-size: 0.8rem; color: var(--color-texto-claro); }

.badge-tipo { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
.badge-tipo.ofertante { background: #dbeafe; color: #1e40af; }
.badge-tipo.demandante { background: #dcfce7; color: #166534; }

.perfil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

.oferta-item { padding: 0.75rem; border: 1px solid var(--color-borde); border-radius: var(--radio); margin-bottom: 0.5rem; cursor: pointer; transition: box-shadow 0.2s; }
.oferta-item:hover { box-shadow: var(--sombra-md); }
.oferta-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.oferta-item-meta { color: var(--color-texto-claro); font-size: 0.85rem; }

.valoracion-item { padding: 0.75rem 0; border-bottom: 1px solid var(--color-borde); }
.valoracion-item:last-child { border-bottom: none; }
.valoracion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.valoracion-fecha { display: block; color: var(--color-texto-claro); font-size: 0.8rem; margin-top: 0.25rem; }
.valoracion-item small { color: var(--color-texto-claro); font-size: 0.85rem; }

.vacio { color: var(--color-texto-claro); text-align: center; padding: 2rem; font-size: 0.9rem; }
.cargando { text-align: center; padding: 4rem; color: var(--color-texto-claro); }
.spinner { width: 40px; height: 40px; border: 3px solid var(--color-borde); border-top: 3px solid var(--color-primario); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .perfil-cabecera { flex-direction: column; align-items: center; text-align: center; }
  .perfil-grid { grid-template-columns: 1fr; }
}
</style>
