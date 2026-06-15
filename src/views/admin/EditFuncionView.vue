<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import FuncionForm from '@/components/admin/FuncionForm.vue'

const route = useRoute()
const router = useRouter()

// Mock hasta conectar con API
const funciones = [
  {
    id: 1,
    peliculaId: '1',
    cinemaId: '1',
    salaId: '3',
    fecha: '2024-11-15',
    hora: '19:30',
    precio: '65.00',
  },
  {
    id: 2,
    peliculaId: '2',
    cinemaId: '1',
    salaId: '1',
    fecha: '2024-11-15',
    hora: '17:00',
    precio: '45.00',
  },
  {
    id: 3,
    peliculaId: '3',
    cinemaId: '2',
    salaId: '5',
    fecha: '2024-11-16',
    hora: '20:00',
    precio: '75.00',
  },
  {
    id: 4,
    peliculaId: '4',
    cinemaId: '3',
    salaId: '7',
    fecha: '2024-11-14',
    hora: '18:30',
    precio: '45.00',
  },
  {
    id: 5,
    peliculaId: '2',
    cinemaId: '4',
    salaId: '8',
    fecha: '2024-11-17',
    hora: '16:00',
    precio: '40.00',
  },
]

const funcionId = computed(() => Number(route.params.id))
const funcion = computed(() => funciones.find((f) => f.id === funcionId.value) ?? null)

function onSaved(data: unknown) {
  // TODO: PUT /api/funciones/:id con data
  console.log('PUT /api/funciones/' + funcionId.value, data)
  router.push('/admin/funciones')
}

function goBack() {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <div class="page-header">
      <button class="back-btn" @click="goBack">Volver</button>
      <h1 class="page-title">Editar función</h1>
    </div>

    <div class="page-body">
      <!-- Función no encontrada -->
      <div v-if="!funcion" class="not-found">
        <p class="not-found-text">No se encontró la función con ID {{ funcionId }}.</p>
        <button class="btn btn-ghost" @click="goBack">Volver al listado</button>
      </div>

      <!-- Formulario precargado -->
      <div v-else class="card">
        <FuncionForm
          :initial-data="{
            peliculaId: funcion.peliculaId,
            cinemaId: funcion.cinemaId,
            salaId: funcion.salaId,
            fecha: funcion.fecha,
            hora: funcion.hora,
            precio: funcion.precio,
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
