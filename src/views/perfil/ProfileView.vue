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
                    <InputText 
                      id="telefono" 
                      v-model="telefono" 
                      inputmode="numeric"
                      maxlength="8"
                      placeholder="+504 9999 9999"
                      :invalid="pTouched.telefono && !!pErrors.telefono" 
                      fluid 
                      @keydown="onlyDigitsKeydown"
                      @blur="pTouch('telefono')" 
                    />
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
                <p class="section-desc"v-if="reservas?.data.length === 0">
                  Todavía no tienes reservas. ¡Explora la cartelera y reserva tu próxima función!</p>
                <button @click="router.push('/')" v-if="reservas?.data.length === 0" class="btn-ghost">Ir A Cartelera</button>
                <div v-else class="reservas-list">
                  <div v-for="reserva in reservas?.data" :key="reserva.id" class="reserva-card">
                    <img class="reserva-poster" :src="reserva.funciones.peliculas.poster_url" :alt="reserva.funciones.peliculas.titulo" />

                    <div class="reserva-info">
                      <div class="reserva-header">
                        <div class="reserva-titulo">{{ reserva.funciones.peliculas.titulo }}</div>
                        <div>
                        <Tag :value="reserva.estado" :severity="estadoSeverity(reserva.estado)" />
                        <button v-if="reserva.estado === 'Confirmada'" class="btn-danger" style="margin-left: 8px;" @click="getCalc(reserva.id); reservaSeleccionada=reserva; cancelarReserva=true">Cancelar</button>
                        <Tag v-if="reserva.estado === 'Cancelada'" style="margin-left: 8px;" :severity="estadoSeverity(reserva.estado)">Pendiente</Tag>
                        </div>
                      </div>
                      <div class="reserva-codigo">{{ reserva.numero_reserva }}</div>
                      <div class="reserva-detalles">
                        <div class="reserva-dato"><i class="pi pi-building" /> {{ reserva.funciones.salas.cines.nombre }}</div>
                        <div class="reserva-dato"><i class="pi pi-objects-column" /> {{ reserva.funciones.salas.nombre }}</div>
                        <div class="reserva-dato"><i class="pi pi-calendar" /> {{ formatFecha(reserva.funciones.fecha_hora) }}</div>
                        <div class="reserva-dato"><i class="pi pi-clock" /> {{ reserva.formato }}</div>
                      </div>

                      <div class="reserva-footer">
                        <div class="reserva-asientos">
                          <Tag v-for="asiento in reserva.reservaAsientos" :key="asiento.id" :value="asiento.asientosfuncion.asientos.codigo" severity="warn"
                            style="font-family: 'DM Mono', monospace; font-size: 11px" />
                        </div>
                        <div class="reserva-total">L. {{ getTotal(reserva.pagos).toFixed(2) }}</div>
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
                    <ToggleSwitch v-model="notifReminders" />
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
                        style="color: var(--success)">
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

      <div v-if="calculoLoading" class="alert-warn" style="padding: 15px;">
        Calculando el monto de reembolso...
      </div>

      <div v-else-if="calculoError" class="alert-warn" style="padding: 15px;">
        {{ calculoError }}
      </div>

      <div v-else-if="calculo" class="alert-warn" style="padding: 15px;">
        Reembolso aplicable: <strong>{{ calculo.porcentaje_de_reembolso }}%</strong>
        — recibirás <strong>L. {{ Number(calculo.monto_de_reembolso).toFixed(2) }}</strong>
        de un total de L. {{ Number(calculo.monto_total).toFixed(2) }}.
      </div>

      <div class="modal-body" v-if="reservaSeleccionada">
        <strong style="font-weight: 600;">
          {{ reservaSeleccionada.numero_reserva }} — {{ reservaSeleccionada.funciones.peliculas.titulo }}
        </strong>

        <div style="color: var(--rosewood);">
          {{ formatFecha(reservaSeleccionada.funciones.fecha_hora) }}
        </div>

        <br />

        <div style="color: var(--rosewood);">
          Esta acción no se puede deshacer. El reembolso se procesará en 3–5 días hábiles.
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-ghost" @click="cerrarModal()">Volver</button>
        <button class="btn-danger" :disabled="calculoLoading" @click="updateReserva()">
          Confirmar cancelación
        </button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import NavBar from '@/components/NavBar.vue'
import { getReservas, cancelReserva, calcularReembolso } from '@/services/reservaService'
import { obtenerUsuario, actualizarPassword, alternarNotificaciones, actualizarPerfil, type ActualizarPerfilPayload } from '@/services/usuarioService'
import { getCurrentUserId } from '@/services/movieService'
import { getUsuarioActual, notificarCambioSesion } from '@/services/authService'
import { isApiError } from '@/services/api'
const router = useRouter()
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
interface ReservasRes {
  data: Reserva[],
  meta: {
    page: number,
    limit: number
  }
}

interface Reserva {
  id: number;
  id_usuario: number;
  id_funcion: number;
  estado: 'Confirmada' | 'Completada' | 'Cancelada'
  formato: string,  
  created_at: string;
  numero_reserva: string;
  updated_at: string | null;

  funciones: Funcion;
  reservaAsientos: ReservaAsiento[];
  pagos: Pago[];
}

export interface Funcion {
  fecha_hora: string,
  peliculas: Pelicula,
  salas: Sala,
}

export interface Pelicula {
  id: number,
  titulo: string,
  sinopsis: string,
  duracion: number,
  clasificacion: string,
  poster_url: string,
  idioma: string,
  subtitulada: boolean,
}

export interface Sala {
  id: number,
  nombre: string,
  cines: Cine,
}

export interface Cine {
  id: number,
  nombre: string,
  ciudad: string,
  direccion: string,
}

export interface ReservaAsiento {
  id: number,
  asientosfuncion: AsientoFuncion,
}

export interface AsientoFuncion {
  id: number,
  asientos: Asiento,
}

export interface Asiento {
  id: number,
  codigo: string
}

export interface Pago {
  id: number,
  metodo: string,
  monto_final: number,
  estado: string,
  referencia: string,
  created_at: string,
}
interface ReservasFilter {
  id_usuario?: number,
  id_pelicula?: number,
  id_cine?: number,
  fecha_inicio?: string,
  fecha_final?: string,
  estado?: string,
}

export interface CalcResr {
  reserva: string,
  monto_total: number,
  porcentaje_de_reembolso: number,
  monto_de_reembolso: number,
}

const filters = ref<ReservasFilter>({id_usuario: getCurrentUserId()})
const reservas = ref<ReservasRes>()
const calculo = ref<CalcResr>()
const calculoLoading = ref(false)
const calculoError = ref('')

async function getUserReservas() {
  try{
    reservas.value = await getReservas({...filters.value });
  }catch(error){
    throw new Error(`Error: ${error}`)
  }
}

onMounted(getUserReservas)

function getTotal(pagos: Pago[]){
  let pagoTotal = 0;
  pagos.forEach(p => pagoTotal=pagoTotal + Number(p.monto_final));
  return pagoTotal;
}

function formatFecha(fechaISO: string): string {
  return new Date(fechaISO).toLocaleDateString('es-HN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function estadoSeverity(estado: Reserva['estado']) {
  return { Confirmada: 'success', Completada: 'info', Cancelada: 'danger' }[estado] as 'success' | 'info' | 'danger'
}

// ── Perfil ──
const INITIAL_PROFILE = reactive({
  nombre: '',
  email: '',
  telefono: '',
  notificaciones_activas: true,
})

const profile = reactive({ ...INITIAL_PROFILE })
const notifReminders = ref(false)
const notifSaved = ref(false)

const telefono = computed({
  get: () => profile.telefono,
  set: (value: string) => {
    profile.telefono = value.replace(/\D/g, '').slice(0, 8)
  }
})

// Bloquea cualquier tecla que no sea un dígito antes de que se escriba
const ALLOWED_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']

function onlyDigitsKeydown(e: KeyboardEvent) {
  if (ALLOWED_KEYS.includes(e.key)) return
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

async function cargarPerfil() {
  try {
    const usuario = await obtenerUsuario(getCurrentUserId())
    Object.assign(INITIAL_PROFILE, {
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono ?? '',
      notificaciones_activas: usuario.notificaciones_activas,
    })
    Object.assign(profile, INITIAL_PROFILE)
  } catch (err) {
    console.error('No se pudo cargar el perfil:', err)
  }
}

onMounted(cargarPerfil)
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
    const payload: ActualizarPerfilPayload = {
      nombre: profile.nombre.trim(),
      email: profile.email.trim(),
    }
    if (profile.telefono.trim()) payload.telefono = profile.telefono.trim()

    const actualizado = await actualizarPerfil(getCurrentUserId(), payload)

    Object.assign(INITIAL_PROFILE, {
      nombre: actualizado.nombre,
      email: actualizado.email,
      telefono: actualizado.telefono ?? '',
      notificaciones_activas: actualizado.notificaciones_activas,
    })
    Object.assign(profile, INITIAL_PROFILE)

    const sesion = getUsuarioActual()
    if (sesion) {
      localStorage.setItem('user', JSON.stringify({
        ...sesion,
        nombre: actualizado.nombre,
        email: actualizado.email,
        telefono: actualizado.telefono,
      }))
      notificarCambioSesion()
    }

    profileSaved.value = true
    setTimeout(() => (profileSaved.value = false), 4000)
  } catch (err) {
    profileError.value = isApiError(err) ? err.message : 'No se pudieron guardar los cambios.'
  } finally {
    profileSubmitting.value = false
  }
}

// ── Notificaciones ──
async function updateNotifications() {
  try {
    await alternarNotificaciones(getCurrentUserId())
    notifSaved.value = true
    setTimeout(() => (notifSaved.value = false), 3000)
  } catch (err) {
    profile.notificaciones_activas = !profile.notificaciones_activas
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
    await actualizarPassword(getCurrentUserId(), pw.current, pw.newPw)
    resetPwForm()
    pwSaved.value = true
    setTimeout(() => (pwSaved.value = false), 4000)
  } catch (err) {
    pwError.value = isApiError(err) ? err.message : 'No se pudo actualizar la contraseña.'
  } finally {
    pwSubmitting.value = false
  }
}

function cerrarModal(){
  cancelarReserva.value = false
  reservaSeleccionada.value = null
  calculo.value = undefined,
  calculoError.value = ''
}

async function updateReserva(){
  const res = reservas.value?.data.find(r => r?.id === reservaSeleccionada.value?.id);
  if(!res) return;
  try{
    await cancelReserva(res?.id);
    res.estado = 'Cancelada'
    await getUserReservas();
  }catch(error){
    throw new Error(`Error: ${error}`)
  }
  cancelarReserva.value = false
}

async function getCalc(id: number){
  calculoLoading.value = true
  calculoError.value = ''
  calculo.value = undefined
  try{
    calculo.value = await calcularReembolso(id);
  }catch(error){
    calculoError.value = 'No se encontraron políticas de cancelación para el reembolso.'
    throw new Error(`Error: ${error}`)
  }finally{
    calculoLoading.value = false
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
const strengthColor = computed(() => ['', '#d92200', '#f37100', '#e6a800', 'var(--success)', 'var(--success)'][strength.value])
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
