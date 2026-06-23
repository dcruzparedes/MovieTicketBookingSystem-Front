<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import UserForm from '@/components/admin/UserForm.vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

interface Customer {
  id: number
  nombre: string
  email: string
  estado: 'Activo' | 'Inactivo'
  created_at: string
  reservas_count: number
  telefono?: string
}

const customers = ref<Customer[]>([
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan@correo.com',
    estado: 'Activo',
    created_at: '2026-01-15',
    reservas_count: 3,
    telefono: '+504 9976 1234',
  },
  {
    id: 2,
    nombre: 'María López',
    email: 'maria@correo.com',
    estado: 'Activo',
    created_at: '2026-02-08',
    reservas_count: 1,
    telefono: '+504 9812 5678',
  },
  {
    id: 3,
    nombre: 'Carlos Mejía',
    email: 'carlos@correo.com',
    estado: 'Activo',
    created_at: '2026-03-22',
    reservas_count: 5,
    telefono: '+504 9543 9012',
  },
  {
    id: 4,
    nombre: 'Ana García',
    email: 'ana@correo.com',
    estado: 'Inactivo',
    created_at: '2025-11-30',
    reservas_count: 0,
    telefono: '+504 9999 0000',
  },
  {
    id: 5,
    nombre: 'Luis Rodríguez',
    email: 'luis@correo.com',
    estado: 'Activo',
    created_at: '2026-04-10',
    reservas_count: 2,
    telefono: '+504 9888 7777',
  },
  {
    id: 6,
    nombre: 'Elena Martínez',
    email: 'elena@correo.com',
    estado: 'Activo',
    created_at: '2026-01-20',
    reservas_count: 4,
  },
  {
    id: 7,
    nombre: 'Roberto Sosa',
    email: 'roberto@correo.com',
    estado: 'Activo',
    created_at: '2026-02-15',
    reservas_count: 0,
  },
  {
    id: 8,
    nombre: 'Lucía Méndez',
    email: 'lucia@correo.com',
    estado: 'Inactivo',
    created_at: '2026-03-05',
    reservas_count: 1,
  },
  {
    id: 9,
    nombre: 'Fernando Ruiz',
    email: 'fernando@correo.com',
    estado: 'Activo',
    created_at: '2026-01-10',
    reservas_count: 6,
  },
  {
    id: 10,
    nombre: 'Gabriela Paz',
    email: 'gabriela@correo.com',
    estado: 'Activo',
    created_at: '2026-04-02',
    reservas_count: 3,
  },
  {
    id: 11,
    nombre: 'Miguel Ángel',
    email: 'miguel@correo.com',
    estado: 'Activo',
    created_at: '2026-02-28',
    reservas_count: 2,
  },
  {
    id: 12,
    nombre: 'Sofía Castro',
    email: 'sofia@correo.com',
    estado: 'Activo',
    created_at: '2026-03-12',
    reservas_count: 0,
  },
  {
    id: 13,
    nombre: 'Daniela Toro',
    email: 'daniela@correo.com',
    estado: 'Inactivo',
    created_at: '2026-01-05',
    reservas_count: 0,
  },
  {
    id: 14,
    nombre: 'Jorge Blanco',
    email: 'jorge@correo.com',
    estado: 'Activo',
    created_at: '2026-04-15',
    reservas_count: 7,
  },
  {
    id: 15,
    nombre: 'Isabel Díaz',
    email: 'isabel@correo.com',
    estado: 'Activo',
    created_at: '2026-02-10',
    reservas_count: 1,
  },
  {
    id: 16,
    nombre: 'Andrés Cruz',
    email: 'andres@correo.com',
    estado: 'Activo',
    created_at: '2026-03-30',
    reservas_count: 2,
  },
  {
    id: 17,
    nombre: 'Paola Ortiz',
    email: 'paola@correo.com',
    estado: 'Inactivo',
    created_at: '2026-01-25',
    reservas_count: 0,
  },
  {
    id: 18,
    nombre: 'Ricardo Luna',
    email: 'ricardo@correo.com',
    estado: 'Activo',
    created_at: '2026-02-20',
    reservas_count: 4,
  },
  {
    id: 19,
    nombre: 'Valeria Sol',
    email: 'valeria@correo.com',
    estado: 'Activo',
    created_at: '2026-03-18',
    reservas_count: 1,
  },
  {
    id: 20,
    nombre: 'Hugo Flores',
    email: 'hugo@correo.com',
    estado: 'Activo',
    created_at: '2026-04-05',
    reservas_count: 3,
  },
])

const loadingIds = ref(new Set<number>())

const showModal = ref(false)
const searchQuery = ref('')
const statusFilter = ref('Todos')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredCustomers = computed(() => {
  return customers.value.filter((c) => {
    const matchesSearch =
      c.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'Todos' || c.estado === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage))

const pagedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCustomers.value.slice(start, end)
})

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

function onUserSaved(data: any) {
  const newUser: Customer = {
    id: customers.value.length + 1,
    nombre: data.nombre,
    email: data.email,
    estado: 'Activo',
    created_at: new Date().toISOString().split('T')[0],
    reservas_count: 0,
    telefono: data.telefono,
  }
  customers.value.push(newUser)
  closeModal()
}

async function toggleActive(customer: Customer) {
  loadingIds.value.add(customer.id)
  const previous = customer.estado
  customer.estado = customer.estado === 'Activo' ? 'Inactivo' : 'Activo' // optimistic update
  try {
    // TODO: PATCH /api/clientes/:id { estado: customer.estado }
    await new Promise((r) => setTimeout(r, 600))
  } catch {
    customer.estado = previous // rollback on error
  } finally {
    loadingIds.value.delete(customer.id)
  }
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <h1 class="page-title">Clientes</h1>
      <button class="btn btn-primary" @click="openModal">+ Nuevo usuario</button>
    </div>

    <div class="page-body">
      <!-- Filtros -->
      <div class="card filter-card">
        <div class="filter-row">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o correo…"
            class="filter-input"
            @input="currentPage = 1"
          />
          <select v-model="statusFilter" class="filter-select" @change="currentPage = 1">
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <!-- Tabla -->
      <div class="card table-card">
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
          <tbody>
            <tr v-for="customer in pagedCustomers" :key="customer.id">
              <td>
                <strong>{{ customer.nombre }}</strong>
              </td>
              <td>{{ customer.email }}</td>
              <td>
                <div class="status-cell">
                  <ToggleSwitch
                    :model-value="customer.estado === 'Activo'"
                    :loading="loadingIds.has(customer.id)"
                    @update:model-value="toggleActive(customer)"
                  />
                  <span class="status-label" :class="customer.estado === 'Activo' ? 'active' : 'inactive'">
                    {{ customer.estado }}
                  </span>
                </div>
              </td>
              <td>{{ customer.created_at }}</td>
              <td>{{ customer.reservas_count }}</td>
            </tr>
            <tr v-if="pagedCustomers.length === 0">
              <td colspan="5" class="empty-state">No se encontraron clientes</td>
            </tr>
          </tbody>
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
  color: #1e783c;
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
</style>
