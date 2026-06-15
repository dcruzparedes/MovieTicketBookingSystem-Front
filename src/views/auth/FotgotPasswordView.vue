<template>
  <div class="auth-screen">
    <div class="auth-wrap">
      <RouterLink to="/login" class="auth-logo">Cine <em>Vicenta</em></RouterLink>

      <div class="card">
        <div class="card-body">
          <!-- Estado: formulario -->
          <template v-if="!sent">
            <div class="form-title">Recuperar contraseña</div>
            <div class="form-sub">Te enviaremos un enlace a tu correo.</div>

            <div v-if="serverError" class="alert alert-error">{{ serverError }}</div>

            <form @submit.prevent="handleSubmit" novalidate>
              <div class="field">
                <label for="email">Correo electrónico</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="tu@correo.com"
                  :class="{ 'input-error': touched && error }"
                  @blur="touched = true"
                  autocomplete="email"
                />
                <span v-if="touched && error" class="field-error">{{ error }}</span>
              </div>

              <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
                {{ submitting ? 'Enviando…' : 'Enviar enlace' }}
              </button>
            </form>
          </template>

          <!-- Estado: enviado -->
          <template v-else>
            <div class="success-icon">✉️</div>
            <div class="form-title" style="text-align: center">Revisa tu correo</div>
            <div class="alert alert-success">
              Enviamos el enlace de restablecimiento a <strong>{{ email }}</strong
              >. Puede tardar unos minutos en llegar.
            </div>
            <div class="resend-row">
              ¿No llegó?
              <button class="btn-link" :disabled="cooldown > 0" @click="resend">
                {{ cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar correo' }}
              </button>
            </div>
          </template>

          <div class="auth-footer">
            <RouterLink to="/login">← Volver al inicio de sesión</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

const email = ref('')
const touched = ref(false)
const submitting = ref(false)
const sent = ref(false)
const serverError = ref('')
const cooldown = ref(0)
let cooldownTimer = null

// ── Validation ──────────────────────────────────────────────
const error = computed(() => {
  if (!email.value.trim()) return 'El correo es requerido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Ingresa un correo válido.'
  return ''
})

// ── Submit ──────────────────────────────────────────────────
async function handleSubmit() {
  touched.value = true
  serverError.value = ''
  if (error.value) return

  submitting.value = true
  try {
    // Aquí irá la llamada real
    await new Promise((r) => setTimeout(r, 900)) // simulación temporal
    sent.value = true
    startCooldown()
  } catch (err) {
    serverError.value = err?.response?.data?.message ?? 'Ocurrió un error. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}

// ── Resend ───────────────────────────────────────────────────
async function resend() {
  if (cooldown.value > 0) return
  try {
    // await authService.requestPasswordReset(email.value)
    await new Promise((r) => setTimeout(r, 600))
    startCooldown()
  } catch {
    /* silently ignore */
  }
}

function startCooldown(seconds = 60) {
  cooldown.value = seconds
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

onUnmounted(() => clearInterval(cooldownTimer))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

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
  display: block;
  font-family: 'DM Serif Display', serif;
  font-size: 38px;
  color: #5a0006;
  letter-spacing: 0.5px;
  text-align: center;
  margin-bottom: 24px;
  text-decoration: none;
}
.auth-logo em {
  font-style: italic;
  color: #f3500a;
}

.card {
  background: #fff;
  border: 1px solid rgba(92, 0, 6, 0.09);
  border-radius: 8px;
}
.card-body {
  padding: 24px 20px 20px;
}

.form-title {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: #2a0a06;
  margin-bottom: 6px;
}
.form-sub {
  font-size: 13px;
  color: #b87060;
  margin-bottom: 20px;
}

/* Success icon */
.success-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: 12px;
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
.alert-success {
  background: rgba(30, 120, 60, 0.08);
  border: 1px solid rgba(30, 120, 60, 0.25);
  color: #1e783c;
}

/* Field */
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

.field-error {
  display: block;
  font-size: 11px;
  color: #d92200;
  margin-top: 4px;
}

/* Resend */
.resend-row {
  text-align: center;
  font-size: 12px;
  color: #b87060;
  margin-bottom: 4px;
}
.btn-link {
  background: none;
  border: none;
  color: #d92200;
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  transition: opacity 0.2s;
}
.btn-link:disabled {
  color: #b87060;
  cursor: default;
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
  margin-top: 16px;
}
.auth-footer a {
  color: #d92200;
  text-decoration: none;
}
.auth-footer a:hover {
  text-decoration: underline;
}
</style>
