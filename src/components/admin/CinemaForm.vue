<script setup lang="ts">
import { computed, reactive } from 'vue'

interface CinemaFields {
  cityId: string
  name: string
  address: string
  phone: string
  email: string
}

interface CinemaErrors {
  cityId: string
  name: string
  address: string
  phone: string
  email: string
}

const props = withDefaults(
  defineProps<{
    initialData?: Partial<CinemaFields>
  }>(),
  { initialData: undefined },
)

const emit = defineEmits<{
  saved: [data: CinemaFields]
  cancel: []
}>()

const isEditing = computed(() => !!props.initialData)

const cities = [
  { id: '1', name: 'San Pedro Sula' },
  { id: '2', name: 'Tegucigalpa' },
  { id: '3', name: 'Yuscarán' },
  { id: '4', name: 'Santa Bárbara' },
  { id: '5', name: 'Copán' },
  { id: '6', name: 'Lempira' },
  { id: '7', name: 'Gracias a Dios' },
  { id: '8', name: 'Siguatepeque' },
  { id: '9', name: 'La Paz' },
]

const form = reactive<CinemaFields>({
  cityId: props.initialData?.cityId ?? '',
  name: props.initialData?.name ?? '',
  address: props.initialData?.address ?? '',
  phone: props.initialData?.phone ?? '',
  email: props.initialData?.email ?? '',
})

const errors = reactive<CinemaErrors>({
  cityId: '',
  name: '',
  address: '',
  phone: '',
  email: '',
})

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(): boolean {
  errors.cityId = form.cityId ? '' : 'Selecciona una ciudad'
  errors.name = form.name.trim() ? '' : 'El nombre del cine es requerido'
  errors.address = form.address.trim() ? '' : 'La dirección es requerida'
  errors.phone = ''
  errors.email =
    form.email && !EMAIL_REGEX.test(form.email) ? 'Ingresa un correo electrónico válido' : ''
  return Object.values(errors).every((e) => !e)
}

function handleSubmit() {
  if (!validate()) return
  emit('saved', { ...form })
}
</script>

<template>
  <form class="form-grid" novalidate @submit.prevent="handleSubmit">
    <!-- Columna izquierda -->
    <div class="col">
      <p class="section-label">Información del cine</p>

      <div class="field">
        <label for="cf-city">Ciudad</label>
        <select id="cf-city" v-model="form.cityId" :class="{ 'input-error': errors.cityId }">
          <option value="" disabled>Seleccionar ciudad…</option>
          <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
        </select>
        <span v-if="errors.cityId" class="field-error">{{ errors.cityId }}</span>
      </div>

      <div class="field">
        <label for="cf-name">Nombre del cine</label>
        <input
          id="cf-name"
          v-model="form.name"
          type="text"
          placeholder="ej. Cine Vicenta Zona 10"
          :class="{ 'input-error': errors.name }"
        />
        <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label for="cf-address">Dirección</label>
        <input
          id="cf-address"
          v-model="form.address"
          type="text"
          placeholder="ej. 5a Av. 12-34, Zona 10"
          :class="{ 'input-error': errors.address }"
        />
        <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="cf-phone">Teléfono <span class="optional">(opcional)</span></label>
          <input
            id="cf-phone"
            v-model="form.phone"
            type="tel"
            placeholder="ej. 2222-3333"
            :class="{ 'input-error': errors.phone }"
          />
          <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
        </div>

        <div class="field">
          <label for="cf-email">Correo <span class="optional">(opcional)</span></label>
          <input
            id="cf-email"
            v-model="form.email"
            type="email"
            placeholder="ej. cine@ejemplo.com"
            :class="{ 'input-error': errors.email }"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? 'Guardar cambios' : 'Guardar cine' }}
        </button>
        <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
      </div>
    </div>

    <!-- Columna derecha: resumen -->
    <div class="col summary-col">
      <p class="section-label">Resumen</p>
      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-icon">📍</span>
          <div class="summary-text">
            <span class="summary-key">Ciudad</span>
            <span class="summary-val">
              {{ cities.find((c) => c.id === form.cityId)?.name || '—' }}
            </span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">🏛</span>
          <div class="summary-text">
            <span class="summary-key">Nombre</span>
            <span class="summary-val">{{ form.name || '—' }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">🗺</span>
          <div class="summary-text">
            <span class="summary-key">Dirección</span>
            <span class="summary-val">{{ form.address || '—' }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">📞</span>
          <div class="summary-text">
            <span class="summary-key">Teléfono</span>
            <span class="summary-val">{{ form.phone || '—' }}</span>
          </div>
        </div>
        <div class="summary-row">
          <span class="summary-icon">✉</span>
          <div class="summary-text">
            <span class="summary-key">Correo</span>
            <span class="summary-val">{{ form.email || '—' }}</span>
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

.optional {
  font-weight: 400;
  color: var(--text3);
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
