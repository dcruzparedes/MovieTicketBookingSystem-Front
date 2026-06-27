<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import {
  getFunciones,
  cancelarFuncion,
  getReservasActivasCount,
  type FuncionRow,
} from '@/services/funcionService'

const router = useRouter()

const funciones = ref<FuncionRow[]>([])
const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    funciones.value = await getFunciones()
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Error al cargar las funciones'
  } finally {
    isLoading.value = false
  }
})

// ── Cancel confirmation ──
const showCancelConfirm = ref(false)
const cancelingFuncion = ref<FuncionRow | null>(null)
const confirmChecked = ref(false)
const reservasCount = ref<number | null>(null)
const reservasLoadError = ref(false)
const isCanceling = ref(false)
const cancelError = ref('')

async function openCancelConfirm(funcion: FuncionRow) {
  cancelingFuncion.value = funcion
  confirmChecked.value = false
  reservasCount.value = null
  reservasLoadError.value = false
  cancelError.value = ''
  showCancelConfirm.value = true

  try {
    reservasCount.value = await getReservasActivasCount(funcion.id)
  } catch {
    reservasLoadError.value = true
    reservasCount.value = 0
  }
}

function closeCancelConfirm() {
  if (isCanceling.value) return
  showCancelConfirm.value = false
  cancelingFuncion.value = null
  confirmChecked.value = false
  cancelError.value = ''
}

async function confirmCancel() {
  if (!cancelingFuncion.value || !confirmChecked.value) return
  isCanceling.value = true
  cancelError.value = ''
  try {
    await cancelarFuncion(cancelingFuncion.value.id)
    const row = funciones.value.find((f) => f.id === cancelingFuncion.value!.id)
    if (row) row.estado = 'cancelada'
    closeCancelConfirm()
  } catch (err) {
    cancelError.value = err instanceof Error ? err.message : 'Error al cancelar la función'
  } finally {
    isCanceling.value = false
  }
}

function goToEdit(funcion: FuncionRow) {
  router.push(`/admin/funciones/${funcion.id}/editar`)
}

function estadoLabel(estado: string) {
  return estado === 'cancelada' ? 'Cancelada' : 'Programada'
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Funciones</h1>
      <button class="btn btn-primary" @click="router.push('/admin/funciones/nueva')">
        + Nueva función
      </button>
    </div>

    <div class="page-body">
      <!-- Cargando -->
      <div v-if="isLoading" class="state-box animado" style="--delay: 80ms">
        <div class="skeleton-row" />
        <div class="skeleton-row short" />
        <div class="skeleton-row" />
      </div>

      <!-- Error de carga -->
      <div v-else-if="loadError" class="state-box animado" style="--delay: 80ms">
        <p class="state-text error-text">{{ loadError }}</p>
      </div>

      <!-- Tabla -->
      <div v-else class="card animado" style="--delay: 80ms">
        <table class="tbl">
          <thead>
            <tr>
              <th>Película</th>
              <th>Cine</th>
              <th>Sala</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr
              v-for="(funcion, index) in funciones"
              :key="funcion.id"
              :class="{ 'row-cancelled': funcion.estado === 'cancelada' }"
              :style="{ '--row-delay': `${index * 40}ms` }"
            >
              <td><strong>{{ funcion.peliculaTitulo }}</strong></td>
              <td>{{ funcion.cinemaNombre }}</td>
              <td>{{ funcion.salaNombre }}</td>
              <td>{{ funcion.fecha }}</td>
              <td style="font-family: 'DM Mono', monospace">{{ funcion.hora }}</td>
              <td>
                <span
                  class="badge"
                  :class="funcion.estado === 'cancelada' ? 'badge-cancelada' : 'badge-programada'"
                >
                  {{ estadoLabel(funcion.estado) }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button
                    class="btn btn-ghost btn-sm"
                    :disabled="funcion.estado === 'cancelada'"
                    @click="goToEdit(funcion)"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-cancel btn-sm"
                    :disabled="funcion.estado === 'cancelada'"
                    @click="openCancelConfirm(funcion)"
                  >
                    Cancelar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="funciones.length === 0" key="empty">
              <td colspan="7" class="empty-state">No hay funciones registradas.</td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </div>

    <!-- Modal confirmación de cancelación -->
    <Teleport to="body">
      <div v-if="showCancelConfirm" class="modal-overlay" @click.self="closeCancelConfirm">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">Cancelar función</h2>
            <button class="close-btn" @click="closeCancelConfirm">✕</button>
          </div>
          <div class="modal-body">
            <!-- Detalle de la función -->
            <div class="funcion-chip">
              <span class="chip-movie">{{ cancelingFuncion?.peliculaTitulo }}</span>
              <span class="chip-detail">
                {{ cancelingFuncion?.cinemaNombre }} · {{ cancelingFuncion?.salaNombre }}
              </span>
              <span class="chip-detail">
                {{ cancelingFuncion?.fecha }} a las {{ cancelingFuncion?.hora }}
              </span>
            </div>

            <!-- Cargando reservas -->
            <div v-if="reservasCount === null && !reservasLoadError" class="reservas-loading">
              <div class="skeleton-row short" />
            </div>

            <!-- Advertencia de reservas afectadas -->
            <div v-else-if="(reservasCount ?? 0) > 0" class="warning-box">
              <span class="warning-icon">⚠</span>
              <div class="warning-content">
                <p class="warning-title">
                  {{ reservasCount }}
                  {{ reservasCount === 1 ? 'cliente tiene' : 'clientes tienen' }}
                  reservas activas
                </p>
                <ul class="warning-list">
                  <li>Sus reservas quedarán anuladas automáticamente.</li>
                  <li>Recibirán una notificación por correo electrónico.</li>
                  <li>Los pagos realizados serán reembolsados.</li>
                </ul>
              </div>
            </div>

            <!-- Sin reservas -->
            <p v-else class="no-reservas-note">
              Esta función no tiene reservas activas.
            </p>

            <!-- Checkbox de confirmación explícita -->
            <label class="confirm-check">
              <input v-model="confirmChecked" type="checkbox" />
              <span>
                Entiendo que esta acción es irreversible y que
                {{ (reservasCount ?? 0) > 0
                  ? `los ${reservasCount} clientes afectados serán notificados.`
                  : 'la función quedará cancelada.' }}
              </span>
            </label>

            <p v-if="cancelError" class="cancel-error">{{ cancelError }}</p>

            <div class="confirm-actions">
              <button
                class="btn btn-danger"
                :disabled="!confirmChecked || isCanceling"
                @click="confirmCancel"
              >
                {{ isCanceling ? 'Cancelando…' : 'Cancelar función' }}
              </button>
              <button class="btn btn-ghost" :disabled="isCanceling" @click="closeCancelConfirm">
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<style scoped>
.page-header {
  padding: 24px 28px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 26px;
  color: var(--text);
  font-weight: 400;
}

.page-body {
  padding: 0 28px 28px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

/* Loading skeleton */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 40px 0;
}

.skeleton-row {
  height: 16px;
  width: 100%;
  max-width: 400px;
  border-radius: 6px;
  background: var(--border2);
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-row.short {
  max-width: 220px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.state-text {
  font-size: 14px;
  color: var(--text2);
}

.error-text {
  color: var(--sinopia);
}

/* Table */
.tbl {
  width: 100%;
  border-collapse: collapse;
}

.tbl th {
  font-size: 11px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border2);
}

.tbl td {
  font-size: 13px;
  color: var(--text2);
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.tbl td strong {
  color: var(--text);
  font-weight: 500;
}

.tbl tr:last-child td {
  border-bottom: none;
}

.tbl tr:hover td {
  background: rgba(243, 113, 0, 0.03);
}

.row-cancelled td {
  opacity: 0.5;
}

.action-group {
  display: flex;
  gap: 6px;
}

.empty-state {
  text-align: center;
  color: var(--text3);
  font-size: 13px;
  padding: 32px 14px;
}

/* Badges */
.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.badge-programada {
  background: rgba(30, 120, 60, 0.1);
  color: var(--success);
}

.badge-cancelada {
  background: rgba(92, 0, 6, 0.07);
  color: var(--text3);
}

/* Buttons */
.btn {
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--sinopia);
  color: #fff;
  padding: 9px 18px;
}

.btn-primary:hover {
  opacity: 0.88;
}

.btn-ghost {
  background: transparent;
  color: var(--text2);
  border: 1px solid var(--border2);
  padding: 6px 14px;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--bg);
}

.btn-cancel {
  background: transparent;
  color: var(--sinopia);
  border: 1px solid rgba(217, 34, 0, 0.3);
  padding: 6px 14px;
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(217, 34, 0, 0.05);
}

.btn-danger {
  background: var(--sinopia);
  color: #fff;
  padding: 10px 20px;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.88;
}

.btn-sm {
  font-size: 12px;
}

/* Modal */
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
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: var(--text);
  font-weight: 400;
}

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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Función chip */
.funcion-chip {
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.chip-movie {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.chip-detail {
  font-size: 12px;
  color: var(--text3);
}

.reservas-loading {
  padding: 4px 0;
}

/* Warning box */
.warning-box {
  background: var(--orange-bg);
  border: 1px solid rgba(243, 113, 0, 0.25);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.warning-icon {
  font-size: 16px;
  line-height: 1;
  margin-top: 1px;
  flex-shrink: 0;
}

.warning-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.warning-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--orange);
}

.warning-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.warning-list li {
  font-size: 12px;
  color: var(--orange);
  line-height: 1.4;
}

.no-reservas-note {
  font-size: 13px;
  color: var(--text3);
}

/* Confirm checkbox */
.confirm-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 12px 14px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  transition: border-color 0.2s, background 0.2s;
}

.confirm-check:has(input:checked) {
  border-color: var(--sinopia);
  background: rgba(217, 34, 0, 0.03);
}

.confirm-check input[type='checkbox'] {
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: var(--sinopia);
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.confirm-check span {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
}

.cancel-error {
  font-size: 13px;
  color: var(--sinopia);
}

.confirm-actions {
  display: flex;
  gap: 10px;
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

.rows-enter-active {
  animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--row-delay, 0ms);
  opacity: 0;
}

.rows-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.rows-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

.rows-move {
  transition: transform 0.3s ease;
}
</style>
