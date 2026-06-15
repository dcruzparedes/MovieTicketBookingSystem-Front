<template>
  <div class="vista-error-pago">
    <div class="error-card">

      <!-- Ícono de error -->
      <div class="icono-error">✕</div>

      <div class="error-titulo">Pago no procesado</div>
      <div class="error-sub">
        Tu tarjeta fue rechazada. Los asientos siguen reservados por
        <span class="timer-inline">{{ tienda.temporizadorFormateado }}</span>
      </div>

      <!-- Detalle del error -->
      <Message severity="error" :closable="false" class="error-mensaje">
        <div class="error-detalle">
          <span class="error-lbl">Motivo:</span>
          {{ mensajeError }}
        </div>
      </Message>

      <!-- Acciones -->
      <div class="error-acciones">
        <Button label="Intentar de nuevo" @click="enrutador.push('/pago')" />
        <Button label="Cancelar" severity="secondary" outlined @click="cancelar" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
const enrutador = useRouter()

// Mock — luego viene del backend en la respuesta del pago
const mensajeError = ref('Fondos insuficientes (INSUFFICIENT_FUNDS)')

function cancelar() {
  tienda.limpiarSeleccion()
  tienda.limpiarTemporizador()
  enrutador.push('/')
}
</script>

<style scoped>
.vista-error-pago {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.error-card {
  background: var(--surface);
  border: 1px solid rgba(217, 34, 0, 0.25);
  border-radius: 14px;
  padding: 38px;
  width: 440px;
  text-align: center;
}

.icono-error {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: rgba(217, 34, 0, 0.1);
  border: 1.5px solid rgba(217, 34, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
  color: var(--sinopia);
}

.error-titulo {
  font-family: 'DM Serif Display', serif;
  font-size: 26px;
  color: var(--text);
  margin-bottom: 8px;
}

.error-sub {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 20px;
  line-height: 1.6;
}

.timer-inline {
  color: var(--sinopia);
  font-family: 'DM Mono', monospace;
  font-weight: 600;
}

.error-mensaje {
  margin-bottom: 20px;
  text-align: left;
}

.error-detalle {
  font-size: 13px;
}

.error-lbl {
  font-weight: 600;
  margin-right: 4px;
}

.error-acciones {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
