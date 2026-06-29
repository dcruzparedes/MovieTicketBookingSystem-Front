<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import UserForm from '@/components/admin/UserForm.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import { listarClientes, cambiarEstadoCliente, type ClienteAdmin } from '@/services/usuarioService'
import { isApiError } from '@/services/api'

type Customer = ClienteAdmin

const customers = ref<Customer[]>([])
const loading = ref(false)
const loadError = ref('')
const loadingIds = ref(new Set<string>())

const showModal = ref(false)
const searchQuery = ref('')
const statusFilter = ref('Todos')
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = ref(1)

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function fetchClientes() {
  loading.value = true
  loadError.value = ''
  try {
    const estadoBackend = statusFilter.value === 'Activo' ? 'activo' : statusFilter.value === 'Inactivo' ? 'inactivo' : undefined
    const res = await listarClientes({
      q: searchQuery.value.trim() || undefined,
      estado: estadoBackend,
      page: currentPage.value,
      limit: itemsPerPage,
    })
    customers.value = res.data
    totalPages.value = res.meta.totalPages
  } catch (err) {
    loadError.value = isApiError(err) ? err.message : 'No se pudieron cargar los clientes.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchClientes)

watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  fetchClientes()
})

watch(currentPage, fetchClientes)

function setPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function onUserSaved() {
  closeModal()
  fetchClientes()
}

async function toggleActive(customer: Customer) {
  loadingIds.value.add(customer.id)
  const previous = customer.estado
  const nuevo = customer.estado === 'activo' ? 'inactivo' : 'activo'
  customer.estado = nuevo // optimistic update
  try {
    await cambiarEstadoCliente(Number(customer.id), nuevo)
  } catch {
    customer.estado = previous // rollback on error
  } finally {
    loadingIds.value.delete(customer.id)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <h1 class="page-title">Clientes</h1>
      <button class="btn btn-primary" @click="openModal">+ Nuevo usuario</button>
    </div>

    <div class="page-body">
      <!-- Filtros -->
      <div class="card filter-card animado" style="--delay: 60ms">
        <div class="filter-row">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o correo…"
            class="filter-input"
          />
          <select v-model="statusFilter" class="filter-select">
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div class="card table-card animado" style="--delay: 120ms">
        <table class="tbl">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Reservas</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="rows" appear>
            <tr v-for="(customer, index) in customers" :key="customer.id" :style="{ '--row-delay': `${index * 40}ms` }">
              <td>
                <strong>{{ customer.nombre }}</strong>
              </td>
              <td>{{ customer.email }}</td>
              <td>
                <div class="status-cell">
                  <ToggleSwitch
                    :model-value="customer.estado === 'activo'"
                    :loading="loadingIds.has(customer.id)"
                    @update:model-value="toggleActive(customer)"
                  />
                  <span class="status-label" :class="customer.estado === 'activo' ? 'active' : 'inactive'">
                    {{ customer.estado === 'activo' ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </td>
              <td>{{ formatFecha(customer.created_at) }}</td>
              <td>{{ customer.reservas_count }}</td>
            </tr>
            <tr v-if="!loading && !loadError && customers.length === 0" key="empty">
              <td colspan="5" class="empty-state">No se encontraron clientes</td>
            </tr>
            <tr v-if="loading" key="loading">
              <td colspan="5" class="empty-state">Cargando clientes…</td>
            </tr>
            <tr v-if="loadError" key="error">
              <td colspan="5" class="empty-state" style="color: var(--sinopia)">{{ loadError }}</td>
            </tr>
          </TransitionGroup>
        </table>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
            ‹
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="setPage(page)"
          >
            {{ page }}
          </button>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="setPage(currentPage + 1)"
          >
            ›
          </button>
        </div>
      </div>
    </div>

    <!-- Modal nuevo usuario -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2 class="modal-title">Nuevo usuario</h2>
          <button class="close-btn" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <UserForm @saved="onUserSaved" @cancel="closeModal" />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.page-header {
  padding: 24px 28px 0;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-family: 'DM Serif Display', serif;
  font-size: 26px;
  color: var(--text);
  font-weight: 400;
}

.btn-primary {
  background: var(--sinopia);
  color: #fff;
  border: none;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 14px;
}

.page-body {
  padding: 0 28px 28px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.filter-card {
  padding: 16px 20px;
  margin-bottom: 14px;
}

.filter-row {
  display: flex;
  gap: 10px;
}

.filter-input {
  flex: 1;
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 9px 13px;
  border-radius: var(--radius);
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  outline: none;
}

.filter-input:focus {
  border-color: var(--tangelo);
}

.filter-select {
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--text2);
  padding: 9px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  outline: none;
}

.filter-select:focus {
  border-color: var(--tangelo);
}

.table-card {
  overflow: hidden;
  padding-bottom: 12px;
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
  padding: 40px !important;
  color: var(--text3);
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

/* Pagination */
.pagination {
  display: flex;
  gap: 5px;
  margin-top: 16px;
  padding: 0 14px;
  align-items: center;
}

.page-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text2);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
}

.page-btn:hover:not(.active) {
  background: var(--bg);
}

.page-btn.active {
  background: var(--sinopia);
  color: #fff;
  border-color: var(--sinopia);
  font-weight: 700;
}
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(42, 10, 6, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 12px; width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); }
.modal-title { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--text); font-weight: 400; }
.close-btn { background: none; border: none; cursor: pointer; color: var(--text3); font-size: 20px; }
.modal-body { padding: 24px; }

/* ── Animaciones ── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
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
.rows-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rows-leave-to { opacity: 0; transform: scale(0.97); }
.rows-move { transition: transform 0.3s ease; }
</style>
