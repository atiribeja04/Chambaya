<template>
  <div id="chambaya-app">
    <Navbar />
    <main class="contenido-principal">
      <router-view />
    </main>
    <footer class="pie-pagina">
      <div class="contenedor footer-grid">
        <div class="footer-col">
          <img src="/logo.png" alt="Chambaya" class="footer-logo" />
          <p class="footer-desc">Conectamos personas que buscan trabajos temporales con quienes los ofrecen. Rápido, sencillo y seguro.</p>
        </div>
        <div class="footer-col">
          <h4>Enlaces</h4>
          <router-link to="/ofertas">Buscar trabajos</router-link>
          <router-link to="/registro">Crear cuenta</router-link>
          <router-link to="/login">Iniciar sesión</router-link>
          <a href="/docs" target="_blank">Documentación API</a>
        </div>
        <div class="footer-col">
          <h4>Contacto</h4>
          <p>info@chambaya.com</p>
          <p>Proyecto educativo</p>
          <p>CIPFP Batoi</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Chambaya - Todos los derechos reservados</p>
      </div>
    </footer>
  </div>
</template>

<script>
/**
 * Componente raiz de la aplicacion Chambaya.
 * Contiene la barra de navegacion, el contenido principal y el pie de pagina.
 */
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: { Navbar },
  mounted() {
    const tema = localStorage.getItem('chambaya-tema') || 'claro'
    document.documentElement.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light')
  }
}
</script>

<style>
/* Estilos globales de Chambaya */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-primario: #2563eb;
  --color-primario-oscuro: #1d4ed8;
  --color-primario-claro: #dbeafe;
  --color-secundario: #10b981;
  --color-secundario-claro: #d1fae5;
  --color-peligro: #ef4444;
  --color-advertencia: #f59e0b;
  --color-fondo: #f8fafc;
  --color-fondo-alt: #f1f5f9;
  --color-texto: #0f172a;
  --color-texto-claro: #64748b;
  --color-borde: #e2e8f0;
  --color-blanco: #ffffff;
  --sombra: 0 1px 3px rgba(0, 0, 0, 0.08);
  --sombra-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --sombra-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
  --radio: 10px;
  --radio-lg: 16px;
}

[data-theme="dark"] {
  --color-primario: #3b82f6;
  --color-primario-oscuro: #60a5fa;
  --color-primario-claro: #1e3a5f;
  --color-secundario: #34d399;
  --color-secundario-claro: #064e3b;
  --color-peligro: #f87171;
  --color-advertencia: #fbbf24;
  --color-fondo: #0f172a;
  --color-fondo-alt: #1e293b;
  --color-texto: #f1f5f9;
  --color-texto-claro: #94a3b8;
  --color-borde: #334155;
  --color-blanco: #1e293b;
  --sombra: 0 1px 3px rgba(0, 0, 0, 0.3);
  --sombra-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --sombra-lg: 0 8px 30px rgba(0, 0, 0, 0.5);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--color-fondo);
  color: var(--color-texto);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--color-primario);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--color-primario-oscuro);
}

.contenedor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.contenido-principal {
  min-height: calc(100vh - 300px);
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-primario {
  background: linear-gradient(135deg, var(--color-primario), var(--color-primario-oscuro));
  color: var(--color-blanco);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.btn-primario:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}

.btn-secundario {
  background: linear-gradient(135deg, var(--color-secundario), #059669);
  color: var(--color-blanco);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-secundario:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
}

.btn-peligro {
  background-color: var(--color-peligro);
  color: var(--color-blanco);
}

.btn-peligro:hover {
  background-color: #dc2626;
}

.btn-outline {
  background-color: transparent;
  border: 2px solid var(--color-primario);
  color: var(--color-primario);
}

.btn-outline:hover {
  background-color: var(--color-primario);
  color: var(--color-blanco);
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
}

/* Formularios */
.campo-formulario {
  margin-bottom: 1.2rem;
}

.campo-formulario label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-texto);
}

.campo-formulario input,
.campo-formulario select,
.campo-formulario textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--color-borde);
  border-radius: var(--radio);
  font-size: 0.95rem;
  font-family: inherit;
  background-color: var(--color-blanco);
  transition: all 0.2s;
}

.campo-formulario input:focus,
.campo-formulario select:focus,
.campo-formulario textarea:focus {
  outline: none;
  border-color: var(--color-primario);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.campo-formulario textarea {
  min-height: 110px;
  resize: vertical;
}

/* Tarjetas */
.tarjeta {
  background-color: var(--color-blanco);
  border-radius: var(--radio);
  box-shadow: var(--sombra);
  padding: 1.5rem;
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.25s ease;
}

.tarjeta:hover {
  box-shadow: var(--sombra-md);
}

.tarjeta-sombra {
  box-shadow: var(--sombra-md);
}

/* Grid */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

/* Alertas */
.alerta {
  padding: 0.85rem 1.1rem;
  border-radius: var(--radio);
  margin-bottom: 1rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.alerta-error {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alerta-exito {
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

/* Pie de pagina */
.pie-pagina {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: var(--color-blanco);
  padding: 3rem 0 0;
  margin-top: 4rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 2rem;
}

.footer-logo {
  height: 40px;
  margin-bottom: 1rem;
}

.footer-desc {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.7;
}

.footer-col h4 {
  color: var(--color-blanco);
  margin-bottom: 1rem;
  font-weight: 600;
}

.footer-col a,
.footer-col p {
  display: block;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: var(--color-blanco);
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 1.5rem 0;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

/* Animaciones */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeInUp 0.5s ease forwards;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-azul { background: var(--color-primario-claro); color: var(--color-primario-oscuro); }
.badge-verde { background: var(--color-secundario-claro); color: #065f46; }
.badge-rojo { background: #fef2f2; color: #991b1b; }

/* Responsive */
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
}
</style>

<!-- TODO: agregar transiciones de ruta -->

<!-- TODO: agregar transiciones de ruta -->
