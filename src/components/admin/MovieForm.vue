<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import PosterUpload from '@/components/PosterUpload.vue'
import {
  createPelicula,
  fetchGeneros,
  fetchIdiomas,
  getCurrentUserId,
  type Genero,
  type Idioma,
} from '@/services/movieService'

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const form = reactive({
  title: '',
  genreId: null as number | null,
  languageId: null as number | null,
  releaseDate: '',
  synopsis: '',
})

const errors = reactive({
  title: '',
  genre: '',
  language: '',
  releaseDate: '',
  synopsis: '',
})

const genres = ref<Genero[]>([])
const languages = ref<Idioma[]>([])
const loading = ref(false)

onMounted(async () => {
  try {
    const [g, i] = await Promise.all([fetchGeneros(), fetchIdiomas()])
    genres.value = g
    languages.value = i
  } catch (e) {
    console.error('Error cargando catálogos:', e)
  }
})

const posterFile = ref<File | null>(null)

function validate(): boolean {
  errors.title = form.title.trim() ? '' : 'El título es requerido'
  errors.genre = form.genreId ? '' : 'Selecciona un género'
  errors.language = form.languageId ? '' : 'Selecciona un idioma'
  errors.releaseDate = form.releaseDate ? '' : 'La fecha de estreno es requerida'
  errors.synopsis = form.synopsis.trim() ? '' : 'La sinopsis es requerida'
  return Object.values(errors).every((e) => !e)
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  try {
    await createPelicula({
      titulo: form.title,
      sinopsis: form.synopsis,
      id_genero: form.genreId ? Number(form.genreId) : undefined,
      id_idioma: form.languageId ? Number(form.languageId) : undefined,
      fecha_estreno: form.releaseDate ? new Date(form.releaseDate).toISOString() : undefined,
      id_usuario: getCurrentUserId(),
    })
    emit('saved')
  } catch (e) {
    console.error('Error al crear película:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="form-grid" novalidate @submit.prevent="handleSubmit">
    <!-- Columna izquierda -->
    <div class="col">
      <p class="section-label">Información general</p>

      <div class="field">
        <label for="mf-title">Título</label>
        <input
          id="mf-title"
          v-model="form.title"
          type="text"
          placeholder="ej. Alien: Romulus"
          :class="{ 'input-error': errors.title }"
        />
        <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="mf-genre">Género</label>
          <select id="mf-genre" v-model="form.genreId" :class="{ 'input-error': errors.genre }">
            <option :value="null" disabled>Seleccionar…</option>
            <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.nombre }}</option>
          </select>
          <span v-if="errors.genre" class="field-error">{{ errors.genre }}</span>
        </div>

        <div class="field">
          <label for="mf-language">Idioma</label>
          <select
            id="mf-language"
            v-model="form.languageId"
            :class="{ 'input-error': errors.language }"
          >
            <option :value="null" disabled>Seleccionar…</option>
            <option v-for="l in languages" :key="l.id" :value="l.id">{{ l.nombre }}</option>
          </select>
          <span v-if="errors.language" class="field-error">{{ errors.language }}</span>
        </div>
      </div>

      <div class="field">
        <label for="mf-date">Fecha de estreno</label>
        <input
          id="mf-date"
          v-model="form.releaseDate"
          type="date"
          :class="{ 'input-error': errors.releaseDate }"
        />
        <span v-if="errors.releaseDate" class="field-error">{{ errors.releaseDate }}</span>
      </div>

      <div class="field">
        <label for="mf-synopsis">Sinopsis</label>
        <textarea
          id="mf-synopsis"
          v-model="form.synopsis"
          placeholder="Descripción de la película…"
          rows="4"
          :class="{ 'input-error': errors.synopsis }"
        ></textarea>
        <span v-if="errors.synopsis" class="field-error">{{ errors.synopsis }}</span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar película' }}
        </button>
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
      </div>
    </div>

    <!-- Columna derecha: póster -->
    <div class="col">
      <p class="section-label">Imagen del póster</p>
      <PosterUpload v-model="posterFile" />
    </div>
  </form>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
}

.col {
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

/* Actions */
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
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
</style>
