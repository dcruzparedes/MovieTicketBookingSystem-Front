<template>
  <!-- NavBar con menú de usuario -->
  <NavBar @logo-click="irAHome" @home-click="irAHome" />
  <div class="diseno-asientos">
    <!-- Toast conflicto -->
    <Toast position="top-center" group="conflicto" @close="tienda.limpiarConflicto()" />

    <!-- Mapa principal -->
    <div class="principal-asientos animado" style="--delay: 0ms">
      <button class="back-btn" @click="irAHome">Funciones</button>
      <div class="meta-funcion">
        <i class="pi pi-calendar" style="font-size: 11px" />
        {{ tienda.funcionActual?.fecha }} · {{ tienda.funcionActual?.hora }} ·
        {{ tienda.funcionActual?.formato }} ·
        {{ tienda.funcionActual?.sala }}
      </div>
      <div v-if="cargando" class="estado-carga">
        <ProgressSpinner style="width: 40px; height: 40px" stroke-width="4" />
      </div>
      <div v-else-if="errorCarga" class="estado-error">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ errorCarga }}</span>
        <Button label="Reintentar" size="small" @click="cargarAsientos" />
      </div>
      <AsientosMap v-else />
    </div>

    <!-- Panel lateral -->
    <div class="panel-lateral animado" style="--delay: 80ms">
      <Panel class="tarjeta-pedido">
        <template #header>
          <span class="etiqueta-pedido">Tu pedido</span>
        </template>

        <div class="titulo-pelicula">
          {{ tienda.funcionActual?.tituloPelicula }}
        </div>
        <div class="meta-pedido">
          <i class="pi pi-calendar" style="font-size: 11px" /> {{ tienda.funcionActual?.fecha }} ·
          {{ tienda.funcionActual?.hora }} · {{ tienda.funcionActual?.formato }}
        </div>
        <div class="meta-pedido">
          <i class="pi pi-map-marker" style="font-size: 11px" /> {{ tienda.funcionActual?.sala }} —
          {{ tienda.funcionActual?.cine }}
        </div>

        <Divider />

        <!-- Asientos seleccionados -->
        <div class="contenedor-asientos-sel">
          <TransitionGroup name="chips" tag="div" class="chips-wrap">
            <Chip
              v-for="codigo in tienda.asientosSeleccionados"
              :key="codigo"
              :label="codigo"
              removable
              class="chip-asiento"
              @remove="tienda.alternarAsiento(codigo)"
            />
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

        <Button
          label="Continuar al pago"
          :disabled="tienda.asientosSeleccionados.length === 0"
          :loading="bloqueando"
          fluid
          style="margin-top: 14px"
          @click="irAPago"
        />

        <!-- Temporizador -->
        <div class="caja-temporizador" :class="{ urgente: tienda.segundosRestantes < 120 }">
          <div class="timer-header">
            <i class="pi pi-clock" />
            <span class="etiqueta-temporizador">Tiempo restante</span>
          </div>
          <div class="valor-temporizador">{{ tienda.temporizadorFormateado }}</div>
          <ProgressBar
            :value="progresoTemporizador"
            :show-value="false"
            class="timer-bar"
            :style="{
              '--bar-color': tienda.segundosRestantes < 120 ? 'var(--sinopia)' : 'var(--darkred)',
            }"
          />
        </div>
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import Panel from 'primevue/panel'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import AsientosMap from '@/components/asientos/AsientosMap.vue'
import { useReservaStore } from '@/stores/reserva'
import { getAsientosPorFuncion, bloquearAsientos } from '@/services/reservaService'
import { isApiError } from '@/services/api'
import { getCurrentUserId } from '@/services/movieService'
import { getUsuarioActual, rutaPorRol } from '@/services/authService'
// NavBar para mostrar el menú de usuario
import NavBar from '@/components/NavBar.vue'

const MINUTOS_BLOQUEO = 10

const tienda = useReservaStore()
const enrutador = useRouter()
const toast = useToast()

const cargando = ref(true)
const errorCarga = ref<string | null>(null)
const bloqueando = ref(false)

const progresoTemporizador = computed(() => Math.round((tienda.segundosRestantes / 600) * 100))

async function cargarAsientos() {
  if (!tienda.funcionActual) {
    enrutador.push('/')
    return
  }

  cargando.value = true
  errorCarga.value = null
  try {
    const data = await getAsientosPorFuncion(tienda.funcionActual.id)
    tienda.construirMapaAsientosDesdeBackend(data)
  } catch (error) {
    errorCarga.value =
      error instanceof Error ? error.message : 'No se pudo cargar el mapa de asientos'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarAsientos)

// No limpiamos el temporizador al desmontar: este componente se desmonta
// justo al navegar a /pago tras bloquear los asientos, que es exactamente
// cuando el temporizador debe seguir corriendo (representa el tiempo real
// del bloqueo en el backend). Limpiarlo aquí lo mataba apenas arrancaba.

async function manejarConflicto() {
  if (!tienda.funcionActual) return
  try {
    const data = await getAsientosPorFuncion(tienda.funcionActual.id)
    const codigosConflicto = tienda.sincronizarTrasConflicto(data)
    toast.add({
      severity: 'error',
      summary: 'Asientos no disponibles',
      detail: codigosConflicto.length
        ? `Otro usuario tomó ${codigosConflicto.join(', ')} mientras elegías. El mapa fue actualizado.`
        : 'Alguno de tus asientos ya no está disponible. El mapa fue actualizado.',
      group: 'conflicto',
      life: 6000,
    })
  } catch {
    errorCarga.value = 'No se pudo actualizar el mapa de asientos. Intenta de nuevo.'
  }
}

async function irAPago() {
  if (tienda.asientosSeleccionados.length === 0 || bloqueando.value) return

  bloqueando.value = true
  try {
    await bloquearAsientos(
      tienda.funcionActual!.id,
      tienda.idsSeleccionados,
      MINUTOS_BLOQUEO,
      tienda.idUsuarioReserva ? Number(tienda.idUsuarioReserva) : getCurrentUserId(),
    )
    enrutador.push('/pago')
  } catch (error) {
    if (isApiError(error) && error.status === 409) {
      await manejarConflicto()
    } else {
      toast.add({
        severity: 'error',
        summary: 'No se pudo continuar',
        detail: isApiError(error) ? error.message : 'Intenta de nuevo.',
        life: 5000,
      })
    }
  } finally {
    bloqueando.value = false
  }
}

function irAHome() {
  tienda.limpiarSeleccion()
  tienda.limpiarClienteReserva()
  tienda.limpiarTemporizador()
  const usuario = getUsuarioActual()
  enrutador.push(usuario ? rutaPorRol(usuario.rol) : '/')
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

.estado-carga {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.estado-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 0;
  color: var(--text3);
  font-size: 13px;
  text-align: center;
}

.estado-error .pi {
  font-size: 22px;
  color: var(--sinopia);
}

.meta-funcion {
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ── Back btn ── */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--text3);
  font-size: 13px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  padding: 8px 0;
  margin-bottom: 12px;
  transition: color 0.2s;
}

.back-btn::before {
  content: '←';
}

.back-btn:hover {
  color: var(--text2);
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
  transition:
    background 0.3s,
    border-color 0.3s;
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
  transition: all 0.2s ease;
}

.chips-leave-active {
  transition: all 0.15s ease;
}

.chips-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.chips-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.chips-move {
  transition: transform 0.2s ease;
}
</style>
