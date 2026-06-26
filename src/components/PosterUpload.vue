<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: File | null
  initialUrl?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
}>()

const preview = ref('')
const error = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const initialRemoved = ref(false)

// Sync preview when modelValue is cleared externally
watch(
  () => props.modelValue,
  (file) => {
    if (!file) {
      preview.value = ''
      error.value = ''
    }
  },
)

// Reset initialRemoved when a new initialUrl is provided
watch(
  () => props.initialUrl,
  () => { initialRemoved.value = false },
)

const displayPreview = computed(() => {
  if (preview.value) return preview.value
  if (props.initialUrl && !initialRemoved.value) return props.initialUrl
  return ''
})

function handleFile(file: File) {
  error.value = ''
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    error.value = 'Solo se permiten archivos JPG o PNG'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'El archivo no debe superar 5 MB'
    return
  }
  preview.value = URL.createObjectURL(file)
  emit('update:modelValue', file)
}

function onFileInput(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function remove() {
  preview.value = ''
  error.value = ''
  initialRemoved.value = true
  if (fileInputRef.value) fileInputRef.value.value = ''
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="poster-upload">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png"
      class="hidden-input"
      @change="onFileInput"
    />

    <!-- Vista previa -->
    <div v-if="displayPreview" class="preview-wrap">
      <img :src="displayPreview" alt="Póster" class="poster-img" />
      <button type="button" class="remove-btn" @click="remove">Quitar imagen</button>
    </div>

    <!-- Zona de carga -->
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

    <span v-if="error" class="upload-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.poster-upload {
  display: flex;
  flex-direction: column;
}

.hidden-input {
  display: none;
}

.drop-zone {
  border: 2px dashed var(--border2);
  border-radius: var(--radius);
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
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
  max-width: 200px;
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

.upload-error {
  display: block;
  font-size: 11px;
  color: var(--sinopia);
  margin-top: 8px;
}
</style>
