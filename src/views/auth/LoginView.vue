<template>
  <div class="auth-screen">

    <!-- Panel izquierdo: frases animadas -->
    <div class="auth-panel-left">
      <div class="panel-logo">Cine <em>Vicenta</em></div>
      <div class="panel-tagline">Puerto Cortés · Honduras</div>

      <div class="frase-container">
        <Transition name="frase" mode="out-in">
          <div :key="fraseActual.rol" class="frase-wrap">
            <div class="frase-icono">{{ fraseActual.icono }}</div>
            <blockquote class="frase-texto">{{ fraseActual.frase }}</blockquote>
            <div class="frase-rol">— {{ fraseActual.rol }}</div>
          </div>
        </Transition>
      </div>

      <!-- Indicadores -->
      <div class="frase-dots">
        <span v-for="(f, i) in frases" :key="i" class="dot" :class="{ active: i === fraseIndex }"
          @click="fraseIndex = i" />
      </div>
    </div>

    <!-- Panel derecho: formulario -->
    <div class="auth-panel-right">
      <BtnHome class="btn-home-pos" />
      <div class="auth-wrap">
        <div class="auth-logo-mobile">Cine <em>Vicenta</em></div>

        <div class="card animado" style="--delay: 0ms">
          <div class="card-body">

            <!-- Tabs -->
            <div class="auth-tabs animado" style="--delay: 60ms">
              <span class="auth-tab active">Iniciar sesión</span>
              <RouterLink to="/register" class="auth-tab">Crear cuenta</RouterLink>
            </div>

            <!-- Role selector -->
            <div class="role-selector animado" style="--delay: 120ms">
              <div v-for="role in roles" :key="role.value" class="role-opt"
                :class="{ active: selectedRole === role.value }" @click="selectedRole = role.value">
                <span class="role-icon">{{ role.icon }}</span>
                {{ role.label }}
              </div>
            </div>

            <!-- Error del backend -->
            <Transition name="fade-alert">
              <div v-if="serverError" class="alert alert-error animado" style="--delay: 0ms">
                {{ serverError }}
              </div>
            </Transition>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" novalidate>
              <div class="field animado" style="--delay: 160ms">
                <label for="email">Correo electrónico</label>
                <input id="email" v-model="form.email" type="email" placeholder="tu@correo.com"
                  :class="{ 'input-error': touched.email && errors.email }" @blur="touch('email')"
                  autocomplete="email" />
                <Transition name="fade-alert">
                  <span v-if="touched.email && errors.email" class="field-error">
                    {{ errors.email }}
                  </span>
                </Transition>
              </div>

              <div class="field animado" style="--delay: 200ms">
                <label for="password">Contraseña</label>
                <div class="input-wrapper">
                  <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••" :class="{ 'input-error': touched.password && errors.password }"
                    @blur="touch('password')" autocomplete="current-password" />
                  <button type="button" class="toggle-pw" @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                    {{ showPassword ? '🙈' : '👁' }}
                  </button>
                </div>
                <Transition name="fade-alert">
                  <span v-if="touched.password && errors.password" class="field-error">
                    {{ errors.password }}
                  </span>
                </Transition>
              </div>

              <button type="submit" class="btn btn-primary btn-full animado" style="--delay: 240ms"
                :disabled="submitting">
                <span v-if="submitting" class="spinner" />
                {{ submitting ? 'Ingresando…' : 'Iniciar sesión' }}
              </button>
            </form>

            <div class="auth-footer animado" style="--delay: 280ms">
              <RouterLink to="/forgot-password">¿Olvidaste tu contraseña?</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BtnHome from '@/components/BtnHome.vue'

const router = useRouter()

// ── Frases del carrusel ──
const frases = [
  {
    rol: 'Cliente',
    icono: '🎟',
    frase: 'Tu próxima película favorita te está esperando. Reserva tu asiento en segundos.',
  },
  {
    rol: 'Recepcionista',
    icono: '🏷',
    frase: 'Gestiona reservas y ayuda a los clientes con un sistema rápido e intuitivo.',
  },
  {
    rol: 'Administrador',
    icono: '⚙️',
    frase: 'Control total sobre cartelera, funciones, reportes y configuración del sistema.',
  },
]

const fraseIndex = ref(0)
const fraseActual = computed(() => frases[fraseIndex.value]!)

let intervalo: ReturnType<typeof setInterval>
onMounted(() => {
  intervalo = setInterval(() => {
    fraseIndex.value = (fraseIndex.value + 1) % frases.length
  }, 3500)
})
onUnmounted(() => clearInterval(intervalo))

// ── Roles ──
const roles = [
  { value: 'cliente', icon: '🎟', label: 'Cliente' },
  { value: 'recepcionista', icon: '🏷', label: 'Recepcionista' },
  { value: 'admin', icon: '⚙️', label: 'Admin' },
]
const selectedRole = ref('cliente')

// ── Formulario ──
const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const showPassword = ref(false)
const submitting = ref(false)
const serverError = ref('')

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!form.email.trim()) {
    e.email = 'El correo es requerido.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    e.email = 'Ingresa un correo válido.'
  }
  if (!form.password) {
    e.password = 'La contraseña es requerida.'
  } else if (form.password.length < 8) {
    e.password = 'Mínimo 8 caracteres.'
  }
  return e
})

const isFormValid = computed(() => Object.keys(errors.value).length === 0)

function touch(field: keyof typeof touched) { touched[field] = true }
function touchAll() { Object.keys(touched).forEach((k) => (touched[k as keyof typeof touched] = true)) }

function redirectByRole(role: string) {
  const routes: Record<string, string> = {
    admin: '/admin',
    recepcionista: '/recepcionista',
    cliente: '/',
  }
  router.push(routes[role] ?? '/')
}

async function handleSubmit() {
  touchAll()
  serverError.value = ''
  if (!isFormValid.value) return

  submitting.value = true
  try {
    await new Promise((r) => setTimeout(r, 900))
    if (form.email === 'error@test.com') {
      serverError.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
      return
    }
    redirectByRole(selectedRole.value)
  } catch (err) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    serverError.value = message ?? 'Ocurrió un error. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ── Layout split ── */
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
  position: relative;
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

/* Frases */
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

/* Dots */
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

/* Tabs */
.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--border2);
  margin-bottom: 20px;
}

.auth-tab {
  flex: 1;
  padding: 9px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: var(--text3);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all .2s;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
}

.auth-tab.active {
  color: var(--sinopia);
  border-bottom-color: var(--sinopia);
}

.auth-tab:not(.active):hover {
  color: var(--text2);
}

/* Role selector */
.role-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

.role-opt {
  flex: 1;
  padding: 10px 6px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  color: var(--text2);
  transition: all .2s;
  user-select: none;
}

.role-opt.active {
  border-color: var(--sinopia);
  color: var(--sinopia);
  background: rgba(217, 34, 0, .06);
}

.role-opt:not(.active):hover {
  background: rgba(92, 0, 6, .03);
}

.role-icon {
  font-size: 18px;
  display: block;
  margin-bottom: 4px;
}

/* Alert */
.alert {
  border-radius: var(--radius);
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.alert-error {
  background: rgba(217, 34, 0, .08);
  border: 1px solid rgba(217, 34, 0, .25);
  color: var(--sinopia);
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

.field input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 10px 13px;
  border-radius: var(--radius);
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: border-color .15s;
}

.field input:focus {
  border-color: var(--tangelo);
}

.field input::placeholder {
  color: var(--text3);
}

.field input.input-error {
  border-color: var(--sinopia);
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  padding-right: 40px;
}

.btn-home-pos {
  position: absolute;
  top: 20px;
  right: 24px;
}

.toggle-pw {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
}

.field-error {
  display: block;
  font-size: 11px;
  color: var(--sinopia);
  margin-top: 4px;
}

/* Button */
.btn {
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  border-radius: var(--radius);
  font-weight: 600;
  transition: opacity .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: var(--sinopia);
  color: #fff;
  padding: 11px 24px;
  font-size: 14px;
}

.btn-primary:hover:not(:disabled) {
  opacity: .88;
}

.btn-primary:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
}

/* Spinner */
.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: #fff;
  animation: girar .6s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
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

/* Frases */
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

/* Errores y validaciones */
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

/* ── Responsive ── */
@media (max-width: 768px) {
  .auth-panel-left {
    display: none;
  }

  .auth-logo-mobile {
    display: block;
  }

  .auth-panel-right {
    background: var(--bg);
  }
}
</style>
