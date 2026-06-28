<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import PosterUpload from '@/components/PosterUpload.vue'
import { uploadPosterPelicula } from '@/services/storageService'
import {
  fetchGeneros,
  fetchIdiomas,
  createPelicula,
  getCurrentUserId,
  type Genero,
  type Idioma,
} from '@/services/movieService'

const router = useRouter()

interface MovieForm {
  title: string
  genre: number | ''
  language: number | ''
  releaseDate: string
  synopsis: string
}

interface FormErrors {
  title: string
  genre: string
  language: string
  releaseDate: string
  synopsis: string
}

const form = reactive<MovieForm>({
  title: '',
  genre: '',
  language: '',
  releaseDate: '',
  synopsis: '',
})

const errors = reactive<FormErrors>({
  title: '',
  genre: '',
  language: '',
  releaseDate: '',
  synopsis: '',
})

const posterFile = ref<File | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')
const loadError = ref('')
const createdMovieId = ref<number | null>(null)

const genres = ref<Genero[]>([])
const languages = ref<Idioma[]>([])

onMounted(async () => {
  try {
    const [g, l] = await Promise.all([fetchGeneros(), fetchIdiomas()])
    genres.value = g
    languages.value = l
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Error al cargar datos'
  }
})

function validate(): boolean {
  errors.title = form.title.trim() ? '' : 'El título es requerido'
  errors.genre = form.genre !== '' ? '' : 'Selecciona un género'
  errors.language = form.language !== '' ? '' : 'Selecciona un idioma'
  errors.releaseDate = form.releaseDate ? '' : 'La fecha de estreno es requerida'
  errors.synopsis = form.synopsis.trim() ? '' : 'La sinopsis es requerida'
  return Object.values(errors).every((e) => !e)
}

async function handleSubmit() {
  // La película ya fue creada (la subida del póster falló); solo reintentar la subida.
  if (createdMovieId.value !== null) {
    await trySubirPoster(createdMovieId.value)
    return
  }

  if (!validate()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const pelicula = (await createPelicula({
      titulo: form.title,
      sinopsis: form.synopsis || undefined,
      id_genero: form.genre !== '' ? Number(form.genre) : undefined,
      id_idioma: form.language !== '' ? Number(form.language) : undefined,
      fecha_estreno: form.releaseDate ? new Date(form.releaseDate).toISOString() : undefined,
      id_usuario: getCurrentUserId(),
    })) as { id: string }

    createdMovieId.value = Number(pelicula.id)
    await trySubirPoster(createdMovieId.value)
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Error al guardar la película'
  } finally {
    isSubmitting.value = false
  }
}

async function trySubirPoster(id: number) {
  if (!posterFile.value) {
    router.push('/admin/peliculas')
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  try {
    await uploadPosterPelicula(id, posterFile.value)
    router.push('/admin/peliculas')
  } catch (err) {
    submitError.value = err instanceof Error
      ? `La película se guardó, pero no se pudo subir el póster: ${err.message}. Puedes intentar subirlo de nuevo.`
      : 'La película se guardó, pero no se pudo subir el póster.'
  } finally {
    isSubmitting.value = false
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
      <h1 class="page-title">Nueva película</h1>
    </div>
    <div class="page-body">
      <form class="form-grid" novalidate @submit.prevent="handleSubmit">
        <!-- Columna izquierda: información general -->
        <div class="card animado" style="--delay: 80ms">
          <p class="section-label">Información general</p>

          <div class="field">
            <label for="title">Título</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="ej. Alien: Romulus"
              :class="{ 'input-error': errors.title }"
              :disabled="createdMovieId !== null"
            />
            <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
          </div>

          <p v-if="loadError" class="submit-error">{{ loadError }}</p>

          <div class="field-row">
            <div class="field">
              <label for="genre">Género</label>
              <select id="genre" v-model="form.genre" :class="{ 'input-error': errors.genre }" :disabled="createdMovieId !== null">
                <option value="" disabled>Seleccionar…</option>
                <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.nombre }}</option>
              </select>
              <span v-if="errors.genre" class="field-error">{{ errors.genre }}</span>
            </div>

            <div class="field">
              <label for="language">Idioma</label>
              <select
                id="language"
                v-model="form.language"
                :class="{ 'input-error': errors.language }"
                :disabled="createdMovieId !== null"
              >
                <option value="" disabled>Seleccionar…</option>
                <option v-for="l in languages" :key="l.id" :value="l.id">{{ l.nombre }}</option>
              </select>
              <span v-if="errors.language" class="field-error">{{ errors.language }}</span>
            </div>
          </div>

          <div class="field">
            <label for="releaseDate">Fecha de estreno</label>
            <input
              id="releaseDate"
              v-model="form.releaseDate"
              type="date"
              :class="{ 'input-error': errors.releaseDate }"
              :disabled="createdMovieId !== null"
            />
            <span v-if="errors.releaseDate" class="field-error">{{ errors.releaseDate }}</span>
          </div>

          <div class="field">
            <label for="synopsis">Sinopsis</label>
            <textarea
              id="synopsis"
              v-model="form.synopsis"
              placeholder="Descripción de la película…"
              rows="4"
              :class="{ 'input-error': errors.synopsis }"
              :disabled="createdMovieId !== null"
            ></textarea>
            <span v-if="errors.synopsis" class="field-error">{{ errors.synopsis }}</span>
          </div>

          <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando…' : createdMovieId !== null ? 'Reintentar subir póster' : 'Guardar película' }}
            </button>
            <button type="button" class="btn btn-ghost" :disabled="isSubmitting" @click="goBack">
              Cancelar
            </button>
          </div>
        </div>

        <!-- Columna derecha: póster -->
        <div class="right-col">
          <div class="card animado" style="--delay: 120ms">
            <p class="section-label">Imagen del póster</p>
            <PosterUpload v-model="posterFile" />
          </div>
        </div>
      </form>
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

.right-col {
  display: flex;
  flex-direction: column;
}

.section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 18px;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 5px;
  font-weight: 500;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border2);
  color: var(--text);
  padding: 10px 13px;
  border-radius: var(--radius);
  font-size: 14px;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}

.field input[readonly] {
  color: var(--text3);
  cursor: default;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--tangelo);
}

.field input.input-error,
.field select.input-error,
.field textarea.input-error {
  border-color: var(--sinopia);
}

.field input::placeholder,
.field textarea::placeholder {
  color: var(--text3);
}

.field textarea {
  resize: vertical;
  min-height: 90px;
  line-height: 1.5;
}

.field select option {
  background: #fff;
}

.field-error {
  display: block;
  font-size: 11px;
  color: var(--sinopia);
  margin-top: 4px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.submit-error {
  font-size: 12px;
  color: var(--sinopia);
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  border-radius: var(--radius);
  font-weight: 600;
  padding: 11px 24px;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn-primary {
  background: var(--sinopia);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.88;
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
