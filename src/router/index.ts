import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Público ──
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/FotgotPasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
    },

    // ── Cliente ──
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/asientos',
      name: 'asientos',
      component: () => import('@/views/asientos/VistaSeleccionAsientos.vue'),
    },
    {
      path: '/pago',
      name: 'pago',
      component: () => import('@/views/pago/VistaPago.vue'),
    },
    {
      path: '/confirmacion',
      name: 'confirmacion',
      component: () => import('@/views/pago/VistaConfirmacionPago.vue'),
    },
    {
      path: '/error-pago',
      name: 'error-pago',
      component: () => import('@/views/pago/VistaErrorPago.vue'),
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
    },

    // ── Admin ──
    {
      path: '/admin/peliculas',
      name: 'admin-peliculas',
      component: () => import('@/views/admin/MoviesView.vue'),
    },
    {
      path: '/admin/peliculas/nueva',
      name: 'admin-pelicula-crear',
      component: () => import('@/views/admin/MovieFormView.vue'),
    },
    {
      path: '/admin/peliculas/:id/editar',
      name: 'admin-pelicula-editar',
      component: () => import('@/views/admin/EditMovieView.vue'),
    },
    {
      path: '/admin/cines/nuevo',
      name: 'admin-cine-crear',
      component: () => import('@/views/admin/CinemaFormView.vue'),
    },
    {
      path: '/admin/cines/:id/editar',
      name: 'admin-cine-editar',
      component: () => import('@/views/admin/EditCinemaView.vue'),
    },
    {
      path: '/admin/salas/nueva',
      name: 'admin-sala-crear',
      component: () => import('@/views/admin/SalaFormView.vue'),
    },
    {
      path: '/admin/funciones/nueva',
      name: 'admin-funcion-crear',
      component: () => import('@/views/admin/FuncionFormView.vue'),
    },
    {
      path: '/admin/clientes',
      name: 'admin-clientes',
      component: () => import('@/views/admin/CustomersView.vue'),
    },
  ],
})

export default router
