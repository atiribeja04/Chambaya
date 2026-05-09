<template>
  <nav class="barra-navegacion">
    <div class="contenedor nav-inner">
      <router-link to="/" class="logo">
        <img src="/logo.png" alt="Chambaya" class="logo-img" />
      </router-link>

      <div class="nav-enlaces">
        <button @click="toggleTema" class="btn-tema" :title="esOscuro ? 'Modo claro' : 'Modo oscuro'">
          {{ esOscuro ? '☀️' : '🌙' }}
        </button>
        <router-link to="/ofertas" class="nav-link">Buscar trabajos</router-link>
        <router-link to="/candidatos" class="nav-link">Buscar candidatos</router-link>

        <template v-if="auth.usuario">
          <router-link v-if="auth.usuario.tipo === 'ofertante'" to="/crear-oferta" class="btn btn-primario btn-sm">Publicar oferta</router-link>
          <router-link v-if="auth.usuario.tipo === 'admin'" to="/admin" class="btn btn-primario btn-sm">Admin</router-link>
          <div class="notif-wrapper" v-if="auth.usuario.tipo !== 'admin'">
            <button class="notif-campana" @click="toggleNotifs" title="Notificaciones">
              🔔
              <span v-if="noLeidas > 0" class="notif-badge">{{ noLeidas > 9 ? '9+' : noLeidas }}</span>
            </button>
            <div v-if="mostrarNotifs" class="notif-dropdown">
              <div class="notif-header">
                <strong>Notificaciones</strong>
                <button v-if="noLeidas > 0" @click="marcarLeidas" class="notif-leer">Leer todas</button>
              </div>
              <div v-if="notificaciones.length === 0" class="notif-vacio">No hay notificaciones</div>
              <div v-for="n in notificaciones" :key="n.id" :class="['notif-item', { 'no-leida': !n.leida }]">
                <p>{{ n.mensaje }}</p>
                <small>{{ formatearFecha(n.creado_en) }}</small>
              </div>
            </div>
          </div>
          <router-link to="/perfil" class="nav-link perfil-link">
            <span v-if="auth.usuario?.foto_perfil" class="nav-avatar"><img :src="auth.usuario.foto_perfil" alt="" /></span>
            <span v-else class="nav-avatar-iniciales">{{ iniciales(auth.usuario.nombre) }}</span>
            {{ auth.usuario.nombre }}
          </router-link>
          <button @click="cerrarSesion" class="btn btn-outline btn-sm">Salir</button>
        </template>

        <template v-else>
          <router-link to="/login" class="nav-link">Iniciar sesion</router-link>
          <router-link to="/registro" class="btn btn-primario btn-sm">Registrarse</router-link>
        </template>
      </div>

      <button class="menu-movil" @click="menuAbierto = !menuAbierto">
        <span v-if="!menuAbierto">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <div v-if="menuAbierto" class="menu-movil-contenido">
      <button @click="toggleTema" class="btn-tema" style="align-self:flex-start">🌙 Modo oscuro</button>
      <router-link to="/ofertas" class="nav-link" @click="menuAbierto = false">Buscar trabajos</router-link>
      <router-link to="/candidatos" class="nav-link" @click="menuAbierto = false">Buscar candidatos</router-link>
      <template v-if="auth.usuario">
        <router-link v-if="auth.usuario.tipo === 'ofertante'" to="/crear-oferta" class="nav-link" @click="menuAbierto = false">Publicar oferta</router-link>
        <router-link v-if="auth.usuario.tipo === 'admin'" to="/admin" class="nav-link" @click="menuAbierto = false">Admin</router-link>
        <router-link to="/perfil" class="nav-link" @click="menuAbierto = false">
          <span v-if="auth.usuario?.foto_perfil" class="nav-avatar"><img :src="auth.usuario.foto_perfil" alt="" /></span>
          Mi perfil
        </router-link>
        <button @click="cerrarSesion" class="btn btn-outline btn-sm">Cerrar sesion</button>
      </template>
      <template v-else>
        <router-link to="/login" class="nav-link" @click="menuAbierto = false">Iniciar sesion</router-link>
        <router-link to="/registro" class="nav-link" @click="menuAbierto = false">Registrarse</router-link>
      </template>
    </div>
  </nav>
</template>

<script>
import { useAuth, logout } from '../store/auth.js'

const API = '/api'

export default {
  name: 'NavbarChambaya',
  setup() {
    return { auth: useAuth() }
  },
  data() {
    return {
      menuAbierto: false,
      notificaciones: [],
      noLeidas: 0,
      mostrarNotifs: false,
      intervaloNotifs: null,
      esOscuro: localStorage.getItem('chambaya-tema') === 'oscuro'
    }
  },
  mounted() {
    if (this.auth.token && this.auth.usuario.tipo !== 'admin') {
      this.cargarNotifs()
      this.intervaloNotifs = setInterval(() => this.cargarNotifs(), 30000)
    }
  },
  beforeUnmount() {
    if (this.intervaloNotifs) clearInterval(this.intervaloNotifs)
  },
  methods: {
    toggleTema() {
      this.esOscuro = !this.esOscuro
      localStorage.setItem('chambaya-tema', this.esOscuro ? 'oscuro' : 'claro')
      document.documentElement.setAttribute('data-theme', this.esOscuro ? 'dark' : 'light')
    },
    async cargarNotifs() {
      try {
        const res = await fetch(`${API}/notificaciones`, {
          headers: { 'Authorization': `Bearer ${this.auth.token}` }
        })
        const data = await res.json()
        this.notificaciones = data.notificaciones || []
        this.noLeidas = data.noLeidas || 0
      } catch (e) { console.error(e) }
    },
    toggleNotifs() {
      this.mostrarNotifs = !this.mostrarNotifs
      if (this.mostrarNotifs) this.cargarNotifs()
    },
    async marcarLeidas() {
      await fetch(`${API}/notificaciones/leer`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${this.auth.token}` }
      })
      this.noLeidas = 0
      this.notificaciones.forEach(n => n.leida = 1)
    },
    iniciales(nombre) { return nombre ? nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : '??' },
    cerrarSesion() {
      logout()
      this.menuAbierto = false
      this.$router.push('/')
    },
    formatearFecha(f) {
      if (!f) return ''
      const d = new Date(f)
      const ahora = new Date()
      const diff = Math.floor((ahora - d) / 1000)
      if (diff < 60) return 'hace un momento'
      if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
      if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
      return d.toLocaleDateString('es-ES')
    }
  }
}
</script>

<style scoped>
.barra-navegacion {
  background-color: var(--color-blanco);
  box-shadow: var(--sombra);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none !important;
}

.logo-img {
  height: 42px;
  width: auto;
}

.nav-enlaces {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.nav-link {
  color: var(--color-texto);
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radio);
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: var(--color-fondo);
  text-decoration: none;
}

.notif-wrapper { position: relative; }

.btn-tema {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.4rem;
  line-height: 1;
  border-radius: var(--radio);
  transition: background 0.2s;
}
.btn-tema:hover { background: var(--color-fondo); }

.notif-campana {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.4rem;
  position: relative;
  line-height: 1;
}

.notif-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-peligro);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.notif-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 340px;
  background: var(--color-blanco);
  border-radius: var(--radio);
  box-shadow: var(--sombra-lg);
  border: 1px solid var(--color-borde);
  z-index: 300;
  max-height: 380px;
  overflow-y: auto;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-borde);
  font-size: 0.9rem;
}

.notif-leer {
  background: none;
  border: none;
  color: var(--color-primario);
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 500;
}

.notif-vacio { padding: 1.5rem; text-align: center; color: var(--color-texto-claro); font-size: 0.9rem; }

.notif-item {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--color-borde);
  font-size: 0.85rem;
  cursor: default;
}

.notif-item:last-child { border-bottom: none; }
.notif-item.no-leida { background: var(--color-primario-claro); }
.notif-item p { margin-bottom: 0.2rem; line-height: 1.4; }
.notif-item small { color: var(--color-texto-claro); font-size: 0.75rem; }

.menu-movil {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-texto);
}

.menu-movil-contenido {
  display: none;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
  border-top: 1px solid var(--color-borde);
}

@media (max-width: 768px) {
  .nav-enlaces { display: none; }
  .menu-movil, .menu-movil-contenido { display: flex; }
  .notif-dropdown { width: 300px; right: -60px; }
}

.perfil-link { display: flex; align-items: center; gap: 0.4rem; }
.nav-avatar { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; background: var(--color-primario); color: #fff; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
.nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
.nav-avatar-iniciales { width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--color-primario); color: #fff; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
</style>

<!-- TODO: barra de búsqueda en navbar -->
