<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import SalaForm from '@/components/admin/SalaForm.vue'

const route = useRoute()
const router = useRouter()

// Mock hasta conectar con API
const salas = [
  { id: 1, cinemaId: '1', name: 'Sala 1', rows: 8, columns: 10 },
  { id: 2, cinemaId: '1', name: 'Sala 2', rows: 10, columns: 12 },
  { id: 3, cinemaId: '1', name: 'Sala VIP', rows: 6, columns: 8 },
  { id: 4, cinemaId: '2', name: 'Sala 1', rows: 8, columns: 10 },
  { id: 5, cinemaId: '2', name: 'Sala IMAX', rows: 12, columns: 15 },
  { id: 6, cinemaId: '3', name: 'Sala 1', rows: 8, columns: 10 },
  { id: 7, cinemaId: '4', name: 'Sala 1', rows: 6, columns: 8 },
]

const salaId = computed(() => Number(route.params.id))
const sala = computed(() => salas.find((s) => s.id === salaId.value) ?? null)

function onSaved(data: unknown) {
  // TODO: PUT /api/salas/:id con data
  console.log('PUT /api/salas/' + salaId.value, data)
  router.push('/admin/salas')
}

function goBack() {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <button class="back-btn" @click="goBack">Volver</button>
      <h1 class="page-title">Editar sala</h1>
    </div>

    <div class="page-body">
      <!-- Sala no encontrada -->
      <div v-if="!sala" class="not-found">
        <p class="not-found-text">No se encontró la sala con ID {{ salaId }}.</p>
        <button class="btn btn-ghost" @click="goBack">Volver a la lista</button>
      </div>

      <!-- Formulario precargado -->
      <div v-else class="card">
        <SalaForm
          :initial-data="{
            cinemaId: sala.cinemaId,
            name: sala.name,
            rows: sala.rows,
            columns: sala.columns,
          }"
          @saved="onSaved"
          @cancel="goBack"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.page-header {
  padding: 24px 28px 0;
  margin-bottom: 20px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--text3);
  font-size: 13px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  padding: 8px 0;
  margin-bottom: 8px;
  transition: color 0.2s;
}

.back-btn::before {
  content: '←';
}

.back-btn:hover {
  color: var(--text2);
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
  padding: 24px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 40px 0;
}

.not-found-text {
  font-size: 14px;
  color: var(--text2);
}

.btn {
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  border-radius: var(--radius);
  font-weight: 600;
  padding: 10px 20px;
  font-size: 13px;
  transition: opacity 0.2s;
}

.btn-ghost {
  background: transparent;
  color: var(--text2);
  border: 1px solid var(--border2);
}

.btn-ghost:hover {
  background: var(--bg);
}
</style>
