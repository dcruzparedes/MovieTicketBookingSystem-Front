<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import FuncionForm, { type FuncionFields } from '@/components/admin/FuncionForm.vue'
import { getFuncion, updateFuncion } from '@/services/funcionService'
import { getPeliculas } from '@/services/movieService'
import { getCines } from '@/services/cinemaService'
import { getSalas } from '@/services/salaService'
import type { Cine } from '@/services/cinemaService'
import type { Sala } from '@/services/salaService'

const route = useRoute()
const router = useRouter()

const funcionId = computed(() => String(route.params.id))

// Load status
type LoadStatus = 'loading' | 'loaded' | 'not-found' | 'error'
const loadStatus = ref<LoadStatus>('loading')
const loadError = ref('')

// Dropdown data
interface PeliculaItem { id: string; titulo: string; dur?: string | null }
const peliculas = ref<PeliculaItem[]>([])
const cines = ref<Cine[]>([])
const salas = ref<Sala[]>([])

// Pre-populated form data
const initialData = ref<Partial<FuncionFields>>({})

onMounted(async () => {
  try {
    const [rawPeliculas, rawCines, rawSalas, funcion] = await Promise.all([
      getPeliculas() as Promise<PeliculaItem[]>,
      getCines(),
      getSalas(),
      getFuncion(funcionId.value),
    ])

    peliculas.value = rawPeliculas
    cines.value = rawCines
    salas.value = rawSalas

    if (!funcion) {
      loadStatus.value = 'not-found'
      return
    }

    // Resolve cinemaId from the salas list (funcion only stores id_sala)
    const sala = rawSalas.find((s) => s.id === funcion.id_sala)
    const cinemaId = sala?.id_cine ?? ''

    initialData.value = {
      peliculaId: funcion.id_pelicula,
      cinemaId,
      salaId: funcion.id_sala,
      fecha: funcion.fecha,
      hora: funcion.hora,
      precio: '',
    }

    loadStatus.value = 'loaded'
  } catch (err) {
    loadStatus.value = 'error'
    loadError.value = err instanceof Error ? err.message : 'Error al cargar los datos'
  }
})

// Save
const isSaving = ref(false)
const saveError = ref('')
const saved = ref(false)

async function handleSaved(data: FuncionFields) {
  isSaving.value = true
  saveError.value = ''

  try {
    await updateFuncion(funcionId.value, {
      id_pelicula: Number(data.peliculaId),
      id_sala: Number(data.salaId),
      fecha_hora: `${data.fecha}T${data.hora}:00`,
    })

    saved.value = true
    setTimeout(() => router.push('/admin/funciones'), 1500)
  } catch (err) {
    const status = (err as { status?: number }).status
    const message = err instanceof Error ? err.message : ''

    if (status === 409) {
      saveError.value = 'Ya existe una función en esa sala en ese horario. Por favor elige otro horario.'
    } else if (status === 404) {
      saveError.value = message || 'La función, película o sala seleccionada no existe.'
    } else if (status === 400) {
      saveError.value = message || 'No se puede asignar una película inactiva a esta función.'
    } else {
      saveError.value = message || 'Error al guardar los cambios'
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
      <h1 class="page-title">Editar función</h1>
    </div>

    <div class="page-body">
      <!-- Cargando -->
      <div v-if="loadStatus === 'loading'" class="state-box animado" style="--delay: 80ms">
        <div class="skeleton-row" />
        <div class="skeleton-row short" />
        <div class="skeleton-row" />
      </div>

      <!-- Error de carga -->
      <div v-else-if="loadStatus === 'error'" class="state-box animado" style="--delay: 80ms">
        <p class="state-text error-text">{{ loadError }}</p>
        <button class="btn btn-ghost" @click="goBack">Volver al listado</button>
      </div>

      <!-- No encontrada -->
      <div v-else-if="loadStatus === 'not-found'" class="state-box animado" style="--delay: 80ms">
        <p class="state-text">No se encontró la función con ID {{ funcionId }}.</p>
        <button class="btn btn-ghost" @click="goBack">Volver al listado</button>
      </div>

      <!-- Formulario -->
      <template v-else>
        <Transition name="fade">
          <div v-if="saved" class="success-banner animado" style="--delay: 0ms">
            Función actualizada correctamente. Redirigiendo…
          </div>
        </Transition>

        <p v-if="saveError" class="save-error">{{ saveError }}</p>

        <div class="card animado" style="--delay: 80ms">
          <FuncionForm
            :key="funcionId"
            :initial-data="initialData"
            :peliculas="peliculas"
            :cines="cines"
            :salas="salas"
            :loading="isSaving"
            @saved="handleSaved"
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

.save-error {
  font-size: 13px;
  color: var(--sinopia);
  margin-bottom: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
