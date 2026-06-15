<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const emit = defineEmits(['logo-click', 'home-click'])

function handleLogoClick() {
  emit('logo-click')
}

function handleHomeClick() {
  emit('home-click')
}

function logout() {
  console.log('Cerrando sesión...')
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  // Redirigir al login
  router.push('/login')
}
</script>

<template>
  <nav class="top-nav">
    <div class="nav-container">
      <div class="nav-logo" @click="handleLogoClick">Cine <em>Vicenta</em></div>
      <div class="nav-links">
        <a @click="handleHomeClick">Cartelera</a>
        <RouterLink to="/perfil">Mi cuenta</RouterLink>
        <button class="nav-btn" @click="logout">Iniciar Sesión</button>
      </div>
    </div>
  </nav>
</template>

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
  color: #faf0ec;
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
.nav-btn {
  background: var(--orange);
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
}
</style>
