<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CiudadForm from '@/components/admin/CiudadForm.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import { getCiudades, createCiudad, updateCiudad, deleteCiudad } from '@/services/ciudadService'

interface CiudadRow {
  id: string
  nombre: string
  active: boolean
}

const ciudades = ref<CiudadRow[]>([])
const isLoading = ref(true)
const loadError = ref('')

const loadingIds = ref(new Set<string>())

// ── Carga inicial ──
onMounted(async () => {
  try {
    const data = await getCiudades()
    ciudades.value = data.map((c) => ({ id: c.id, nombre: c.nombre, active: true }))
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Error al cargar las ciudades'
  } finally {
    isLoading.value = false
  }
})

// ── Modal crear / editar ──
const showModal = ref(false)
const editingCity = ref<CiudadRow | null>(null)
const isSaving = ref(false)
const saveError = ref('')

function openCreateModal() {
  editingCity.value = null
  saveError.value = ''
  showModal.value = true
}

function openEditModal(city: CiudadRow) {
  editingCity.value = city
  saveError.value = ''
  showModal.value = true
}

function closeModal() {
  if (isSaving.value) return
  showModal.value = false
  editingCity.value = null
  saveError.value = ''
}

async function onSaved(data: { name: string }) {
  isSaving.value = true
  saveError.value = ''
  try {
    if (editingCity.value) {
      await updateCiudad(editingCity.value.id, data.name)
      editingCity.value.nombre = data.name
    } else {
      const created = await createCiudad(data.name)
      ciudades.value.push({ id: created.id, nombre: created.nombre, active: true })
    }
    isSaving.value = false
    closeModal()
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status === 500) {
      saveError.value = 'Ya existe una ciudad con ese nombre.'
    } else {
      saveError.value = err instanceof Error ? err.message : 'Error al guardar la ciudad'
    }
  } finally {
    isSaving.value = false
  }
}

// ── Confirmación de eliminación ──
const showDeleteConfirm = ref(false)
const deletingCity = ref<CiudadRow | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')

function openDeleteConfirm(city: CiudadRow) {
  deletingCity.value = city
  deleteError.value = ''
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  if (isDeleting.value) return
  showDeleteConfirm.value = false
  deletingCity.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!deletingCity.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await deleteCiudad(deletingCity.value.id)
    ciudades.value = ciudades.value.filter((c) => c.id !== deletingCity.value!.id)
    isDeleting.value = false
    closeDeleteConfirm()
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status === 500 || status === 409) {
      deleteError.value = 'No se puede eliminar esta ciudad porque tiene cines asociados.'
    } else {
      deleteError.value = err instanceof Error ? err.message : 'Error al eliminar la ciudad'
    }
  } finally {
    isDeleting.value = false
  }
}

// ── Toggle activo (estado local, sin persistencia en backend) ──
function toggleActive(city: CiudadRow) {
  city.active = !city.active
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Ciudades</h1>
      <button class="btn btn-primary" @click="openCreateModal">+ Nueva ciudad</button>
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
              <th>#</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(ciudad, index) in ciudades" :key="ciudad.id" :style="{ '--row-delay': `${index * 40}ms` }">
              <td class="id-cell">{{ ciudad.id }}</td>
              <td>
                <strong>{{ ciudad.nombre }}</strong>
              </td>
              <td>
                <div class="status-cell">
                  <ToggleSwitch
                    :model-value="ciudad.active"
                    :loading="loadingIds.has(ciudad.id)"
                    @update:model-value="toggleActive(ciudad)"
                  />
                  <span class="status-label" :class="ciudad.active ? 'active' : 'inactive'">
                    {{ ciudad.active ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn btn-ghost btn-sm" @click="openEditModal(ciudad)">
                    Editar
                  </button>
                  <button class="btn btn-danger btn-sm" @click="openDeleteConfirm(ciudad)">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="ciudades.length === 0" key="empty">
              <td colspan="4" class="empty-state">No hay ciudades registradas.</td>
            </tr>
          </TransitionGroup>
        </table>
      </div>
    </div>

    <!-- Modal crear / editar -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingCity ? 'Editar ciudad' : 'Nueva ciudad' }}</h2>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <p v-if="saveError" class="modal-error">{{ saveError }}</p>
            <CiudadForm
              :key="editingCity?.id ?? 'new'"
              :initial-data="editingCity ? { name: editingCity.nombre } : undefined"
              :loading="isSaving"
              @saved="onSaved"
              @cancel="closeModal"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal confirmación de eliminación -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="closeDeleteConfirm">
        <div class="modal-box modal-box--sm">
          <div class="modal-header">
            <h2 class="modal-title">Eliminar ciudad</h2>
            <button class="close-btn" @click="closeDeleteConfirm">✕</button>
          </div>
          <div class="modal-body">
            <p class="confirm-text">
              ¿Estás seguro de que deseas eliminar
              <strong>{{ deletingCity?.nombre }}</strong
              >? Esta acción no se puede deshacer.
            </p>
            <p v-if="deleteError" class="modal-error">{{ deleteError }}</p>
            <div class="confirm-actions">
              <button class="btn btn-danger" :disabled="isDeleting" @click="confirmDelete">
                {{ isDeleting ? 'Eliminando…' : 'Sí, eliminar' }}
              </button>
              <button class="btn btn-ghost" :disabled="isDeleting" @click="closeDeleteConfirm">Cancelar</button>
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

/* Modal error */
.modal-error {
  font-size: 13px;
  color: var(--sinopia);
  margin-bottom: 12px;
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

.id-cell {
  color: var(--text3);
  font-size: 12px;
  width: 40px;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 12px;
  font-weight: 500;
}

.status-label.active {
  color: var(--success);
}

.status-label.inactive {
  color: var(--text3);
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

.btn-danger {
  background: var(--sinopia);
  color: #fff;
  padding: 6px 14px;
  opacity: 0.9;
}

.btn-danger:hover {
  opacity: 1;
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
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-box--sm {
  max-width: 380px;
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
  margin-bottom: 20px;
}

.confirm-text strong {
  color: var(--text);
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
