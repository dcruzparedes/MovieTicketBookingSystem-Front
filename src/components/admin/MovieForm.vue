<script setup lang="ts">
import { computed, reactive, ref, withDefaults } from 'vue'

interface FormFields {
  title: string
  genre: string
  language: string
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

const props = withDefaults(
  defineProps<{
    initialData?: Partial<FormFields>
    initialPosterUrl?: string
  }>(),
  { initialData: undefined, initialPosterUrl: undefined },
)

const emit = defineEmits<{
  saved: [data: FormFields & { poster: File | null }]
  cancel: []
}>()

const isEditing = computed(() => !!props.initialData)

const form = reactive<FormFields>({
  title: props.initialData?.title ?? '',
  genre: props.initialData?.genre ?? '',
  language: props.initialData?.language ?? '',
  releaseDate: props.initialData?.releaseDate ?? '',
  synopsis: props.initialData?.synopsis ?? '',
})

const errors = reactive<FormErrors>({
  title: '',
  genre: '',
  language: '',
  releaseDate: '',
  synopsis: '',
})

const genres = ['Acción', 'Animación', 'Drama', 'Sci-Fi', 'Terror']
const languages = ['Español', 'Subtitulada']

// Poster
const posterFile = ref<File | null>(null)
const posterPreview = ref(props.initialPosterUrl ?? '')
const posterError = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleFileSelect(file: File) {
  posterError.value = ''
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    posterError.value = 'Solo se permiten archivos JPG o PNG'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    posterError.value = 'El archivo no debe superar 5 MB'
    return
  }
  posterFile.value = file
  posterPreview.value = URL.createObjectURL(file)
}

function onFileInput(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) handleFileSelect(file)
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFileSelect(file)
}

function removePoster() {
  posterFile.value = null
  posterPreview.value = ''
  posterError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function validate(): boolean {
  errors.title = form.title.trim() ? '' : 'El título es requerido'
  errors.genre = form.genre ? '' : 'Selecciona un género'
  errors.language = form.language ? '' : 'Selecciona un idioma'
  errors.releaseDate = form.releaseDate ? '' : 'La fecha de estreno es requerida'
  errors.synopsis = form.synopsis.trim() ? '' : 'La sinopsis es requerida'
  return Object.values(errors).every((e) => !e)
}

function handleSubmit() {
  if (!validate()) return
  emit('saved', { ...form, poster: posterFile.value })
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
          <select id="mf-genre" v-model="form.genre" :class="{ 'input-error': errors.genre }">
            <option value="" disabled>Seleccionar…</option>
            <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
          </select>
          <span v-if="errors.genre" class="field-error">{{ errors.genre }}</span>
        </div>

        <div class="field">
          <label for="mf-language">Idioma</label>
          <select
            id="mf-language"
            v-model="form.language"
            :class="{ 'input-error': errors.language }"
          >
            <option value="" disabled>Seleccionar…</option>
            <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
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
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? 'Guardar cambios' : 'Guardar película' }}
        </button>
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
      </div>
    </div>

    <!-- Columna derecha: póster -->
    <div class="col">
      <p class="section-label">Imagen del póster</p>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png"
        class="hidden-input"
        @change="onFileInput"
      />

      <div v-if="posterPreview" class="preview-wrap">
        <img :src="posterPreview" alt="Póster" class="poster-img" />
        <button type="button" class="remove-btn" @click="removePoster">Quitar imagen</button>
      </div>

      <div
        v-else
        class="drop-zone"
        :class="{ dragging: isDragging }"
        @click="fileInputRef?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="onDrop"
      >
        <span class="drop-icon">🖼</span>
        <p class="drop-text">Arrastra o <span class="drop-link">haz clic para subir</span></p>
        <p class="drop-hint">JPG, PNG · máx. 5 MB</p>
      </div>

      <span v-if="posterError" class="field-error" style="margin-top: 8px; display: block">{{
        posterError
      }}</span>
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

/* Poster */
.hidden-input {
  display: none;
}

.drop-zone {
  border: 2px dashed var(--border2);
  border-radius: var(--radius);
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--tangelo);
  background: rgba(243, 113, 0, 0.06);
}

.drop-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.drop-text {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 4px;
}

.drop-link {
  color: var(--sinopia);
  font-weight: 500;
}

.drop-hint {
  font-size: 11px;
  color: var(--text3);
}

.preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.poster-img {
  width: 100%;
  max-width: 180px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--border2);
}

.remove-btn {
  background: none;
  border: 1px solid var(--border2);
  color: var(--text2);
  font-size: 12px;
  font-family: 'Outfit', sans-serif;
  padding: 6px 14px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: var(--bg);
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
