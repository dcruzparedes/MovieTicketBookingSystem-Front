<template>
  <div class="diseno-asientos">
    <!-- Toast para conflicto de concurrencia -->
    <Toast position="top-center" group="conflicto" @close="tienda.limpiarConflicto()">
      <template #message="slotProps">
        <div class="conflicto-toast">
          <div class="conflicto-titulo">{{ slotProps.message.summary }}</div>
          <div class="conflicto-desc">{{ slotProps.message.detail }}</div>
          <div class="conflicto-seats">
            <Tag
              v-for="codigo in tienda.asientosEnConflicto"
              :key="codigo"
              :value="codigo"
              severity="danger"
              class="conflicto-tag"
            />
          </div>
        </div>
      </template>
    </Toast>

    <!-- Mapa principal -->
    <div class="principal-asientos">
      <div class="meta-funcion">Viernes 12 Jun · 19:15 · 3D · Sala 4</div>

      <AsientosMap />

      <!-- Solo para desarrollo -->
      <Button
        label="Simular conflicto"
        severity="secondary"
        size="small"
        style="margin-top: 12px"
        @click="simularConflicto"
      />
    </div>

    <!-- Panel lateral de pedido -->
    <div class="panel-lateral">
      <div class="tarjeta-pedido">
        <div class="etiqueta-pedido">Tu pedido</div>
        <div class="titulo-pelicula">{{ tienda.funcionActual?.tituloPelicula ?? 'Alien: Romulus' }}</div>
        <div class="meta-pedido">Vie 12 Jun · 19:15 · 3D</div>
        <div class="meta-pedido">Sala 4 — Cine Vicenta</div>

        <Divider />

        <!-- Asientos seleccionados -->
        <div class="contenedor-asientos-sel">
          <template v-if="tienda.asientosSeleccionados.length">
            <Tag
              v-for="codigo in tienda.asientosSeleccionados"
              :key="codigo"
              :value="codigo"
              severity="warn"
              class="etiqueta-asiento"
            />
          </template>
          <span v-else class="pista-vacia">Selecciona al menos un asiento</span>
        </div>

        <Divider />

        <div class="linea-pedido">
          <span>Asientos</span>
          <span>{{ tienda.asientosSeleccionados.length }}</span>
        </div>
        <div class="linea-pedido">
          <span>Subtotal</span>
          <span>L. {{ tienda.subtotal.toFixed(2) }}</span>
        </div>

        <Divider />

        <div class="total-pedido">
          <span>Total</span>
          <span>L. {{ tienda.subtotal.toFixed(2) }}</span>
        </div>

        <Button
          label="Continuar al pago"
          :disabled="tienda.asientosSeleccionados.length === 0"
          fluid
          style="margin-top: 14px"
          @click="irAPago"
        />

        <!-- Temporizador -->
        <div class="caja-temporizador">
          <div class="valor-temporizador">{{ tienda.temporizadorFormateado }}</div>
          <div class="etiqueta-temporizador">Tiempo restante</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import AsientosMap from '@/components/asientos/AsientosMap.vue'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
const enrutador = useRouter()
const toast = useToast()

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
    detail: 'Otro usuario tomó estos asientos mientras elegías. El mapa fue actualizado.',
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

.principal-asientos { flex: 1; min-width: 0; }

.meta-funcion {
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 16px;
}

/* ── Toast de conflicto ── */
.conflicto-toast { display: flex; flex-direction: column; gap: 6px; }
.conflicto-titulo { font-size: 13px; font-weight: 600; }
.conflicto-desc { font-size: 12px; opacity: 0.85; line-height: 1.5; }
.conflicto-seats { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
.conflicto-tag { font-family: 'DM Mono', monospace; font-size: 11px; }

/* ── Panel lateral ── */
.panel-lateral { width: 230px; flex-shrink: 0; }

.tarjeta-pedido {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 18px;
  position: sticky;
  top: 16px;
}

.etiqueta-pedido {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 14px;
}

.titulo-pelicula {
  font-family: 'DM Serif Display', serif;
  font-size: 16px;
  color: var(--text);
  margin-bottom: 3px;
}

.meta-pedido { font-size: 12px; color: var(--text3); margin-bottom: 2px; }

.contenedor-asientos-sel {
  min-height: 38px;
  margin: 4px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.etiqueta-asiento { font-family: 'DM Mono', monospace; font-size: 11px; }

.pista-vacia { font-size: 12px; color: var(--text3); }

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

/* ── Temporizador ── */
.caja-temporizador {
  background: rgba(146, 0, 4, 0.07);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 10px;
  text-align: center;
  margin-top: 12px;
}
.valor-temporizador {
  font-family: 'DM Mono', monospace;
  font-size: 22px;
  color: var(--darkred);
  font-weight: 500;
}
.etiqueta-temporizador {
  font-size: 9px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}
</style>
