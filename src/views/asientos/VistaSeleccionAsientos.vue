<template>
  <div class="diseno-asientos">

    <!-- Toast conflicto -->
    <Toast position="top-center" group="conflicto" @close="tienda.limpiarConflicto()" />

    <!-- Mapa principal -->
    <div class="principal-asientos animado" style="--delay: 0ms">
      <div class="meta-funcion">
        {{ tienda.funcionActual?.fecha }} ·
        {{ tienda.funcionActual?.hora }} ·
        {{ tienda.funcionActual?.formato }} ·
        {{ tienda.funcionActual?.sala }}
      </div>
      <AsientosMap />
      <Button label="Simular conflicto" severity="secondary" size="small" style="margin-top: 12px"
        @click="simularConflicto" />
    </div>

    <!-- Panel lateral -->
    <div class="panel-lateral animado" style="--delay: 80ms">
      <Panel class="tarjeta-pedido">
        <template #header>
          <span class="etiqueta-pedido">Tu pedido</span>
        </template>

        <div class="titulo-pelicula">{{ tienda.funcionActual?.tituloPelicula ?? 'Alien: Romulus' }}</div>
        <div class="meta-pedido">
          <i class="pi pi-calendar" style="font-size: 11px" /> Vie 12 Jun · 19:15 · 3D
        </div>
        <div class="meta-pedido">
          <i class="pi pi-map-marker" style="font-size: 11px" /> Sala 4 — Cine Vicenta
        </div>

        <Divider />

        <!-- Asientos seleccionados -->
        <div class="contenedor-asientos-sel">
          <TransitionGroup name="chips" tag="div" class="chips-wrap">
            <Chip v-for="codigo in tienda.asientosSeleccionados" :key="codigo" :label="codigo" removable
              class="chip-asiento" @remove="tienda.alternarAsiento(codigo)" />
          </TransitionGroup>
          <span v-if="!tienda.asientosSeleccionados.length" class="pista-vacia">
            <i class="pi pi-info-circle" style="font-size: 11px" />
            Selecciona al menos un asiento
          </span>
        </div>

        <Divider />

        <div class="linea-pedido">
          <span>Asientos</span>
          <span>{{ tienda.asientosSeleccionados.length }} / {{ tienda.MAX_ASIENTOS }}</span>
        </div>
        <div class="linea-pedido">
          <span>Subtotal</span>
          <span>L. {{ tienda.subtotal.toFixed(2) }}</span>
        </div>

        <Divider />

        <div class="total-pedido">
          <span>Total</span>
          <span class="total-val">L. {{ tienda.subtotal.toFixed(2) }}</span>
        </div>

        <Button label="Continuar al pago" :disabled="tienda.asientosSeleccionados.length === 0" fluid
          style="margin-top: 14px" @click="irAPago" />

        <!-- Temporizador -->
        <div class="caja-temporizador" :class="{ urgente: tienda.segundosRestantes < 120 }">
          <div class="timer-header">
            <i class="pi pi-clock" />
            <span class="etiqueta-temporizador">Tiempo restante</span>
          </div>
          <div class="valor-temporizador">{{ tienda.temporizadorFormateado }}</div>
          <ProgressBar :value="progresoTemporizador" :show-value="false" class="timer-bar"
            :style="{ '--bar-color': tienda.segundosRestantes < 120 ? 'var(--sinopia)' : 'var(--darkred)' }" />
        </div>

      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import Panel from 'primevue/panel'
import ProgressBar from 'primevue/progressbar'
import AsientosMap from '@/components/asientos/AsientosMap.vue'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
const enrutador = useRouter()
const toast = useToast()

const progresoTemporizador = computed(() =>
  Math.round((tienda.segundosRestantes / 600) * 100)
)

onMounted(() => {
  tienda.construirMapaAsientos(8, 10)
  tienda.iniciarTemporizador()
})

onUnmounted(() => {
  tienda.limpiarTemporizador()
})

function irAPago() {
  if (tienda.asientosSeleccionados.length === 0) return
  enrutador.push('/pago')
}

function simularConflicto() {
  tienda.aplicarConflicto(['B3', 'B4'])
  toast.add({
    severity: 'error',
    summary: 'Asientos no disponibles',
    detail: 'Otro usuario tomó los asientos B3 y B4 mientras elegías. El mapa fue actualizado.',
    group: 'conflicto',
    life: 6000,
  })
}
</script>

<style scoped>
.diseno-asientos {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 22px;
}

.principal-asientos {
  flex: 1;
  min-width: 0;
}

.meta-funcion {
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Panel lateral ── */
.panel-lateral {
  width: 240px;
  flex-shrink: 0;
}

.tarjeta-pedido {
  position: sticky;
  top: 16px;
}

.etiqueta-pedido {
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.titulo-pelicula {
  font-family: 'DM Serif Display', serif;
  font-size: 16px;
  color: var(--text);
  margin-bottom: 6px;
}

.meta-pedido {
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 3px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ── Chips de asientos ── */
.contenedor-asientos-sel {
  min-height: 38px;
  margin: 4px 0;
}

.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip-asiento {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  background: rgba(243, 80, 10, 0.1);
  color: var(--tangelo);
  border: 1px solid rgba(243, 80, 10, 0.2);
}

.pista-vacia {
  font-size: 12px;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ── Líneas del pedido ── */
.linea-pedido {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 6px;
}

.total-pedido {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.total-val {
  color: var(--sinopia);
  font-family: 'DM Mono', monospace;
}

/* ── Temporizador ── */
.caja-temporizador {
  background: rgba(146, 0, 4, 0.06);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 12px;
  text-align: center;
  margin-top: 12px;
  transition: background .3s, border-color .3s;
}

.caja-temporizador.urgente {
  background: rgba(217, 34, 0, 0.08);
  border-color: rgba(217, 34, 0, 0.3);
}

.timer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 4px;
}

.etiqueta-temporizador {
  font-size: 9px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.valor-temporizador {
  font-family: 'DM Mono', monospace;
  font-size: 24px;
  color: var(--darkred);
  font-weight: 500;
  margin-bottom: 8px;
}

.timer-bar {
  height: 4px !important;
}

/* ── Animaciones ── */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animado {
  opacity: 0;
  animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

/* Chips entrando/saliendo */
.chips-enter-active {
  transition: all .2s ease;
}

.chips-leave-active {
  transition: all .15s ease;
}

.chips-enter-from {
  opacity: 0;
  transform: scale(.8);
}

.chips-leave-to {
  opacity: 0;
  transform: scale(.8);
}

.chips-move {
  transition: transform .2s ease;
}
</style>
