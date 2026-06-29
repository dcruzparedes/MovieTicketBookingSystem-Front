<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { getSalas, deleteSala, type Sala } from '@/services/salaService'

const router = useRouter()
const route = useRoute()

const salas = ref<Sala[]>([])

onMounted(async () => {
  salas.value = await getSalas()
})

// Filtro por cine si viene en la query
const filteredSalas = computed(() => {
  const cineId = route.query.cineId
  if (!cineId) return salas.value
  return salas.value.filter(s => s.id_cine === cineId)
})

const selectedCineName = computed(() => {
  const cineId = route.query.cineId
  if (!cineId) return ''
  const sala = salas.value.find(s => s.id_cine === cineId)
  return sala ? sala.cineNombre : ''
})

function goToNewSala() {
  router.push('/admin/salas/nueva')
}

function editSala(id: string) {
  router.push(`/admin/salas/${id}/editar`)
}

// ── Confirmación de eliminación ──
const showDeleteConfirm = ref(false)
const deletingSala = ref<Sala | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')

function openDeleteConfirm(sala: Sala) {
  deletingSala.value = sala
  deleteError.value = ''
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  if (isDeleting.value) return
  showDeleteConfirm.value = false
  deletingSala.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!deletingSala.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await deleteSala(Number(deletingSala.value.id))
    salas.value = await getSalas()
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'Error al eliminar la sala'
  } finally {
    isDeleting.value = false
    closeDeleteConfirm()
  }
}

function clearFilter() {
  router.push('/admin/salas')
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <div class="header-titles">
        <h1 class="page-title">Salas</h1>
        <p v-if="selectedCineName" class="page-subtitle">
          Cine: <strong>{{ selectedCineName }}</strong>
          <button class="clear-btn" @click="clearFilter">✕ Quitar filtro</button>
        </p>
      </div>
      <button class="btn btn-primary" @click="goToNewSala">+ Nueva sala</button>
    </div>

    <div class="page-body">
      <div class="card animado" style="--delay: 80ms">
        <table class="tbl">
          <thead>
            <tr>
              <th>Sala</th>
              <th>Cine</th>
              <th>Filas</th>
              <th>Columnas</th>
              <th>Capacidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(sala, index) in filteredSalas" :key="sala.id" :style="{ '--row-delay': `${index * 40}ms` }">
              <td><strong>{{ sala.nombre }}</strong></td>
              <td>{{ sala.cineNombre }}</td>
              <td>{{ sala.filas }}</td>
              <td>{{ sala.columnas }}</td>
              <td>
                <span class="capacity-badge">{{ sala.filas * sala.columnas }} asientos</span>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn btn-ghost btn-sm" @click="editSala(sala.id)">
                    Editar
                  </button>
                  <button class="btn btn-ghost btn-sm btn-danger" @click="openDeleteConfirm(sala)">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredSalas.length === 0" key="empty">
              <td colspan="6" class="empty-state">No hay salas registradas para este criterio.</td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </div>
  </AdminLayout>

  <Teleport to="body">
    <!-- CONFIRMACIÓN DE ELIMINACIÓN -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
      <div class="modal-box" style="max-width:380px">
        <div class="modal-header">
          <div class="modal-title">Eliminar sala</div>
          <button class="close-btn" @click="closeDeleteConfirm">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:var(--text2);line-height:1.55;margin-bottom:16px">
            ¿Estás seguro de que deseas eliminar la sala <strong>{{ deletingSala?.nombre }}</strong>? Esta acción no se puede deshacer.
          </p>
          <p v-if="deleteError" class="field-error" style="margin-bottom:12px">{{ deleteError }}</p>
          <div style="display:flex;gap:10px">
            <button class="btn btn-danger" :disabled="isDeleting" @click="confirmDelete">{{ isDeleting ? 'Eliminando…' : 'Sí, eliminar' }}</button>
            <button class="btn btn-ghost" :disabled="isDeleting" @click="closeDeleteConfirm">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.page-header {
  padding: 24px 28px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 26px;
  color: var(--text);
  font-weight: 400;
}

.page-subtitle {
  font-size: 13px;
  color: var(--text3);
}

.page-subtitle strong {
  color: var(--text2);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--sinopia);
  font-size: 11px;
  cursor: pointer;
  margin-left: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
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

.empty-state {
  text-align: center;
  color: var(--text3);
  font-size: 13px;
  padding: 32px 14px;
}

.capacity-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(90, 0, 6, 0.06);
  color: var(--rosewood);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.action-group {
  display: flex;
  gap: 8px;
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

.btn-ghost:hover {
  background: var(--bg);
}

.btn-sm {
  font-size: 12px;
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

.field-error { font-size: 11px; color: var(--sinopia); margin-top: 4px; }
</style>
