<template>
  <div class="pagina-candidatos">
    <div class="contenedor">
      <h1>Buscar candidatos</h1>
      <p class="subtitulo-pagina">Encuentra profesionales disponibles para tu trabajo</p>

      <div class="filtros tarjeta">
        <div class="campo-formulario">
          <label for="busqueda">Que buscas?</label>
          <input id="busqueda" v-model="busqueda" type="text" placeholder="Limpieza, informatica, jardineria..." @input="buscarConDelay" />
        </div>
      </div>

      <div v-if="cargando" class="cargando">Buscando candidatos...</div>
      <div v-else-if="demandantes.length === 0" class="vacio">
        <p>No se encontraron candidatos con esos criterios.</p>
      </div>
      <div v-else class="resultados-count">{{ total }} candidatos encontrados</div>

      <div class="grid-2">
        <div v-for="d in demandantes" :key="d.id" class="tarjeta candidato-card" @click="$router.push(`/perfil/${d.id}`)">
          <div v-if="d.destacado_hasta" class="destacado-badge">⭐ DESTACADO</div>
          <div class="candidato-header">
            <div class="candidato-avatar">
              <img v-if="d.foto_perfil" :src="d.foto_perfil" class="avatar-img" alt="" />
              <span v-else class="avatar-iniciales">{{ iniciales(d.nombre) }}</span>
            </div>
            <div class="candidato-info">
              <h3 class="candidato-nombre">{{ d.nombre }}</h3>
              <span class="badge badge-verde">Disponible</span>
              <span class="candidato-rating">⭐ {{ Number(d.puntuacion_media).toFixed(1) }} ({{ d.total_valoraciones }})</span>
            </div>
          </div>
          <p v-if="d.skills" class="candidato-skills">{{ d.skills }}</p>
          <p class="candidato-barrio" v-if="d.barrio">📍 {{ d.barrio }}, {{ d.ubicacion }}</p>
          <p v-if="d.disponibilidad" class="candidato-disponibilidad">🕐 {{ d.disponibilidad }}</p>
          <div class="candidato-footer">
            <span class="btn btn-primario btn-sm" @click.stop="$router.push(`/perfil/${d.id}`)">Ver perfil</span>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="paginacion">
        <button @click="irPagina(pagina - 1)" :disabled="pagina <= 1" class="btn btn-outline btn-sm">Anterior</button>
        <span class="pagina-info">Pagina {{ pagina }} de {{ totalPages }}</span>
        <button @click="irPagina(pagina + 1)" :disabled="pagina >= totalPages" class="btn btn-outline btn-sm">Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script>
const API = '/api'

export default {
  name: 'CandidatosView',
  data() {
    return {
      demandantes: [],
      cargando: true,
      busqueda: '',
      pagina: 1,
      totalPages: 1,
      total: 0,
      timeoutId: null
    }
  },
  mounted() { this.buscar() },
  methods: {
    iniciales(nombre) { return nombre ? nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : '??' },
    buscarConDelay() {
      if (this.timeoutId) clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        this.pagina = 1
        this.buscar(1)
      }, 300)
    },
    async buscar(paginaNueva) {
      this.cargando = true
      if (paginaNueva !== undefined) this.pagina = paginaNueva
      try {
        const params = new URLSearchParams()
        if (this.busqueda) params.set('busqueda', this.busqueda)
        params.set('page', String(this.pagina))
        params.set('limit', '12')
        const res = await fetch(`${API}/demandantes?${params}`)
        const data = await res.json()
        this.demandantes = data.demandantes || []
        this.totalPages = data.totalPages || 1
        this.total = data.total || 0
      } catch (e) { console.error(e) }
      finally { this.cargando = false }
    },
    irPagina(pag) {
      if (pag < 1 || pag > this.totalPages) return
      this.buscar(pag)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.pagina-candidatos {
  padding-top: 1rem;
}

.pagina-candidatos h1 {
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

.candidato-card {
  position: relative;
  cursor: pointer;
  border: 1px solid var(--color-borde);
  padding: 1.25rem;
}

.candidato-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--sombra-lg);
  border-color: var(--color-primario-claro);
}

.destacado-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0 8px 0 8px;
  font-weight: 700;
  font-size: 0.75rem;
}

.candidato-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.candidato-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-primario);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.candidato-info {
  flex: 1;
}

.candidato-nombre {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.candidato-skills {
  color: var(--color-texto-claro);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.candidato-barrio, .candidato-disponibilidad {
  color: var(--color-texto-claro);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.candidato-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-borde);
}

.candidato-rating {
  color: var(--color-texto-claro);
  font-size: 0.8rem;
  display: block;
  margin-top: 0.25rem;
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

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.pagina-info {
  font-size: 0.9rem;
  color: var(--color-texto-claro);
}

@media (max-width: 768px) {
  .grid-2 { grid-template-columns: 1fr; }
}
</style>

<!-- TODO: filtros avanzados de búsqueda -->
