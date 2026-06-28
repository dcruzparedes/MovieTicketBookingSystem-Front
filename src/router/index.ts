import { createRouter, createWebHistory } from 'vue-router'
import { getUsuarioActual, rutaPorRol } from '@/services/authService'

declare module 'vue-router' {
  interface RouteMeta {
    publico?: boolean
    roles?: string[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Público ──
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { publico: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { publico: true },
    },
    {
      path: '/activate',
      name: 'activate',
      component: () => import('@/views/auth/ActivationView.vue'),
      meta: { publico: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/FotgotPasswordView.vue'),
      meta: { publico: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
      meta: { publico: true },
    },
    {
      path: '/sesion-requerida',
      name: 'sesion-requerida',
      component: () => import('@/views/auth/SesionRequeridaView.vue'),
      meta: { publico: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { publico: true },
    },

    // ── Cliente (requiere sesión con rol cliente) ──
    {
      path: '/asientos',
      name: 'asientos',
      component: () => import('@/views/asientos/VistaSeleccionAsientos.vue'),
      meta: { roles: ['cliente'] },
    },
    {
      path: '/pago',
      name: 'pago',
      component: () => import('@/views/pago/VistaPago.vue'),
      meta: { roles: ['cliente'] },
    },
    {
      path: '/confirmacion',
      name: 'confirmacion',
      component: () => import('@/views/pago/VistaConfirmacionPago.vue'),
      meta: { roles: ['cliente'] },
    },
    {
      path: '/error-pago',
      name: 'error-pago',
      component: () => import('@/views/pago/VistaErrorPago.vue'),
      meta: { roles: ['cliente'] },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/views/perfil/ProfileView.vue'),
    },

    // ── Recepcionista ──
    {
      path: '/recepcionista',
      name: 'recepcionista',
      component: () => import('@/views/recepcionista/VistaBuscarCliente.vue'),
      meta: { roles: ['recepcionista'] },
    },

    // ── Admin ──
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/AdminDashboard.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/peliculas',
      name: 'admin-peliculas',
      component: () => import('@/views/admin/MoviesView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/peliculas/nueva',
      name: 'admin-pelicula-crear',
      component: () => import('@/views/admin/MovieFormView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/peliculas/:id/editar',
      name: 'admin-pelicula-editar',
      component: () => import('@/views/admin/EditMovieView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/cines',
      name: 'admin-cines',
      component: () => import('@/views/admin/CinemasView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/cines/nuevo',
      name: 'admin-cine-crear',
      component: () => import('@/views/admin/CinemaFormView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/cines/:id/editar',
      name: 'admin-cine-editar',
      component: () => import('@/views/admin/EditCinemaView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/salas',
      name: 'admin-salas',
      component: () => import('@/views/admin/SalasView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/salas/nueva',
      name: 'admin-sala-crear',
      component: () => import('@/views/admin/SalaFormView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/salas/:id/editar',
      name: 'admin-sala-editar',
      component: () => import('@/views/admin/EditSalaView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/ciudades',
      name: 'admin-ciudades',
      component: () => import('@/views/admin/CiudadesView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/funciones',
      name: 'admin-funciones',
      component: () => import('@/views/admin/FuncionesView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/funciones/nueva',
      name: 'admin-funcion-crear',
      component: () => import('@/views/admin/FuncionFormView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/funciones/:id/editar',
      name: 'admin-funcion-editar',
      component: () => import('@/views/admin/EditFuncionView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/clientes',
      name: 'admin-clientes',
      component: () => import('@/views/admin/CustomersView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/generos',
      name: 'admin-generos',
      component: () => import('@/views/admin/GenerosView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/idiomas',
      name: 'admin-idiomas',
      component: () => import('@/views/admin/IdiomasView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/roles',
      name: 'admin-roles',
      component: () => import('@/views/admin/RolesView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/reembolsos',
      name: 'admin-reembolsos',
      component: () => import('@/views/admin/ReembolsosView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/cupones',
      name: 'admin-cupones',
      component: () => import('@/views/admin/CuponesView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/cancelaciones',
      name: 'admin-cancelaciones',
      component: () => import('@/views/admin/CancelacionesView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/reservas',
      name: 'admin-reservas',
      component: () => import('@/views/admin/ReservasView.vue'),
      meta: { roles: ['admin'] },
    },
    {
      path: '/admin/pagos',
      name: 'admin-pagos',
      component: () => import('@/views/admin/PagosView.vue'),
      meta: { roles: ['admin'] },
    },
  ],
})

// Bloquea el acceso a cualquier ruta no marcada como pública si no hay
// sesión activa, y restringe por rol las rutas que declaren `meta.roles`.
router.beforeEach((to) => {
  if (to.meta.publico) return true

  const usuario = getUsuarioActual()
  if (!usuario) {
    return { path: '/sesion-requerida', query: { redirect: to.fullPath } }
  }

  // Si el rol activo no puede entrar a esta ruta, se cancela el intento y
  // continúa con el flujo propio de ese rol (no con un destino genérico).
  if (to.meta.roles && !to.meta.roles.includes(usuario.rol)) {
    return { path: rutaPorRol(usuario.rol) }
  }

  return true
})

export default router
