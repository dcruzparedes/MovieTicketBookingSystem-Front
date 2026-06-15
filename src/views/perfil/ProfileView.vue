<template>
  <div class="profile-screen">
    <div class="content">
      <div class="page">

        <div class="btn-home-wrapper">
          <BtnHome />
        </div>

        <div class="eyebrow animado" style="--delay: 0ms">Mi cuenta</div>

        <div class="profile-layout">

          <!-- ── Sidebar ── -->
          <aside class="profile-sidebar animado" style="--delay: 60ms">
            <div v-for="item in menuItems" :key="item.tab" class="sidebar-item"
              :class="{ active: activeTab === item.tab }" @click="activeTab = item.tab">
              <i :class="['pi', item.icon]" />
              {{ item.label }}
            </div>
          </aside>

          <!-- ── Panel principal ── -->
          <div class="profile-panel animado" style="--delay: 120ms">
            <Transition name="fade-tab" mode="out-in">

              <!-- TAB: PERFIL -->
              <div v-if="activeTab === 'perfil'" key="perfil">
                <div class="section-title">Información personal</div>

                <Transition name="fade-alert">
                  <Message v-if="profileSaved" severity="success" :closable="false" style="margin-bottom: 16px">
                    Cambios guardados correctamente.
                  </Message>
                </Transition>
                <Transition name="fade-alert">
                  <Message v-if="profileError" severity="error" :closable="false" style="margin-bottom: 16px">
                    {{ profileError }}
                  </Message>
                </Transition>

                <form @submit.prevent="saveProfile" novalidate>
                  <div class="field">
                    <label for="nombre">Nombre completo</label>
                    <InputText id="nombre" v-model="profile.nombre" placeholder="Juan Pérez"
                      :invalid="pTouched.nombre && !!pErrors.nombre" fluid @blur="pTouch('nombre')" />
                    <Transition name="fade-alert">
                      <small v-if="pTouched.nombre && pErrors.nombre" class="field-error">{{ pErrors.nombre }}</small>
                    </Transition>
                  </div>

                  <div class="field">
                    <label for="email">Correo electrónico</label>
                    <InputText id="email" v-model="profile.email" type="email" placeholder="tu@correo.com"
                      :invalid="pTouched.email && !!pErrors.email" fluid @blur="pTouch('email')" />
                    <Transition name="fade-alert">
                      <small v-if="pTouched.email && pErrors.email" class="field-error">{{ pErrors.email }}</small>
                    </Transition>
                  </div>

                  <div class="field">
                    <label for="telefono">Teléfono</label>
                    <InputText id="telefono" v-model="profile.telefono" type="tel" placeholder="+504 9999 9999"
                      :invalid="pTouched.telefono && !!pErrors.telefono" fluid @blur="pTouch('telefono')" />
                    <Transition name="fade-alert">
                      <small v-if="pTouched.telefono && pErrors.telefono" class="field-error">{{ pErrors.telefono
                        }}</small>
                    </Transition>
                  </div>

                  <div class="form-actions">
                    <Button type="submit" label="Guardar cambios" :loading="profileSubmitting" />
                    <Button type="button" label="Cancelar" severity="secondary" outlined @click="resetProfile" />
                  </div>
                </form>
              </div>

              <!-- TAB: NOTIFICACIONES -->
              <div v-else-if="activeTab === 'notificaciones'" key="notificaciones">
                <div class="section-title">Notificaciones</div>
                <p class="section-desc">Gestiona cómo recibes las novedades y avisos de Cine Vicenta.</p>

                <div class="settings-list">
                  <div class="setting-item">
                    <div class="setting-info">
                      <p class="setting-label">Correos promocionales</p>
                      <p class="setting-desc">Ofertas, estrenos y descuentos exclusivos</p>
                    </div>
                    <ToggleSwitch v-model="profile.notificaciones_activas" @update:model-value="updateNotifications" />
                  </div>
                  <div class="setting-item">
                    <div class="setting-info">
                      <p class="setting-label">Recordatorios de función</p>
                      <p class="setting-desc">Te avisaremos 1 hora antes de que inicie tu función</p>
                    </div>
                    <ToggleSwitch v-model="notifReminders" @update:model-value="updateNotifications" />
                  </div>
                </div>

                <Transition name="fade-alert">
                  <Message v-if="notifSaved" severity="success" :closable="false" style="margin-top: 16px">
                    Preferencias de notificación actualizadas.
                  </Message>
                </Transition>
              </div>

              <!-- TAB: CONTRASEÑA -->
              <div v-else-if="activeTab === 'password'" key="password">
                <div class="section-title">Cambiar contraseña</div>

                <Transition name="fade-alert">
                  <Message v-if="pwSaved" severity="success" :closable="false" style="margin-bottom: 16px">
                    Contraseña actualizada correctamente.
                  </Message>
                </Transition>
                <Transition name="fade-alert">
                  <Message v-if="pwError" severity="error" :closable="false" style="margin-bottom: 16px">
                    {{ pwError }}
                  </Message>
                </Transition>

                <form @submit.prevent="savePassword" novalidate>
                  <div class="field">
                    <label for="current">Contraseña actual</label>
                    <Password id="current" v-model="pw.current" placeholder="Tu contraseña actual" :feedback="false"
                      :invalid="pwTouched.current && !!pwErrors.current" fluid toggle-mask @blur="pwTouch('current')" />
                    <Transition name="fade-alert">
                      <small v-if="pwTouched.current && pwErrors.current" class="field-error">{{ pwErrors.current
                        }}</small>
                    </Transition>
                  </div>

                  <Divider />

                  <div class="field">
                    <label for="newpw">Nueva contraseña</label>
                    <Password id="newpw" v-model="pw.newPw" placeholder="Mínimo 8 caracteres" :feedback="false"
                      :invalid="pwTouched.newPw && !!pwErrors.newPw" fluid toggle-mask @blur="pwTouch('newPw')" />
                    <Transition name="fade-alert">
                      <small v-if="pwTouched.newPw && pwErrors.newPw" class="field-error">{{ pwErrors.newPw }}</small>
                    </Transition>
                    <div v-if="pw.newPw" class="pw-strength">
                      <div class="pw-strength-bar"
                        :style="{ width: strengthPercent + '%', background: strengthColor }" />
                    </div>
                    <Transition name="fade-alert">
                      <small v-if="pw.newPw" class="field-hint" :style="{ color: strengthColor }">{{ strengthLabel
                        }}</small>
                    </Transition>
                  </div>

                  <div class="field">
                    <label for="confirmpw">Confirmar nueva contraseña</label>
                    <Password id="confirmpw" v-model="pw.confirm" placeholder="Repite la nueva contraseña"
                      :feedback="false" :invalid="pwTouched.confirm && !!pwErrors.confirm" fluid toggle-mask
                      @blur="pwTouch('confirm')" />
                    <Transition name="fade-alert">
                      <small v-if="pwTouched.confirm && pwErrors.confirm" class="field-error">{{ pwErrors.confirm
                        }}</small>
                    </Transition>
                    <Transition name="fade-alert">
                      <small v-if="pwTouched.confirm && !pwErrors.confirm && pw.confirm" class="field-hint"
                        style="color: #1e783c">
                        ✓ Las contraseñas coinciden
                      </small>
                    </Transition>
                  </div>

                  <div class="form-actions">
                    <Button type="submit" label="Actualizar contraseña" :loading="pwSubmitting" />
                    <Button type="button" label="Cancelar" severity="secondary" outlined @click="resetPwForm" />
                  </div>
                </form>
              </div>

            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import ToggleSwitch from 'primevue/toggleswitch'
import BtnHome from '@/components/BtnHome.vue'

const activeTab = ref('perfil')

const menuItems = [
  { tab: 'perfil', icon: 'pi-user', label: 'Mi perfil' },
  { tab: 'notificaciones', icon: 'pi-bell', label: 'Notificaciones' },
  { tab: 'password', icon: 'pi-lock', label: 'Contraseña' },
]

// ── Perfil ──
const INITIAL_PROFILE = {
  nombre: 'Juan Pérez',
  email: 'juan@correo.com',
  telefono: '+504 9999 9999',
  notificaciones_activas: true,
}

const profile = reactive({ ...INITIAL_PROFILE })
const notifReminders = ref(false)
const notifSaved = ref(false)
const pTouched = reactive({ nombre: false, email: false, telefono: false })
const profileSubmitting = ref(false)
const profileSaved = ref(false)
const profileError = ref('')

const pErrors = computed(() => {
  const e: Record<string, string> = {}
  if (!profile.nombre.trim()) e.nombre = 'El nombre es requerido.'
  else if (profile.nombre.trim().length < 3) e.nombre = 'Mínimo 3 caracteres.'
  if (!profile.email.trim()) e.email = 'El correo es requerido.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'Ingresa un correo válido.'
  if (profile.telefono && !/^\+?[\d\s\-()]{7,}$/.test(profile.telefono)) e.telefono = 'Ingresa un número válido.'
  return e
})

function pTouch(f: keyof typeof pTouched) { pTouched[f] = true }
function pTouchAll() { Object.keys(pTouched).forEach((k) => (pTouched[k as keyof typeof pTouched] = true)) }

function resetProfile() {
  Object.assign(profile, INITIAL_PROFILE)
  Object.keys(pTouched).forEach((k) => (pTouched[k as keyof typeof pTouched] = false))
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
    await new Promise((r) => setTimeout(r, 800))
    profileSaved.value = true
    setTimeout(() => (profileSaved.value = false), 4000)
  } catch (err: any) {
    profileError.value = err?.response?.data?.message ?? 'No se pudieron guardar los cambios.'
  } finally {
    profileSubmitting.value = false
  }
}

// ── Notificaciones ──
async function updateNotifications() {
  try {
    await new Promise((r) => setTimeout(r, 600))
    notifSaved.value = true
    setTimeout(() => (notifSaved.value = false), 3000)
  } catch (err) {
    console.error('Error actualizando notificaciones:', err)
  }
}

// ── Contraseña ──
const pw = reactive({ current: '', newPw: '', confirm: '' })
const pwTouched = reactive({ current: false, newPw: false, confirm: false })
const pwSubmitting = ref(false)
const pwSaved = ref(false)
const pwError = ref('')

const pwErrors = computed(() => {
  const e: Record<string, string> = {}
  if (!pw.current) e.current = 'Ingresa tu contraseña actual.'
  if (!pw.newPw) e.newPw = 'La nueva contraseña es requerida.'
  else if (pw.newPw.length < 8) e.newPw = 'Mínimo 8 caracteres.'
  else if (pw.newPw === pw.current) e.newPw = 'La nueva contraseña debe ser diferente a la actual.'
  if (!pw.confirm) e.confirm = 'Confirma tu nueva contraseña.'
  else if (pw.confirm !== pw.newPw) e.confirm = 'Las contraseñas no coinciden.'
  return e
})

const isPwValid = computed(() => Object.keys(pwErrors.value).length === 0)

function pwTouch(f: keyof typeof pwTouched) { pwTouched[f] = true }
function pwTouchAll() { Object.keys(pwTouched).forEach((k) => (pwTouched[k as keyof typeof pwTouched] = true)) }

function resetPwForm() {
  pw.current = ''; pw.newPw = ''; pw.confirm = ''
  Object.keys(pwTouched).forEach((k) => (pwTouched[k as keyof typeof pwTouched] = false))
  pwSaved.value = false; pwError.value = ''
}

watch(() => pw.newPw, () => { if (pwTouched.confirm) pwTouched.confirm = true })

async function savePassword() {
  pwTouchAll()
  pwError.value = ''; pwSaved.value = false
  if (!isPwValid.value) return
  pwSubmitting.value = true
  try {
    await new Promise((r) => setTimeout(r, 900))
    if (pw.current === 'incorrecta') { pwError.value = 'La contraseña actual es incorrecta.'; return }
    pwSaved.value = true
    resetPwForm()
    setTimeout(() => (pwSaved.value = false), 4000)
  } catch (err: any) {
    pwError.value = err?.response?.data?.message ?? 'No se pudo actualizar la contraseña.'
  } finally {
    pwSubmitting.value = false
  }
}

// ── Fortaleza ──
const strength = computed(() => {
  const p = pw.newPw; if (!p) return 0
  let s = 0
  if (p.length >= 8) s++; if (p.length >= 12) s++
  if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const strengthPercent = computed(() => (strength.value / 5) * 100)
const strengthLabel = computed(() => ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strength.value])
const strengthColor = computed(() => ['', '#d92200', '#f37100', '#e6a800', '#1e783c', '#1e783c'][strength.value])
</script>

<style scoped>
.profile-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg);
  font-family: 'Outfit', sans-serif;
}

.content {
  flex: 1;
}

.page {
  max-width: 860px;
  margin: 0 auto;
  padding: 28px 24px;
  position: relative;
}

.btn-home-wrapper {
  position: absolute;
  top: 28px;
  right: 24px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 20px;
}

.section-title {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: var(--text);
  margin-bottom: 22px;
}

.section-desc {
  font-size: 13px;
  color: var(--text2);
  margin: -14px 0 24px;
  line-height: 1.5;
}

.profile-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* ── Sidebar ── */
.profile-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.sidebar-item {
  padding: 13px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  cursor: pointer;
  transition: background .15s;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-item:last-child {
  border-bottom: none;
}

.sidebar-item:hover {
  background: rgba(243, 113, 0, .04);
}

.sidebar-item.active {
  color: var(--sinopia);
  background: rgba(217, 34, 0, .06);
  border-left: 3px solid var(--sinopia);
  padding-left: 15px;
}

.sidebar-item .pi {
  font-size: 14px;
}

/* ── Panel ── */
.profile-panel {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

/* ── Settings ── */
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
  border-bottom: 1px solid var(--border);
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
  color: var(--text);
  margin-bottom: 2px;
}

.setting-desc {
  font-size: 12px;
  color: var(--text3);
}

/* ── Fields ── */
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

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
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

.fade-tab-enter-active {
  transition: opacity .2s ease, transform .2s ease;
}

.fade-tab-leave-active {
  transition: opacity .15s ease;
}

.fade-tab-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.fade-tab-leave-to {
  opacity: 0;
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
</style>
