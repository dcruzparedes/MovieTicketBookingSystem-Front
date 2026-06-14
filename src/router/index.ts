import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import VistaSeleccionAsientos from '@/views/asientos/VistaSeleccionAsientos.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    { path: '/asientos', name: 'asientos', component: VistaSeleccionAsientos },
    {
      path: '/admin/peliculas/nueva',
      name: 'admin-movie-create',
      component: () => import('@/views/admin/MovieFormView.vue'),
    },
  ],
})

export default router
