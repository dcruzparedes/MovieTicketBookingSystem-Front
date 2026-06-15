<template>
  <div class="auth-screen">

    <!-- Panel izquierdo -->
    <div class="auth-panel-left">
      <div class="panel-logo">Cine <em>Vicenta</em></div>
      <div class="panel-tagline">Puerto Cortés · Honduras</div>

      <div class="frase-container">
        <Transition name="frase" mode="out-in">
          <div :key="fraseActual.titulo" class="frase-wrap">
            <div class="frase-icono">{{ fraseActual.icono }}</div>
            <blockquote class="frase-texto">{{ fraseActual.frase }}</blockquote>
            <div class="frase-rol">— {{ fraseActual.titulo }}</div>
          </div>
        </Transition>
      </div>

      <div class="frase-dots">
        <span v-for="(f, i) in frases" :key="i" class="dot" :class="{ active: i === fraseIndex }"
          @click="fraseIndex = i" />
      </div>
    </div>

    <!-- Panel derecho -->
    <div class="auth-panel-right">

      <!-- Barra superior con BtnHome -->
      <div class="top-bar">
        <BtnHome />
      </div>

      <!-- Contenido centrado -->
      <div class="auth-center">
        <div class="auth-wrap">
          <div class="auth-logo-mobile">Cine <em>Vicenta</em></div>

          <!-- Estado: enviado -->
          <div v-if="sent" class="card animado" style="--delay: 0ms">
            <div class="card-body" style="text-align: center">
              <Avatar icon="pi pi-envelope" size="xlarge" shape="circle" :style="{
                background: 'rgba(30,120,60,0.1)',
                color: '#1e783c',
                border: '1.5px solid rgba(30,120,60,0.3)',
                width: '64px', height: '64px',
                margin: '0 auto 16px',
                display: 'flex'
              }" />
              <div class="form-title">Revisa tu correo</div>
              <Message severity="success" :closable="false" style="margin-bottom: 16px; text-align: left">
                Enviamos el enlace de restablecimiento a <strong>{{ email }}</strong>. Puede tardar unos minutos en
                llegar.
              </Message>
              <div class="resend-row">
                ¿No llegó?
                <button class="btn-link" :disabled="cooldown > 0" @click="resend">
                  {{ cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar correo' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Estado: formulario -->
          <div v-else class="card animado" style="--delay: 0ms">
            <div class="card-body">
              <div class="form-title animado" style="--delay: 60ms">Recuperar contraseña</div>
              <p class="form-sub animado" style="--delay: 100ms">Te enviaremos un enlace a tu correo.</p>

              <Transition name="fade-alert">
                <Message v-if="serverError" severity="error" :closable="false" style="margin-bottom: 16px">
                  {{ serverError }}
                </Message>
              </Transition>

              <form @submit.prevent="handleSubmit" novalidate>
                <div class="field animado" style="--delay: 140ms">
                  <label for="email">Correo electrónico</label>
                  <InputText id="email" v-model="email" type="email" placeholder="tu@correo.com"
                    :invalid="touched && !!error" fluid @blur="touched = true" autocomplete="email" />
                  <Transition name="fade-alert">
                    <small v-if="touched && error" class="field-error">{{ error }}</small>
                  </Transition>
                </div>

                <Button type="submit" label="Enviar enlace" icon="pi pi-send" fluid :loading="submitting"
                  class="animado" style="--delay: 180ms" />
              </form>

              <div class="auth-footer animado" style="--delay: 220ms">
                <RouterLink to="/login">← Volver al inicio de sesión</RouterLink>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Avatar from 'primevue/avatar'
import BtnHome from '@/components/BtnHome.vue'

const email = ref('')
const touched = ref(false)
const submitting = ref(false)
const sent = ref(false)
const serverError = ref('')
const cooldown = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null

const error = computed(() => {
  if (!email.value.trim()) return 'El correo es requerido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Ingresa un correo válido.'
  return ''
})

async function handleSubmit() {
  touched.value = true
  serverError.value = ''
  if (error.value) return
  submitting.value = true
  try {
    await new Promise((r) => setTimeout(r, 900))
    sent.value = true
    startCooldown()
  } catch (err: any) {
    serverError.value = err?.response?.data?.message ?? 'Ocurrió un error. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}

async function resend() {
  if (cooldown.value > 0) return
  try {
    await new Promise((r) => setTimeout(r, 600))
    startCooldown()
  } catch { /* silently ignore */ }
}

function startCooldown(seconds = 60) {
  cooldown.value = seconds
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer!)
  }, 1000)
}

const frases = [
  { titulo: 'Sin preocupaciones', icono: '📧', frase: 'Te enviamos un enlace seguro para restablecer tu contraseña en segundos.' },
  { titulo: 'Tu cuenta segura', icono: '🔐', frase: 'Nuestro sistema de recuperación usa enlaces de un solo uso con expiración automática.' },
  { titulo: 'Cine Vicenta', icono: '🎬', frase: 'Recupera el acceso y vuelve a disfrutar de tus películas favoritas.' },
]
const fraseIndex = ref(0)
const fraseActual = computed(() => frases[fraseIndex.value]!)

let intervalo: ReturnType<typeof setInterval>
onMounted(() => { intervalo = setInterval(() => { fraseIndex.value = (fraseIndex.value + 1) % frases.length }, 3500) })
onUnmounted(() => { clearInterval(intervalo); if (cooldownTimer) clearInterval(cooldownTimer) })
</script>

<style scoped>
.auth-screen {
  display: flex;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
}

/* ── Panel izquierdo ── */
.auth-panel-left {
  width: 420px;
  flex-shrink: 0;
  background: var(--rosewood);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.panel-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 32px;
  color: #faf0ec;
  letter-spacing: .3px;
  margin-bottom: 4px;
  text-align: center;
}

.panel-logo em {
  font-style: italic;
  color: var(--tangelo);
}

.panel-tagline {
  font-size: 10px;
  color: rgba(250, 240, 236, .35);
  letter-spacing: 2.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 52px;
}

.frase-container {
  width: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.frase-wrap {
  text-align: center;
}

.frase-icono {
  font-size: 36px;
  margin-bottom: 16px;
}

.frase-texto {
  font-family: 'DM Serif Display', serif;
  font-size: 19px;
  font-style: italic;
  color: #faf0ec;
  line-height: 1.55;
  margin: 0 0 14px;
  opacity: .92;
}

.frase-rol {
  font-size: 11px;
  color: rgba(250, 240, 236, .4);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.frase-dots {
  display: flex;
  gap: 7px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(250, 240, 236, .25);
  cursor: pointer;
  transition: background .3s, transform .3s;
}

.dot.active {
  background: var(--tangelo);
  transform: scale(1.3);
}

/* ── Panel derecho ── */
.auth-panel-right {
  flex: 1;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px 0;
}

.auth-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-wrap {
  width: 380px;
}

.auth-logo-mobile {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--rosewood);
  text-align: center;
  margin-bottom: 20px;
  display: none;
}

.auth-logo-mobile em {
  font-style: italic;
  color: var(--tangelo);
}

/* Card */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.card-body {
  padding: 24px;
}

.form-title {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: var(--text);
  margin-bottom: 6px;
}

.form-sub {
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 20px;
}

/* Fields */
.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 5px;
  font-weight: 500;
}

.field-error {
  display: block;
  font-size: 11px;
  color: var(--sinopia);
  margin-top: 4px;
}

/* Resend */
.resend-row {
  text-align: center;
  font-size: 12px;
  color: var(--text3);
  margin-top: 8px;
}

.btn-link {
  background: none;
  border: none;
  color: var(--sinopia);
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  transition: opacity .2s;
}

.btn-link:disabled {
  color: var(--text3);
  cursor: default;
}

/* Footer */
.auth-footer {
  text-align: center;
  font-size: 12px;
  color: var(--text3);
  margin-top: 14px;
}

.auth-footer a {
  color: var(--sinopia);
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* ── Animaciones ── */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animado {
  opacity: 0;
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

.frase-enter-active {
  transition: opacity .5s ease, transform .5s cubic-bezier(0.22, 1, 0.36, 1);
}

.frase-leave-active {
  transition: opacity .3s ease, transform .3s ease;
}

.frase-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.frase-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-alert-enter-active {
  transition: opacity .2s ease, transform .2s ease;
}

.fade-alert-leave-active {
  transition: opacity .15s ease;
}

.fade-alert-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-alert-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .auth-panel-left {
    display: none;
  }

  .auth-logo-mobile {
    display: block;
  }
}
</style>
