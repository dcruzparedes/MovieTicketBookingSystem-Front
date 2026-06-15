<template>
  <div class="auth-screen">
    <div class="auth-wrap">
      <div class="auth-logo">Cine <em>Vicenta</em></div>
      <div class="auth-tagline">Puerto Cortés · Honduras</div>

      <div class="card">
        <div class="card-body">
          <!-- Tabs -->
          <div class="auth-tabs">
            <span class="auth-tab active">Iniciar sesión</span>
            <RouterLink to="/register" class="auth-tab">Crear cuenta</RouterLink>
          </div>

          <!-- Role selector -->
          <div class="role-selector">
            <div
              v-for="role in roles"
              :key="role.value"
              class="role-opt"
              :class="{ active: selectedRole === role.value }"
              @click="selectedRole = role.value"
            >
              <span class="role-icon">{{ role.icon }}</span>
              {{ role.label }}
            </div>
          </div>

          <!-- Error alert del backend -->
          <div v-if="serverError" class="alert alert-error">
            {{ serverError }}
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" novalidate>
            <!-- Email -->
            <div class="field">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="tu@correo.com"
                :class="{ 'input-error': touched.email && errors.email }"
                @blur="touch('email')"
                autocomplete="email"
              />
              <span v-if="touched.email && errors.email" class="field-error">
                {{ errors.email }}
              </span>
            </div>

            <!-- Contraseña -->
            <div class="field">
              <label for="password">Contraseña</label>
              <div class="input-wrapper">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  :class="{ 'input-error': touched.password && errors.password }"
                  @blur="touch('password')"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-pw"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  {{ showPassword ? '🙈' : '👁' }}
                </button>
              </div>
              <span v-if="touched.password && errors.password" class="field-error">
                {{ errors.password }}
              </span>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
              {{ submitting ? 'Ingresando…' : 'Iniciar sesión' }}
            </button>
          </form>

          <div class="auth-footer">
            <RouterLink to="/forgot-password">¿Olvidaste tu contraseña?</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const roles = [
  { value: 'cliente', icon: '🎟', label: 'Cliente' },
  { value: 'recepcionista', icon: '🏷', label: 'Recepcionista' },
  { value: 'admin', icon: '⚙️', label: 'Admin' },
]

const selectedRole = ref('cliente')
const form = reactive({ email: '', password: '' })
const touched = reactive({ email: false, password: false })
const showPassword = ref(false)
const submitting = ref(false)
const serverError = ref('')

// Validaciones
const errors = computed(() => {
  const e = {}

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

// Funciones de interacción
function touch(field) {
  touched[field] = true
}

function touchAll() {
  Object.keys(touched).forEach((k) => (touched[k] = true))
}

// Redirect por rol
// Se usará cuando el backend devuelva el token con el rol real.
// Por ahora usa el rol seleccionado manualmente.
function redirectByRole(role) {
  const routes = {
    admin: '/admin',
    recepcionista: '/recepcion',
    cliente: '/',
  }
  router.push(routes[role] ?? '/')
}

// ── Submit ──────────────────────────────────────────────────
async function handleSubmit() {
  touchAll()
  serverError.value = ''
  if (!isFormValid.value) return

  submitting.value = true

  try {
    // Aquí irá la llamada real al backend, por ejemplo:

    // Simulación temporal hasta conectar el backend
    await new Promise((r) => setTimeout(r, 900))

    // Simula credenciales incorrectas para demostrar el error del servidor
    if (form.email === 'error@test.com') {
      serverError.value = 'Credenciales incorrectas. Verifica tu correo y contraseña.'
      return
    }

    redirectByRole(selectedRole.value)
  } catch (err) {
    // Cuando el backend responda con error 401/403:
    serverError.value = err?.response?.data?.message ?? 'Ocurrió un error. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --bg: #faf4f0;
  --surface: #ffffff;
  --border: rgba(92, 0, 6, 0.09);
  --border2: rgba(92, 0, 6, 0.17);
  --text: #2a0a06;
  --text2: #7a3020;
  --text3: #b87060;
  --tangelo: #f3500a;
  --sinopia: #d92200;
  --rosewood: #5a0006;
  --radius: 8px;
}

.auth-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #faf4f0;
  font-family: 'Outfit', sans-serif;
}

.auth-wrap {
  width: 400px;
}

.auth-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 38px;
  color: #5a0006;
  letter-spacing: 0.5px;
  text-align: center;
  margin-bottom: 2px;
}
.auth-logo em {
  font-style: italic;
  color: #f3500a;
}

.auth-tagline {
  text-align: center;
  font-size: 12px;
  color: #b87060;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 24px;
}

/* Card */
.card {
  background: #fff;
  border: 1px solid rgba(92, 0, 6, 0.09);
  border-radius: 8px;
}
.card-body {
  padding: 20px;
}

/* Tabs */
.auth-tabs {
  display: flex;
  border-bottom: 1px solid rgba(92, 0, 6, 0.17);
  margin-bottom: 20px;
}
.auth-tab {
  flex: 1;
  padding: 9px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #b87060;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
}
.auth-tab.active {
  color: #d92200;
  border-bottom-color: #d92200;
}
.auth-tab:not(.active):hover {
  color: #7a3020;
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
  border: 1px solid rgba(92, 0, 6, 0.17);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  color: #7a3020;
  transition: all 0.2s;
  user-select: none;
}
.role-opt.active {
  border-color: #d92200;
  color: #d92200;
  background: rgba(217, 34, 0, 0.06);
}
.role-opt:not(.active):hover {
  background: rgba(92, 0, 6, 0.03);
}
.role-icon {
  font-size: 18px;
  display: block;
  margin-bottom: 4px;
}

/* Alert */
.alert {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}
.alert-error {
  background: rgba(217, 34, 0, 0.08);
  border: 1px solid rgba(217, 34, 0, 0.25);
  color: #d92200;
}

/* Fields */
.field {
  margin-bottom: 16px;
}
.field label {
  display: block;
  font-size: 12px;
  color: #7a3020;
  margin-bottom: 5px;
  font-weight: 500;
}
.field input {
  width: 100%;
  background: #faf4f0;
  border: 1px solid rgba(92, 0, 6, 0.17);
  color: #2a0a06;
  padding: 10px 13px;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus {
  border-color: #f3500a;
}
.field input::placeholder {
  color: #b87060;
}
.field input.input-error {
  border-color: #d92200;
}

.input-wrapper {
  position: relative;
}
.input-wrapper input {
  padding-right: 40px;
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
  color: #d92200;
  margin-top: 4px;
}

/* Button */
.btn {
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  border-radius: 8px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-primary {
  background: #d92200;
  color: #fff;
  padding: 11px 24px;
  font-size: 14px;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.88;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-full {
  width: 100%;
}

/* Footer */
.auth-footer {
  text-align: center;
  font-size: 12px;
  color: #b87060;
  margin-top: 14px;
}
.auth-footer a {
  color: #d92200;
  text-decoration: none;
}
.auth-footer a:hover {
  text-decoration: underline;
}
</style>
