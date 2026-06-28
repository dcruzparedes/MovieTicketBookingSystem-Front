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
      <BtnHome />

      <div class="auth-wrap">
        <div class="auth-logo-mobile">Cine <em>Vicenta</em></div>

        <!-- Estado: éxito -->
        <div v-if="saved" class="card animado" style="--delay: 0ms">
          <div class="card-body" style="text-align: center">
            <Avatar icon="pi pi-check" size="xlarge" shape="circle" :style="{
              background: 'rgba(30,120,60,0.1)',
              color: 'var(--success)',
              border: '1.5px solid rgba(30,120,60,0.3)',
              width: '64px', height: '64px',
              margin: '0 auto 16px',
              display: 'flex'
            }" />
            <div class="form-title">Contraseña actualizada</div>
            <p class="form-sub">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <Button label="Ir al inicio de sesión" icon="pi pi-sign-in" fluid @click="enrutador.push('/login')" />
          </div>
        </div>

        <!-- Estado: sin token en la URL -->
        <div v-else-if="tokenFaltante" class="card animado" style="--delay: 0ms">
          <div class="card-body" style="text-align: center">
            <Message severity="error" :closable="false" style="margin-bottom: 16px; text-align: left">
              Este enlace no es válido. Solicita uno nuevo para restablecer tu contraseña.
            </Message>
            <Button label="Solicitar enlace" icon="pi pi-send" fluid @click="enrutador.push('/forgot-password')" />
          </div>
        </div>

        <!-- Estado: formulario -->
        <div v-else class="card animado" style="--delay: 0ms">
          <div class="card-body">
            <div class="form-title animado" style="--delay: 60ms">Nueva contraseña</div>
            <p class="form-sub animado" style="--delay: 100ms">Elige una contraseña segura.</p>

            <Transition name="fade-alert">
              <Message v-if="serverError" severity="error" :closable="false" style="margin-bottom: 16px">
                {{ serverError }}
              </Message>
            </Transition>

            <form @submit.prevent="handleSubmit" novalidate>
              <div class="field animado" style="--delay: 140ms">
                <label for="password">Nueva contraseña</label>
                <Password id="password" v-model="form.password" placeholder="Mínimo 8 caracteres" :feedback="false"
                  :invalid="touched.password && !!errors.password" fluid toggle-mask @blur="touch('password')" />
                <Transition name="fade-alert">
                  <small v-if="touched.password && errors.password" class="field-error">{{ errors.password }}</small>
                </Transition>
                <div v-if="form.password" class="pw-strength">
                  <div class="pw-strength-bar" :style="{ width: strengthPercent + '%', background: strengthColor }" />
                </div>
                <Transition name="fade-alert">
                  <small v-if="form.password" class="field-hint" :style="{ color: strengthColor }">{{ strengthLabel
                    }}</small>
                </Transition>
              </div>

              <div class="field animado" style="--delay: 180ms">
                <label for="confirm">Confirmar contraseña</label>
                <Password id="confirm" v-model="form.confirm" placeholder="Repite la contraseña" :feedback="false"
                  :invalid="touched.confirm && !!errors.confirm" fluid toggle-mask @blur="touch('confirm')" />
                <Transition name="fade-alert">
                  <small v-if="touched.confirm && errors.confirm" class="field-error">{{ errors.confirm }}</small>
                </Transition>
                <Transition name="fade-alert">
                  <small v-if="touched.confirm && !errors.confirm && form.confirm" class="field-hint"
                    style="color: var(--success)">
                    ✓ Las contraseñas coinciden
                  </small>
                </Transition>
              </div>

              <Button type="submit" label="Guardar contraseña" icon="pi pi-lock" fluid :loading="submitting"
                class="animado" style="--delay: 220ms" />
            </form>

            <div class="auth-footer animado" style="--delay: 260ms">
              <RouterLink to="/login">← Volver al inicio de sesión</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Avatar from 'primevue/avatar'
import BtnHome from '@/components/BtnHome.vue'
import { authService } from '@/services/authService'
import { isApiError } from '@/services/api'

const route = useRoute()
const enrutador = useRouter()

const resetToken = computed(() => String(route.query.token ?? ''))
const tokenFaltante = computed(() => !resetToken.value)

// ── Frases ──
const frases = [
  { titulo: 'Seguridad primero', icono: '🔒', frase: 'Una buena contraseña es tu primera línea de defensa. Elige una segura.' },
  { titulo: 'Casi listo', icono: '✅', frase: 'Solo un paso más y podrás volver a disfrutar de tus películas favoritas.' },
  { titulo: 'Cine Vicenta', icono: '🎬', frase: 'Tu cuenta segura, tu experiencia sin interrupciones.' },
]
const fraseIndex = ref(0)
const fraseActual = computed(() => frases[fraseIndex.value]!)

let intervalo: ReturnType<typeof setInterval>
onMounted(() => { intervalo = setInterval(() => { fraseIndex.value = (fraseIndex.value + 1) % frases.length }, 3500) })
onUnmounted(() => clearInterval(intervalo))

// ── Form ──
const form = reactive({ password: '', confirm: '' })
const touched = reactive({ password: false, confirm: false })
const submitting = ref(false)
const saved = ref(false)
const serverError = ref('')

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!form.password) e.password = 'La contraseña es requerida.'
  else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.'
  if (!form.confirm) e.confirm = 'Confirma tu contraseña.'
  else if (form.confirm !== form.password) e.confirm = 'Las contraseñas no coinciden.'
  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

function touch(f: keyof typeof touched) { touched[f] = true }
function touchAll() { Object.keys(touched).forEach((k) => (touched[k as keyof typeof touched] = true)) }

watch(() => form.password, () => { if (touched.confirm) touched.confirm = true })

// ── Fortaleza ──
const strength = computed(() => {
  const pw = form.password; if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++; if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
})
const strengthPercent = computed(() => (strength.value / 5) * 100)
const strengthLabel = computed(() => ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strength.value])
const strengthColor = computed(() => ['', '#d92200', '#f37100', '#e6a800', 'var(--success)', 'var(--success)'][strength.value])

async function handleSubmit() {
  touchAll()
  serverError.value = ''
  if (!isValid.value) return
  submitting.value = true
  try {
    await authService.resetPassword(resetToken.value, form.password)
    saved.value = true
  } catch (err) {
    serverError.value = isApiError(err)
      ? err.message
      : 'El enlace expiró o es inválido. Solicita uno nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ── Layout ── */
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
  color: var(--cream);
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
  color: var(--cream);
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
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
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

/* Títulos */
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

.field-hint {
  display: block;
  font-size: 11px;
  margin-top: 4px;
}

.pw-strength {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}

.pw-strength-bar {
  height: 100%;
  border-radius: 2px;
  transition: width .3s, background .3s;
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

/* Responsive */
@media (max-width: 768px) {
  .auth-panel-left {
    display: none;
  }

  .auth-logo-mobile {
    display: block;
  }
}
</style>
