<template>
  <nav class="top-nav">
    <div class="nav-container">

      <!-- Logo -->
      <div class="nav-logo" @click="handleLogoClick">
        Cine <em>Vicenta</em>
      </div>

      <!-- Links -->
      <div class="nav-links">
        <a @click="handleHomeClick">Cartelera</a>

        <!-- Sin sesión -->
        <template v-if="!estaAutenticado">
          <RouterLink to="/login" class="nav-link-sutil">Iniciar sesión</RouterLink>
          <RouterLink to="/register">
            <Button label="Crear cuenta" size="small" />
          </RouterLink>
        </template>

        <!-- Con sesión -->
        <template v-else>
          <div class="nav-usuario" @click="toggleMenu">
            <Avatar :label="inicialUsuario" shape="circle" class="nav-avatar" />
            <span class="nav-nombre">{{ nombreUsuario }}</span>
            <i class="pi pi-chevron-down nav-chevron" :class="{ rotado: menuVisible }" />
          </div>

          <Menu ref="menuRef" :model="menuItems" popup />
        </template>
      </div>

    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import { getUsuarioActual, cerrarSesion, sesionVersion } from '@/services/authService'

const router = useRouter()
const emit = defineEmits(['logo-click', 'home-click'])

const usuarioActual = computed(() => { sesionVersion.value; return getUsuarioActual() })
const estaAutenticado = computed(() => usuarioActual.value !== null)
const nombreUsuario = computed(() => usuarioActual.value?.nombre ?? '')

const inicialUsuario = computed(() =>
  nombreUsuario.value?.charAt(0).toUpperCase() ?? 'U'
)

// ── Menú desplegable ──
const menuRef = ref()
const menuVisible = ref(false)

function toggleMenu(event: MouseEvent) {
  menuRef.value.toggle(event)
  menuVisible.value = !menuVisible.value
}

const menuItems = computed(() => [
  {
    label: nombreUsuario.value,
    items: [
      {
        label: 'Mi perfil',
        icon: 'pi pi-user',
        command: () => router.push('/perfil'),
      },
      {
        label: 'Mis reservas',
        icon: 'pi pi-ticket',
        command: () => router.push({ path: '/perfil', query: { tab: 'reservas' } }),
      },
      { separator: true },
      {
        label: 'Cerrar sesión',
        icon: 'pi pi-sign-out',
        command: logout,
      },
    ],
  },
])

function logout() {
  cerrarSesion()
  router.push('/login')
}

function handleLogoClick() {
  emit('logo-click')
  router.push('/')
}
function handleHomeClick() {
  emit('home-click')
  router.push('/')
}
</script>

<style scoped>
.top-nav {
  background: var(--rosewood);
  height: 52px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0 24px;
}

.nav-container {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: var(--cream);
  letter-spacing: 0.3px;
  cursor: pointer;
}

.nav-logo em {
  font-style: italic;
  color: var(--tangelo);
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  color: rgba(250, 240, 236, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 500;
  text-decoration: none;
}

.nav-links a:hover {
  color: rgba(250, 240, 236, 0.85);
}

.nav-link-sutil {
  color: rgba(250, 240, 236, 0.6) !important;
  font-size: 13px !important;
}

/* ── Usuario autenticado ── */
.nav-usuario {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background 0.2s;
}

.nav-usuario:hover {
  background: rgba(250, 240, 236, 0.08);
}

.nav-avatar {
  width: 30px;
  height: 30px;
  font-size: 13px;
  cursor: pointer;
  background: rgba(243, 80, 10, 0.25) !important;
  color: var(--cream) !important;
  border: 1.5px solid rgba(243, 80, 10, 0.4);
}

.nav-nombre {
  font-size: 13px;
  color: rgba(250, 240, 236, 0.85);
  font-weight: 500;
}

.nav-chevron {
  font-size: 10px;
  color: rgba(250, 240, 236, 0.45);
  transition: transform 0.2s;
}

.nav-chevron.rotado {
  transform: rotate(180deg);
}
</style>
