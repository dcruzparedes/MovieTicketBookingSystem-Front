<template>
  <div class="auth-screen">
    <div class="auth-wrap">
      <div class="auth-logo">Cine <em>Vicenta</em></div>
      <div class="auth-tagline">Puerto Cortés · Honduras</div>

      <div class="card">
        <div class="card-body">
          <!-- Tabs -->
          <div class="auth-tabs">
            <RouterLink to="/login" class="auth-tab">Iniciar sesión</RouterLink>
            <span class="auth-tab active">Crear cuenta</span>
          </div>

          <!-- Success state -->
          <div v-if="registered" class="alert alert-success">
            ✓ ¡Cuenta creada con éxito! Redirigiendo…
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="handleSubmit" novalidate>
            <!-- Nombre -->
            <div class="field">
              <label for="nombre">Nombre completo</label>
              <input
                id="nombre"
                v-model="form.nombre"
                type="text"
                placeholder="Juan Pérez"
                :class="{ 'input-error': touched.nombre && errors.nombre }"
                @blur="touch('nombre')"
                autocomplete="name"
              />
              <span v-if="touched.nombre && errors.nombre" class="field-error">
                {{ errors.nombre }}
              </span>
            </div>

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
                  placeholder="Mínimo 8 caracteres"
                  :class="{ 'input-error': touched.password && errors.password }"
                  @blur="touch('password')"
                  autocomplete="new-password"
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
              <!-- Password strength bar -->
              <div v-if="form.password" class="pw-strength">
                <div
                  class="pw-strength-bar"
                  :style="{ width: strengthPercent + '%', background: strengthColor }"
                ></div>
              </div>
              <span v-if="form.password" class="field-success" :style="{ color: strengthColor }">
                {{ strengthLabel }}
              </span>
            </div>

            <!-- Confirmar contraseña -->
            <div class="field">
              <label for="confirm">Confirmar contraseña</label>
              <input
                id="confirm"
                v-model="form.confirm"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Repite la contraseña"
                :class="{ 'input-error': touched.confirm && errors.confirm }"
                @blur="touch('confirm')"
                autocomplete="new-password"
              />
              <span v-if="touched.confirm && errors.confirm" class="field-error">
                {{ errors.confirm }}
              </span>
              <span v-if="touched.confirm && !errors.confirm && form.confirm" class="field-success">
                ✓ Las contraseñas coinciden
              </span>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
              {{ submitting ? 'Creando cuenta…' : 'Crear cuenta' }}
            </button>
          </form>

          <div class="auth-footer">
            ¿Ya tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({ nombre: '', email: '', password: '', confirm: '' })
const touched = reactive({ nombre: false, email: false, password: false, confirm: false })
const showPassword = ref(false)
const submitting = ref(false)
const registered = ref(false)

// ── Validation ─────────────────────────────────────────────
const errors = computed(() => {
  const e = {}

  if (!form.nombre.trim()) {
    e.nombre = 'El nombre es requerido.'
  } else if (form.nombre.trim().length < 3) {
    e.nombre = 'Debe tener al menos 3 caracteres.'
  }

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

  if (!form.confirm) {
    e.confirm = 'Confirma tu contraseña.'
  } else if (form.confirm !== form.password) {
    e.confirm = 'Las contraseñas no coinciden.'
  }

  return e
})

const isFormValid = computed(() => Object.keys(errors.value).length === 0)

// ── Password strength ───────────────────────────────────────
const strength = computed(() => {
  const pw = form.password
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
})

const strengthPercent = computed(() => (strength.value / 5) * 100)
const strengthLabel = computed(
  () => ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strength.value],
)
const strengthColor = computed(
  () => ['', '#d92200', '#f37100', '#e6a800', '#1e783c', '#1e783c'][strength.value],
)

// ── Helpers ─────────────────────────────────────────────────
function touch(field) {
  touched[field] = true
}

function touchAll() {
  Object.keys(touched).forEach((k) => (touched[k] = true))
}

async function handleSubmit() {
  touchAll()
  if (!isFormValid.value) return

  submitting.value = true
  // Aquí irá la llamada al backend en el futuro
  await new Promise((r) => setTimeout(r, 900))
  submitting.value = false
  registered.value = true

  setTimeout(() => router.push('/'), 1800)
}

// Touch confirm reactively when password changes after confirm was touched
watch(
  () => form.password,
  () => {
    if (touched.confirm) touched.confirm = true
  },
)
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
.field-success {
  display: block;
  font-size: 11px;
  color: #1e783c;
  margin-top: 4px;
}

/* Password strength */
.pw-strength {
  height: 3px;
  background: rgba(92, 0, 6, 0.09);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}
.pw-strength-bar {
  height: 100%;
  border-radius: 2px;
  transition:
    width 0.3s,
    background 0.3s;
}

/* Alert */
.alert {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}
.alert-success {
  background: rgba(30, 120, 60, 0.08);
  border: 1px solid rgba(30, 120, 60, 0.25);
  color: #1e783c;
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
  cursor: pointer;
}
.auth-footer a:hover {
  text-decoration: underline;
}
</style>
