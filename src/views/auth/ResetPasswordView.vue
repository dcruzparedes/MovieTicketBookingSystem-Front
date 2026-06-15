<template>
  <div class="auth-screen">
    <div class="auth-wrap">
      <RouterLink to="/login" class="auth-logo">Cine <em>Vicenta</em></RouterLink>

      <div class="card">
        <div class="card-body">
          <!-- Éxito -->
          <template v-if="saved">
            <div class="success-icon">✓</div>
            <div class="form-title" style="text-align: center">Contraseña actualizada</div>
            <p class="form-sub" style="text-align: center">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <RouterLink
              to="/login"
              class="btn btn-primary btn-full"
              style="display: block; text-align: center; text-decoration: none; margin-top: 4px"
            >
              Ir al inicio de sesión
            </RouterLink>
          </template>

          <!-- Formulario -->
          <template v-else>
            <div class="form-title">Nueva contraseña</div>
            <p class="form-sub">Elige una contraseña segura.</p>

            <div v-if="serverError" class="alert alert-error">{{ serverError }}</div>

            <form @submit.prevent="handleSubmit" novalidate>
              <!-- Nueva contraseña -->
              <div class="field">
                <label for="password">Nueva contraseña</label>
                <div class="input-wrapper">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPw ? 'text' : 'password'"
                    placeholder="Mínimo 8 caracteres"
                    :class="{ 'input-error': touched.password && errors.password }"
                    @blur="touch('password')"
                    autocomplete="new-password"
                  />
                  <button type="button" class="toggle-pw" @click="showPw = !showPw">
                    {{ showPw ? '🙈' : '👁' }}
                  </button>
                </div>
                <span v-if="touched.password && errors.password" class="field-error">{{
                  errors.password
                }}</span>

                <!-- Barra de fortaleza -->
                <div v-if="form.password" class="pw-strength">
                  <div
                    class="pw-strength-bar"
                    :style="{ width: strengthPercent + '%', background: strengthColor }"
                  ></div>
                </div>
                <span v-if="form.password" class="field-hint" :style="{ color: strengthColor }">{{
                  strengthLabel
                }}</span>
              </div>

              <!-- Confirmar contraseña -->
              <div class="field">
                <label for="confirm">Confirmar contraseña</label>
                <input
                  id="confirm"
                  v-model="form.confirm"
                  :type="showPw ? 'text' : 'password'"
                  placeholder="Repite la contraseña"
                  :class="{ 'input-error': touched.confirm && errors.confirm }"
                  @blur="touch('confirm')"
                  autocomplete="new-password"
                />
                <span v-if="touched.confirm && errors.confirm" class="field-error">{{
                  errors.confirm
                }}</span>
                <span
                  v-if="touched.confirm && !errors.confirm && form.confirm"
                  class="field-success"
                  >✓ Las contraseñas coinciden</span
                >
              </div>

              <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
                {{ submitting ? 'Guardando…' : 'Guardar contraseña' }}
              </button>
            </form>
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
import { reactive, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// El token vendrá como query param: /reset-password?token=abc123
const resetToken = computed(() => route.query.token ?? '')

const form = reactive({ password: '', confirm: '' })
const touched = reactive({ password: false, confirm: false })
const showPw = ref(false)
const submitting = ref(false)
const saved = ref(false)
const serverError = ref('')

// ── Validation ──────────────────────────────────────────────
const errors = computed(() => {
  const e = {}
  if (!form.password) e.password = 'La contraseña es requerida.'
  else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.'

  if (!form.confirm) e.confirm = 'Confirma tu contraseña.'
  else if (form.confirm !== form.password) e.confirm = 'Las contraseñas no coinciden.'
  return e
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

// ── Password strength ────────────────────────────────────────
const strength = computed(() => {
  const pw = form.password
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
})
const strengthPercent = computed(() => (strength.value / 5) * 100)
const strengthLabel = computed(
  () => ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strength.value],
)
const strengthColor = computed(
  () => ['', '#d92200', '#f37100', '#e6a800', '#1e783c', '#1e783c'][strength.value],
)

function touch(f) {
  touched[f] = true
}
function touchAll() {
  Object.keys(touched).forEach((k) => (touched[k] = true))
}

watch(
  () => form.password,
  () => {
    if (touched.confirm) touched.confirm = true
  },
)

async function handleSubmit() {
  touchAll()
  serverError.value = ''
  if (!isValid.value) return

  submitting.value = true
  try {
    // Aquí irá la llamada real

    await new Promise((r) => setTimeout(r, 900))
    saved.value = true
  } catch (err) {
    serverError.value =
      err?.response?.data?.message ?? 'El enlace expiró o es inválido. Solicita uno nuevo.'
  } finally {
    submitting.value = false
  }
}
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

.success-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: 12px;
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
.field-hint {
  display: block;
  font-size: 11px;
  margin-top: 4px;
}

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
