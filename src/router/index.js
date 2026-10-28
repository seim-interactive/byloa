import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AdminPanel from '../views/AdminPanel.vue'
import Login from '../views/Login.vue'
import { initAuth } from '../composables/useAuth'
import { forceThemeFor, savedTheme } from '../composables/useTheme'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Ingresar · ByLoa', noindex: true, darkOnly: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAuth: true, title: 'Panel · ByLoa', noindex: true, darkOnly: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard para proteger rutas autenticadas
router.beforeEach(async (to, from, next) => {
  // Inicializar autenticación si no está hecha
  const user = await initAuth()

  if (to.meta.requiresAuth) {
    if (user) {
      next()
    } else {
      next('/login')
    }
  } else {
    if (to.path === '/login' && user) {
      next('/admin')
    } else {
      next()
    }
  }
})

/**
 * Título y robots por ruta. Todas las rutas sirven el mismo `index.html`, que
 * trae el título y el `index, follow` de la home; para login y panel se pisan
 * acá, así nunca aparecen en Google aunque alguien enlace a ellas.
 */
const DEFAULT_TITLE = document.title
const robotsTag = document.querySelector('meta[name="robots"]')
const DEFAULT_ROBOTS = robotsTag?.getAttribute('content')

router.afterEach((to) => {
  // Login y panel están diseñados sólo en oscuro; al volver al sitio, el tema
  // que la persona eligió.
  forceThemeFor(to.meta.darkOnly ? 'dark' : savedTheme())
  document.title = to.meta.title ?? DEFAULT_TITLE
  robotsTag?.setAttribute('content', to.meta.noindex ? 'noindex, nofollow' : DEFAULT_ROBOTS)
})

export default router
