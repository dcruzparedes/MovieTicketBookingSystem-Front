import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VistaSeleccionAsientos from '@/views/asientos/VistaSeleccionAsientos.vue'
import VistaPago from '@/views/pago/VistaPago.vue'
import VistaConfirmacion from '@/views/pago/VistaConfirmacionPago.vue'
import VistaErrorPago from '@/views/pago/VistaErrorPago.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    { path: '/asientos', name: 'asientos', component: VistaSeleccionAsientos },
    { path: '/pago', name: 'pago', component: VistaPago },
    { path: '/confirmacion', name: 'confirmacion', component: VistaConfirmacion },
    { path: '/error-pago', name: 'error-pago', component: VistaErrorPago },
    {
      path: '/admin/peliculas',
      name: 'admin-movies',
      component: () => import('@/views/admin/MoviesView.vue'),
    },
    {
      path: '/admin/peliculas/nueva',
      name: 'admin-movie-create',
      component: () => import('@/views/admin/MovieFormView.vue'),
    },
    {
      path: '/admin/peliculas/:id/editar',
      name: 'admin-movie-edit',
      component: () => import('@/views/admin/EditMovieView.vue'),
    },
    {
      path: '/admin/cines/nuevo',
      name: 'admin-cinema-create',
      component: () => import('@/views/admin/CinemaFormView.vue'),
    },
    {
      path: '/admin/cines/:id/editar',
      name: 'admin-cinema-edit',
      component: () => import('@/views/admin/EditCinemaView.vue'),
    },
    {
      path: '/admin/salas/nueva',
      name: 'admin-sala-create',
      component: () => import('@/views/admin/SalaFormView.vue'),
    },
    {
      path: '/perfil',
      name: 'profile',
      component: () => import('@/views/perfil/ProfileView.vue'),
    },{
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/FotgotPasswordView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
    },
  ],
})

export default router
