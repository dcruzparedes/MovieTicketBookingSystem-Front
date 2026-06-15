<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

interface Funcion {
  id: number
  peliculaTitulo: string
  cinemaNombre: string
  salaNombre: string
  fecha: string
  hora: string
  precio: string
  cancelada: boolean
}

const router = useRouter()

const funciones = ref<Funcion[]>([
  {
    id: 1,
    peliculaTitulo: 'Alien: Romulus',
    cinemaNombre: 'Cine Vicenta Zona 10',
    salaNombre: 'Sala VIP',
    fecha: '2024-11-15',
    hora: '19:30',
    precio: '65.00',
    cancelada: false,
  },
  {
    id: 2,
    peliculaTitulo: 'Wild Robot',
    cinemaNombre: 'Cine Vicenta Zona 10',
    salaNombre: 'Sala 1',
    fecha: '2024-11-15',
    hora: '17:00',
    precio: '45.00',
    cancelada: false,
  },
  {
    id: 3,
    peliculaTitulo: 'Megalopolis',
    cinemaNombre: 'Cine Vicenta Miraflores',
    salaNombre: 'Sala IMAX',
    fecha: '2024-11-16',
    hora: '20:00',
    precio: '75.00',
    cancelada: false,
  },
  {
    id: 4,
    peliculaTitulo: 'Venom: El Último Baile',
    cinemaNombre: 'Cine Vicenta Pradera',
    salaNombre: 'Sala 2',
    fecha: '2024-11-14',
    hora: '18:30',
    precio: '45.00',
    cancelada: true,
  },
  {
    id: 5,
    peliculaTitulo: 'Wild Robot',
    cinemaNombre: 'Cine Vicenta Antigua',
    salaNombre: 'Sala 1',
    fecha: '2024-11-17',
    hora: '16:00',
    precio: '40.00',
    cancelada: false,
  },
])

// ── Cancel confirmation ──
const showCancelConfirm = ref(false)
const cancelingFuncion = ref<Funcion | null>(null)

function openCancelConfirm(funcion: Funcion) {
  cancelingFuncion.value = funcion
  showCancelConfirm.value = true
}

function closeCancelConfirm() {
  showCancelConfirm.value = false
  cancelingFuncion.value = null
}

function confirmCancel() {
  if (!cancelingFuncion.value) return
  // TODO: PATCH /api/funciones/:id { cancelada: true }
  cancelingFuncion.value.cancelada = true
  closeCancelConfirm()
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <h1 class="page-title">Funciones</h1>
      <button class="btn btn-primary" @click="router.push('/admin/funciones/nueva')">
        + Nueva función
      </button>
    </div>

    <div class="page-body">
      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>Película</th>
              <th>Cine</th>
              <th>Sala</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="funcion in funciones"
              :key="funcion.id"
              :class="{ 'row-cancelled': funcion.cancelada }"
            >
              <td><strong>{{ funcion.peliculaTitulo }}</strong></td>
              <td>{{ funcion.cinemaNombre }}</td>
              <td>{{ funcion.salaNombre }}</td>
              <td>{{ funcion.fecha }}</td>
              <td>{{ funcion.hora }}</td>
              <td>Q {{ funcion.precio }}</td>
              <td>
                <span class="badge" :class="funcion.cancelada ? 'badge-cancelada' : 'badge-programada'">
                  {{ funcion.cancelada ? 'Cancelada' : 'Programada' }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button
                    class="btn btn-ghost btn-sm"
                    :disabled="funcion.cancelada"
                    @click="router.push('/admin/funciones/' + funcion.id + '/editar')"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-cancel btn-sm"
                    :disabled="funcion.cancelada"
                    @click="openCancelConfirm(funcion)"
                  >
                    Cancelar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="funciones.length === 0">
              <td colspan="8" class="empty-state">No hay funciones registradas.</td>
            </tr>
          </tbody>
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
            <p class="confirm-text">
              ¿Estás seguro de que deseas cancelar la función de
              <strong>{{ cancelingFuncion?.peliculaTitulo }}</strong> el
              {{ cancelingFuncion?.fecha }} a las {{ cancelingFuncion?.hora }}?
            </p>
            <p class="confirm-note">Esta acción no se puede deshacer.</p>
            <div class="confirm-actions">
              <button class="btn btn-danger" @click="confirmCancel">Sí, cancelar función</button>
              <button class="btn btn-ghost" @click="closeCancelConfirm">Volver</button>
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
  color: #1e783c;
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

.btn-danger:hover {
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
  max-width: 420px;
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
}

.confirm-text {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.55;
  margin-bottom: 8px;
}

.confirm-text strong {
  color: var(--text);
}

.confirm-note {
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 20px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}
</style>
