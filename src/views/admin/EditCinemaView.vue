<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import CinemaForm from '@/components/admin/CinemaForm.vue'
import { getCines, updateCine, getCineFunciones } from '@/services/cinemaService'
import type { Cine } from '@/services/cinemaService'

const route = useRoute()
const router = useRouter()

const cinemaId = computed(() => Number(route.params.id))

type LoadStatus = 'loading' | 'loaded' | 'not-found' | 'error'

const status = ref<LoadStatus>('loading')
const loadError = ref('')
const cinema = ref<Cine | null>(null)
const hasActiveFunciones = ref(false)

const isSaving = ref(false)
const saveError = ref('')
const saved = ref(false)

onMounted(async () => {
  try {
    const [cines, funciones] = await Promise.all([
      getCines(),
      getCineFunciones(cinemaId.value).catch(() => []),
    ])

    const found = cines.find((c) => Number(c.id) === cinemaId.value) ?? null
    if (!found) {
      status.value = 'not-found'
      return
    }

    cinema.value = found
    hasActiveFunciones.value = funciones.length > 0
    status.value = 'loaded'
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Error al cargar el cine'
    status.value = 'error'
  }
})

const initialData = computed(() => {
  if (!cinema.value) return undefined
  return {
    cityId: String(cinema.value.id_ciudad),
    name: cinema.value.nombre,
    address: cinema.value.direccion ?? '',
    phone: '',
    email: '',
  }
})

async function onSaved(data: {
  cityId: string
  name: string
  address: string
  phone: string
  email: string
}) {
  isSaving.value = true
  saveError.value = ''

  try {
    await updateCine(cinemaId.value, {
      nombre: data.name,
      id_ciudad: Number(data.cityId),
      direccion: data.address,
    })

    saved.value = true
    setTimeout(() => router.push('/admin/cines'), 1500)
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status === 404) {
      saveError.value = 'El cine ya no existe. Por favor vuelve a la lista.'
    } else {
      saveError.value = err instanceof Error ? err.message : 'Error al guardar el cine'
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
      <h1 class="page-title">Editar cine</h1>
    </div>

    <div class="page-body">
      <!-- Cargando -->
      <div v-if="status === 'loading'" class="state-box animado" style="--delay: 80ms">
        <div class="skeleton-row" />
        <div class="skeleton-row short" />
        <div class="skeleton-row" />
      </div>

      <!-- Error de carga -->
      <div v-else-if="status === 'error'" class="state-box animado" style="--delay: 80ms">
        <p class="state-text error-text">{{ loadError }}</p>
        <button class="btn btn-ghost" @click="goBack">Volver a la lista</button>
      </div>

      <!-- Cine no encontrado -->
      <div v-else-if="status === 'not-found'" class="state-box animado" style="--delay: 80ms">
        <p class="state-text">No se encontró el cine con ID {{ cinemaId }}.</p>
        <button class="btn btn-ghost" @click="goBack">Volver a la lista</button>
      </div>

      <!-- Formulario precargado -->
      <template v-else-if="status === 'loaded'">
        <!-- Advertencia funciones activas -->
        <div v-if="hasActiveFunciones" class="warning-banner animado" style="--delay: 40ms">
          <span class="warning-icon">⚠</span>
          <span>Este cine tiene <strong>funciones activas</strong>. Modificar sus datos podría
            afectar las reservas existentes.</span>
        </div>

        <Transition name="fade">
          <div v-if="saved" class="success-banner animado" style="--delay: 0ms">
            Cine actualizado correctamente. Redirigiendo…
          </div>
        </Transition>

        <p v-if="saveError" class="save-error">{{ saveError }}</p>

        <div class="card animado" style="--delay: 80ms">
          <CinemaForm
            :initial-data="initialData"
            :loading="isSaving"
            @saved="onSaved"
            @cancel="goBack"
          />
        </div>
      </template>
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

/* Loading skeleton */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 40px 0;
}

.skeleton-row {
  height: 16px;
  width: 100%;
  max-width: 400px;
  border-radius: 6px;
  background: var(--border2);
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-row.short {
  max-width: 220px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.state-text {
  font-size: 14px;
  color: var(--text2);
}

.error-text {
  color: var(--sinopia);
}

/* Warning banner */
.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fcd34d;
  border-radius: var(--radius);
  padding: 12px 18px;
  font-size: 13px;
  margin-bottom: 14px;
  line-height: 1.5;
}

.warning-icon {
  flex-shrink: 0;
  font-size: 15px;
  margin-top: 1px;
}

/* Success banner */
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

/* Save error */
.save-error {
  font-size: 13px;
  color: var(--sinopia);
  margin-bottom: 12px;
}

/* Buttons */
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
