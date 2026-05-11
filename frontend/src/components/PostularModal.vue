<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal-contenido tarjeta">
      <div class="modal-header">
        <h2>Solicitar trabajo</h2>
        <button class="modal-cerrar" @click="$emit('cerrar')">✕</button>
      </div>
      <p class="modal-oferta"><strong>{{ oferta.titulo }}</strong> — {{ oferta.usuario_nombre }}</p>

      <div v-if="error" class="alerta alerta-error">{{ error }}</div>
      <div v-if="exito" class="alerta alerta-exito">{{ exito }}</div>

      <form @submit.prevent="enviar">
        <div class="campo-formulario">
          <label for="comentario">Mensaje para el ofertante</label>
          <textarea id="comentario" v-model="mensaje" rows="4"
            placeholder="Hola! Me interesa este trabajo. Tengo experiencia en..."></textarea>
        </div>
        <div class="modal-acciones">
          <button type="button" class="btn btn-outline" @click="$emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn btn-primario" :disabled="enviando">
            {{ enviando ? 'Enviando...' : 'Enviar solicitud' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const API = '/api'

export default {
  name: 'PostularModal',
  props: {
    oferta: { type: Object, required: true }
  },
  emits: ['cerrar', 'solicitado'],
  data() {
    return {
      mensaje: '',
      error: '',
      exito: '',
      enviando: false
    }
  },
  computed: {
    token() { return localStorage.getItem('token') }
  },
  methods: {
    async enviar() {
      this.error = ''
      this.exito = ''
      this.enviando = true
      try {
        const res = await fetch(`${API}/ofertas/${this.oferta.id}/solicitar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` },
          body: JSON.stringify({ mensaje: this.mensaje })
        })
        const data = await res.json()
        if (!res.ok) { this.error = data.error; return }
        this.exito = data.mensaje
        setTimeout(() => this.$emit('solicitado'), 1500)
      } catch (e) {
        this.error = 'Error de conexion'
      } finally {
        this.enviando = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.modal-contenido {
  width: 100%;
  max-width: 480px;
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
}

.modal-cerrar {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: var(--color-texto-claro);
  padding: 0.25rem;
  line-height: 1;
}

.modal-oferta {
  color: var(--color-texto-claro);
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-borde);
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
}

textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-borde);
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: var(--color-primario);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
</style>
