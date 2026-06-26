<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import FuncionForm, { type FuncionFields } from '@/components/admin/FuncionForm.vue'
import { createFuncion } from '@/services/funcionService'
import { getPeliculas } from '@/services/movieService'
import { getCines } from '@/services/cinemaService'
import { getSalas } from '@/services/salaService'
import type { Cine } from '@/services/cinemaService'
import type { Sala } from '@/services/salaService'

const router = useRouter()

interface PeliculaItem {
  id: string
  titulo: string
  dur?: string | null
}

const peliculas = ref<PeliculaItem[]>([])
const cines = ref<Cine[]>([])
const salas = ref<Sala[]>([])
const loadError = ref('')

const isSaving = ref(false)
const saveError = ref('')
const saved = ref(false)

onMounted(async () => {
  try {
    const [rawPeliculas, rawCines, rawSalas] = await Promise.all([
      getPeliculas() as Promise<PeliculaItem[]>,
      getCines(),
      getSalas(),
    ])
    peliculas.value = rawPeliculas
    cines.value = rawCines
    salas.value = rawSalas
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Error al cargar los datos del formulario'
  }
})

async function handleSaved(data: FuncionFields) {
  isSaving.value = true
  saveError.value = ''

  try {
    await createFuncion({
      id_pelicula: Number(data.peliculaId),
      id_sala: Number(data.salaId),
      fecha_hora: `${data.fecha}T${data.hora}:00`,
      estado: 'activa',
    })

    saved.value = true
    setTimeout(() => router.push('/admin/funciones'), 1500)
  } catch (err) {
    const status = (err as { status?: number }).status
    const message = err instanceof Error ? err.message : ''

    if (status === 409) {
      saveError.value = 'Ya existe una función en esa sala en ese horario. Por favor elige otro horario.'
    } else if (status === 400) {
      saveError.value = message || 'No se puede crear una función para una película inactiva.'
    } else if (status === 404) {
      saveError.value = message || 'La película o sala seleccionada no existe.'
    } else {
      saveError.value = message || 'Error al crear la función'
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
      <h1 class="page-title">Nueva función</h1>
    </div>

    <div class="page-body">
      <p v-if="loadError" class="load-error">{{ loadError }}</p>

      <Transition name="fade">
        <div v-if="saved" class="success-banner animado" style="--delay: 0ms">
          Función creada correctamente. Redirigiendo…
        </div>
      </Transition>

      <p v-if="saveError" class="save-error">{{ saveError }}</p>

      <div class="card animado" style="--delay: 80ms">
        <FuncionForm
          :peliculas="peliculas"
          :cines="cines"
          :salas="salas"
          :loading="isSaving"
          @saved="handleSaved"
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

.load-error {
  font-size: 13px;
  color: var(--sinopia);
  margin-bottom: 12px;
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
