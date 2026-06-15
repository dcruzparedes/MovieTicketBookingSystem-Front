<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

interface Cinema {
  id: number
  nombre: string
  ciudad: string
  direccion: string
  salasCount: number
}

const router = useRouter()

const cinemas = ref<Cinema[]>([
  {
    id: 1,
    nombre: 'Cine Vicenta',
    ciudad: 'Puerto Cortés',
    direccion: 'Barrio El Centro',
    salasCount: 4,
  },
  {
    id: 2,
    nombre: 'Cinemark City SPS',
    ciudad: 'San Pedro Sula',
    direccion: 'City Center Mall',
    salasCount: 6,
  },
  {
    id: 3,
    nombre: 'Metrocinemas',
    ciudad: 'Tegucigalpa',
    direccion: 'Multiplaza',
    salasCount: 5,
  },
])

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
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <h1 class="page-title">Cines</h1>
      <button class="btn btn-primary" @click="goToNewCinema">+ Nuevo cine</button>
    </div>

    <div class="page-body">
      <div class="card">
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
          <tbody>
            <tr v-for="cinema in cinemas" :key="cinema.id">
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
                </div>
              </td>
            </tr>
            <tr v-if="cinemas.length === 0">
              <td colspan="5" class="empty-state">No hay cines registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
</style>
