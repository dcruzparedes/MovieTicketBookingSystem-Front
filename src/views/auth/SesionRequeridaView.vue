<template>
  <div class="vista-sesion-requerida">
    <div class="sesion-layout">
      <div class="sesion-card">
        <div class="sesion-icono">
          <i class="pi pi-lock" />
        </div>
        <div class="sesion-titulo">Necesitas iniciar sesión</div>
        <div class="sesion-sub">
          Necesitas iniciar sesión o crear una cuenta primero para continuar.
        </div>

        <div class="sesion-acciones">
          <Button label="Iniciar sesión" fluid @click="irALogin" />
          <Button label="Crear cuenta" severity="secondary" outlined fluid @click="irARegistro" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'

const route = useRoute()
const router = useRouter()

const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null

function irALogin() {
  router.push(redirect ? { path: '/login', query: { redirect } } : '/login')
}

function irARegistro() {
  router.push('/register')
}
</script>

<style scoped>
.vista-sesion-requerida {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
}

.sesion-layout {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.sesion-card {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 14px;
  padding: 38px;
  width: 380px;
  text-align: center;
}

.sesion-icono {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(217, 34, 0, 0.08);
  border: 1.5px solid rgba(217, 34, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 22px;
  color: var(--sinopia);
}

.sesion-titulo {
  font-family: 'DM Serif Display', serif;
  font-size: 24px;
  color: var(--text);
  margin-bottom: 10px;
}

.sesion-sub {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 24px;
}

.sesion-acciones {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
