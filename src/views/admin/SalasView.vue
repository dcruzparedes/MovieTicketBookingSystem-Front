<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

interface Sala {
  id: number
  nombre: string
  cineNombre: string
  id_cine: number
  filas: number
  columnas: number
}

const router = useRouter()
const route = useRoute()

// Mock data
const salas = ref<Sala[]>([
  { id: 1, nombre: 'Sala 1', cineNombre: 'Cine Vicenta', id_cine: 1, filas: 8, columnas: 12 },
  { id: 2, nombre: 'Sala 2', cineNombre: 'Cine Vicenta', id_cine: 1, filas: 6, columnas: 10 },
  { id: 3, nombre: 'Sala 4 (VIP)', cineNombre: 'Cine Vicenta', id_cine: 1, filas: 8, columnas: 10 },
  { id: 4, nombre: 'IMAX', cineNombre: 'Cinemark City SPS', id_cine: 2, filas: 12, columnas: 18 },
  { id: 5, nombre: 'Sala 1', cineNombre: 'Cinemark City SPS', id_cine: 2, filas: 10, columnas: 15 },
  { id: 6, nombre: 'Premium', cineNombre: 'Metrocinemas', id_cine: 3, filas: 6, columnas: 8 },
])

// Filtro por cine si viene en la query
const filteredSalas = computed(() => {
  const cineId = route.query.cineId
  if (!cineId) return salas.value
  return salas.value.filter(s => s.id_cine === Number(cineId))
})

const selectedCineName = computed(() => {
  const cineId = route.query.cineId
  if (!cineId) return ''
  const sala = salas.value.find(s => s.id_cine === Number(cineId))
  return sala ? sala.cineNombre : ''
})

function goToNewSala() {
  router.push('/admin/salas/nueva')
}

function editSala(id: number) {
  // TODO: Implement EditSalaView
  console.log('Editar sala:', id)
}

function clearFilter() {
  router.push('/admin/salas')
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
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
      <div class="card">
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
          <tbody>
            <tr v-for="sala in filteredSalas" :key="sala.id">
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
                </div>
              </td>
            </tr>
            <tr v-if="filteredSalas.length === 0">
              <td colspan="6" class="empty-state">No hay salas registradas para este criterio.</td>
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
</style>
