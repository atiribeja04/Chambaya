/**
 * Almacen reactivo de autenticacion.
 * 
 * Mantiene el estado del usuario sincronizado entre componentes
 * sin necesidad de recargar la pagina.
 * 
 * @module store/auth
 */

import { reactive } from 'vue'

const stored = localStorage.getItem('usuario')

const auth = reactive({
  usuario: stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('token') || null
})

function guardar(usuario, token) {
  auth.usuario = usuario
  auth.token = token
  localStorage.setItem('usuario', JSON.stringify(usuario))
  localStorage.setItem('token', token)
}

function limpiar() {
  auth.usuario = null
  auth.token = null
  localStorage.removeItem('usuario')
  localStorage.removeItem('token')
}

export function useAuth() {
  return auth
}

export function login(usuario, token) {
  guardar(usuario, token)
}

export function logout() {
  limpiar()
}
