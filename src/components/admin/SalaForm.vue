<script setup lang="ts">
import { computed, reactive, withDefaults } from 'vue'
import AsientosMap from '@/components/asientos/AsientosMap.vue'

interface SalaFields {
  cinemaId: string
  name: string
  rows: number
  columns: number
}

interface SalaErrors {
  cinemaId: string
  name: string
  rows: string
  columns: string
}

const props = withDefaults(
  defineProps<{
    initialData?: Partial<SalaFields>
  }>(),
  { initialData: undefined },
)

const emit = defineEmits<{
  saved: [data: SalaFields]
  cancel: []
}>()

const isEditing = computed(() => !!props.initialData)

const cinemas = [
  { id: '1', name: 'Cine Vicenta Zona 10', city: 'Ciudad de Guatemala' },
  { id: '2', name: 'Cine Vicenta Miraflores', city: 'Ciudad de Guatemala' },
  { id: '3', name: 'Cine Vicenta Pradera', city: 'Quetzaltenango' },
  { id: '4', name: 'Cine Vicenta Antigua', city: 'Antigua Guatemala' },
]

const form = reactive<SalaFields>({
  cinemaId: props.initialData?.cinemaId ?? '',
  name: props.initialData?.name ?? '',
  rows: props.initialData?.rows ?? 8,
  columns: props.initialData?.columns ?? 10,
})

const errors = reactive<SalaErrors>({
  cinemaId: '',
  name: '',
  rows: '',
  columns: '',
})

const totalSeats = computed(() => {
  const r = Math.max(1, Math.min(26, form.rows || 0))
  const c = Math.max(1, Math.min(30, form.columns || 0))
  return r * c
})

function validate(): boolean {
  errors.cinemaId = form.cinemaId ? '' : 'Selecciona un cine'
  errors.name = form.name.trim() ? '' : 'El nombre de la sala es requerido'

  const r = form.rows
  if (!r || r < 1) errors.rows = 'Mínimo 1 fila'
  else if (r > 26) errors.rows = 'Máximo 26 filas'
  else errors.rows = ''

  const c = form.columns
  if (!c || c < 1) errors.columns = 'Mínimo 1 columna'
  else if (c > 30) errors.columns = 'Máximo 30 columnas'
  else errors.columns = ''

  return Object.values(errors).every((e) => !e)
}

function handleSubmit() {
  if (!validate()) return
  emit('saved', { ...form })
}
</script>

<template>
  <form class="form-grid" novalidate @submit.prevent="handleSubmit">
    <!-- Columna izquierda: campos -->
    <div class="col">
      <p class="section-label">Información de la sala</p>

      <div class="field">
        <label for="sf-cinema">Cine</label>
        <select id="sf-cinema" v-model="form.cinemaId" :class="{ 'input-error': errors.cinemaId }">
          <option value="" disabled>Seleccionar cine…</option>
          <option v-for="cinema in cinemas" :key="cinema.id" :value="cinema.id">
            {{ cinema.name }} — {{ cinema.city }}
          </option>
        </select>
        <span v-if="errors.cinemaId" class="field-error">{{ errors.cinemaId }}</span>
      </div>

      <div class="field">
        <label for="sf-name">Nombre de la sala</label>
        <input
          id="sf-name"
          v-model="form.name"
          type="text"
          placeholder="ej. Sala 1, Sala VIP, Sala IMAX"
          :class="{ 'input-error': errors.name }"
        />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>

      <p class="section-label" style="margin-top: 8px">Distribución de asientos</p>

      <div class="field-row">
        <div class="field">
          <label for="sf-rows">Filas <span class="hint">(máx. 26)</span></label>
          <input
            id="sf-rows"
            v-model.number="form.rows"
            type="number"
            min="1"
            max="26"
            placeholder="8"
            :class="{ 'input-error': errors.rows }"
          />
          <span v-if="errors.rows" class="field-error">{{ errors.rows }}</span>
        </div>

        <div class="field">
          <label for="sf-cols">Columnas <span class="hint">(máx. 30)</span></label>
          <input
            id="sf-cols"
            v-model.number="form.columns"
            type="number"
            min="1"
            max="30"
            placeholder="10"
            :class="{ 'input-error': errors.columns }"
          />
          <span v-if="errors.columns" class="field-error">{{ errors.columns }}</span>
        </div>
      </div>

      <div class="totals-row">
        <span class="total-badge">{{ totalSeats }} asientos en total</span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? 'Guardar cambios' : 'Guardar sala' }}
        </button>
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
      </div>
    </div>

    <!-- Columna derecha: preview de AsientosMap -->
    <div class="col">
      <p class="section-label">Vista previa</p>

      <div class="preview-wrap">
        <AsientosMap :preview="true" :filas="form.rows" :columnas="form.columns" />

        <div class="preview-footer">
          <span class="preview-stat">
            <strong>{{ Math.min(form.rows, 26) }}</strong> filas ×
            <strong>{{ Math.min(form.columns, 30) }}</strong> columnas =
            <strong>{{ totalSeats }}</strong> asientos
          </span>
        </div>
      </div>
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

.hint {
  font-weight: 400;
  color: var(--text3);
  font-size: 11px;
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
.field select {
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
.field select:focus {
  border-color: var(--tangelo);
}

.field input.input-error,
.field select.input-error {
  border-color: var(--sinopia);
}

.field input::placeholder {
  color: var(--text3);
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

.totals-row {
  margin-bottom: 20px;
}

.total-badge {
  display: inline-block;
  background: rgba(243, 80, 10, 0.08);
  color: var(--tangelo);
  border: 1px solid rgba(243, 80, 10, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
}

/* Preview */
.preview-wrap {
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 20px 16px 16px;
  overflow: auto;
  max-height: 480px;
  position: sticky;
  top: 24px;
}

.preview-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border2);
  text-align: center;
}

.preview-stat {
  font-size: 12px;
  color: var(--text2);
}

.preview-stat strong {
  color: var(--text);
}

/* Actions */
.form-actions {
  display: flex;
  gap: 10px;
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
