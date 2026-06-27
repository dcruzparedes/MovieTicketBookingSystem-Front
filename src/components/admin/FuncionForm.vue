<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

export interface FuncionFields {
  peliculaId: string
  cinemaId: string
  salaId: string
  fecha: string
  hora: string
  precio: string
}

interface FuncionErrors {
  peliculaId: string
  cinemaId: string
  salaId: string
  fecha: string
  hora: string
}

const props = withDefaults(
  defineProps<{
    initialData?: Partial<FuncionFields>
    peliculas?: { id: string; titulo: string; dur?: string | null }[]
    cines?: { id: string; nombre: string }[]
    salas?: { id: string; id_cine: string; nombre: string }[]
    loading?: boolean
  }>(),
  {
    initialData: undefined,
    peliculas: () => [],
    cines: () => [],
    salas: () => [],
    loading: false,
  },
)

const emit = defineEmits<{
  saved: [data: FuncionFields]
  cancel: []
}>()

const isEditing = computed(() => !!props.initialData)

const form = reactive<FuncionFields>({
  peliculaId: props.initialData?.peliculaId ?? '',
  cinemaId: props.initialData?.cinemaId ?? '',
  salaId: props.initialData?.salaId ?? '',
  fecha: props.initialData?.fecha ?? '',
  hora: props.initialData?.hora ?? '',
  precio: props.initialData?.precio ?? '',
})

const errors = reactive<FuncionErrors>({
  peliculaId: '',
  cinemaId: '',
  salaId: '',
  fecha: '',
  hora: '',
})

const salasFiltradas = computed(() =>
  form.cinemaId ? props.salas.filter((s) => s.id_cine === form.cinemaId) : [],
)

// Reset sala when cinema changes
watch(
  () => form.cinemaId,
  () => {
    form.salaId = ''
  },
)

const selectedPelicula = computed(() => props.peliculas.find((p) => p.id === form.peliculaId) ?? null)
const selectedCinema = computed(() => props.cines.find((c) => c.id === form.cinemaId) ?? null)
const selectedSala = computed(() => props.salas.find((s) => s.id === form.salaId) ?? null)

function validate(): boolean {
  errors.peliculaId = form.peliculaId ? '' : 'Selecciona una película'
  errors.cinemaId = form.cinemaId ? '' : 'Selecciona un cine'
  errors.salaId = form.salaId ? '' : 'Selecciona una sala'
  errors.fecha = form.fecha ? '' : 'La fecha es requerida'
  errors.hora = form.hora ? '' : 'La hora es requerida'
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
      <p class="section-label">Función</p>

      <div class="field">
        <label for="ff-pelicula">Película</label>
        <select
          id="ff-pelicula"
          v-model="form.peliculaId"
          :class="{ 'input-error': errors.peliculaId }"
        >
          <option value="" disabled>Seleccionar película…</option>
          <option v-for="p in peliculas" :key="p.id" :value="p.id">
            {{ p.titulo }}
          </option>
        </select>
        <span v-if="errors.peliculaId" class="field-error">{{ errors.peliculaId }}</span>
      </div>

      <p class="section-label" style="margin-top: 4px">Ubicación</p>

      <div class="field">
        <label for="ff-cinema">Cine</label>
        <select id="ff-cinema" v-model="form.cinemaId" :class="{ 'input-error': errors.cinemaId }">
          <option value="" disabled>Seleccionar cine…</option>
          <option v-for="c in cines" :key="c.id" :value="c.id">
            {{ c.nombre }}
          </option>
        </select>
        <span v-if="errors.cinemaId" class="field-error">{{ errors.cinemaId }}</span>
      </div>

      <div class="field">
        <label for="ff-sala">Sala</label>
        <select
          id="ff-sala"
          v-model="form.salaId"
          :disabled="!form.cinemaId"
          :class="{ 'input-error': errors.salaId }"
        >
          <option value="" disabled>
            {{ form.cinemaId ? 'Seleccionar sala…' : 'Primero elige un cine' }}
          </option>
          <option v-for="s in salasFiltradas" :key="s.id" :value="s.id">{{ s.nombre }}</option>
        </select>
        <span v-if="errors.salaId" class="field-error">{{ errors.salaId }}</span>
      </div>

      <p class="section-label" style="margin-top: 4px">Horario y precio</p>

      <div class="field-row">
        <div class="field">
          <label for="ff-fecha">Fecha</label>
          <input
            id="ff-fecha"
            v-model="form.fecha"
            type="date"
            :class="{ 'input-error': errors.fecha }"
          />
          <span v-if="errors.fecha" class="field-error">{{ errors.fecha }}</span>
        </div>

        <div class="field">
          <label for="ff-hora">Hora</label>
          <input
            id="ff-hora"
            v-model="form.hora"
            type="time"
            :class="{ 'input-error': errors.hora }"
          />
          <span v-if="errors.hora" class="field-error">{{ errors.hora }}</span>
        </div>
      </div>

      <div class="field">
        <label for="ff-precio">Precio base (L.)</label>
        <input
          id="ff-precio"
          v-model="form.precio"
          type="number"
          min="0"
          step="0.50"
          placeholder="ej. 45.00"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear función' }}
        </button>
        <button type="button" class="btn btn-ghost" :disabled="loading" @click="emit('cancel')">Cancelar</button>
      </div>
    </div>

    <!-- Columna derecha: resumen -->
    <div class="col summary-col">
      <p class="section-label">Resumen</p>
      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-icon">🎬</span>
          <div class="summary-text">
            <span class="summary-key">Película</span>
            <span class="summary-val">{{ selectedPelicula?.titulo || '—' }}</span>
            <span v-if="selectedPelicula?.dur" class="summary-sub">{{ selectedPelicula.dur }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">🏛</span>
          <div class="summary-text">
            <span class="summary-key">Cine</span>
            <span class="summary-val">{{ selectedCinema?.nombre || '—' }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">🎭</span>
          <div class="summary-text">
            <span class="summary-key">Sala</span>
            <span class="summary-val">{{ selectedSala?.nombre || '—' }}</span>
          </div>
        </div>
        <div class="summary-divider" />
        <div class="summary-row">
          <span class="summary-icon">📅</span>
          <div class="summary-text">
            <span class="summary-key">Fecha</span>
            <span class="summary-val">{{ form.fecha || '—' }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">🕐</span>
          <div class="summary-text">
            <span class="summary-key">Hora</span>
            <span class="summary-val">{{ form.hora || '—' }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">💰</span>
          <div class="summary-text">
            <span class="summary-key">Precio base</span>
            <span class="summary-val">{{ form.precio ? 'L. ' + form.precio : '—' }}</span>
          </div>
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
  box-sizing: border-box;
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

.field select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Summary */
.summary-col {
  position: sticky;
  top: 24px;
}

.summary-card {
  background: var(--bg);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.summary-icon {
  font-size: 16px;
  line-height: 1;
  margin-top: 2px;
  flex-shrink: 0;
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.summary-key {
  font-size: 11px;
  color: var(--text3);
  font-weight: 500;
}

.summary-val {
  font-size: 13px;
  color: var(--text);
  word-break: break-word;
}

.summary-sub {
  font-size: 11px;
  color: var(--text3);
}

.summary-divider {
  height: 1px;
  background: var(--border2);
  margin: 2px 0;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>