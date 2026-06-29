<script setup lang="ts">
import { reactive, computed } from 'vue'

export interface UserFields {
  nombre: string
  email: string
  telefono: string
  password: string
  id_rol: string
}

const emit = defineEmits<{
  saved: [data: UserFields]
  cancel: []
}>()

const form = reactive<UserFields>({
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  id_rol: '',
})

const errors = reactive({
  nombre: '',
  email: '',
  telefono: '',
  password: '',
  id_rol: '',
})

const roles = [
  { id: '1', nombre: 'Cliente' },
  { id: '2', nombre: 'Admin' },
  { id: '3', nombre: 'Recepcionista' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(): boolean {
  errors.nombre = form.nombre.trim() ? '' : 'El nombre es requerido'
  errors.email = EMAIL_REGEX.test(form.email) ? '' : 'Ingresa un correo válido'
  errors.telefono = form.telefono.trim() ? '' : 'El teléfono es requerido'
  errors.password =
    form.password.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres'
  errors.id_rol = form.id_rol ? '' : 'Selecciona un rol'

  return Object.values(errors).every((e) => !e)
}

const telefono = computed({
  get: () => form.telefono,
  set: (value: string) => {
    form.telefono = value.replace(/\D/g, '').slice(0, 8)
  }
})

// Bloquea cualquier tecla que no sea un dígito antes de que se escriba
const ALLOWED_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']

function onlyDigitsKeydown(e: KeyboardEvent) {
  if (ALLOWED_KEYS.includes(e.key)) return
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

function handleSubmit() {
  if (!validate()) return
  emit('saved', { ...form })
}
</script>

<template>
  <form class="user-form" novalidate @submit.prevent="handleSubmit">
    <div class="field">
      <label for="user-nombre">Nombre</label>
      <input
        id="user-nombre"
        v-model="form.nombre"
        type="text"
        placeholder="ej. Juan Pérez"
        :class="{ 'input-error': errors.nombre }"
      />
      <span v-if="errors.nombre" class="field-error">{{ errors.nombre }}</span>
    </div>

    <div class="field">
      <label for="user-email">Correo</label>
      <input
        id="user-email"
        v-model="form.email"
        type="email"
        placeholder="ej. juan@correo.com"
        :class="{ 'input-error': errors.email }"
      />
      <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
    </div>

    <div class="field">
      <label for="user-telefono">Teléfono</label>
      <input
        id="user-telefono"
        v-model="telefono"
        type="tel"
        placeholder="ej. 9999 9999"
        :class="{ 'input-error': errors.telefono }"
        inputmode="numeric"
        maxlength="8"
        fluid 
        @keydown="onlyDigitsKeydown"
      />
      <span v-if="errors.telefono" class="field-error">{{ errors.telefono }}</span>
    </div>

    <div class="field">
      <label for="user-password">Contraseña</label>
      <input
        id="user-password"
        v-model="form.password"
        type="password"
        placeholder="Mínimo 8 caracteres"
        :class="{ 'input-error': errors.password }"
      />
      <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
    </div>

    <div class="field">
      <label for="user-rol">Rol</label>
      <select id="user-rol" v-model="form.id_rol" :class="{ 'input-error': errors.id_rol }">
        <option value="" disabled>Seleccionar rol…</option>
        <option v-for="rol in roles" :key="rol.id" :value="rol.id">
          {{ rol.nombre }}
        </option>
      </select>
      <span v-if="errors.id_rol" class="field-error">{{ errors.id_rol }}</span>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">Guardar usuario</button>
      <button type="button" class="btn btn-ghost" @click="emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>

<style scoped>
.user-form {
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
