<template>
  <div class="pagina-crear">
    <div class="contenedor">
      <div class="formulario-oferta tarjeta">
        <h1>{{ esEdicion ? 'Editar oferta' : 'Publicar nueva oferta' }}</h1>
        <p class="subtitulo">{{ esEdicion ? 'Modifica los datos de tu oferta' : 'Describe el trabajo que necesitas' }}</p>

        <div v-if="error" class="alerta alerta-error">{{ error }}</div>
        <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>

        <form @submit.prevent="guardar">
          <div class="campo-formulario">
            <label for="titulo">Titulo del trabajo *</label>
            <input id="titulo" v-model="form.titulo" type="text" placeholder="Ej: Necesito ayuda con mudanza" required />
          </div>

          <div class="campo-formulario">
            <label for="descripcion">Descripcion detallada *</label>
            <textarea id="descripcion" v-model="form.descripcion"
              placeholder="Describe el trabajo, horario, requisitos, etc..." required></textarea>
          </div>

          <div class="campo-formulario">
            <label for="categoria">Categoria</label>
            <select id="categoria" v-model="form.categoria_id">
              <option value="">Seleccionar categoria</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
            </select>
          </div>

            <div class="grid-2">
              <div class="campo-formulario">
                <label for="barrio">Barrio / Zona</label>
                <input id="barrio" v-model="form.barrio" type="text" placeholder="Ej: Salamanca, Lavapiés..." />
              </div>
              <div class="campo-formulario">
                <label for="ubicacion">Zona</label>
                <input id="ubicacion" v-model="form.ubicacion" type="text" placeholder="Ej: Barrio X - Madrid" />
              </div>
            </div>

            <div class="campo-formulario">
              <label for="direccion">Dirección</label>
              <input id="direccion" v-model="form.direccion" type="text" placeholder="Ej: Calle de Serrano 45" />
              <small class="nota-privacidad">NOTA: Esta información no será compartida públicamente. Solo una estimación.</small>
              <button type="button" @click="obtenerUbicacion" class="btn btn-xs btn-outline geo-btn" :disabled="geoBuscando">
                {{ geoBuscando ? 'Buscando...' : '📍 Obtener ubicación en el mapa' }}
              </button>
              <div v-if="geoLat && geoPreview" class="geo-preview" ref="geoMapa"></div>
            </div>

          <div class="grid-2">
            <div class="campo-formulario">
              <label for="precio">Precio (€)</label>
              <input id="precio" v-model="form.precio" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>

            <div class="campo-formulario">
              <label for="tipo_precio">Tipo de precio</label>
              <select id="tipo_precio" v-model="form.tipo_precio">
                <option value="fijo">Precio fijo</option>
                <option value="por_hora">Por hora</option>
                <option value="por_dia">Por dia</option>
              </select>
            </div>
          </div>

          <div class="campo-formulario">
            <label for="imagen">Imagen (opcional)</label>
            <input id="imagen" type="file" accept="image/*" @change="onImagenChange" class="input-file" />
            <div v-if="imagenPreview" class="imagen-preview">
              <img :src="imagenPreview" alt="Preview" />
              <button type="button" @click="eliminarImagen" class="btn btn-xs btn-peligro">✕</button>
            </div>
          </div>

          <div class="form-acciones">
            <router-link to="/" class="btn btn-outline">Cancelar</router-link>
            <button type="submit" class="btn btn-primario" :disabled="guardando">
              {{ guardando ? 'Guardando...' : (esEdicion ? 'Actualizar oferta' : 'Publicar oferta') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
const API = '/api'

export default {
  name: 'CreateJobView',
  data() {
    return {
      form: { titulo: '', descripcion: '', categoria_id: '', ubicacion: '', barrio: '', direccion: '', precio: '', tipo_precio: 'fijo' },
      categorias: [],
      error: '',
      exito: '',
      guardando: false,
      esEdicion: false,
      imagenFile: null,
      imagenPreview: null,
      geoBuscando: false,
      geoLat: null,
      geoLng: null,
      geoPreview: false
    }
  },
  computed: {
    token() { return localStorage.getItem('token') }
  },
  mounted() {
    this.cargarCategorias()
    const id = this.$route.query.id
    if (id) { this.esEdicion = true; this.cargarOferta(id) }
  },
  methods: {
    onImagenChange(e) {
      const file = e.target.files[0]
      if (!file) return
      this.imagenFile = file
      this.imagenPreview = URL.createObjectURL(file)
    },
    eliminarImagen() {
      this.imagenFile = null
      this.imagenPreview = null
      this.$el.querySelector('#imagen').value = ''
    },
    async cargarCategorias() {
      try {
        const res = await fetch(`${API}/ofertas/categorias`)
        const data = await res.json()
        this.categorias = data.categorias || []
      } catch (e) { console.error(e) }
    },
    async cargarOferta(id) {
      try {
        const res = await fetch(`${API}/ofertas/${id}`)
        const data = await res.json()
        if (data.oferta) {
          this.form.titulo = data.oferta.titulo
          this.form.descripcion = data.oferta.descripcion
          this.form.categoria_id = data.oferta.categoria_id || ''
          this.form.ubicacion = data.oferta.ubicacion || ''
          this.form.barrio = data.oferta.barrio || ''
          this.form.direccion = data.oferta.direccion || ''
          this.form.precio = data.oferta.precio || ''
          this.form.tipo_precio = data.oferta.tipo_precio || 'fijo'
          if (data.oferta.imagen) this.imagenPreview = data.oferta.imagen
        }
      } catch (e) { console.error(e) }
    },
    async obtenerUbicacion() {
      this.geoBuscando = true
      this.geoLat = null
      this.geoLng = null
      this.geoPreview = false
      try {
        const res = await fetch(`${API}/geocode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            direccion: this.form.direccion,
            barrio: this.form.barrio,
            ubicacion: this.form.ubicacion
          })
        })
        const data = await res.json()
        if (data.lat && data.lng) {
          this.geoLat = data.lat
          this.geoLng = data.lng
          this.geoPreview = true
          this.$nextTick(() => this.mostrarMapa())
        } else {
          this.error = 'No se pudo determinar la ubicación. Revisa los datos ingresados.'
        }
      } catch (e) {
        this.error = 'Error al buscar ubicación'
      } finally {
        this.geoBuscando = false
      }
    },
    async mostrarMapa() {
      if (!this.$refs.geoMapa || !window.L) {
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
          script.onload = () => this.$nextTick(() => this.mostrarMapa())
          document.body.appendChild(script)
          return
        }
      }
      if (!this.$refs.geoMapa || !window.L) return
      const map = window.L.map(this.$refs.geoMapa).setView([this.geoLat, this.geoLng], 14)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map)
      window.L.marker([this.geoLat, this.geoLng]).addTo(map)
    },
    async guardar() {
      this.error = ''
      this.exito = ''
      this.guardando = true
      try {
        if (!this.geoLat && (this.form.barrio || this.form.ubicacion)) {
          const gRes = await fetch(`${API}/geocode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              direccion: this.form.direccion,
              barrio: this.form.barrio,
              ubicacion: this.form.ubicacion
            })
          })
          const gData = await gRes.json()
          this.geoLat = gData.lat
          this.geoLng = gData.lng
        }

        const method = this.esEdicion ? 'PUT' : 'POST'
        const url = this.esEdicion
          ? `${API}/ofertas/${this.$route.query.id}`
          : `${API}/ofertas`

        const fd = new FormData()
        fd.append('titulo', this.form.titulo)
        fd.append('descripcion', this.form.descripcion)
        if (this.form.categoria_id) fd.append('categoria_id', this.form.categoria_id)
        if (this.form.barrio) fd.append('barrio', this.form.barrio)
        if (this.form.ubicacion) fd.append('ubicacion', this.form.ubicacion)
        if (this.form.direccion) fd.append('direccion', this.form.direccion)
        if (this.form.precio) fd.append('precio', parseFloat(this.form.precio))
        fd.append('tipo_precio', this.form.tipo_precio)
        if (this.imagenFile) fd.append('imagen', this.imagenFile)
        if (this.geoLat) fd.append('latitud', this.geoLat)
        if (this.geoLng) fd.append('longitud', this.geoLng)

        const res = await fetch(url, {
          method,
          headers: { 'Authorization': `Bearer ${this.token}` },
          body: fd
        })
        const data = await res.json()
        if (!res.ok) { this.error = data.error; return }
        this.exito = data.mensaje
        if (!this.esEdicion) {
          this.form = { titulo: '', descripcion: '', categoria_id: '', ubicacion: '', barrio: '', direccion: '', precio: '', tipo_precio: 'fijo' }
          this.imagenFile = null
          this.imagenPreview = null
          this.geoLat = null
          this.geoLng = null
          this.geoPreview = false
        }
      } catch (e) {
        this.error = 'Error de conexion con el servidor'
      } finally {
        this.guardando = false
      }
    }
  }
}
</script>

<style scoped>
.pagina-crear {
  max-width: 700px;
  margin: 0 auto;
}

.formulario-oferta {
  padding: 2rem;
}

.formulario-oferta h1 {
  margin-bottom: 0.25rem;
}

.subtitulo {
  color: var(--color-texto-claro);
  margin-bottom: 1.5rem;
}

.form-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-borde);
}

.input-file { padding: 0.5rem 0; font-size: 0.9rem; }
.imagen-preview { position: relative; display: inline-block; margin-top: 0.5rem; }
.imagen-preview img { max-height: 200px; border-radius: var(--radio); border: 1px solid var(--color-borde); }
.imagen-preview .btn-xs { position: absolute; top: 0.3rem; right: 0.3rem; }
.nota-privacidad { display: block; margin-top: 0.3rem; font-size: 0.8rem; color: var(--color-texto-claro); font-style: italic; }
.geo-btn { margin-top: 0.5rem; }
.geo-preview { height: 200px; border-radius: var(--radio); margin-top: 0.5rem; overflow: hidden; z-index: 1; }
</style>

<!-- TODO: validación de dirección con mapa -->

<!-- TODO: validación de dirección con mapa -->
