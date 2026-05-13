<template>
  <div class="pagina-detalle">
    <div class="contenedor">
      <div v-if="cargando" class="cargando"><div class="spinner"></div><p>Cargando oferta...</p></div>

      <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>
      <div v-else-if="error" class="alerta alerta-error">{{ error }}</div>

      <template v-else-if="oferta">
        <div class="detalle-grid">
          <div class="detalle-principal tarjeta">
            <div class="detalle-header">
              <div>
                <span class="badge badge-azul">{{ oferta.categoria_nombre || 'Sin categoria' }}</span>
                <h1>{{ oferta.titulo }}
                  <button v-if="token && !esMiOferta" :class="['fav-btn-detalle', { activo: esFavorito }]" @click="toggleFavorito" :title="esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'">
                    {{ esFavorito ? '❤️' : '🤍' }}
                  </button>
                </h1>
              </div>
              <div class="detalle-precio">
                <span class="precio-valor">{{ formatearPrecio(oferta.precio, oferta.tipo_precio) }}</span>
                <span v-if="oferta.ubicacion" class="detalle-ubicacion">📍 {{ oferta.ubicacion }}</span>
              </div>
            </div>

            <img v-if="oferta.imagen" :src="oferta.imagen" class="detalle-imagen" alt="Imagen de la oferta" />

            <div class="detalle-cuerpo">
              <h3>Descripcion</h3>
              <p>{{ oferta.descripcion }}</p>
            </div>

            <div class="detalle-info">
              <span>Estado: <strong>{{ estadoTexto(oferta.estado) }}</strong></span>
              <span>Publicado: {{ formatearFecha(oferta.creado_en) }}</span>
            </div>

            <!-- Botones para el ofertante -->
            <div v-if="esMiOferta" class="detalle-acciones">
              <button @click="editarOferta" class="btn btn-primario btn-sm">Editar oferta</button>
              <button @click="cambiarEstado('completada')" class="btn btn-secundario btn-sm">Completada</button>
              <button @click="cambiarEstado('cancelada')" class="btn btn-peligro btn-sm">Cancelar</button>
              <button @click="mostrarBoostModal = true" class="btn btn-outline btn-sm">{{ oferta.destacado_hasta ? '⭐ Renovar destacado' : 'Destacar oferta' }}</button>
            </div>

            <!-- Solicitantes (solo para el ofertante) -->
            <div v-if="esMiOferta" class="solicitantes-seccion">
              <h3>Solicitantes ({{ solicitudes.length }})</h3>
              <div v-if="solicitudes.length === 0" class="vacio">Aun no hay solicitantes para esta oferta.</div>
              <div v-for="s in solicitudes" :key="s.id" class="solicitante-card">
                <div class="solicitante-info">
                  <strong>{{ s.nombre }}</strong>
                  <span v-if="s.ubicacion">📍 {{ s.ubicacion }}</span>
                  <a v-if="s.email" :href="'mailto:'+s.email">✉️ {{ s.email }}</a>
                  <a v-if="s.telefono" :href="'tel:'+s.telefono">📞 {{ s.telefono }}</a>
                </div>
                <p v-if="s.mensaje" class="solicitante-mensaje">"{{ s.mensaje }}"</p>
                <span :class="['badge', s.estado === 'aceptada' ? 'badge-verde' : s.estado === 'rechazada' ? 'badge-rojo' : 'badge-azul']">
                  {{ s.estado === 'pendiente' ? 'Pendiente' : s.estado === 'aceptada' ? 'Aceptada' : 'Rechazada' }}
                </span>
                <div v-if="s.estado === 'pendiente'" class="solicitante-acciones">
                  <button @click="responderSolicitud(s.id, 'aceptada')" class="btn btn-secundario btn-sm">Aceptar</button>
                  <button @click="aceptarYCompletar(s.id)" class="btn btn-primario btn-sm">Aceptar & completar</button>
                  <button @click="responderSolicitud(s.id, 'rechazada')" class="btn btn-peligro btn-sm">Rechazar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="detalle-sidebar">
            <div class="tarjeta sidebar-usuario">
              <h3>Ofertante</h3>
              <p class="usuario-nombre">
                <router-link :to="`/perfil/${oferta.usuario_id}`" class="enlace-perfil">{{ oferta.usuario_nombre }}</router-link>
              </p>
              <p class="usuario-rating">
                ⭐ {{ Number(oferta.puntuacion_media).toFixed(1) }}
                ({{ oferta.total_valoraciones }} valoraciones)
              </p>
              <p v-if="oferta.usuario_ubicacion">📍 {{ oferta.usuario_ubicacion }}</p>
              <hr />
              <button v-if="token && usuario?.id !== oferta.usuario_id" @click="abrirModal" class="btn btn-primario" style="width:100%">
                Solicitar trabajo
              </button>
              <router-link v-else-if="!token" to="/login" class="btn btn-primario" style="width:100%;text-align:center">
                Inicia sesion para solicitar
              </router-link>
              <hr />
              <button @click="compartir" class="btn btn-outline btn-sm" style="width:100%">🔗 Compartir oferta</button>
              <hr />
              <div v-if="oferta.latitud && oferta.longitud" class="mapa-container">
                <h3>Ubicacion</h3>
                <p class="mapa-barrio" v-if="oferta.barrio">📍 {{ oferta.barrio }}</p>
                <div ref="mapaEl" class="mapa-leaflet"></div>
              </div>
            </div>

            <!-- Ofertas similares -->
            <div class="tarjeta sidebar-similares" v-if="similares.length">
              <h3>Ofertas similares</h3>
              <div v-for="s in similares" :key="s.id" class="similar-item" @click="$router.push(`/ofertas/${s.id}`)">
                <strong>{{ s.titulo }}</strong>
                <span class="similar-meta">{{ s.usuario_nombre }} · {{ formatearPrecio(s.precio, s.tipo_precio) }}</span>
              </div>
            </div>

            <div class="tarjeta sidebar-valoraciones">
              <h3>Valoraciones</h3>
              <div v-if="valoraciones.length === 0" class="vacio">Aun no hay valoraciones</div>
              <div v-for="v in valoraciones" :key="v.id" class="valoracion-item">
                <div class="valoracion-header">
                  <strong>{{ v.usuario_nombre }}</strong>
                  <span>{{ '⭐'.repeat(v.puntuacion) }}</span>
                </div>
                <p v-if="v.comentario">{{ v.comentario }}</p>
                <small class="valoracion-fecha">{{ formatearFecha(v.creado_en) }}</small>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <PostularModal v-if="mostrarModal" :oferta="oferta" @cerrar="mostrarModal = false" @solicitado="modalSolicitado" />

    <!-- Rating modal -->
    <div v-if="ratingData" class="modal-overlay" @click.self="ratingData = null">
      <div class="modal-contenido tarjeta">
        <h3>Valorar a {{ ratingData.nombre }}</h3>
        <p class="rating-sub">Puntua el trabajo realizado</p>
        <div class="rating-estrellas">
          <button v-for="n in 5" :key="n" @click="ratingPunt = n" :class="['estrella', { activa: n <= ratingPunt }]">★</button>
        </div>
        <textarea v-model="ratingComent" class="form-input" placeholder="Comentario (opcional)" rows="3"></textarea>
        <div class="rating-acciones">
          <button @click="ratingData = null" class="btn btn-secundario">Omitir</button>
          <button @click="enviarRating" class="btn btn-primario" :disabled="!ratingPunt">Enviar valoracion</button>
        </div>
      </div>
    </div>

    <!-- Boost modal -->
    <div v-if="mostrarBoostModal" class="modal-overlay" @click.self="mostrarBoostModal = false">
      <div class="modal-contenido tarjeta">
        <h3>Destacar oferta</h3>
        <p class="rating-sub">Aparece primero en las busquedas</p>
        <div class="boost-opciones">
          <button v-for="d in opcionesBoost" :key="d.dias" @click="destacarOferta(d.dias)" class="btn btn-outline" :disabled="boostCargando">
            {{ d.label }}
          </button>
        </div>
        <div v-if="boostExito" class="alerta alerta-exito" style="margin-top:0.5rem">{{ boostExito }}</div>
        <div v-if="boostError" class="alerta alerta-error" style="margin-top:0.5rem">{{ boostError }}</div>
        <div class="rating-acciones">
          <button @click="mostrarBoostModal = false" class="btn btn-secundario">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PostularModal from '../components/PostularModal.vue'
import { useAuth } from '../store/auth.js'

const API = '/api'

export default {
  name: 'JobDetailView',
  components: { PostularModal },
  data() {
    return {
      oferta: null,
      valoraciones: [],
      solicitudes: [],
      cargando: true,
      error: '',
      exito: '',
      mostrarModal: false,
      esFavorito: false,
      ratingData: null,
      ratingPunt: 0,
      ratingComent: '',
      similares: [],
      mostrarBoostModal: false,
      opcionesBoost: [
        { dias: 2, label: '2 días' },
        { dias: 7, label: '7 días' },
        { dias: 14, label: '14 días' },
        { dias: 30, label: '30 días' }
      ],
      boostCargando: false,
      boostExito: '',
      boostError: '',
      _mapaIniciado: false
    }
  },
  setup() {
    return { auth: useAuth() }
  },
  watch: {
    exito(v) { if (v) setTimeout(() => this.exito = '', 4000) },
    error(v) { if (v) setTimeout(() => this.error = '', 4000) }
  },
  computed: {
    token() { return this.auth.token },
    usuario() { return this.auth.usuario },
    esMiOferta() { return this.usuario && this.oferta && this.usuario.id === this.oferta.usuario_id }
  },
  mounted() {
    this.cargarOferta()
  },
  methods: {
    async cargarOferta() {
      try {
        const res = await fetch(`${API}/ofertas/${this.$route.params.id}`)
        const data = await res.json()
        if (!res.ok) { this.error = data.error; return }
        this.oferta = data.oferta
        this.valoraciones = data.valoraciones || []
        if (this.token && !this.esMiOferta) this.verificarFavorito()
        if (this.esMiOferta) this.cargarSolicitudes()
        this.cargarSimilares()
        this.$nextTick(() => this.iniciarMapa())
      } catch (e) { this.error = 'Error al cargar la oferta' }
      finally { this.cargando = false }
    },
    async cargarSolicitudes() {
      try {
        const res = await fetch(`${API}/ofertas/${this.oferta.id}/solicitudes`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const data = await res.json()
        this.solicitudes = data.solicitudes || []
      } catch (e) { console.error(e) }
    },
    abrirModal() { this.mostrarModal = true },
    modalSolicitado() { this.mostrarModal = false },
    async verificarFavorito() {
      try {
        const res = await fetch(`${API}/ofertas/mis-favoritos`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const data = await res.json()
        this.esFavorito = (data.ofertas || []).some(o => o.id === this.oferta.id)
      } catch (e) {}
    },
    async cargarSimilares() {
      try {
        const res = await fetch(`${API}/ofertas/${this.oferta.id}/similares`)
        const data = await res.json()
        this.similares = data.ofertas || []
      } catch (e) {}
    },
    compartir() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.exito = 'Enlace copiado al portapapeles'
      }).catch(() => { this.error = 'No se pudo copiar el enlace' })
    },
    async toggleFavorito() {
      try {
        if (this.esFavorito) {
          await fetch(`${API}/ofertas/${this.oferta.id}/favorito`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${this.token}` }
          })
        } else {
          await fetch(`${API}/ofertas/${this.oferta.id}/favorito`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${this.token}` }
          })
        }
        this.esFavorito = !this.esFavorito
      } catch (e) { console.error(e) }
    },
    formatearPrecio(precio, tipo) {
      if (!precio) return 'A convenir'
      const etiquetas = { por_hora: '/hora', por_dia: '/dia', fijo: '' }
      return `${precio}€${etiquetas[tipo] || ''}`
    },
    formatearFecha(fecha) { return fecha ? new Date(fecha).toLocaleDateString('es-ES') : '' },
    estadoTexto(estado) { return { activa: 'Activa', completada: 'Completada', cancelada: 'Cancelada' }[estado] || estado },
    async cambiarEstado(estado) {
      if (!confirm(`Seguro que quieres ${estado === 'completada' ? 'completar' : 'cancelar'} esta oferta?`)) return
      try {
        const res = await fetch(`${API}/ofertas/${this.oferta.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado })
        })
        if (res.ok) this.oferta.estado = estado
      } catch (e) { console.error(e) }
    },
    editarOferta() { this.$router.push(`/crear-oferta?id=${this.oferta.id}`) },
    async responderSolicitud(solicitudId, estado) {
      try {
        await fetch(`${API}/ofertas/${this.oferta.id}/solicitudes/${solicitudId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado })
        })
        this.cargarSolicitudes()
      } catch (e) { console.error(e) }
    },
    async aceptarYCompletar(solicitudId) {
      if (!confirm('Aceptar esta solicitud y marcar la oferta como completada?')) return
      try {
        await fetch(`${API}/ofertas/${this.oferta.id}/solicitudes/${solicitudId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado: 'aceptada' })
        })
        await fetch(`${API}/ofertas/${this.oferta.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado: 'completada' })
        })
        this.oferta.estado = 'completada'
        this.cargarSolicitudes()
        const postulante = this.solicitudes.find(s => s.id === solicitudId)
        if (postulante) {
          this.ratingData = { id: postulante.id, nombre: postulante.nombre, usuarioId: postulante.usuario_id }
          this.ratingPunt = 0
          this.ratingComent = ''
        }
      } catch (e) { console.error(e) }
    },
    async destacarOferta(duracion) {
      this.boostCargando = true
      this.boostExito = ''
      this.boostError = ''
      try {
        const res = await fetch(`${API}/destacados`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ tipo: 'oferta', ref_id: this.oferta.id, duracion })
        })
        const data = await res.json()
        if (res.ok) {
          this.boostExito = `Oferta destacada por ${duracion} días`
          this.oferta.destacado_hasta = data.destacado?.fecha_fin
        } else {
          this.boostError = data.error || 'Error al destacar'
        }
      } catch (e) { this.boostError = 'Error de conexión' }
      finally { this.boostCargando = false }
    },
    iniciarMapa() {
      if (!this.oferta?.latitud || !this.oferta?.longitud) return
      if (this._mapaIniciado) return
      this._mapaIniciado = true
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      if (!window.L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => this._dibujarMapa()
        document.body.appendChild(script)
      } else {
        this._dibujarMapa()
      }
    },
    _dibujarMapa() {
      if (!this.$refs.mapaEl || !window.L) return
      const lat = parseFloat(this.oferta.latitud)
      const lng = parseFloat(this.oferta.longitud)
      if (isNaN(lat) || isNaN(lng)) return
      const map = window.L.map(this.$refs.mapaEl).setView([lat, lng], 13)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)
      window.L.circle([lat, lng], {
        radius: 500,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 2
      }).addTo(map)
    },
    async enviarRating() {
      if (!this.ratingPunt) return
      try {
        const res = await fetch(`${API}/valoraciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({
            oferta_id: this.oferta.id,
            usuario_destino_id: this.ratingData.usuarioId,
            puntuacion: this.ratingPunt,
            comentario: this.ratingComent || undefined
          })
        })
        if (res.ok) {
          this.exito = 'Valoracion enviada correctamente'
          this.ratingData = null
        } else {
          const err = await res.json()
          this.error = err.error || 'Error al enviar valoracion'
        }
      } catch (e) {
        this.error = 'Error al enviar valoracion'
        console.error(e)
      }
    }
  }
}
</script>

<style scoped>
.detalle-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }

.detalle-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-borde); }
.detalle-precio { text-align: right; }
.precio-valor { font-size: 1.5rem; font-weight: 700; color: var(--color-secundario); display: block; }
.detalle-ubicacion { font-size: 0.9rem; color: var(--color-texto-claro); }
.detalle-cuerpo { margin-bottom: 1.5rem; }
.detalle-cuerpo h3 { margin-bottom: 0.5rem; }
.detalle-cuerpo p { white-space: pre-wrap; color: var(--color-texto-claro); line-height: 1.7; }
.detalle-info { display: flex; gap: 2rem; font-size: 0.9rem; color: var(--color-texto-claro); margin-bottom: 1.5rem; }
.detalle-acciones { display: flex; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--color-borde); }

.solicitantes-seccion { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-borde); }
.solicitantes-seccion h3 { margin-bottom: 1rem; }
.solicitante-card { padding: 1rem; margin-bottom: 0.75rem; border: 1px solid var(--color-borde); border-radius: var(--radio); background: var(--color-fondo); }
.solicitante-info { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-bottom: 0.5rem; }
.solicitante-info a { color: var(--color-texto-claro); font-size: 0.9rem; }
.solicitante-info a:hover { color: var(--color-primario); }
.solicitante-mensaje { font-style: italic; color: var(--color-texto-claro); font-size: 0.9rem; margin-bottom: 0.5rem; padding: 0.5rem; background: var(--color-blanco); border-radius: var(--radio); }
.solicitante-acciones { display: flex; gap: 0.5rem; margin-top: 0.5rem; }

.sidebar-usuario, .sidebar-valoraciones { margin-bottom: 1rem; }
.sidebar-usuario hr { margin: 1rem 0; border: none; border-top: 1px solid var(--color-borde); }
.usuario-nombre { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
.enlace-perfil { color: var(--color-texto); text-decoration: none; }
.enlace-perfil:hover { color: var(--color-primario); text-decoration: underline; }
.usuario-rating { color: var(--color-texto-claro); font-size: 0.9rem; }
.valoracion-item { padding: 0.75rem 0; border-bottom: 1px solid var(--color-borde); }
.valoracion-item:last-child { border-bottom: none; }
.valoracion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.valoracion-fecha { color: var(--color-texto-claro); font-size: 0.8rem; }

.fav-btn-detalle {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  margin-left: 0.5rem;
  vertical-align: middle;
  transition: transform 0.2s;
}
.fav-btn-detalle:hover { transform: scale(1.2); }

.detalle-imagen {
  width: calc(100% + 3rem);
  margin: 0 -1.5rem 1rem -1.5rem;
  max-height: 350px;
  object-fit: cover;
  border-radius: 0;
}

.sidebar-similars { margin-top: 1rem; }
.similar-item { padding: 0.6rem 0; border-bottom: 1px solid var(--color-borde); cursor: pointer; }
.similar-item:last-child { border-bottom: none; }
.similar-item:hover { color: var(--color-primario); }
.similar-item strong { display: block; font-size: 0.9rem; margin-bottom: 0.15rem; }
.similar-meta { font-size: 0.8rem; color: var(--color-texto-claro); }

.spinner { width: 40px; height: 40px; border: 3px solid var(--color-borde); border-top: 3px solid var(--color-primario); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.cargando, .vacio { text-align: center; padding: 2rem; color: var(--color-texto-claro); }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-contenido {
  width: 90%; max-width: 420px;
  padding: 1.5rem;
}
.rating-sub { color: var(--color-texto-claro); margin-bottom: 1rem; }
.rating-estrellas { display: flex; gap: 0.25rem; margin-bottom: 1rem; justify-content: center; }
.rating-estrellas .estrella {
  font-size: 2rem; cursor: pointer; background: none; border: none;
  color: var(--color-borde); transition: color 0.15s;
}
.rating-estrellas .estrella.activa { color: #f59e0b; }
.rating-estrellas .estrella:hover { color: #fbbf24; }
.rating-acciones { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }

.mapa-container { margin-bottom: 1rem; }
.mapa-container h3 { margin-bottom: 0.5rem; font-size: 1rem; }
.mapa-barrio { color: var(--color-texto-claro); font-size: 0.85rem; margin-bottom: 0.5rem; }
.mapa-direccion { color: var(--color-texto-claro); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 500; }
.mapa-leaflet { height: 250px; border-radius: var(--radio); overflow: hidden; z-index: 1; }
.boost-opciones { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0; }

@media (max-width: 768px) {
  .detalle-grid { grid-template-columns: 1fr; }
  .detalle-header { flex-direction: column; }
  .detalle-precio { text-align: left; margin-top: 0.5rem; }
}
</style>
