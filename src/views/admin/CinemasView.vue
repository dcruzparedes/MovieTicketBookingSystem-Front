<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { api } from '@/services/api'

interface Cinema {
  id: number
  nombre: string
  ciudad: string
  direccion: string
  salasCount: number
}

// Interface to match API response
interface ApiCinema {
  id: string
  nombre: string
  direccion: string
  id_ciudad: string
  _count?: {
    salas: number
  }
}

interface ApiCity {
  id: string
  nombre: string
}

const router = useRouter()
const cinemas = ref<Cinema[]>([])

async function fetchCinemas() {
  try {
    const apiCinemas = await api.get<ApiCinema[]>('/cines')
    // We need cities to display city name instead of ID
    const apiCities = await api.get<ApiCity[]>('/ciudades')

    cinemas.value = apiCinemas.map((c) => {
      const city = apiCities.find((ct) => ct.id === c.id_ciudad)
      return {
        id: Number(c.id),
        nombre: c.nombre,
        ciudad: city ? city.nombre : 'Desconocida',
        direccion: c.direccion || '',
        salasCount: c._count?.salas ?? 0,
      }
    })
  } catch (error) {
    console.error('Error al cargar cines:', error)
    alert('Error al cargar los cines')
  }
}

onMounted(fetchCinemas)

function goToNewCinema() {
  router.push('/admin/cines/nuevo')
}

function editCinema(id: number) {
  router.push(`/admin/cines/${id}/editar`)
}

function viewSalas(id: number) {
  // TODO: Navigate to salas view filtered by cinema
  router.push({ path: '/admin/salas', query: { cineId: id.toString() } })
}

// ── Confirmación de eliminación ──
const showDeleteConfirm = ref(false)
const deletingCinema = ref<Cinema | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')

function openDeleteConfirm(cinema: Cinema) {
  deletingCinema.value = cinema
  deleteError.value = ''
  showDeleteConfirm.value = true
}

function closeDeleteConfirm() {
  if (isDeleting.value) return
  showDeleteConfirm.value = false
  deletingCinema.value = null
  deleteError.value = ''
}

async function confirmDelete() {
  if (!deletingCinema.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    await api.delete(`/cines/${deletingCinema.value.id}`)
    cinemas.value = cinemas.value.filter((c) => c.id !== deletingCinema.value!.id)
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'Error al eliminar el cine'
  } finally {
    isDeleting.value = false
    closeDeleteConfirm()
  }
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Cines</h1>
      <button class="btn btn-primary" @click="goToNewCinema">+ Nuevo cine</button>
    </div>

    <div class="page-body">
      <div class="card animado" style="--delay: 80ms">
        <table class="tbl">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Dirección</th>
              <th>Salas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr
              v-for="(cinema, index) in cinemas"
              :key="cinema.id"
              :style="{ '--row-delay': `${index * 40}ms` }"
            >
              <td>
                <strong>{{ cinema.nombre }}</strong>
              </td>
              <td>{{ cinema.ciudad }}</td>
              <td>{{ cinema.direccion }}</td>
              <td>
                <span class="badge-salas">{{ cinema.salasCount }} salas</span>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn btn-ghost btn-sm" @click="editCinema(cinema.id)">
                    Editar
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="viewSalas(cinema.id)">Salas</button>
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openDeleteConfirm(cinema)"
                    style="color: var(--danger, #e74c3c)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="cinemas.length === 0" key="empty">
              <td colspan="5" class="empty-state">No hay cines registrados.</td>
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
          <div class="modal-title">Eliminar cine</div>
          <button class="close-btn" @click="closeDeleteConfirm">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px;color:var(--text2);line-height:1.55;margin-bottom:16px">
            ¿Estás seguro de que deseas eliminar el cine <strong>{{ deletingCinema?.nombre }}</strong>? Esta acción no se puede deshacer.
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

.tbl th:last-child,
.tbl td:last-child {
  text-align: right;
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

.badge-salas {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(243, 113, 0, 0.08);
  color: var(--orange);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.action-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
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
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
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
