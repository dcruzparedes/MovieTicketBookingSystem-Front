<template>
  <div class="resumen-reserva">
    <div class="linea-resumen">
      <span class="resumen-lbl">Película</span>
      <span class="resumen-val">{{ tienda.funcionActual?.tituloPelicula ?? 'Alien: Romulus' }}</span>
    </div>
    <div class="linea-resumen">
      <span class="resumen-lbl">Función</span>
      <span class="resumen-val">Vie 12 Jun · 19:15 · 3D</span>
    </div>
    <div class="linea-resumen">
      <span class="resumen-lbl">Sala</span>
      <span class="resumen-val">Sala 4 — Cine Vicenta</span>
    </div>
    <div class="linea-resumen">
      <span class="resumen-lbl">Asientos</span>
      <span class="resumen-asientos">
        <Tag
          v-for="codigo in tienda.asientosSeleccionados"
          :key="codigo"
          :value="codigo"
          severity="warn"
          class="tag-asiento"
        />
      </span>
    </div>

    <Divider />

    <div class="linea-resumen">
      <span class="resumen-lbl">Subtotal</span>
      <span class="resumen-val">L. {{ tienda.subtotal.toFixed(2) }}</span>
    </div>
    <div v-if="tienda.descuento > 0" class="linea-resumen">
      <span class="resumen-lbl">Descuento</span>
      <span class="resumen-val descuento">− L. {{ tienda.descuento.toFixed(2) }}</span>
    </div>

    <Divider />

    <div class="linea-total">
      <span>Total</span>
      <span class="total-val">L. {{ tienda.totalFinal.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
</script>

<style scoped>
.resumen-reserva { display: flex; flex-direction: column; gap: 8px; }

.linea-resumen {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 13px;
}

.resumen-lbl { color: var(--text3); flex-shrink: 0; }
.resumen-val { color: var(--text); font-weight: 500; text-align: right; }
.resumen-val.descuento { color: var(--success); }

.resumen-asientos {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.tag-asiento { font-family: 'DM Mono', monospace; font-size: 11px; }

.linea-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.total-val {
  color: var(--sinopia);
  font-family: 'DM Mono', monospace;
}
</style>
