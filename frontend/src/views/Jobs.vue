<template>
  <div class="pagina-ofertas">
    <div class="contenedor">
      <h1>Buscar trabajos</h1>
      <p class="subtitulo-pagina">Encuentra el trabajo temporal perfecto para ti</p>

      <!-- Filtros -->
      <div class="filtros tarjeta">
        <div class="filtros-grid">
          <div class="campo-formulario">
            <label for="busqueda">Que buscas?</label>
            <input id="busqueda" v-model="filtros.busqueda" type="text" placeholder="Limpieza, mudanzas..." @input="buscar" />
          </div>
          <div class="campo-formulario">
            <label for="categoria">Categoria</label>
            <select id="categoria" v-model="filtros.categoria" @change="buscar">
              <option value="">Todas las categorias</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>
          <div class="campo-formulario">
            <label for="ubicacion">Ubicacion</label>
            <input id="ubicacion" v-model="filtros.ubicacion" type="text" placeholder="Madrid, Barcelona..." @input="buscar" />
          </div>
          <div class="campo-formulario">
            <label for="barrio">Barrio</label>
            <input id="barrio" v-model="filtros.barrio" type="text" placeholder="Salamanca, Lavapiés..." @input="buscar" />
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div v-if="cargando" class="cargando">Buscando ofertas...</div>
      <div v-else-if="ofertas.length === 0" class="vacio">
        <p>No se encontraron ofertas con esos criterios.</p>
      </div>
      <div v-else class="resultados-count">{{ mostrarTotal }} ofertas encontradas</div>

      <div class="grid-2">
        <div v-for="oferta in ofertas" :key="oferta.id" class="tarjeta oferta-tarjeta"
             @click="$router.push(`/ofertas/${oferta.id}`)">
          <div v-if="oferta.destacado_hasta" class="destacado-badge">⭐ DESTACADO</div>
          <img v-if="oferta.imagen" :src="oferta.imagen" class="oferta-imagen" alt="" />
          <div class="oferta-header">
            <span class="oferta-categoria">{{ oferta.categoria_nombre || 'Sin categoria' }}</span>
            <span class="oferta-precio">{{ formatearPrecio(oferta.precio, oferta.tipo_precio) }}</span>
          </div>
          <button v-if="auth.token" :class="['fav-btn', { activo: oferta.favorito }]" @click.stop="toggleFavorito(oferta)">
            {{ oferta.favorito ? '❤️' : '🤍' }}
          </button>
          <h3 class="oferta-titulo">{{ oferta.titulo }}</h3>
          <p class="oferta-descripcion">{{ truncarTexto(oferta.descripcion, 150) }}</p>
          <div class="oferta-footer">
            <span>👤 <router-link :to="`/perfil/${oferta.usuario_id}`" class="enlace-perfil" @click.stop>{{ oferta.usuario_nombre }}</router-link></span>
            <span>📍 {{ oferta.barrio || oferta.ubicacion || oferta.usuario_ubicacion || 'N/E' }}</span>
            <span>⭐ {{ Number(oferta.puntuacion_media).toFixed(1) }} ({{ oferta.total_valoraciones }})</span>
          </div>
        </div>
      </div>

      <!-- Paginacion -->
      <div v-if="totalPages > 1" class="paginacion">
        <button @click="irPagina(pagina - 1)" :disabled="pagina <= 1" class="btn btn-outline btn-sm">Anterior</button>
        <span class="pagina-info">Pagina {{ pagina }} de {{ totalPages }}</span>
        <button @click="irPagina(pagina + 1)" :disabled="pagina >= totalPages" class="btn btn-outline btn-sm">Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../store/auth.js'

const API = '/api'

export default {
  name: 'JobsView',
  setup() {
    return { auth: useAuth() }
  },
  data() {
    return {
      ofertas: [],
      categorias: [],
      cargando: true,
      pagina: 1,
      totalPages: 1,
      mostrarTotal: 0,
      filtros: {
        busqueda: '',
        categoria: '',
        ubicacion: '',
        barrio: ''
      },
      favoritosIds: new Set(),
      timeoutId: null
    }
  },
  mounted() {
    this.cargarCategorias()
    const query = this.$route.query
    if (query.categoria) this.filtros.categoria = query.categoria
    if (query.busqueda) this.filtros.busqueda = query.busqueda
    if (this.auth.token) this.cargarIdsFavoritos()
    this.buscar()
  },
  methods: {
    async cargarCategorias() {
      try {
        const res = await fetch(`${API}/ofertas/categorias`)
        const data = await res.json()
        this.categorias = data.categorias || []
      } catch (e) { console.error('Error cargando categorias:', e) }
    },
    async cargarIdsFavoritos() {
      try {
        const res = await fetch(`${API}/ofertas/mis-favoritos`, {
          headers: { 'Authorization': `Bearer ${this.auth.token}` }
        })
        const data = await res.json()
        this.favoritosIds = new Set((data.ofertas || []).map(o => o.id))
      } catch (e) {}
    },
    async toggleFavorito(oferta) {
      try {
        if (oferta.favorito) {
          await fetch(`${API}/ofertas/${oferta.id}/favorito`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${this.auth.token}` }
          })
          oferta.favorito = false
        } else {
          await fetch(`${API}/ofertas/${oferta.id}/favorito`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${this.auth.token}` }
          })
          oferta.favorito = true
        }
      } catch (e) { console.error(e) }
    },
    async buscar(paginaNueva) {
      this.cargando = true
      if (paginaNueva !== undefined) this.pagina = paginaNueva
      if (this.timeoutId) clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(async () => {
        try {
          const params = new URLSearchParams()
          if (this.filtros.busqueda) params.set('busqueda', this.filtros.busqueda)
          if (this.filtros.categoria) params.set('categoria', this.filtros.categoria)
          if (this.filtros.ubicacion) params.set('ubicacion', this.filtros.ubicacion)
          if (this.filtros.barrio) params.set('barrio', this.filtros.barrio)
          params.set('page', String(this.pagina))
          params.set('limit', '12')
          const res = await fetch(`${API}/ofertas?${params}`)
          const data = await res.json()
          this.ofertas = (data.ofertas || []).map(o => ({ ...o, favorito: this.favoritosIds.has(o.id) }))
          this.totalPages = data.totalPages || 1
          this.mostrarTotal = data.total || this.ofertas.length
        } catch (e) { console.error('Error en busqueda:', e) }
        finally { this.cargando = false }
      }, 300)
    },
    irPagina(pag) {
      if (pag < 1 || pag > this.totalPages) return
      this.buscar(pag)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    formatearPrecio(precio, tipo) {
      if (!precio) return 'A convenir'
      const etiquetas = { por_hora: '/hora', por_dia: '/dia', fijo: '' }
      return `${precio}€${etiquetas[tipo] || ''}`
    },
    truncarTexto(texto, max) {
      if (!texto || texto.length <= max) return texto
      return texto.substring(0, max) + '...'
    }
  }
}
</script>

<style scoped>
.pagina-ofertas {
  padding-top: 1rem;
}

.pagina-ofertas h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.subtitulo-pagina {
  color: var(--color-texto-claro);
  margin-bottom: 1.5rem;
}

.filtros {
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-borde);
}

.filtros-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 1rem;
}

.filtros-grid .campo-formulario {
  margin-bottom: 0;
}

.oferta-tarjeta {
  cursor: pointer;
  border: 1px solid var(--color-borde);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.fav-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--color-blanco);
  border: 1px solid var(--color-borde);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  z-index: 2;
}

.fav-btn:hover { transform: scale(1.15); }
.fav-btn.activo { border-color: #ef4444; background: #fef2f2; }

.oferta-tarjeta { position: relative; }

.destacado-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #f59e0b;
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 0 var(--radio) 0 8px;
  font-weight: 700;
  font-size: 0.75rem;
  z-index: 3;
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
  flex-grow: 1;
}

.oferta-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--color-texto-claro);
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-borde);
}

.oferta-footer .enlace-perfil { color: var(--color-texto-claro); text-decoration: none; }
.oferta-footer .enlace-perfil:hover { color: var(--color-primario); text-decoration: underline; }

.oferta-imagen {
  width: calc(100% + 3rem);
  margin: -1.5rem -1.5rem 0.75rem -1.5rem;
  height: 160px;
  object-fit: cover;
  border-radius: var(--radio) var(--radio) 0 0;
}

.resultados-count {
  margin-bottom: 1rem;
  color: var(--color-texto-claro);
  font-size: 0.9rem;
  font-weight: 500;
}

.cargando, .vacio {
  text-align: center;
  padding: 4rem;
  color: var(--color-texto-claro);
}

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

.paginacion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-borde);
}
.pagina-info { font-size: 0.9rem; color: var(--color-texto-claro); }

@media (max-width: 768px) {
  .filtros-grid { grid-template-columns: 1fr; }
}
</style>
