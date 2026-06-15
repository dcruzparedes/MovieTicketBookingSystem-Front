<template>
  <div class="metodo-pago">
    <!-- Selector de método -->
    <div class="metodos-row">
      <div
        :class="['metodo-opt', tienda.metodoPago === 'tarjeta' && 'activo']"
        @click="tienda.metodoPago = 'tarjeta'"
      >
        💳 Tarjeta
      </div>
      <div
        :class="['metodo-opt', tienda.metodoPago === 'efectivo' && 'activo']"
        @click="tienda.metodoPago = 'efectivo'"
      >
        💵 Efectivo
      </div>
    </div>

    <!-- Campos de tarjeta -->
    <div v-if="tienda.metodoPago === 'tarjeta'" class="campos-tarjeta">
      <div class="campo">
        <label>Número de tarjeta</label>
        <InputText
          v-model="numeroTarjeta"
          placeholder="4242 4242 4242 4242"
          class="input-mono"
          fluid
        />
      </div>
      <div class="campos-fila">
        <div class="campo">
          <label>Vencimiento</label>
          <InputText
            v-model="vencimiento"
            placeholder="MM / AA"
            class="input-mono"
            fluid
          />
        </div>
        <div class="campo">
          <label>CVV</label>
          <InputText
            v-model="cvv"
            placeholder="•••"
            class="input-mono"
            fluid
          />
        </div>
      </div>
      <div class="campo">
        <label>Nombre en tarjeta</label>
        <InputText
          v-model="nombreTarjeta"
          placeholder="Juan Pérez"
          fluid
        />
      </div>
    </div>

    <!-- Info de efectivo -->
    <div v-else class="info-efectivo">
      <i class="pi pi-info-circle" style="color: var(--orange)" />
      Presenta el código en taquilla y paga en efectivo. Tienes
      <strong style="color: var(--sinopia)">30 minutos</strong>
      antes de que los asientos se liberen.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()

const numeroTarjeta = ref('')
const vencimiento = ref('')
const cvv = ref('')
const nombreTarjeta = ref('')
</script>

<style scoped>
.metodo-pago { display: flex; flex-direction: column; gap: 16px; }

.metodos-row { display: flex; gap: 8px; }

.metodo-opt {
  flex: 1;
  padding: 11px;
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  cursor: pointer;
  text-align: center;
  font-size: 13px;
  color: var(--text2);
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
}
.metodo-opt.activo {
  border-color: var(--tangelo);
  color: var(--tangelo);
  background: rgba(243, 80, 10, 0.06);
  font-weight: 600;
}

.campos-tarjeta { display: flex; flex-direction: column; gap: 12px; }

.campo { display: flex; flex-direction: column; gap: 5px; }
.campo label {
  font-size: 12px;
  color: var(--text2);
  font-weight: 500;
}

.campos-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.input-mono { font-family: 'DM Mono', monospace; letter-spacing: 1px; }

.info-efectivo {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 14px;
  font-size: 13px;
  color: var(--text2);
  line-height: 1.7;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 1px solid var(--border);
}
</style>
