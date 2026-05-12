<template>
  <div class="pagina-auth">
    <div class="contenedor">
      <div class="auth-wrapper">
        <div class="auth-header">
          <img src="/logo.png" alt="Chambaya" class="auth-logo" />
          <h1>Crear cuenta</h1>
          <p class="auth-subtitulo">Únete a Chambaya y empieza a conectar</p>
        </div>

        <div class="auth-formulario tarjeta">
          <div v-if="error" class="alerta alerta-error">{{ error }}</div>

          <form @submit.prevent="registrar">
            <div class="campo-formulario">
              <label for="nombre">Nombre completo</label>
              <input id="nombre" v-model="nombre" type="text" placeholder="Tu nombre" required />
            </div>
            <div class="campo-formulario">
              <label for="email">Correo electrónico</label>
              <input id="email" v-model="email" type="email" placeholder="tu@email.com" required />
            </div>
            <div class="campo-formulario">
              <label for="password">Contraseña</label>
              <input id="password" v-model="password" type="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
            </div>
            <div class="campo-formulario">
              <label for="tipo">Tipo de usuario</label>
              <select id="tipo" v-model="tipo" required>
                <option value="demandante">Busco trabajo - Quiero encontrar trabajos</option>
                <option value="ofertante">Ofrezco trabajo - Quiero contratar</option>
              </select>
            </div>
            <div class="campo-formulario">
              <label for="ubicacion">Ubicación (opcional)</label>
              <input id="ubicacion" v-model="ubicacion" type="text" placeholder="Ej: Madrid, Barcelona..." />
            </div>
            <button type="submit" class="btn btn-secundario btn-auth" :disabled="cargando">
              {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="auth-enlace">
            ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
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
  name: 'RegisterView',
  data() {
    return {
      nombre: '', email: '', password: '', tipo: 'demandante', ubicacion: '',
      error: '', cargando: false
    }
  },
  methods: {
    async registrar() {
      this.error = ''
      this.cargando = true
      try {
        const res = await fetch(`${API}/auth/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: this.nombre,
            email: this.email,
            password: this.password,
            tipo: this.tipo,
            ubicacion: this.ubicacion
          })
        })
        const data = await res.json()
        if (!res.ok) {
          this.error = data.error || 'Error al registrarse'
          return
        }
        login(data.usuario, data.token)
        this.$router.push('/')
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
