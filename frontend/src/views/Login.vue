<template>
  <div class="pagina-auth">
    <div class="contenedor">
      <div class="auth-wrapper">
        <div class="auth-header">
          <img src="/logo.png" alt="Chambaya" class="auth-logo" />
          <h1>Iniciar sesión</h1>
          <p class="auth-subtitulo">Accede a tu cuenta de Chambaya</p>
        </div>

        <div class="auth-formulario tarjeta">
          <div v-if="error" class="alerta alerta-error">{{ error }}</div>

          <form @submit.prevent="iniciarSesion">
            <div class="campo-formulario">
              <label for="email">Correo electrónico</label>
              <input id="email" v-model="email" type="email" placeholder="tu@email.com" required />
            </div>
            <div class="campo-formulario">
              <label for="password">Contraseña</label>
              <input id="password" v-model="password" type="password" placeholder="Tu contraseña" required />
            </div>
            <button type="submit" class="btn btn-primario btn-auth" :disabled="cargando">
              {{ cargando ? 'Entrando...' : 'Iniciar sesión' }}
            </button>
          </form>

          <p class="auth-enlace">
            ¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '../store/auth.js'

const API = '/api'

export default {
  name: 'LoginView',
  data() {
    return { email: '', password: '', error: '', cargando: false }
  },
  methods: {
    async iniciarSesion() {
      this.error = ''
      this.cargando = true
      try {
        const res = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        })
        const data = await res.json()
        if (!res.ok) { this.error = data.error || 'Error al iniciar sesion'; return }
        login(data.usuario, data.token)
        const ruta = this.$route.query.redirect || (data.usuario.tipo === 'admin' ? '/admin' : '/')
        this.$router.push(ruta)
      } catch (e) {
        this.error = 'Error de conexion con el servidor'
      } finally {
        this.cargando = false
      }
    }
  }
}
</script>

<style scoped>
.pagina-auth {
  min-height: 70vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--color-fondo) 0%, var(--color-fondo-alt) 100%);
}

.auth-wrapper {
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  height: 50px;
  width: auto;
  margin-bottom: 1rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.auth-subtitulo {
  color: var(--color-texto-claro);
  font-size: 0.95rem;
}

.auth-formulario {
  padding: 2rem;
  border: 1px solid var(--color-borde);
}

.btn-auth {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
}

.auth-enlace {
  text-align: center;
  margin-top: 1.25rem;
  color: var(--color-texto-claro);
  font-size: 0.9rem;
}
</style>
