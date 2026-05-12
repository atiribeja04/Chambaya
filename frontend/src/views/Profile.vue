<template>
  <div class="pagina-perfil">
    <div class="contenedor">
      <div class="perfil-cabecera">
        <h1>Mi perfil</h1>
        <span class="badge-tipo" :class="usuario?.tipo">
          {{ usuario?.tipo === 'ofertante' ? 'Ofertante' : 'Demandante' }}
        </span>
      </div>

      <div v-if="error" class="alerta alerta-error">{{ error }}</div>
      <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>

      <div class="tabs">
        <button :class="['tab', { activa: tab === 'datos' }]" @click="tab = 'datos'">
          Datos personales
        </button>
        <button v-if="usuario?.tipo === 'ofertante'" :class="['tab', { activa: tab === 'ofertas' }]" @click="tab = 'ofertas'; cargarMisOfertas()">
          Mis ofertas ({{ misOfertas.length }})
        </button>
        <button :class="['tab', { activa: tab === 'solicitudes' }]" @click="tab = 'solicitudes'; cargarMisSolicitudes()">
          Mis postulaciones ({{ misSolicitudes.length }})
        </button>
        <button :class="['tab', { activa: tab === 'valoraciones' }]" @click="tab = 'valoraciones'; cargarValoraciones()">
          Valoraciones
        </button>
        <button :class="['tab', { activa: tab === 'favoritos' }]" @click="tab = 'favoritos'; cargarFavoritos()">
          Favoritos
        </button>
      </div>

      <!-- TAB: Datos personales -->
      <div v-if="tab === 'datos'" class="tab-contenido">
        <div class="tarjeta">
          <form @submit.prevent="actualizarPerfil">
            <div class="campo-formulario">
              <label for="nombre">Nombre</label>
              <input id="nombre" v-model="perfil.nombre" type="text" required />
            </div>
            <div class="campo-formulario">
              <label for="email">Email</label>
              <input id="email" :value="perfil.email" type="email" disabled style="opacity:0.6" />
            </div>
            <div class="campo-formulario">
              <label for="telefono">Telefono</label>
              <input id="telefono" v-model="perfil.telefono" type="text" placeholder="+34 600 000 000" />
            </div>
            <div class="campo-formulario">
              <label for="ubicacion">Ubicacion</label>
              <input id="ubicacion" v-model="perfil.ubicacion" type="text" placeholder="Madrid, Barcelona..." />
            </div>
            <div class="campo-formulario">
              <label for="descripcion">Sobre ti</label>
              <textarea id="descripcion" v-model="perfil.descripcion"
                placeholder="Breve descripcion sobre ti o tu negocio..."></textarea>
            </div>
            <div v-if="perfil.tipo === 'demandante'" class="demandante-fields">
              <hr />
              <h3>Perfil de candidato</h3>
              <div class="campo-formulario">
                <label for="skills">Habilidades (separadas por comas)</label>
                <input id="skills" v-model="perfil.skills" type="text" placeholder="Limpieza, Cocina, Cuidado de niños..." />
              </div>
              <div class="campo-formulario">
                <label for="disponibilidad">Disponibilidad</label>
                <input id="disponibilidad" v-model="perfil.disponibilidad" type="text" placeholder="Lunes a viernes de 9:00 a 18:00" />
              </div>
              <div class="campo-formulario">
                <label for="barrio">Barrio / Zona</label>
                <input id="barrio" v-model="perfil.barrio" type="text" placeholder="Ej: Salamanca, Lavapiés..." />
              </div>
              <div class="campo-formulario">
                <label for="perfil-direccion">Dirección</label>
                <input id="perfil-direccion" v-model="perfil.direccion" type="text" placeholder="Ej: Calle de Serrano 45" />
                <small class="nota-privacidad">NOTA: Esta información no será compartida públicamente. Solo una estimación.</small>
              </div>
              <div class="campo-formulario checkbox-field">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="perfil.en_busqueda" />
                  <span>Publicar mi perfil como candidato disponible</span>
                </label>
                <p class="ayuda-texto">Los ofertantes podran encontrar tu perfil y contactarte</p>
              </div>
            </div>
            <button type="submit" class="btn btn-primario" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </form>
          <hr />
          <form @submit.prevent="cambiarPassword" class="password-form">
            <h3>Cambiar contrasena</h3>
            <div class="campo-formulario">
              <label for="passActual">Contrasena actual</label>
              <input id="passActual" v-model="passActual" type="password" placeholder="••••••••" />
            </div>
            <div class="campo-formulario">
              <label for="passNueva">Nueva contrasena</label>
              <input id="passNueva" v-model="passNueva" type="password" placeholder="Min. 6 caracteres" />
            </div>
            <button type="submit" class="btn btn-outline btn-sm" :disabled="cambiandoPass">{{ cambiandoPass ? 'Cambiando...' : 'Cambiar contrasena' }}</button>
          </form>
          <div v-if="perfil.tipo === 'demandante' && perfil.en_busqueda" class="destacar-seccion">
            <hr />
            <h3>Destacar perfil</h3>
            <p class="ayuda-texto">Destaca tu perfil para aparecer primero en las busquedas</p>
            <div class="boost-opciones">
              <button v-for="d in opcionesBoost" :key="d.dias" @click="destacarPerfil(d.dias)" class="btn btn-outline btn-sm" :disabled="boostCargando">
                {{ d.label }} — {{ d.precio }}
              </button>
            </div>
            <div v-if="boostExito" class="alerta alerta-exito">{{ boostExito }}</div>
            <div v-if="boostError" class="alerta alerta-error">{{ boostError }}</div>
          </div>
          <p class="fecha-registro">Miembro desde {{ formatearFecha(perfil.creado_en) }}</p>
        </div>
      </div>

      <!-- TAB: Mis ofertas (solo ofertante) -->
      <div v-if="tab === 'ofertas'" class="tab-contenido">
        <div v-if="misOfertas.length === 0" class="vacio">No has publicado ofertas aun.</div>
        <div v-for="o in misOfertas" :key="o.id" class="oferta-perfil tarjeta">
          <div class="oferta-perfil-cabecera" @click="alternarOferta(o.id)">
            <div>
              <strong>{{ o.titulo }}</strong>
              <span :class="['estado', o.estado]">{{ estadoTexto(o.estado) }}</span>
            </div>
            <div class="oferta-perfil-meta">
              <small>{{ formatearFecha(o.creado_en) }}</small>
              <span class="solicitudes-count">{{ o.solicitudes?.length || 0 }} solicitudes</span>
              <span class="flecha">{{ ofertaAbierta === o.id ? '▲' : '▼' }}</span>
            </div>
          </div>

          <div v-if="ofertaAbierta === o.id" class="oferta-perfil-cuerpo">
            <p class="oferta-descripcion">{{ o.descripcion }}</p>
            <router-link :to="`/ofertas/${o.id}`" class="btn btn-outline btn-sm">Ver oferta</router-link>

            <div v-if="o.solicitudes?.length" class="solicitudes-lista">
              <h4>Solicitantes ({{ o.solicitudes.length }})</h4>
              <div v-for="s in o.solicitudes" :key="s.id" class="solicitante-card">
                <div class="solicitante-info">
                  <strong><router-link :to="`/perfil/${s.usuario_id}`" class="enlace-perfil">{{ s.nombre }}</router-link></strong>
                  <a v-if="s.email" :href="'mailto:'+s.email">✉️ {{ s.email }}</a>
                  <a v-if="s.telefono" :href="'tel:'+s.telefono">📞 {{ s.telefono }}</a>
                </div>
                <p v-if="s.mensaje" class="solicitante-mensaje">"{{ s.mensaje }}"</p>
                <span :class="['badge', s.estado === 'aceptada' ? 'badge-verde' : s.estado === 'rechazada' ? 'badge-rojo' : 'badge-azul']">
                  {{ s.estado === 'pendiente' ? 'Pendiente' : s.estado === 'aceptada' ? 'Aceptada' : 'Rechazada' }}
                </span>
                <div v-if="s.estado === 'pendiente'" class="solicitante-acciones">
                  <button @click="responderSolicitud(o.id, s.id, 'aceptada')" class="btn btn-secundario btn-sm">Aceptar</button>
                  <button @click="aceptarYCompletar(o.id, s.id)" class="btn btn-primario btn-sm">Aceptar & completar</button>
                  <button @click="responderSolicitud(o.id, s.id, 'rechazada')" class="btn btn-peligro btn-sm">Rechazar</button>
                </div>
              </div>
            </div>
            <div v-else class="vacio">No hay solicitantes para esta oferta.</div>
          </div>
        </div>
      </div>

      <!-- TAB: Mis postulaciones -->
      <div v-if="tab === 'solicitudes'" class="tab-contenido">
        <div v-if="misSolicitudes.length === 0" class="vacio">No te has postulado a ninguna oferta aun.</div>
        <div v-for="s in misSolicitudes" :key="s.id" class="solicitud-card tarjeta">
          <div class="solicitud-header">
            <router-link :to="`/ofertas/${s.oferta_id}`" class="solicitud-titulo">{{ s.oferta_titulo }}</router-link>
            <span :class="['badge', s.estado === 'aceptada' ? 'badge-verde' : s.estado === 'rechazada' ? 'badge-rojo' : 'badge-azul']">
              {{ s.estado === 'pendiente' ? 'Pendiente' : s.estado === 'aceptada' ? 'Aceptada' : 'Rechazada' }}
            </span>
          </div>
          <div class="solicitud-body">
            <p class="solicitud-ofertante">
              Ofertante: <router-link :to="`/perfil/${s.ofertante_id}`">{{ s.ofertante_nombre }}</router-link>
            </p>
            <p v-if="s.mensaje" class="solicitud-mensaje">"{{ s.mensaje }}"</p>
            <div class="solicitud-meta">
              <small>{{ formatearFecha(s.creado_en) }}</small>
              <span :class="['badge', s.oferta_estado === 'activa' ? 'badge-verde' : s.oferta_estado === 'completada' ? 'badge-azul' : 'badge-rojo']">
                {{ s.oferta_estado === 'activa' ? 'Activa' : s.oferta_estado === 'completada' ? 'Completada' : 'Cancelada' }}
              </span>
              <button v-if="s.estado === 'aceptada' && s.oferta_estado === 'completada' && !s.ya_valorado"
                @click="abrirRatingOfertante(s)" class="btn btn-primario btn-sm">
                Valorar ofertante
              </button>
              <small v-else-if="s.ya_valorado" class="texto-valorado">✔ Ya valorado</small>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: Favoritos -->
      <div v-if="tab === 'favoritos'" class="tab-contenido">
        <div v-if="favoritos.length === 0" class="vacio">No tienes ofertas guardadas.</div>
        <div v-for="o in favoritos" :key="o.id" class="oferta-fav tarjeta" @click="$router.push(`/ofertas/${o.id}`)">
          <div class="fav-header">
            <strong>{{ o.titulo }}</strong>
            <span class="badge badge-azul">{{ o.categoria_nombre || 'Sin categoria' }}</span>
          </div>
          <p class="fav-meta">{{ o.usuario_nombre }} · {{ o.ubicacion || 'Sin ubicacion' }} · {{ formatearPrecio(o.precio, o.tipo_precio) }}</p>
        </div>
      </div>

      <!-- TAB: Valoraciones -->
      <div v-if="tab === 'valoraciones'" class="tab-contenido">
        <div class="valoraciones-stats tarjeta" v-if="valoracionesStats">
          <div class="stats-media">
            <span class="stats-numero">{{ Number(valoracionesStats.media).toFixed(1) }}</span>
            <span class="stats-estrellas">{{ '⭐'.repeat(Math.round(valoracionesStats.media)) }}</span>
          </div>
          <p>{{ valoracionesStats.total }} valoraciones en total</p>
        </div>

        <div v-if="valoraciones.length === 0" class="vacio">Aun no tienes valoraciones.</div>
        <div v-for="v in valoraciones" :key="v.id" class="valoracion-item tarjeta">
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
  </div>
</template>

<script>
import { useAuth, logout } from '../store/auth.js'

const API = '/api'

export default {
  name: 'ProfileView',
  setup() {
    return { auth: useAuth() }
  },
  data() {
    return {
      tab: 'datos',
      perfil: { nombre: '', email: '', telefono: '', ubicacion: '', descripcion: '', tipo: '', creado_en: '', direccion: '' },
      misOfertas: [],
      misSolicitudes: [],
      valoraciones: [],
      valoracionesStats: null,
      favoritos: [],
      ofertaAbierta: null,
      error: '',
      exito: '',
      guardando: false,
      passActual: '',
      passNueva: '',
      cambiandoPass: false,
      ratingData: null,
      ratingPunt: 0,
      ratingComent: '',
      opcionesBoost: [
        { dias: 2, label: '2 días', precio: 'Gratis' },
        { dias: 7, label: '7 días', precio: 'Gratis' },
        { dias: 14, label: '14 días', precio: 'Gratis' },
        { dias: 30, label: '30 días', precio: 'Gratis' }
      ],
      boostCargando: false,
      boostExito: '',
      boostError: ''
    }
  },
  watch: {
    exito(v) { if (v) setTimeout(() => this.exito = '', 4000) },
    error(v) { if (v) setTimeout(() => this.error = '', 4000) }
  },
  computed: {
    token() { return this.auth.token },
    usuario() { return this.auth.usuario }
  },
  mounted() {
    this.cargarPerfil()
    if (this.usuario?.tipo === 'ofertante') this.cargarMisOfertas()
  },
  methods: {
    async cargarPerfil() {
      try {
        const res = await fetch(`${API}/auth/perfil`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const data = await res.json()
        if (data.usuario) this.perfil = data.usuario
      } catch (e) { console.error(e) }
    },
    async cargarMisOfertas() {
      try {
        const res = await fetch(`${API}/ofertas/mis-ofertas`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const data = await res.json()
        this.misOfertas = data.ofertas || []
      } catch (e) { console.error(e) }
    },
    async cargarMisSolicitudes() {
      try {
        const res = await fetch(`${API}/solicitudes/mis-solicitudes`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const data = await res.json()
        this.misSolicitudes = data.solicitudes || []
      } catch (e) { console.error(e) }
    },
    async cargarValoraciones() {
      if (this.valoraciones.length) return
      try {
        const res = await fetch(`${API}/valoraciones/usuario/${this.usuario.id}`)
        const data = await res.json()
        this.valoraciones = data.valoraciones || []
        this.valoracionesStats = data.estadisticas || null
      } catch (e) { console.error(e) }
    },
    alternarOferta(id) {
      this.ofertaAbierta = this.ofertaAbierta === id ? null : id
    },
    async responderSolicitud(ofertaId, solicitudId, estado) {
      try {
        await fetch(`${API}/ofertas/${ofertaId}/solicitudes/${solicitudId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado })
        })
        this.cargarMisOfertas()
      } catch (e) { console.error(e) }
    },
    async aceptarYCompletar(ofertaId, solicitudId) {
      if (!confirm('Aceptar esta solicitud y marcar la oferta como completada?')) return
      try {
        await fetch(`${API}/ofertas/${ofertaId}/solicitudes/${solicitudId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado: 'aceptada' })
        })
        await fetch(`${API}/ofertas/${ofertaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado: 'completada' })
        })
        this.cargarMisOfertas()
        const oferta = this.misOfertas.find(o => o.id === ofertaId)
        const postulante = oferta?.solicitudes?.find(s => s.id === solicitudId)
        if (postulante) {
          this.ratingData = { id: postulante.id, nombre: postulante.nombre, usuarioId: postulante.usuario_id, ofertaId }
          this.ratingPunt = 0
          this.ratingComent = ''
        }
      } catch (e) { console.error(e) }
    },
    async enviarRating() {
      if (!this.ratingPunt) return
      try {
        const res = await fetch(`${API}/valoraciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({
            oferta_id: this.ratingData.ofertaId,
            usuario_destino_id: this.ratingData.usuarioId,
            puntuacion: this.ratingPunt,
            comentario: this.ratingComent || undefined
          })
        })
        if (res.ok) {
          this.exito = 'Valoracion enviada correctamente'
          this.ratingData = null
          if (this.tab === 'solicitudes') this.cargarMisSolicitudes()
        } else {
          const err = await res.json()
          this.error = err.error || 'Error al enviar valoracion'
        }
      } catch (e) {
        this.error = 'Error al enviar valoracion'
        console.error(e)
      }
    },
    abrirRatingOfertante(s) {
      this.ratingData = {
        nombre: s.ofertante_nombre,
        usuarioId: s.ofertante_id,
        ofertaId: s.oferta_id
      }
      this.ratingPunt = 0
      this.ratingComent = ''
    },
    async cargarFavoritos() {
      if (this.favoritos.length) return
      try {
        const res = await fetch(`${API}/ofertas/mis-favoritos`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const data = await res.json()
        this.favoritos = data.ofertas || []
      } catch (e) { console.error(e) }
    },
    async cambiarPassword() {
      this.error = ''; this.exito = ''; this.cambiandoPass = true
      try {
        const res = await fetch(`${API}/auth/cambiar-password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ passwordActual: this.passActual, passwordNueva: this.passNueva })
        })
        const data = await res.json()
        if (!res.ok) { this.error = data.error; return }
        this.exito = data.mensaje
        this.passActual = ''; this.passNueva = ''
      } catch (e) { this.error = 'Error de conexion' }
      finally { this.cambiandoPass = false }
    },
    formatearPrecio(precio, tipo) {
      if (!precio) return 'A convenir'
      const etiquetas = { por_hora: '/hora', por_dia: '/dia', fijo: '' }
      return `${precio}€${etiquetas[tipo] || ''}`
    },
    async actualizarPerfil() {
      this.error = ''; this.exito = ''; this.guardando = true
      try {
        const res = await fetch(`${API}/auth/perfil`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({
            nombre: this.perfil.nombre,
            telefono: this.perfil.telefono,
            ubicacion: this.perfil.ubicacion,
            descripcion: this.perfil.descripcion,
            skills: this.perfil.skills,
            disponibilidad: this.perfil.disponibilidad,
            en_busqueda: this.perfil.en_busqueda ? 1 : 0,
            barrio: this.perfil.barrio,
            direccion: this.perfil.direccion
          })
        })
        const data = await res.json()
        if (!res.ok) { this.error = data.error; return }
        this.exito = 'Perfil actualizado correctamente'
        if (data.usuario) {
          this.perfil = data.usuario
          logout()
          logout(data.usuario, this.token)
        }
      } catch (e) { this.error = 'Error de conexion' }
      finally { this.guardando = false }
    },
    async destacarPerfil(duracion) {
      this.boostCargando = true
      this.boostExito = ''
      this.boostError = ''
      try {
        const res = await fetch(`${API}/destacados`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ tipo: 'demandante', ref_id: this.usuario.id, duracion })
        })
        const data = await res.json()
        if (res.ok) {
          this.boostExito = `Perfil destacado por ${duracion} días`
        } else {
          this.boostError = data.error || 'Error al destacar'
        }
      } catch (e) { this.boostError = 'Error de conexión' }
      finally { this.boostCargando = false }
    },
    formatearFecha(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleDateString('es-ES')
    },
    estadoTexto(e) {
      const map = { activa: 'Activa', completada: 'Completada', cancelada: 'Cancelada' }
      return map[e] || e
    }
  }
}
</script>

<style scoped>
.perfil-cabecera {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.badge-tipo {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
}

.badge-tipo.ofertante { background: #dbeafe; color: #1e40af; }
.badge-tipo.demandante { background: #dcfce7; color: #166534; }

.tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 1.5rem;
  background: var(--color-fondo);
  border-radius: var(--radio);
  padding: 4px;
  overflow-x: auto;
}

.tab {
  padding: 0.6rem 1.2rem;
  border: none;
  background: transparent;
  border-radius: var(--radio);
  cursor: pointer;
  font-weight: 500;
  color: var(--color-texto-claro);
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 0.95rem;
}

.tab.activa {
  background: var(--color-blanco);
  color: var(--color-texto);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.tab-contenido { max-width: 720px; }

.oferta-perfil { margin-bottom: 1rem; }

.oferta-perfil-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
}

.oferta-perfil-cabecera:hover { opacity: 0.8; }

.oferta-perfil-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-texto-claro);
}

.solicitudes-count {
  font-size: 0.85rem;
  background: var(--color-fondo);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.flecha { font-size: 0.8rem; }

.oferta-perfil-cuerpo {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-borde);
}

.oferta-descripcion {
  color: var(--color-texto-claro);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  white-space: pre-wrap;
}

.solicitudes-lista { margin-top: 1rem; }

.solicitudes-lista h4 { margin-bottom: 0.75rem; }

.solicitante-card {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio);
  background: var(--color-fondo);
}

.solicitante-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin-bottom: 0.25rem;
}
.solicitante-info .enlace-perfil { color: var(--color-texto); font-weight: 600; text-decoration: none; }
.solicitante-info .enlace-perfil:hover { color: var(--color-primario); text-decoration: underline; }

.solicitante-info a { color: var(--color-texto-claro); font-size: 0.9rem; }
.solicitante-info a:hover { color: var(--color-primario); }

.solicitante-mensaje {
  font-style: italic;
  color: var(--color-texto-claro);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  padding: 0.4rem;
  background: var(--color-blanco);
  border-radius: var(--radio);
}

.solicitante-acciones {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.estado {
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-left: 0.5rem;
}

.estado.activa { background-color: #dcfce7; color: #166534; }
.estado.completada { background-color: #dbeafe; color: #1e40af; }
.estado.cancelada { background-color: #fef2f2; color: #991b1b; }

.valoraciones-stats { text-align: center; margin-bottom: 1rem; }
.stats-media { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.25rem; }
.stats-numero { font-size: 2rem; font-weight: 800; color: var(--color-primario); }
.stats-estrellas { font-size: 1.3rem; }

.valoracion-item { margin-bottom: 0.75rem; }
.valoracion-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
.valoracion-fecha { display: block; color: var(--color-texto-claro); font-size: 0.8rem; margin-top: 0.25rem; }
.valoracion-item small { color: var(--color-texto-claro); font-size: 0.85rem; }

.fecha-registro { color: var(--color-texto-claro); font-size: 0.85rem; margin-top: 1rem; }

.password-form { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-borde); }
.password-form h3 { margin-bottom: 1rem; font-size: 1rem; }

.oferta-fav { cursor: pointer; margin-bottom: 0.75rem; }
.oferta-fav:hover { box-shadow: var(--sombra-md); }
.fav-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
.fav-meta { color: var(--color-texto-claro); font-size: 0.85rem; }

.solicitud-card { margin-bottom: 0.75rem; padding: 1rem; }
.solicitud-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.solicitud-titulo { font-weight: 600; color: var(--color-texto); text-decoration: none; }
.solicitud-titulo:hover { color: var(--color-primario); text-decoration: underline; }
.solicitud-body { color: var(--color-texto-claro); font-size: 0.9rem; }
.solicitud-ofertante { margin-bottom: 0.25rem; }
.solicitud-ofertante a { color: var(--color-texto-claro); }
.solicitud-ofertante a:hover { color: var(--color-primario); }
.solicitud-mensaje { font-style: italic; padding: 0.4rem; background: var(--color-fondo); border-radius: var(--radio); margin-bottom: 0.5rem; }
.solicitud-meta { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; }
.texto-valorado { color: var(--color-verde, #166534); font-weight: 500; }

.demandante-fields { margin-top: 1rem; }
.demandante-fields h3 { margin-bottom: 1rem; font-size: 1rem; }
.checkbox-field { margin-top: 0.5rem; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.95rem; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
.ayuda-texto { color: var(--color-texto-claro); font-size: 0.8rem; margin-top: 0.25rem; }
.nota-privacidad { display: block; margin-top: 0.3rem; font-size: 0.8rem; color: var(--color-texto-claro); font-style: italic; }
.destacar-seccion { margin-top: 1.5rem; }
.destacar-seccion h3 { margin-bottom: 0.5rem; font-size: 1rem; }
.boost-opciones { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0; }

.vacio { color: var(--color-texto-claro); text-align: center; padding: 2rem; }

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
</style>
