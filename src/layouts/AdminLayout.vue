<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

withDefaults(defineProps<{ subtitle?: string }>(), { subtitle: 'Administrador' })

const route = useRoute()
const router = useRouter()

const navGroups = [
  {
    label: 'Catálogo',
    items: [
      { label: 'Películas', icon: 'pi-video', to: '/admin/peliculas' },
      { label: 'Géneros', icon: 'pi-list', to: '/admin/generos' },
      { label: 'Idiomas', icon: 'pi-globe', to: '/admin/idiomas' },
      { label: 'Cines', icon: 'pi-building', to: '/admin/cines' },
      { label: 'Salas', icon: 'pi-objects-column', to: '/admin/salas' },
      { label: 'Ciudades', icon: 'pi-map-marker', to: '/admin/ciudades' },
      { label: 'Funciones', icon: 'pi-calendar', to: '/admin/funciones' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { label: 'Cupones', icon: 'pi-tag', to: '/admin/cupones' },
      { label: 'Cancelaciones', icon: 'pi-arrow-circle-left', to: '/admin/cancelaciones' },
      { label: 'Reembolsos', icon: 'pi-dollar', to: '/admin/reembolsos' },
    ],
  },
  {
    label: 'Usuarios',
    items: [
      { label: 'Clientes', icon: 'pi-users', to: '/admin/clientes' },
      { label: 'Roles', icon: 'pi-user-edit', to: '/admin/roles' },
    ],
  },
  {
    label: 'Reportes',
    items: [
      { label: 'Reservas', icon: 'pi-chart-bar', to: '/admin/reservas' },
      { label: 'Pagos', icon: 'pi-wallet', to: '/admin/pagos' },
    ],
  },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

function logout() {
  router.push('/')
}
</script>

<template>
  <div class="admin-wrap">
    <aside class="sidebar">
      <RouterLink to="/admin" class="sidebar-logo">
        Cine <em>Vicenta</em>
        <span>{{ subtitle }}</span>
      </RouterLink>

      <nav class="sidebar-nav">
        <slot name="nav">
          <template v-for="group in navGroups" :key="group.label">
            <p class="nav-group">{{ group.label }}</p>
            <RouterLink v-for="item in group.items" :key="item.to" :to="item.to" class="nav-item"
              :class="{ active: isActive(item.to) }">
              <i :class="['pi', item.icon, 'nav-icon']" />
              {{ item.label }}
            </RouterLink>
          </template>
        </slot>
      </nav>

      <button class="nav-item logout" @click="logout">
        <i class="pi pi-sign-out nav-icon" />
        Salir
      </button>
    </aside>

    <main class="admin-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-wrap {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 218px;
  background: var(--rosewood);
  flex-shrink: 0;
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sidebar-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 18px;
  color: var(--cream);
  padding: 0 8px 14px;
  border-bottom: 1px solid rgba(250, 240, 236, 0.12);
  margin-bottom: 12px;
  display: block;
  text-decoration: none;
  transition: opacity 0.2s;
}

.sidebar-logo:hover {
  opacity: 0.85;
}

.sidebar-logo em {
  font-style: italic;
  color: var(--tangelo);
}

.sidebar-logo span {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 9px;
  color: rgba(250, 240, 236, 0.35);
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 2px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-group {
  font-size: 9px;
  color: rgba(250, 240, 236, 0.3);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 10px 8px 4px;
  font-weight: 600;
}

.logout {
  color: rgba(250, 240, 236, 0.3);
  margin-top: 8px;
}

.logout:hover {
  color: rgba(250, 240, 236, 0.6);
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
}
</style>

<!-- Sin "scoped": el contenido de <slot name="nav"> proporcionado por quien consume
     este layout se compila con el alcance del componente padre, no el de este archivo. -->
<style>
.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(250, 240, 236, 0.55);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 400;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: rgba(250, 240, 236, 0.08);
  color: rgba(250, 240, 236, 0.85);
}

.nav-item.active {
  background: rgba(243, 113, 0, 0.25);
  color: var(--cream);
  font-weight: 500;
}

.nav-icon {
  font-size: 13px;
  flex-shrink: 0;
}
</style>
