<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import SalaForm, { type SalaFields } from '@/components/admin/SalaForm.vue'
import { getSala, updateSala } from '@/services/salaService'
import { getCines } from '@/services/cinemaService'
import type { Sala } from '@/services/salaService'
import type { Cine } from '@/services/cinemaService'

const route = useRoute()
const router = useRouter()

const salaId = computed(() => Number(route.params.id))

type LoadStatus = 'loading' | 'loaded' | 'not-found' | 'error'

const status = ref<LoadStatus>('loading')
const loadError = ref('')
const sala = ref<Sala | null>(null)
const cinemas = ref<Cine[]>([])

const isSaving = ref(false)
const saveError = ref('')
const saved = ref(false)

onMounted(async () => {
  try {
    const [fetchedSala, fetchedCines] = await Promise.all([
      getSala(salaId.value),
      getCines(),
    ])

    sala.value = fetchedSala
    cinemas.value = fetchedCines
    status.value = 'loaded'
  } catch (err) {
    const httpStatus = (err as { status?: number }).status
    if (httpStatus === 404) {
      status.value = 'not-found'
    } else {
      loadError.value = err instanceof Error ? err.message : 'Error al cargar la sala'
      status.value = 'error'
    }
  }
})

const initialData = computed(() => {
  if (!sala.value) return undefined
  return {
    cinemaId: sala.value.id_cine,
    name: sala.value.nombre,
    rows: sala.value.filas,
    columns: sala.value.columnas,
  }
})

async function onSaved(data: SalaFields) {
  isSaving.value = true
  saveError.value = ''

  try {
    await updateSala(salaId.value, {
      nombre: data.name,
      id_cine: Number(data.cinemaId),
      filas: data.rows,
      columnas: data.columns,
    })

    saved.value = true
    setTimeout(() => router.push('/admin/salas'), 1500)
  } catch (err) {
    const httpStatus = (err as { status?: number }).status
    if (httpStatus === 404) {
      saveError.value = 'La sala ya no existe. Por favor vuelve a la lista.'
    } else {
      saveError.value = err instanceof Error ? err.message : 'Error al guardar la sala'
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
      <h1 class="page-title">Editar sala</h1>
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

      <!-- Sala no encontrada -->
      <div v-else-if="status === 'not-found'" class="state-box animado" style="--delay: 80ms">
        <p class="state-text">No se encontró la sala con ID {{ salaId }}.</p>
        <button class="btn btn-ghost" @click="goBack">Volver a la lista</button>
      </div>

      <!-- Formulario precargado -->
      <template v-else-if="status === 'loaded'">
        <!-- Advertencia: modificar sala puede afectar funciones -->
        <div class="warning-banner animado" style="--delay: 40ms">
          <span class="warning-icon">⚠</span>
          <span>Modificar las <strong>filas o columnas</strong> de esta sala puede dejar de
            coincidir con los asientos de funciones ya programadas.</span>
        </div>

        <Transition name="fade">
          <div v-if="saved" class="success-banner">
            Sala actualizada correctamente. Redirigiendo…
          </div>
        </Transition>

        <p v-if="saveError" class="save-error">{{ saveError }}</p>

        <div class="card animado" style="--delay: 80ms">
          <SalaForm
            :initial-data="initialData"
            :cinemas="cinemas"
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
