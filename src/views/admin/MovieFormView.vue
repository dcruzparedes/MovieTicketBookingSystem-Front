<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import PosterUpload from '@/components/PosterUpload.vue'
import { uploadPoster } from '@/services/storageService'
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
const posterUrl = ref('')
const posterUploading = ref(false)
const posterError = ref('')

const isSubmitting = ref(false)
const submitError = ref('')
const loadError = ref('')

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

watch(posterFile, async (file) => {
  if (!file) {
    posterUrl.value = ''
    posterError.value = ''
    return
  }
  posterUploading.value = true
  posterError.value = ''
  try {
    posterUrl.value = await uploadPoster(file)
  } catch (err) {
    posterError.value = err instanceof Error ? err.message : 'Error al subir el póster'
    posterFile.value = null
  } finally {
    posterUploading.value = false
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
  if (!validate() || posterUploading.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    await createPelicula({
      titulo: form.title,
      sinopsis: form.synopsis || undefined,
      poster_url: posterUrl.value || undefined,
      id_genero: form.genre !== '' ? form.genre : undefined,
      id_idioma: form.language !== '' ? form.language : undefined,
      fecha_estreno: form.releaseDate || undefined,
      id_usuario: getCurrentUserId(),
    })
    router.push('/admin/peliculas')
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Error al guardar la película'
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

          <p v-if="loadError" class="submit-error">{{ loadError }}</p>

          <div class="field">
            <label for="title">Título</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="ej. Alien: Romulus"
              :class="{ 'input-error': errors.title }"
            />
            <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="genre">Género</label>
              <select id="genre" v-model="form.genre" :class="{ 'input-error': errors.genre }">
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
            ></textarea>
            <span v-if="errors.synopsis" class="field-error">{{ errors.synopsis }}</span>
          </div>

          <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || posterUploading"
            >
              {{ isSubmitting ? 'Guardando…' : 'Guardar película' }}
            </button>
            <button
              type="button"
              class="btn btn-ghost"
              :disabled="isSubmitting || posterUploading"
              @click="goBack"
            >
              Cancelar
            </button>
          </div>
        </div>

        <!-- Columna derecha: póster + S3 -->
        <div class="right-col">
          <div class="card animado" style="--delay: 120ms">
            <p class="section-label">Imagen del póster</p>
            <PosterUpload
              v-model="posterFile"
              :uploading="posterUploading"
              :uploaded-url="posterUrl"
            />
            <span v-if="posterError" class="field-error" style="margin-top: 8px; display: block">
              {{ posterError }}
            </span>
          </div>

          <div class="card animado" style="--delay: 160ms; margin-top: 14px">
            <p class="section-label">Almacenamiento S3</p>
            <div class="field">
              <label for="s3-bucket">Bucket</label>
              <input id="s3-bucket" type="text" value="cine-vicenta-media" readonly />
            </div>
            <div class="field" style="margin-bottom: 0">
              <label for="s3-prefix">Prefijo</label>
              <input id="s3-prefix" type="text" value="posters/" readonly />
            </div>
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
