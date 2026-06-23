<template>
  <div class="cupon-descuento">
    <div v-if="!cuponAplicado" class="cupon-row">
      <InputText
        v-model="codigoIngresado"
        placeholder="PROMO2026"
        class="input-cupon"
        :disabled="cargando"
        @keyup.enter="aplicar"
      />
      <Button
        label="Aplicar"
        severity="secondary"
        :loading="cargando"
        @click="aplicar"
      />
    </div>

    <!-- Cupón aplicado -->
    <div v-else class="cupon-aplicado">
      <div class="cupon-aplicado-info">
        <i class="pi pi-tag" style="color: var(--success)" />
        <div>
          <div class="cupon-codigo">{{ tienda.codigoCupon }}</div>
          <div class="cupon-ahorro">Ahorrás L. {{ tienda.descuento.toFixed(2) }}</div>
        </div>
      </div>
      <Button
        icon="pi pi-times"
        severity="danger"
        text
        size="small"
        @click="quitar"
      />
    </div>

    <!-- Error -->
    <div v-if="error" class="cupon-error">
      <i class="pi pi-exclamation-circle" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()

const codigoIngresado = ref('')
const cargando = ref(false)
const error = ref('')

const cuponAplicado = computed(() => tienda.codigoCupon !== '')

// Mock de cupones válidos — luego se reemplaza con POST /cupones/validar
const CUPONES_MOCK: Record<string, { tipo: 'porcentaje' | 'fijo'; valor: number; id: string }> = {
  'PROMO2026': { tipo: 'porcentaje', valor: 20, id: '1' },
  'VERANO50':  { tipo: 'fijo',       valor: 50, id: '2' },
}

async function aplicar() {
  if (!codigoIngresado.value.trim()) return
  error.value = ''
  cargando.value = true

  // Simula latencia del backend
  await new Promise(r => setTimeout(r, 600))

  const codigo = codigoIngresado.value.toUpperCase().trim()
  const cupon = CUPONES_MOCK[codigo]

  if (cupon) {
    tienda.aplicarCupon(codigo, cupon.tipo, cupon.valor, cupon.id)
    codigoIngresado.value = ''
  } else {
    error.value = 'Código inválido o expirado.'
  }

  cargando.value = false
}

function quitar() {
  tienda.limpiarCupon()
  error.value = ''
}
</script>

<style scoped>
.cupon-descuento { display: flex; flex-direction: column; gap: 8px; }

.cupon-row { display: flex; gap: 8px; }

.input-cupon {
  flex: 1;
  font-family: 'DM Mono', monospace;
  letter-spacing: 2px;
}

.cupon-aplicado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 120, 60, 0.06);
  border: 1px solid rgba(30, 120, 60, 0.25);
  border-radius: var(--radius);
  padding: 10px 12px;
}

.cupon-aplicado-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cupon-codigo {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 1px;
}

.cupon-ahorro {
  font-size: 11px;
  color: var(--success);
  margin-top: 2px;
}

.cupon-error {
  font-size: 12px;
  color: var(--sinopia);
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
