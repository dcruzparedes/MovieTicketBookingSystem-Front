<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CinemaForm from '@/components/admin/CinemaForm.vue'
import { createCine } from '@/services/cinemaService'
import { getCiudades, type Ciudad } from '@/services/ciudadService'

const router = useRouter()

const isSaving = ref(false)
const saveError = ref('')
const saved = ref(false)
const cities = ref<Ciudad[]>([])

onMounted(async () => {
  try {
    cities.value = await getCiudades()
  } catch {
    cities.value = []
  }
})

async function handleSaved(data: {
  cityId: string
  name: string
  address: string
  phone: string
  email: string
}) {
  isSaving.value = true
  saveError.value = ''

  try {
    await createCine({
      nombre: data.name,
      id_ciudad: Number(data.cityId),
      direccion: data.address,
    })

    saved.value = true
    setTimeout(() => router.push('/admin/cines'), 1500)
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status === 404) {
      saveError.value = 'La ciudad seleccionada no existe. Por favor selecciona otra.'
    } else {
      saveError.value = err instanceof Error ? err.message : 'Error al crear el cine'
    }
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <div class="page-header animado" style="--delay: 0ms">
      <button class="back-btn" @click="goBack">Volver</button>
      <h1 class="page-title">Nuevo cine</h1>
    </div>

    <div class="page-body">
      <Transition name="fade">
        <div v-if="saved" class="success-banner animado" style="--delay: 0ms">
          Cine creado correctamente. Redirigiendo…
        </div>
      </Transition>

      <p v-if="saveError" class="save-error">{{ saveError }}</p>

      <div class="card animado" style="--delay: 80ms">
        <CinemaForm :cities="cities" :loading="isSaving" @saved="handleSaved" @cancel="goBack" />
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

.save-error {
  font-size: 13px;
  color: var(--sinopia);
  margin-bottom: 12px;
}

.success-banner {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
  border-radius: var(--radius);
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
