<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

interface FuncionFields {
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
  precio: string
}

const props = withDefaults(
  defineProps<{
    initialData?: Partial<FuncionFields>
  }>(),
  { initialData: undefined },
)

const emit = defineEmits<{
  saved: [data: FuncionFields]
  cancel: []
}>()

const isEditing = computed(() => !!props.initialData)

const peliculas = [
  { id: '1', title: 'Alien: Romulus', genre: 'Sci-Fi', duration: 119 },
  { id: '2', title: 'Wild Robot', genre: 'Animación', duration: 102 },
  { id: '3', title: 'Megalopolis', genre: 'Drama', duration: 138 },
  { id: '4', title: 'Venom: El Último Baile', genre: 'Acción', duration: 109 },
]

const cinemas = [
  { id: '1', name: 'Cine Vicenta Zona 10', city: 'San Pedro Sula' },
  { id: '2', name: 'Cine Vicenta Miraflores', city: 'Tegucigalpa' },
  { id: '3', name: 'Cine Vicenta Pradera', city: 'Yuscarán' },
  { id: '4', name: 'Cine Vicenta Antigua', city: 'Santa Bárbara' },
]

const allSalas = [
  { id: '1', cinemaId: '1', name: 'Sala 1' },
  { id: '2', cinemaId: '1', name: 'Sala 2' },
  { id: '3', cinemaId: '1', name: 'Sala VIP' },
  { id: '4', cinemaId: '2', name: 'Sala 1' },
  { id: '5', cinemaId: '2', name: 'Sala IMAX' },
  { id: '6', cinemaId: '3', name: 'Sala 1' },
  { id: '7', cinemaId: '3', name: 'Sala 2' },
  { id: '8', cinemaId: '4', name: 'Sala 1' },
]

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
  precio: '',
})

const salas = computed(() =>
  form.cinemaId ? allSalas.filter((s) => s.cinemaId === form.cinemaId) : [],
)

// Reset sala when cinema changes
watch(
  () => form.cinemaId,
  () => {
    form.salaId = ''
  },
)

const selectedPelicula = computed(() => peliculas.find((p) => p.id === form.peliculaId) ?? null)
const selectedCinema = computed(() => cinemas.find((c) => c.id === form.cinemaId) ?? null)
const selectedSala = computed(() => allSalas.find((s) => s.id === form.salaId) ?? null)

function formatDuration(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

function validate(): boolean {
  errors.peliculaId = form.peliculaId ? '' : 'Selecciona una película'
  errors.cinemaId = form.cinemaId ? '' : 'Selecciona un cine'
  errors.salaId = form.salaId ? '' : 'Selecciona una sala'
  errors.fecha = form.fecha ? '' : 'La fecha es requerida'
  errors.hora = form.hora ? '' : 'La hora es requerida'
  const precio = parseFloat(form.precio)
  errors.precio = !form.precio.trim()
    ? 'El precio base es requerido'
    : isNaN(precio) || precio < 0
      ? 'Ingresa un precio válido'
      : ''
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
            {{ p.title }} ({{ p.genre }})
          </option>
        </select>
        <span v-if="errors.peliculaId" class="field-error">{{ errors.peliculaId }}</span>
      </div>

      <p class="section-label" style="margin-top: 4px">Ubicación</p>

      <div class="field">
        <label for="ff-cinema">Cine</label>
        <select id="ff-cinema" v-model="form.cinemaId" :class="{ 'input-error': errors.cinemaId }">
          <option value="" disabled>Seleccionar cine…</option>
          <option v-for="c in cinemas" :key="c.id" :value="c.id">
            {{ c.name }} — {{ c.city }}
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
          <option v-for="s in salas" :key="s.id" :value="s.id">{{ s.name }}</option>
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
          :class="{ 'input-error': errors.precio }"
        />
        <span v-if="errors.precio" class="field-error">{{ errors.precio }}</span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? 'Guardar cambios' : 'Crear función' }}
        </button>
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
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
            <span class="summary-val">{{ selectedPelicula?.title || '—' }}</span>
            <span v-if="selectedPelicula" class="summary-sub">
              {{ selectedPelicula.genre }} · {{ formatDuration(selectedPelicula.duration) }}
            </span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">🏛</span>
          <div class="summary-text">
            <span class="summary-key">Cine</span>
            <span class="summary-val">{{ selectedCinema?.name || '—' }}</span>
            <span v-if="selectedCinema" class="summary-sub">{{ selectedCinema.city }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">🎭</span>
          <div class="summary-text">
            <span class="summary-key">Sala</span>
            <span class="summary-val">{{ selectedSala?.name || '—' }}</span>
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
</style>
