<template>
  <div class="pagina-admin">
    <div class="contenedor">
      <h1>Panel de administracion</h1>

      <div v-if="error" class="alerta alerta-error">{{ error }}</div>
      <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>

      <!-- Estadisticas -->
      <div class="stats-grid" v-if="stats">
        <div class="tarjeta stat-card stat-usuarios">
          <span class="stat-valor">{{ stats.totalUsuarios }}</span>
          <span class="stat-etiqueta">Usuarios</span>
          <span class="stat-sub">{{ stats.usuariosPorTipo?.find(t => t.tipo === 'ofertante')?.total || 0 }} ofert. / {{ stats.usuariosPorTipo?.find(t => t.tipo === 'demandante')?.total || 0 }} demanda.</span>
        </div>
        <div class="tarjeta stat-card stat-ofertas">
          <span class="stat-valor">{{ stats.totalOfertas }}</span>
          <span class="stat-etiqueta">Ofertas totales</span>
          <span class="stat-sub">{{ stats.ofertasActivas }} activas</span>
        </div>
        <div class="tarjeta stat-card stat-solicitudes">
          <span class="stat-valor">{{ stats.totalSolicitudes }}</span>
          <span class="stat-etiqueta">Solicitudes</span>
          <span class="stat-sub">{{ stats.solicitudesPendientes }} pendientes</span>
        </div>
        <div class="tarjeta stat-card stat-valoraciones">
          <span class="stat-valor">{{ stats.totalValoraciones }}</span>
          <span class="stat-etiqueta">Valoraciones</span>
          <span class="stat-sub">en {{ stats.totalOfertas }} ofertas</span>
        </div>
      </div>

      <!-- Barras de distribucion -->
      <div class="barras-grid" v-if="stats">
        <div class="tarjeta barra-card">
          <h4 class="barra-titulo">Ofertas por estado</h4>
          <div v-for="e in (stats.ofertasPorEstado || [])" :key="e.estado" class="barra-fila">
            <span class="barra-etiqueta">{{ { activa: 'Activas', completada: 'Completadas', cancelada: 'Canceladas' }[e.estado] || e.estado }}</span>
            <div class="barra-track">
              <div class="barra-relleno" :style="{ width: (e.total / stats.totalOfertas * 100) + '%' }"></div>
            </div>
            <span class="barra-valor">{{ e.total }}</span>
          </div>
        </div>
        <div class="tarjeta barra-card">
          <h4 class="barra-titulo">Usuarios por tipo</h4>
          <div v-for="e in (stats.usuariosPorTipo || [])" :key="e.tipo" class="barra-fila">
            <span class="barra-etiqueta">{{ { admin: 'Admin', ofertante: 'Ofertantes', demandante: 'Demandantes' }[e.tipo] || e.tipo }}</span>
            <div class="barra-track">
              <div class="barra-relleno" :style="{ width: (e.total / stats.totalUsuarios * 100) + '%', background: e.tipo === 'admin' ? 'var(--color-peligro)' : e.tipo === 'ofertante' ? 'var(--color-primario)' : 'var(--color-secundario)' }"></div>
            </div>
            <span class="barra-valor">{{ e.total }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button :class="['tab', { activa: pestanya === 'ofertas' }]" @click="pestanya = 'ofertas'">Ofertas ({{ ofertas.length }})</button>
        <button :class="['tab', { activa: pestanya === 'solicitudes' }]" @click="pestanya = 'solicitudes'; cargarTodasSolicitudes()">Solicitudes ({{ todasSolicitudes.length }})</button>
        <button :class="['tab', { activa: pestanya === 'usuarios' }]" @click="pestanya = 'usuarios'">Usuarios ({{ usuarios.length }})</button>
        <button :class="['tab', { activa: pestanya === 'categorias' }]" @click="pestanya = 'categorias'">Categorias</button>
      </div>

      <!-- Panel de ofertas -->
      <div v-if="pestanya === 'ofertas'" class="tarjeta">
        <div class="tabla-wrap">
          <table class="tabla-admin">
            <thead>
              <tr><th>ID</th><th>Titulo</th><th>Usuario</th><th>Categoria</th><th>Precio</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in ofertas" :key="o.id">
                <td>{{ o.id }}</td>
                <td><router-link :to="`/ofertas/${o.id}`" class="enlace-tabla">{{ o.titulo }}</router-link></td>
                <td>{{ o.usuario_nombre }}</td>
                <td>{{ o.categoria_nombre || '-' }}</td>
                <td>{{ o.precio ? o.precio + '€' : '-' }}</td>
                <td><span :class="['badge', o.estado === 'activa' ? 'badge-verde' : o.estado === 'completada' ? 'badge-azul' : 'badge-rojo']">{{ estadoTexto(o.estado) }}</span></td>
                <td>{{ formatearFecha(o.creado_en) }}</td>
                <td>
                  <select :value="o.estado" @change="cambiarEstadoOferta(o.id, $event.target.value)" class="select-estado">
                    <option value="activa">Activa</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                  <button @click="editarOferta(o)" class="btn btn-secundario btn-xs" title="Editar">✎</button>
                  <button @click="eliminarOferta(o.id)" class="btn btn-peligro btn-xs" title="Eliminar">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel de solicitudes -->
      <div v-if="pestanya === 'solicitudes'" class="tarjeta">
        <div class="tabla-wrap">
          <table class="tabla-admin">
            <thead>
              <tr><th>ID</th><th>Oferta</th><th>Solicitante</th><th>Contacto</th><th>Mensaje</th><th>Estado</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              <tr v-for="s in todasSolicitudes" :key="s.id">
                <td>{{ s.id }}</td>
                <td><router-link :to="`/ofertas/${s.oferta_id}`" class="enlace-tabla">{{ s.oferta_titulo || 'Oferta #'+s.oferta_id }}</router-link></td>
                <td>{{ s.nombre }}</td>
                <td class="contacto-tabla">
                  <a :href="'mailto:'+s.email">✉️</a>
                  <a v-if="s.telefono" :href="'tel:'+s.telefono">📞 {{ s.telefono }}</a>
                </td>
                <td class="mensaje-tabla">{{ s.mensaje || '-' }}</td>
                <td><span :class="['badge', s.estado === 'pendiente' ? 'badge-azul' : s.estado === 'aceptada' ? 'badge-verde' : 'badge-rojo']">{{ estadoSolicitud(s.estado) }}</span></td>
                <td>{{ formatearFecha(s.creado_en) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel de usuarios -->
      <div v-if="pestanya === 'usuarios'" class="tarjeta">
        <div class="tabla-wrap">
          <table class="tabla-admin">
            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Telefono</th><th>Tipo</th><th>Ubicacion</th><th>Registro</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u.id">
                <td>{{ u.id }}</td>
                <td><a href="#" @click.prevent="verUsuario(u)" class="enlace-tabla">{{ u.nombre }}</a></td>
                <td>{{ u.email }}</td>
                <td>{{ u.telefono || '-' }}</td>
                <td><span :class="['badge', u.tipo === 'admin' ? 'badge-rojo' : u.tipo === 'ofertante' ? 'badge-azul' : 'badge-verde']">{{ u.tipo === 'admin' ? 'Admin' : u.tipo === 'ofertante' ? 'Ofertante' : 'Demandante' }}</span></td>
                <td>{{ u.ubicacion || '-' }}</td>
                <td>{{ formatearFecha(u.creado_en) }}</td>
                <td>
                  <button @click="editarUsuario(u)" class="btn btn-secundario btn-xs" title="Editar">✎</button>
                  <button v-if="u.tipo !== 'admin'" @click="eliminarUsuario(u.id)" class="btn btn-peligro btn-xs" title="Eliminar">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel de categorias -->
      <div v-if="pestanya === 'categorias'" class="tarjeta">
        <form @submit.prevent="crearCategoria" class="form-categoria">
          <input v-model="nuevaCat.nombre" placeholder="Nombre" required class="input-cat" />
          <input v-model="nuevaCat.descripcion" placeholder="Descripcion" class="input-cat" />
          <input v-model="nuevaCat.icono" placeholder="Icono (ej: 🧹)" class="input-cat input-cat-sm" />
          <button type="submit" class="btn btn-primario btn-sm">Anadir</button>
        </form>
        <div class="tabla-wrap">
          <table class="tabla-admin">
            <thead><tr><th>ID</th><th>Icono</th><th>Nombre</th><th>Descripcion</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="c in categorias" :key="c.id">
                <td>{{ c.id }}</td>
                <td class="icono-celda">{{ c.icono || '-' }}</td>
                <td>{{ c.nombre }}</td>
                <td>{{ c.descripcion || '-' }}</td>
                <td><button @click="eliminarCategoria(c.id)" class="btn btn-peligro btn-xs">✕</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal detalle usuario -->
      <div v-if="usuarioSeleccionado && !editandoUsuario" class="modal-overlay" @click.self="usuarioSeleccionado = null">
        <div class="modal-contenido tarjeta">
          <div class="modal-header">
            <h2>{{ usuarioSeleccionado.nombre }}</h2>
            <button class="modal-cerrar" @click="usuarioSeleccionado = null">✕</button>
          </div>
          <div class="detalle-usuario">
            <p><strong>Email:</strong> {{ usuarioSeleccionado.email }}</p>
            <p><strong>Telefono:</strong> {{ usuarioSeleccionado.telefono || '-' }}</p>
            <p><strong>Tipo:</strong> {{ usuarioSeleccionado.tipo === 'admin' ? 'Admin' : usuarioSeleccionado.tipo === 'ofertante' ? 'Ofertante' : 'Demandante' }}</p>
            <p><strong>Ubicacion:</strong> {{ usuarioSeleccionado.ubicacion || '-' }}</p>
            <p><strong>Registro:</strong> {{ formatearFecha(usuarioSeleccionado.creado_en) }}</p>
            <p><strong>Ofertas publicadas:</strong> {{ usuarioSeleccionado.total_ofertas || 0 }}</p>
            <router-link :to="`/perfil/${usuarioSeleccionado.id}`" class="btn btn-secundario btn-sm" style="margin-top:0.75rem">Ver perfil publico</router-link>
            <button @click="editarUsuario(usuarioSeleccionado)" class="btn btn-primario btn-sm" style="margin-top:0.75rem;margin-left:0.5rem">Editar usuario</button>
          </div>
        </div>
      </div>

      <!-- Modal editar oferta -->
      <div v-if="editandoOferta" class="modal-overlay" @click.self="editandoOferta = null">
        <div class="modal-contenido tarjeta modal-form">
          <div class="modal-header">
            <h2>Editar oferta #{{ editandoOferta.id }}</h2>
            <button class="modal-cerrar" @click="editandoOferta = null">✕</button>
          </div>
          <form @submit.prevent="guardarOferta">
            <label>Titulo</label>
            <input v-model="ofertaForm.titulo" class="form-input" required />
            <label>Descripcion</label>
            <textarea v-model="ofertaForm.descripcion" class="form-input" rows="3"></textarea>
            <label>Precio (€)</label>
            <input v-model.number="ofertaForm.precio" type="number" min="0" step="0.01" class="form-input" />
            <label>Tipo precio</label>
            <select v-model="ofertaForm.tipo_precio" class="form-input">
              <option value="por_hora">Por hora</option>
              <option value="por_dia">Por dia</option>
              <option value="fijo">Fijo</option>
            </select>
            <label>Ubicacion</label>
            <input v-model="ofertaForm.ubicacion" class="form-input" />
            <label>Categoria</label>
            <select v-model.number="ofertaForm.categoria_id" class="form-input">
              <option :value="null">Sin categoria</option>
              <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
            <div class="modal-acciones">
              <button type="button" @click="editandoOferta = null" class="btn btn-secundario">Cancelar</button>
              <button type="submit" class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal editar usuario -->
      <div v-if="editandoUsuario" class="modal-overlay" @click.self="editandoUsuario = null">
        <div class="modal-contenido tarjeta modal-form">
          <div class="modal-header">
            <h2>Editar usuario #{{ editandoUsuario.id }}</h2>
            <button class="modal-cerrar" @click="editandoUsuario = null">✕</button>
          </div>
          <form @submit.prevent="guardarUsuario">
            <label>Nombre</label>
            <input v-model="userForm.nombre" class="form-input" required />
            <label>Email</label>
            <input v-model="userForm.email" type="email" class="form-input" required />
            <label>Telefono</label>
            <input v-model="userForm.telefono" class="form-input" />
            <label>Ubicacion</label>
            <input v-model="userForm.ubicacion" class="form-input" />
            <label>Tipo</label>
            <select v-model="userForm.tipo" class="form-input" :disabled="editandoUsuario.tipo === 'admin'">
              <option value="ofertante">Ofertante</option>
              <option value="demandante">Demandante</option>
            </select>
            <div class="modal-acciones">
              <button type="button" @click="editandoUsuario = null" class="btn btn-secundario">Cancelar</button>
              <button type="submit" class="btn btn-primario" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuth } from '../store/auth.js'

const API = '/api'

export default {
  name: 'AdminView',
  setup() {
    return { auth: useAuth() }
  },
  data() {
    return {
      pestanya: 'ofertas',
      stats: null,
      ofertas: [],
      usuarios: [],
      categorias: [],
      todasSolicitudes: [],
      nuevaCat: { nombre: '', descripcion: '', icono: '' },
      usuarioSeleccionado: null,
      editandoOferta: null,
      editandoUsuario: null,
      ofertaForm: { titulo: '', descripcion: '', precio: null, tipo_precio: 'por_hora', ubicacion: '', categoria_id: null },
      userForm: { nombre: '', email: '', telefono: '', ubicacion: '', tipo: '' },
      error: '',
      exito: '',
      guardando: false
    }
  },
  watch: {
    exito(v) { if (v) setTimeout(() => this.exito = '', 4000) },
    error(v) { if (v) setTimeout(() => this.error = '', 4000) }
  },
  computed: {
    token() { return this.auth.token },
    solicitudesPendientes() { return this.todasSolicitudes.filter(s => s.estado === 'pendiente').length }
  },
  mounted() { this.cargarTodo() },
  methods: {
    async cargarTodo() {
      try {
        const h = { 'Authorization': `Bearer ${this.token}` }
        const [r1, r2, r3, r4, r5] = await Promise.all([
          fetch(`${API}/admin/dashboard`, { headers: h }),
          fetch(`${API}/admin/ofertas`, { headers: h }),
          fetch(`${API}/admin/usuarios`, { headers: h }),
          fetch(`${API}/ofertas/categorias`),
          fetch(`${API}/admin/solicitudes`, { headers: h })
        ])
        const d1 = await r1.json()
        const d2 = await r2.json()
        const d3 = await r3.json()
        const d4 = await r4.json()
        const d5 = await r5.json()
        this.stats = d1.estadisticas
        this.ofertas = d2.ofertas || []
        this.usuarios = d3.usuarios || []
        this.categorias = d4.categorias || []
        this.todasSolicitudes = d5.solicitudes || []
      } catch (e) { this.error = 'Error al cargar datos' }
    },
    async cargarTodasSolicitudes() {
      try {
        const res = await fetch(`${API}/admin/solicitudes`, {
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        const data = await res.json()
        this.todasSolicitudes = data.solicitudes || []
      } catch (e) { console.error(e) }
    },
    async cambiarEstadoOferta(id, estado) {
      try {
        await fetch(`${API}/admin/ofertas/${id}/estado`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ estado })
        })
        const o = this.ofertas.find(x => x.id === id)
        if (o) o.estado = estado
        this.exito = 'Estado actualizado'
      } catch (e) { this.error = 'Error al actualizar' }
    },
    async eliminarOferta(id) {
      if (!confirm('Eliminar esta oferta permanentemente?')) return
      try {
        await fetch(`${API}/ofertas/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        this.ofertas = this.ofertas.filter(o => o.id !== id)
        this.exito = 'Oferta eliminada'
      } catch (e) { console.error(e) }
    },
    async eliminarUsuario(id) {
      if (!confirm('Eliminar este usuario y todos sus datos?')) return
      try {
        await fetch(`${API}/admin/usuarios/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        this.usuarios = this.usuarios.filter(u => u.id !== id)
        this.exito = 'Usuario eliminado'
      } catch (e) { console.error(e) }
    },
    async crearCategoria() {
      try {
        await fetch(`${API}/admin/categorias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify(this.nuevaCat)
        })
        this.nuevaCat = { nombre: '', descripcion: '', icono: '' }
        const res = await fetch(`${API}/ofertas/categorias`)
        const data = await res.json()
        this.categorias = data.categorias || []
        this.exito = 'Categoria creada'
      } catch (e) { console.error(e) }
    },
    async eliminarCategoria(id) {
      if (!confirm('Eliminar esta categoria?')) return
      try {
        await fetch(`${API}/admin/categorias/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        })
        this.categorias = this.categorias.filter(c => c.id !== id)
        this.exito = 'Categoria eliminada'
      } catch (e) { console.error(e) }
    },
    verUsuario(u) { this.usuarioSeleccionado = u },
    editarOferta(o) {
      this.ofertaForm = { titulo: o.titulo, descripcion: o.descripcion || '', precio: o.precio, tipo_precio: o.tipo_precio || 'por_hora', ubicacion: o.ubicacion || '', categoria_id: o.categoria_id }
      this.editandoOferta = o
    },
    async guardarOferta() {
      this.guardando = true
      try {
        const res = await fetch(`${API}/admin/ofertas/${this.editandoOferta.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify(this.ofertaForm)
        })
        if (res.ok) {
          Object.assign(this.editandoOferta, this.ofertaForm)
          this.editandoOferta = null
          this.exito = 'Oferta actualizada'
        } else {
          const d = await res.json()
          this.error = d.error
        }
      } catch (e) { this.error = 'Error al actualizar oferta' }
      finally { this.guardando = false }
    },
    editarUsuario(u) {
      this.userForm = { nombre: u.nombre, email: u.email, telefono: u.telefono || '', ubicacion: u.ubicacion || '', tipo: u.tipo }
      if (u.tipo === 'admin') this.userForm.tipo = 'admin'
      this.editandoUsuario = u
    },
    async guardarUsuario() {
      this.guardando = true
      try {
        const res = await fetch(`${API}/admin/usuarios/${this.editandoUsuario.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify(this.userForm)
        })
        if (res.ok) {
          Object.assign(this.editandoUsuario, this.userForm)
          this.editandoUsuario = null
          this.exito = 'Usuario actualizado'
        } else {
          const d = await res.json()
          this.error = d.error
        }
      } catch (e) { this.error = 'Error al actualizar usuario' }
      finally { this.guardando = false }
    },
    formatearFecha(f) { return f ? new Date(f).toLocaleDateString('es-ES') : '' },
    estadoTexto(e) { return { activa: 'Activa', completada: 'Completada', cancelada: 'Cancelada' }[e] || e },
    estadoSolicitud(e) { return { pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada' }[e] || e }
  }
}
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { text-align: center; padding: 1.25rem; position: relative; overflow: hidden; }
.stat-valor { display: block; font-size: 2rem; font-weight: 800; }
.stat-etiqueta { font-size: 0.85rem; color: var(--color-texto-claro); display: block; margin-bottom: 0.15rem; }
.stat-sub { font-size: 0.75rem; color: var(--color-texto-claro); opacity: 0.8; }
.stat-usuarios .stat-valor { color: #6366f1; }
.stat-ofertas .stat-valor { color: var(--color-secundario); }
.stat-solicitudes .stat-valor { color: var(--color-primario); }
.stat-valoraciones .stat-valor { color: #f59e0b; }

.tabs { display: flex; gap: 2px; margin-bottom: 1rem; background: var(--color-fondo); border-radius: var(--radio); padding: 4px; overflow-x: auto; }
.tab { padding: 0.6rem 1.2rem; border: none; background: transparent; border-radius: var(--radio); cursor: pointer; font-weight: 500; color: var(--color-texto-claro); transition: all 0.2s; white-space: nowrap; font-size: 0.95rem; }
.tab.activa { background: var(--color-blanco); color: var(--color-texto); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.tabla-wrap { overflow-x: auto; }
.tabla-admin { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.tabla-admin th, .tabla-admin td { padding: 0.55rem 0.7rem; text-align: left; border-bottom: 1px solid var(--color-borde); white-space: nowrap; }
.tabla-admin th { font-weight: 600; background-color: var(--color-fondo); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-texto-claro); }
.tabla-admin tbody tr:hover { background-color: var(--color-fondo); }

.enlace-tabla { color: var(--color-primario); font-weight: 500; }
.enlace-tabla:hover { text-decoration: underline; }
.contacto-tabla { display: flex; gap: 0.5rem; align-items: center; }
.mensaje-tabla { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icono-celda { font-size: 1.2rem; }
.select-estado { padding: 0.2rem 0.4rem; border-radius: var(--radio); border: 1px solid var(--color-borde); font-size: 0.8rem; margin-right: 0.35rem; }

.form-categoria { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.input-cat { flex: 1; min-width: 140px; padding: 0.5rem 0.7rem; border: 1.5px solid var(--color-borde); border-radius: var(--radio); font-size: 0.9rem; font-family: inherit; }
.input-cat-sm { max-width: 100px; }
.input-cat:focus { outline: none; border-color: var(--color-primario); }

.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
.modal-contenido { width: 100%; max-width: 440px; padding: 1.5rem; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.modal-cerrar { background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--color-texto-claro); }
.detalle-usuario p { margin-bottom: 0.5rem; font-size: 0.95rem; }

.btn-xs { padding: 0.2rem 0.45rem; font-size: 0.75rem; border-radius: var(--radio); border: none; cursor: pointer; }
.modal-form .form-input { width: 100%; margin-bottom: 0.75rem; padding: 0.5rem 0.7rem; border: 1.5px solid var(--color-borde); border-radius: var(--radio); font-size: 0.9rem; font-family: inherit; box-sizing: border-box; }
.modal-form .form-input:focus { outline: none; border-color: var(--color-primario); }
.modal-form label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.2rem; color: var(--color-texto); }
.modal-form textarea.form-input { resize: vertical; }
.modal-acciones { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }

.barras-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
.barra-titulo { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-texto-claro); }
.barra-fila { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; font-size: 0.85rem; }
.barra-etiqueta { width: 100px; flex-shrink: 0; color: var(--color-texto); }
.barra-track { flex: 1; height: 8px; background: var(--color-fondo-alt); border-radius: 999px; overflow: hidden; }
.barra-relleno { height: 100%; background: var(--color-primario); border-radius: 999px; transition: width 0.5s; min-width: 2px; }
.barra-valor { width: 30px; text-align: right; font-weight: 700; color: var(--color-texto); }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .barras-grid { grid-template-columns: 1fr; }
  .tabla-admin { font-size: 0.8rem; }
  .tabla-admin th, .tabla-admin td { padding: 0.4rem 0.5rem; }
}
</style>
