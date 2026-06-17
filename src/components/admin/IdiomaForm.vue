<script setup lang="ts">
import { reactive, computed } from 'vue'

interface IdiomaFields {
  name: string
}

const props = defineProps<{
  initialData?: Partial<IdiomaFields>
}>()

const emit = defineEmits<{
  saved: [data: IdiomaFields]
  cancel: []
}>()

const isEditing = computed(() => !!props.initialData)

const form = reactive<IdiomaFields>({
  name: props.initialData?.name ?? '',
})

const errors = reactive({ name: '' })

function validate(): boolean {
  errors.name = form.name.trim() ? '' : 'El nombre del idioma es requerido'
  return !errors.name
}

function handleSubmit() {
  if (!validate()) return
  emit('saved', { ...form })
}
</script>

<template>
  <form class="idioma-form" novalidate @submit.prevent="handleSubmit">
    <div class="field">
      <label for="idioma-name">Nombre del idioma</label>
      <input
        id="idioma-name"
        v-model="form.name"
        type="text"
        placeholder="ej. Español"
        :class="{ 'input-error': errors.name }"
        autofocus
      />
      <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? 'Guardar cambios' : 'Crear idioma' }}
      </button>
      <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>

<style scoped>
.idioma-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
.field input {
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
  box-sizing: border-box;
}
.field input:focus {
  border-color: var(--tangelo);
}
.field input.input-error {
  border-color: var(--sinopia);
}
.field-error {
  display: block;
  font-size: 11px;
  color: var(--sinopia);
  margin-top: 4px;
}
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
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
