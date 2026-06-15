<template>
  <div class="profile-screen">
    <div class="content">
      <div class="page">
        <div class="eyebrow">Mi cuenta</div>

        <div class="profile-layout">
          <!-- ── Sidebar de navegación ── -->
          <aside class="profile-sidebar">
            <div
              class="sidebar-item"
              :class="{ active: activeTab === 'perfil' }"
              @click="activeTab = 'perfil'"
            >
              👤 Mi perfil
            </div>
            <div
              class="sidebar-item"
              :class="{ active: activeTab === 'notificaciones' }"
              @click="activeTab = 'notificaciones'"
            >
              🔔 Notificaciones
            </div>
            <div
              class="sidebar-item"
              :class="{ active: activeTab === 'password' }"
              @click="activeTab = 'password'"
            >
              🔑 Contraseña
            </div>
          </aside>

          <!-- ── Panel principal ── -->
          <div class="profile-panel">
            <!-- ══════════════════════════
                 TAB: PERFIL
            ══════════════════════════ -->
            <div v-if="activeTab === 'perfil'">
              <div class="section-title">Información personal</div>

              <div v-if="profileSaved" class="alert alert-success">
                ✓ Cambios guardados correctamente.
              </div>
              <div v-if="profileError" class="alert alert-error">
                {{ profileError }}
              </div>

              <form @submit.prevent="saveProfile" novalidate>
                <div class="field">
                  <label for="nombre">Nombre completo</label>
                  <input
                    id="nombre"
                    v-model="profile.nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    :class="{ 'input-error': pTouched.nombre && pErrors.nombre }"
                    @blur="pTouch('nombre')"
                  />
                  <span v-if="pTouched.nombre && pErrors.nombre" class="field-error">{{
                    pErrors.nombre
                  }}</span>
                </div>

                <div class="field">
                  <label for="email">Correo electrónico</label>
                  <input
                    id="email"
                    v-model="profile.email"
                    type="email"
                    placeholder="tu@correo.com"
                    :class="{ 'input-error': pTouched.email && pErrors.email }"
                    @blur="pTouch('email')"
                  />
                  <span v-if="pTouched.email && pErrors.email" class="field-error">{{
                    pErrors.email
                  }}</span>
                </div>

                <div class="field">
                  <label for="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    v-model="profile.telefono"
                    type="tel"
                    placeholder="+504 9999 9999"
                    :class="{ 'input-error': pTouched.telefono && pErrors.telefono }"
                    @blur="pTouch('telefono')"
                  />
                  <span v-if="pTouched.telefono && pErrors.telefono" class="field-error">{{
                    pErrors.telefono
                  }}</span>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="profileSubmitting">
                    {{ profileSubmitting ? 'Guardando…' : 'Guardar cambios' }}
                  </button>
                  <button type="button" class="btn btn-ghost" @click="resetProfile">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>

            <div v-if="activeTab === 'notificaciones'">
              <div class="section-title">Notificaciones</div>
              <p class="section-desc">
                Gestiona cómo recibes las novedades y avisos de Cine Vicenta.
              </p>

              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <p class="setting-label">Correos promocionales</p>
                    <p class="setting-desc">Ofertas, estrenos y descuentos exclusivos</p>
                  </div>
                  <ToggleSwitch
                    v-model="profile.notificaciones_activas"
                    :loading="notifLoading"
                    @update:model-value="updateNotifications"
                  />
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <p class="setting-label">Recordatorios de función</p>
                    <p class="setting-desc">Te avisaremos 1 hora antes de que inicie tu función</p>
                  </div>
                  <ToggleSwitch
                    v-model="notifReminders"
                    :loading="notifLoading"
                    @update:model-value="updateNotifications"
                  />
                </div>
              </div>
            </div>

            <!-- ══════════════════════════
                 TAB: CAMBIAR CONTRASEÑA
            ══════════════════════════ -->
            <div v-if="activeTab === 'password'">
              <div class="section-title">Cambiar contraseña</div>

              <div v-if="pwSaved" class="alert alert-success">
                ✓ Contraseña actualizada correctamente.
              </div>
              <div v-if="pwError" class="alert alert-error">{{ pwError }}</div>

              <form @submit.prevent="savePassword" novalidate>
                <!-- Contraseña actual -->
                <div class="field">
                  <label for="current">Contraseña actual</label>
                  <div class="input-wrapper">
                    <input
                      id="current"
                      v-model="pw.current"
                      :type="showCurrent ? 'text' : 'password'"
                      placeholder="Tu contraseña actual"
                      :class="{ 'input-error': pwTouched.current && pwErrors.current }"
                      @blur="pwTouch('current')"
                      autocomplete="current-password"
                    />
                    <button type="button" class="toggle-pw" @click="showCurrent = !showCurrent">
                      {{ showCurrent ? '🙈' : '👁' }}
                    </button>
                  </div>
                  <span v-if="pwTouched.current && pwErrors.current" class="field-error">{{
                    pwErrors.current
                  }}</span>
                </div>

                <hr class="divider" />

                <!-- Nueva contraseña -->
                <div class="field">
                  <label for="newpw">Nueva contraseña</label>
                  <div class="input-wrapper">
                    <input
                      id="newpw"
                      v-model="pw.newPw"
                      :type="showNew ? 'text' : 'password'"
                      placeholder="Mínimo 8 caracteres"
                      :class="{ 'input-error': pwTouched.newPw && pwErrors.newPw }"
                      @blur="pwTouch('newPw')"
                      autocomplete="new-password"
                    />
                    <button type="button" class="toggle-pw" @click="showNew = !showNew">
                      {{ showNew ? '🙈' : '👁' }}
                    </button>
                  </div>
                  <span v-if="pwTouched.newPw && pwErrors.newPw" class="field-error">{{
                    pwErrors.newPw
                  }}</span>
                  <div v-if="pw.newPw" class="pw-strength">
                    <div
                      class="pw-strength-bar"
                      :style="{ width: strengthPercent + '%', background: strengthColor }"
                    ></div>
                  </div>
                  <span v-if="pw.newPw" class="field-hint" :style="{ color: strengthColor }">{{
                    strengthLabel
                  }}</span>
                </div>

                <!-- Confirmar nueva contraseña -->
                <div class="field">
                  <label for="confirmpw">Confirmar nueva contraseña</label>
                  <input
                    id="confirmpw"
                    v-model="pw.confirm"
                    :type="showNew ? 'text' : 'password'"
                    placeholder="Repite la nueva contraseña"
                    :class="{ 'input-error': pwTouched.confirm && pwErrors.confirm }"
                    @blur="pwTouch('confirm')"
                    autocomplete="new-password"
                  />
                  <span v-if="pwTouched.confirm && pwErrors.confirm" class="field-error">{{
                    pwErrors.confirm
                  }}</span>
                  <span
                    v-if="pwTouched.confirm && !pwErrors.confirm && pw.confirm"
                    class="field-success"
                    >✓ Las contraseñas coinciden</span
                  >
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="pwSubmitting">
                    {{ pwSubmitting ? 'Actualizando…' : 'Actualizar contraseña' }}
                  </button>
                  <button type="button" class="btn btn-ghost" @click="resetPwForm">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const router = useRouter()
const activeTab = ref('perfil')

// ══════════════════════════════════════════════
//  PERFIL
// ══════════════════════════════════════════════

// Datos iniciales (vendrán del store/API cuando se conecte el backend)
const INITIAL_PROFILE = {
  nombre: 'Juan Pérez',
  email: 'juan@correo.com',
  telefono: '+504 9999 9999',
  notificaciones_activas: true,
}

const profile = reactive({ ...INITIAL_PROFILE })
const notifReminders = ref(false)
const notifLoading = ref(false)
const pTouched = reactive({ nombre: false, email: false, telefono: false })
const profileSubmitting = ref(false)
const profileSaved = ref(false)
const profileError = ref('')

const pErrors = computed(() => {
  const e = {}
  if (!profile.nombre.trim()) e.nombre = 'El nombre es requerido.'
  else if (profile.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres.'

  if (!profile.email.trim()) e.email = 'El correo es requerido.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'Ingresa un correo válido.'

  if (profile.telefono && !/^\+?[\d\s\-()]{7,}$/.test(profile.telefono))
    e.telefono = 'Ingresa un número válido.'

  return e
})

function pTouch(f) {
  pTouched[f] = true
}
function pTouchAll() {
  Object.keys(pTouched).forEach((k) => (pTouched[k] = true))
}

function resetProfile() {
  Object.assign(profile, INITIAL_PROFILE)
  Object.keys(pTouched).forEach((k) => (pTouched[k] = false))
  profileSaved.value = false
  profileError.value = ''
}

async function saveProfile() {
  pTouchAll()
  profileError.value = ''
  profileSaved.value = false
  if (Object.keys(pErrors.value).length) return

  profileSubmitting.value = true
  try {
    // Aquí irá la llamada real, por ejemplo:

    await new Promise((r) => setTimeout(r, 800))
    profileSaved.value = true
    setTimeout(() => (profileSaved.value = false), 4000)
  } catch (err) {
    profileError.value = err?.response?.data?.message ?? 'No se pudieron guardar los cambios.'
  } finally {
    profileSubmitting.value = false
  }
}

// ══════════════════════════════════════════════
//  NOTIFICACIONES
// ══════════════════════════════════════════════

async function updateNotifications() {
  notifLoading.value = true
  try {
    // TODO: PATCH /api/usuarios/profile { notificaciones_activas: profile.notificaciones_activas }
    await new Promise((r) => setTimeout(r, 600))
    console.log('Notificaciones actualizadas:', profile.notificaciones_activas)
  } catch (err) {
    console.error('Error actualizando notificaciones:', err)
  } finally {
    notifLoading.value = false
  }
}

// ══════════════════════════════════════════════
//  CAMBIO DE CONTRASEÑA
// ══════════════════════════════════════════════

const pw = reactive({ current: '', newPw: '', confirm: '' })
const pwTouched = reactive({ current: false, newPw: false, confirm: false })
const showCurrent = ref(false)
const showNew = ref(false)
const pwSubmitting = ref(false)
const pwSaved = ref(false)
const pwError = ref('')

const pwErrors = computed(() => {
  const e = {}
  if (!pw.current) e.current = 'Ingresa tu contraseña actual.'

  if (!pw.newPw) e.newPw = 'La nueva contraseña es requerida.'
  else if (pw.newPw.length < 8) e.newPw = 'Mínimo 8 caracteres.'
  else if (pw.newPw === pw.current) e.newPw = 'La nueva contraseña debe ser diferente a la actual.'

  if (!pw.confirm) e.confirm = 'Confirma tu nueva contraseña.'
  else if (pw.confirm !== pw.newPw) e.confirm = 'Las contraseñas no coinciden.'
  return e
})

const isPwValid = computed(() => Object.keys(pwErrors.value).length === 0)

function pwTouch(f) {
  pwTouched[f] = true
}
function pwTouchAll() {
  Object.keys(pwTouched).forEach((k) => (pwTouched[k] = true))
}

function resetPwForm() {
  pw.current = ''
  pw.newPw = ''
  pw.confirm = ''
  Object.keys(pwTouched).forEach((k) => (pwTouched[k] = false))
  pwSaved.value = false
  pwError.value = ''
}

watch(
  () => pw.newPw,
  () => {
    if (pwTouched.confirm) pwTouched.confirm = true
  },
)

async function savePassword() {
  pwTouchAll()
  pwError.value = ''
  pwSaved.value = false
  if (!isPwValid.value) return

  pwSubmitting.value = true
  try {
    // Aquí irá la llamada real
    await new Promise((r) => setTimeout(r, 900))

    // Simula contraseña actual incorrecta para demostrar el error del backend
    if (pw.current === 'incorrecta') {
      pwError.value = 'La contraseña actual es incorrecta.'
      return
    }

    pwSaved.value = true
    resetPwForm()
    setTimeout(() => (pwSaved.value = false), 4000)
  } catch (err) {
    // El backend devolverá 400/401 si la contraseña actual es incorrecta
    pwError.value = err?.response?.data?.message ?? 'No se pudo actualizar la contraseña.'
  } finally {
    pwSubmitting.value = false
  }
}

// ── Password strength ────────────────────────────────────────
const strength = computed(() => {
  const p = pw.newPw
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const strengthPercent = computed(() => (strength.value / 5) * 100)
const strengthLabel = computed(
  () => ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strength.value],
)
const strengthColor = computed(
  () => ['', '#d92200', '#f37100', '#e6a800', '#1e783c', '#1e783c'][strength.value],
)

// ── Auth ─────────────────────────────────────────────────────
function logout() {
  // localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

.profile-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #faf4f0;
  font-family: 'Outfit', sans-serif;
  color: #2a0a06;
}
/* Layout */
.content {
  flex: 1;
  overflow-y: auto;
}
.page {
  max-width: 860px;
  margin: 0 auto;
  padding: 28px 24px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: #b87060;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
}
.section-title {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: #2a0a06;
  margin-bottom: 22px;
}
.section-desc {
  font-size: 13px;
  color: #7a3020;
  margin: -14px 0 24px;
  line-height: 1.5;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(92, 0, 6, 0.07);
}
.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.setting-info {
  flex: 1;
  padding-right: 20px;
}
.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #2a0a06;
  margin-bottom: 2px;
}
.setting-desc {
  font-size: 12px;
  color: #b87060;
}

.profile-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* Sidebar */
.profile-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid rgba(92, 0, 6, 0.09);
  border-radius: 8px;
  overflow: hidden;
}
.sidebar-item {
  padding: 13px 18px;
  font-size: 13px;
  font-weight: 500;
  color: #7a3020;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(92, 0, 6, 0.07);
}
.sidebar-item:last-child {
  border-bottom: none;
}
.sidebar-item:hover {
  background: rgba(243, 113, 0, 0.04);
}
.sidebar-item.active {
  color: #d92200;
  background: rgba(217, 34, 0, 0.06);
  border-left: 3px solid #d92200;
  padding-left: 15px;
}

/* Panel */
.profile-panel {
  flex: 1;
  background: #fff;
  border: 1px solid rgba(92, 0, 6, 0.09);
  border-radius: 8px;
  padding: 24px;
}

/* Divider */
.divider {
  border: none;
  border-top: 1px solid rgba(92, 0, 6, 0.09);
  margin: 20px 0;
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

/* Alerts */
.alert {
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;
}
.alert-success {
  background: rgba(30, 120, 60, 0.08);
  border: 1px solid rgba(30, 120, 60, 0.25);
  color: #1e783c;
}
.alert-error {
  background: rgba(217, 34, 0, 0.08);
  border: 1px solid rgba(217, 34, 0, 0.25);
  color: #d92200;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
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
.btn-ghost {
  background: transparent;
  color: #7a3020;
  border: 1px solid rgba(92, 0, 6, 0.17);
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 400;
}
.btn-ghost:hover {
  background: #faf4f0;
}
</style>
