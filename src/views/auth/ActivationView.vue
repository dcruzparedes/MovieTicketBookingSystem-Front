<template>
  <div class="auth-screen">
    <!-- Panel izquierdo (reutilizado) -->
    <div class="auth-panel-left">
      <div class="panel-logo">Cine <em>Vicenta</em></div>
      <div class="panel-tagline">Puerto Cortés · Honduras</div>
      <blockquote class="frase-texto">Activa tu cuenta para comenzar a disfrutar de la mejor experiencia cinematográfica.</blockquote>
    </div>

    <!-- Panel derecho -->
    <div class="auth-panel-right">
      <BtnHome class="btn-home-pos" />
      <div class="auth-wrap">
        <div class="card animado">
          <div class="card-body">
            <h2 class="auth-title">Activar cuenta</h2>
            <p class="auth-subtitle">Ingresa el token de verificación que enviamos a tu correo electrónico.</p>
            
            <form @submit.prevent="handleActivate">
              <div class="field">
                <input v-model="token" type="text" placeholder="Token de verificación" required />
              </div>
              <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
                {{ submitting ? 'Activando...' : 'Activar cuenta' }}
              </button>
            </form>

            <div v-if="apiError" class="alert alert-error">{{ apiError }}</div>
            <div v-if="success" class="alert alert-success">¡Cuenta activada con éxito! Redirigiendo al login...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BtnHome from '@/components/BtnHome.vue'
import { api } from '@/services/api' 

const router = useRouter()
const route = useRoute()
const token = ref((route.query.token as string) || '')
const submitting = ref(false)
const apiError = ref<string | null>(null)
const success = ref(false)

async function handleActivate() {
  submitting.value = true
  apiError.value = null
  try {
    await api.post('/auth/activate', { token: token.value })
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (err: any) {
    apiError.value = 'Token inválido o cuenta ya activada.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (token.value) {
    handleActivate()
  }
})
</script>

<style scoped>
/* Importing styles from RegisterView.vue to maintain consistency */
.auth-screen { display: flex; min-height: 100vh; font-family: 'Outfit', sans-serif; }
.auth-panel-left { width: 420px; flex-shrink: 0; background: var(--rosewood); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 40px; }
.panel-logo { font-family: 'DM Serif Display', serif; font-size: 32px; color: var(--cream); letter-spacing: 0.3px; margin-bottom: 4px; text-align: center; }
.panel-logo em { font-style: italic; color: var(--tangelo); }
.panel-tagline { font-size: 10px; color: rgba(250, 240, 236, 0.35); letter-spacing: 2.5px; text-transform: uppercase; text-align: center; margin-bottom: 52px; }
.frase-texto { font-family: 'DM Serif Display', serif; font-size: 19px; font-style: italic; color: var(--cream); line-height: 1.55; text-align: center; }
.auth-panel-right { flex: 1; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
.auth-wrap { width: 380px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
.card-body { padding: 24px; }
.auth-title { font-family: 'DM Serif Display', serif; font-size: 24px; color: var(--rosewood); margin-bottom: 8px; }
.auth-subtitle { font-size: 14px; color: var(--text2); margin-bottom: 20px; }
.field { margin-bottom: 16px; }
.field input { width: 100%; background: var(--bg); border: 1px solid var(--border2); color: var(--text); padding: 10px 13px; border-radius: var(--radius); font-size: 14px; outline: none; }
.btn { border: none; cursor: pointer; font-family: 'Outfit', sans-serif; border-radius: var(--radius); font-weight: 600; padding: 11px 24px; font-size: 14px; width: 100%; }
.btn-primary { background: var(--sinopia); color: #fff; }
.alert { border-radius: var(--radius); padding: 12px 16px; font-size: 13px; margin-top: 16px; }
.alert-success { background: rgba(30, 120, 60, 0.08); color: var(--success); }
.alert-error { background: rgba(217, 34, 0, 0.08); color: var(--sinopia); }
.btn-home-pos { position: absolute; top: 20px; right: 24px; }
</style>
