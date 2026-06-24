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
      path: '/activate',
      name: 'activate',
      component: () => import('@/views/auth/ActivationView.vue'),
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
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/AdminDashboard.vue'),
    },
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
      path: '/admin/cines',
      name: 'admin-cines',
      component: () => import('@/views/admin/CinemasView.vue'),
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
      path: '/admin/salas',
      name: 'admin-salas',
      component: () => import('@/views/admin/SalasView.vue'),
    },
    {
      path: '/admin/salas/nueva',
      name: 'admin-sala-crear',
      component: () => import('@/views/admin/SalaFormView.vue'),
    },
    {
      path: '/admin/salas/:id/editar',
      name: 'admin-sala-editar',
      component: () => import('@/views/admin/EditSalaView.vue'),
    },
    {
      path: '/admin/ciudades',
      name: 'admin-ciudades',
      component: () => import('@/views/admin/CiudadesView.vue'),
    },
    {
      path: '/admin/funciones',
      name: 'admin-funciones',
      component: () => import('@/views/admin/FuncionesView.vue'),
    },
    {
      path: '/admin/funciones/nueva',
      name: 'admin-funcion-crear',
      component: () => import('@/views/admin/FuncionFormView.vue'),
    },
    {
      path: '/admin/funciones/:id/editar',
      name: 'admin-funcion-editar',
      component: () => import('@/views/admin/EditFuncionView.vue'),
    },
    {
      path: '/admin/clientes',
      name: 'admin-clientes',
      component: () => import('@/views/admin/CustomersView.vue'),
    },
    {
      path: '/admin/generos',
      name: 'admin-generos',
      component: () => import('@/views/admin/GenerosView.vue'),
    },
    {
      path: '/admin/idiomas',
      name: 'admin-idiomas',
      component: () => import('@/views/admin/IdiomasView.vue'),
    },
    {
      path: '/admin/roles',
      name: 'admin-roles',
      component: () => import('@/views/admin/RolesView.vue'),
    },
    {
      path: '/admin/reembolsos',
      name: 'admin-reembolsos',
      component: () => import('@/views/admin/ReembolsosView.vue'),
    },
    {
      path: '/admin/cupones',
      name: 'admin-cupones',
      component: () => import('@/views/admin/CuponesView.vue'),
    },
    {
      path: '/admin/cancelaciones',
      name: 'admin-cancelaciones',
      component: () => import('@/views/admin/CancelacionesView.vue'),
    },
    {
      path: '/admin/reservas',
      name: 'admin-reservas',
      component: () => import('@/views/admin/ReservasView.vue'),
    },
    {
      path: '/admin/pagos',
      name: 'admin-pagos',
      component: () => import('@/views/admin/PagosView.vue'),
    },
  ],
})

export default router
