/**
 * Configuracion del enrutador de Vue.js para Chambaya.
 * 
 * Define las rutas de la aplicacion y protege las que requieren autenticacion.
 * 
 * @module router
 */

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Jobs from '../views/Jobs.vue'
import JobDetail from '../views/JobDetail.vue'
import CreateJob from '../views/CreateJob.vue'
import Profile from '../views/Profile.vue'
import Admin from '../views/Admin.vue'
import PublicProfile from '../views/PublicProfile.vue'
import Candidatos from '../views/Candidatos.vue'

/**
 * Obtiene el token JWT almacenado en localStorage.
 * @returns {string|null} Token JWT o null
 */
function obtenerToken() {
  return localStorage.getItem('token')
}

/**
 * Obtiene los datos del usuario desde localStorage.
 * @returns {Object|null} Datos del usuario o null
 */
function obtenerUsuario() {
  const data = localStorage.getItem('usuario')
  return data ? JSON.parse(data) : null
}

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/registro', name: 'Register', component: Register },
  { path: '/ofertas', name: 'Jobs', component: Jobs },
  { path: '/ofertas/:id', name: 'JobDetail', component: JobDetail },
  {
    path: '/candidatos',
    name: 'Candidatos',
    component: Candidatos
  },
  {
    path: '/crear-oferta',
    name: 'CreateJob',
    component: CreateJob,
    meta: { requiereAuth: true, tipoPermitido: 'ofertante' }
  },
  {
    path: '/perfil',
    name: 'Profile',
    component: Profile,
    meta: { requiereAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiereAuth: true, tipoPermitido: 'admin' }
  },
  {
    path: '/perfil/:id',
    name: 'PublicProfile',
    component: PublicProfile
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Guard de navegacion que protege rutas que requieren autenticacion.
 * Redirige al login si el usuario no esta autenticado.
 */
router.beforeEach((to, from, next) => {
  const token = obtenerToken()
  const usuario = obtenerUsuario()

  if (to.meta.requiereAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.tipoPermitido && usuario?.tipo !== to.meta.tipoPermitido) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
