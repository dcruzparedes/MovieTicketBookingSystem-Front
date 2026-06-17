<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CiudadForm from '@/components/admin/CiudadForm.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

interface Ciudad {
  id: number
  name: string
  active: boolean
}

const ciudades = ref<Ciudad[]>([
  { id: 1, name: 'San Pedro Sula', active: true },
  { id: 2, name: 'Francisco Morazán', active: true },
  { id: 3, name: 'Siguatepeque', active: true },
  { id: 4, name: 'Tegucigalpa', active: false },
  { id: 5, name: 'Copán', active: true },
  { id: 6, name: 'Olancho', active: true },
  { id: 7, name: 'Gracias a Dios', active: false },
  { id: 8, name: 'La Paz', active: true },
  { id: 9, name: 'Lempira', active: true },
])

const loadingIds = ref(new Set<number>())

// ── Modal create/edit ──
const showModal = ref(false)
const editingCity = ref<Ciudad | null>(null)

function openCreateModal() {
  editingCity.value = null
  showModal.value = true
}

function openEditModal(city: Ciudad) {
  editingCity.value = city
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCity.value = null
}

function onSaved(data: { name: string }) {
  if (editingCity.value) {
    editingCity.value.name = data.name
  } else {
    ciudades.value.push({ id: Date.now(), name: data.name, active: true })
  }
  closeModal()
}

// ── Delete confirmation ──
const showDeleteConfirm = ref(false)
const deletingCity = ref<Ciudad | null>(null)

function openDeleteConfirm(city: Ciudad) {
  deletingCity.value = city
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
  deletingCity.value = null
}

function confirmDelete() {
  if (!deletingCity.value) return
  ciudades.value = ciudades.value.filter((c) => c.id !== deletingCity.value!.id)
  closeDeleteConfirm()
}

// ── Toggle active ──
async function toggleActive(city: Ciudad) {
  loadingIds.value.add(city.id)
  const previous = city.active
  city.active = !city.active
  try {
    // TODO: PATCH /api/ciudades/:id { active: city.active }
    await new Promise((r) => setTimeout(r, 600))
  } catch {
    city.active = previous
  } finally {
    loadingIds.value.delete(city.id)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <h1 class="page-title">Ciudades</h1>
      <button class="btn btn-primary" @click="openCreateModal">+ Nueva ciudad</button>
    </div>

    <div class="page-body">
      <div class="card">
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ciudad in ciudades" :key="ciudad.id">
              <td class="id-cell">{{ ciudad.id }}</td>
              <td>
                <strong>{{ ciudad.name }}</strong>
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
            <tr v-if="ciudades.length === 0">
              <td colspan="4" class="empty-state">No hay ciudades registradas.</td>
            </tr>
          </tbody>
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
            <CiudadForm
              :key="editingCity?.id ?? 'new'"
              :initial-data="editingCity ? { name: editingCity.name } : undefined"
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
              <strong>{{ deletingCity?.name }}</strong
              >? Esta acción no se puede deshacer.
            </p>
            <div class="confirm-actions">
              <button class="btn btn-danger" @click="confirmDelete">Sí, eliminar</button>
              <button class="btn btn-ghost" @click="closeDeleteConfirm">Cancelar</button>
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
  color: #1e783c;
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
</style>
