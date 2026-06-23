<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CinemaForm from '@/components/admin/CinemaForm.vue'

const route = useRoute()
const router = useRouter()

// Mock hasta conectar con API
const cinemas = [
  {
    id: 1,
    cityId: '1',
    name: 'Cine Vicenta Zona 10',
    address: '5a Av. 12-34, Zona 10',
    phone: '2222-3333',
    email: 'zona10@cinevicenta.com',
  },
  {
    id: 2,
    cityId: '1',
    name: 'Cine Vicenta Miraflores',
    address: 'Blvd. Miraflores 4-12, Zona 11',
    phone: '2333-4444',
    email: 'miraflores@cinevicenta.com',
  },
  {
    id: 3,
    cityId: '2',
    name: 'Cine Vicenta Pradera',
    address: '1a Calle 15-05, Zona 3',
    phone: '7777-8888',
    email: 'pradera@cinevicenta.com',
  },
  {
    id: 4,
    cityId: '3',
    name: 'Cine Vicenta Antigua',
    address: '4a Calle Oriente 2',
    phone: '7832-1234',
    email: 'antigua@cinevicenta.com',
  },
]

const cinemaId = computed(() => Number(route.params.id))
const cinema = computed(() => cinemas.find((c) => c.id === cinemaId.value) ?? null)

function onSaved(data: unknown) {
  // TODO: PUT /api/cines/:id con data
  console.log('PUT /api/cines/' + cinemaId.value, data)
  router.push('/admin/cines')
}

function goBack() {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <button class="back-btn" @click="goBack">Volver</button>
      <h1 class="page-title">Editar cine</h1>
    </div>

    <div class="page-body">
      <!-- Cine no encontrado -->
      <div v-if="!cinema" class="not-found animado" style="--delay: 80ms">
        <p class="not-found-text">No se encontró el cine con ID {{ cinemaId }}.</p>
        <button class="btn btn-ghost" @click="goBack">Volver a la lista</button>
      </div>

      <!-- Formulario precargado -->
      <div v-else class="card animado" style="--delay: 80ms">
        <CinemaForm
          :initial-data="{
            cityId: cinema.cityId,
            name: cinema.name,
            address: cinema.address,
            phone: cinema.phone,
            email: cinema.email,
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
</style>
