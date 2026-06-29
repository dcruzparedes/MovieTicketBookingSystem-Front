<template>
  <div class="vista-error-pago">
    <NavBar @logo-click="cancelar" @home-click="cancelar" />
    <div class="error-layout">
      <div class="error-card animado" style="--delay: 0ms">

        <!-- Ícono de error -->
        <div class="icono-error animado" style="--delay: 80ms">✕</div>

        <div class="error-titulo animado" style="--delay: 140ms">Pago no procesado</div>
        <div class="error-sub animado" style="--delay: 180ms">
          Tu tarjeta fue rechazada. Los asientos siguen reservados por
          <span class="timer-inline">{{ tienda.temporizadorFormateado }}</span>
        </div>

        <!-- Detalle del error -->
        <Message severity="error" :closable="false" class="error-mensaje animado" style="--delay: 240ms">
          <div class="error-detalle">
            <span class="error-lbl">Motivo:</span>
            {{ mensajeError }}
          </div>
        </Message>

        <!-- Acciones -->
        <div class="error-acciones animado" style="--delay: 300ms">
          <Button label="Intentar de nuevo" @click="enrutador.push('/pago')" />
          <Button label="Cancelar" severity="secondary" outlined @click="cancelar" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import NavBar from '@/components/NavBar.vue'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
const enrutador = useRouter()
const ruta = useRoute()

const mensajeError = computed(() => String(ruta.query.motivo ?? 'No se pudo procesar el pago.'))

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
  flex-direction: column;
}

.error-layout {
  flex: 1;
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

/* ── Animaciones ── */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animado {
  opacity: 0;
  animation: slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}
</style>
