<template>
  <div class="profile-screen">
    <NavBar />
    <div class="content">
      <div class="page">

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

              <!-- TAB: RESERVAS -->
              <div v-else-if="activeTab === 'reservas'" key="reservas">
                <div class="section-title">Mis reservas</div>
                <p class="section-desc">Consulta el historial y el estado de tus reservas de funciones.</p>

                <div v-if="reservas.length === 0" class="empty-reservas">
                  Todavía no tienes reservas. ¡Explora la cartelera y reserva tu próxima función!
                </div>

                <div v-else class="reservas-list">
                  <div v-for="reserva in reservas" :key="reserva.id" class="reserva-card">
                    <img class="reserva-poster" :src="reserva.posterUrl" :alt="reserva.pelicula" />

                    <div class="reserva-info">
                      <div class="reserva-header">
                        <div class="reserva-titulo">{{ reserva.pelicula }}</div>
                        <div>
                        <Tag :value="reserva.estado" :severity="estadoSeverity(reserva.estado)" />
                        <button v-if="reserva.estado === 'Confirmada'" class="btn-danger" style="margin-left: 8px;" @click="reservaSeleccionada=reserva; cancelarReserva=true">Cancelar</button>
                        <Tag v-if="reserva.estado === 'Cancelada'" style="margin-left: 8px;" :severity="estadoSeverity(reserva.estado)">Pendiente</Tag>
                        </div>
                      </div>
                      <div class="reserva-codigo">{{ reserva.numero }}</div>
                      <div class="reserva-detalles">
                        <div class="reserva-dato"><i class="pi pi-building" /> {{ reserva.cine }}</div>
                        <div class="reserva-dato"><i class="pi pi-th-large" /> {{ reserva.sala }}</div>
                        <div class="reserva-dato"><i class="pi pi-calendar" /> {{ reserva.fecha }}</div>
                        <div class="reserva-dato"><i class="pi pi-clock" /> {{ reserva.hora }} · {{ reserva.formato }}</div>
                      </div>

                      <div class="reserva-footer">
                        <div class="reserva-asientos">
                          <Tag v-for="codigo in reserva.asientos" :key="codigo" :value="codigo" severity="warn"
                            style="font-family: 'DM Mono', monospace; font-size: 11px" />
                        </div>
                        <div class="reserva-total">L. {{ reserva.total.toFixed(2) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
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
                      <small v-if="pwTouched.confirm && !!pwErrors.confirm" class="field-error">{{ pwErrors.confirm
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
  <div v-if="cancelarReserva" class="modal-container">
  <div class="modal-overlay" id="modal-cancel">
  <div class="modal-box" style="padding: 20px;">
    <div class="modal-title" style="margin-bottom: 10px; font-weight: 600;">¿Cancelar esta reserva?</div>
    <div class="alert-warn" style="padding: 15px;">Política vigente: más de 48h → 100% de reembolso · 24–48h → 50% · menos de 24h → sin reembolso.</div>
    <div class="modal-body" v-if="reservaSeleccionada">
  <strong style="font-weight: 600;">
    {{ reservaSeleccionada.numero }} — {{ reservaSeleccionada.pelicula }}
  </strong>

  <div style="color: #510000;">
    {{ reservaSeleccionada.fecha }} · {{ reservaSeleccionada.hora }} · Asientos {{ reservaSeleccionada.asientos.join(', ') }}
  </div>

  <br />

  <div style="color: #510000;">
    Esta acción no se puede deshacer. El reembolso se procesará en 3–5 días hábiles.
  </div>
</div>
    <div class="modal-actions">
      <button class="btn-ghost" @click="cerrarModal()">Volver</button>
      <button class="btn-danger" @click="updateReserva()">Confirmar cancelación</button>
    </div>
  </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const cancelarReserva = ref(false)
const menuItems = [
  { tab: 'perfil', icon: 'pi-user', label: 'Mi perfil' },
  { tab: 'reservas', icon: 'pi-ticket', label: 'Mis reservas' },
  { tab: 'notificaciones', icon: 'pi-bell', label: 'Notificaciones' },
  { tab: 'password', icon: 'pi-lock', label: 'Contraseña' },
]

const tabsValidos = menuItems.map((item) => item.tab)
const tabInicial = typeof route.query.tab === 'string' && tabsValidos.includes(route.query.tab)
  ? route.query.tab
  : 'perfil'
const activeTab = ref(tabInicial)

// ── Reservas ──
interface Reserva {
  id: number
  numero: string
  pelicula: string
  posterUrl: string
  cine: string
  sala: string
  fecha: string
  hora: string
  formato: string
  asientos: string[]
  total: number
  estado: 'Confirmada' | 'Completada' | 'Cancelada'
}

const reservas = ref<Reserva[]>([
  {
    id: 1,
    numero: 'RES-2026-0421',
    pelicula: 'There Will Be Blood',
    posterUrl: 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p171565_p_v8_aa.jpg',
    cine: 'Cine Vicenta',
    sala: 'Sala 4',
    fecha: 'Viernes 12 jun, 2026',
    hora: '19:15',
    formato: '3D · Español',
    asientos: ['B5', 'B6'],
    total: 360,
    estado: 'Confirmada',
  },
  {
    id: 2,
    numero: 'RES-2026-0388',
    pelicula: 'Pulp Fiction',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    cine: 'Metrocinema Tegus',
    sala: 'Sala 1',
    fecha: 'Lunes 8 jun, 2026',
    hora: '20:00',
    formato: '2D · Español',
    asientos: ['D3'],
    total: 120,
    estado: 'Completada',
  },
  {
    id: 3,
    numero: 'RES-2026-0356',
    pelicula: 'Fight Club',
    posterUrl: 'https://s3.amazonaws.com/nightjarprod/content/uploads/sites/344/2024/08/21164326/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK-scaled.jpg',
    cine: 'Cine Vicenta',
    sala: 'Sala 2',
    fecha: 'Martes 2 jun, 2026',
    hora: '21:45',
    formato: 'IMAX · Español',
    asientos: ['G7', 'G8'],
    total: 360,
    estado: 'Cancelada',
  },
])

function estadoSeverity(estado: Reserva['estado']) {
  return { Confirmada: 'success', Completada: 'info', Cancelada: 'danger' }[estado] as 'success' | 'info' | 'danger'
}

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
const reservaSeleccionada = ref<Reserva | null>(null)

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

function cerrarModal(){
  cancelarReserva.value = false
  reservaSeleccionada.value = null
}

function updateReserva(){
  const res = reservas.value.find(r => r?.id === reservaSeleccionada.value?.id);
  if(res){
    res.estado = 'Cancelada'
  }
  cancelarReserva.value = false
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
/* ── ALERTS ── */
.alert-warn { 
  background: rgba(243,113,0,.08); 
  border: 1px solid rgba(243,113,0,.25); 
  color: var(--orange); 
}

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

.btn-danger { 
  background: rgba(146,0,4,.1); 
  color: var(--darkred); 
  border-radius: 10px;
  border: 1px solid rgba(146,0,4,.2); 
  padding: 8px 16px; 
  font-size: 12px; 
}

.btn-danger:hover { 
  background: rgba(165, 165, 165, 0.1); 
  color: var(--darkred); 
  border: 1px solid rgba(146,0,4,.2); 
}

.btn-danger:active { 
  background: rgba(146,0,4,.1); 
  color: var(--darkred); 
  border: 1px solid rgba(146,0,4,.2); 
}

.btn-ghost { 
  background: transparent; 
  color: var(--text2); 
  border: 1px solid var(--border2); 
  padding: 9px 18px; 
  font-size: 13px; 
  border-radius: 10px;
  font-weight: 400; 
}
.btn-ghost:hover { background: var(--bg); }

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

/* Modal */
.modal-container {
  
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 10, 6, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal-box {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: 20px;
  color: var(--text);
  font-weight: 400;
}

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text3);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
  font-family: 'Outfit', sans-serif;
}

.close-btn:hover {
  color: var(--text);
}

.modal-body {
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

/* ── Reservas ── */
.empty-reservas {
  padding: 32px 0;
  text-align: center;
  color: var(--text3);
  font-size: 13px;
}

.reservas-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reserva-card {
  display: flex;
  gap: 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
}

.reserva-poster {
  width: 64px;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.reserva-info {
  flex: 1;
  min-width: 0;
}

.reserva-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.reserva-titulo {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.reserva-codigo {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: var(--text3);
  margin-top: 2px;
  margin-bottom: 10px;
}

.reserva-detalles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}

.reserva-dato {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text2);
}

.reserva-dato .pi {
  font-size: 11px;
  color: var(--text3);
}

.reserva-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.reserva-asientos {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.reserva-total {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--sinopia);
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
