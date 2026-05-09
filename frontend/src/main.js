/**
 * Archivo principal de la aplicacion Vue.js
 * 
 * Inicializa la aplicacion Chambaya con Vue Router.
 * 
 * @module main
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)
app.use(router)
app.mount('#app')
