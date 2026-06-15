<template>
  <div class="vista-confirmacion">
    <div class="confirmacion-card">

      <!-- Ícono de éxito -->
      <div class="icono-exito">✓</div>

      <div class="confirmacion-titulo">¡Reserva confirmada!</div>
      <div class="confirmacion-sub">Te enviamos los detalles a tu correo electrónico</div>

      <!-- Ticket -->
      <div class="ticket-card">
        <div class="ticket-codigo">{{ numeroReserva }}</div>

        <div class="ticket-fila">
          <span>Película</span>
          <span>{{ tienda.funcionActual?.tituloPelicula ?? 'Alien: Romulus' }}</span>
        </div>
        <div class="ticket-fila">
          <span>Fecha</span>
          <span>Viernes 12 Jun, 2026</span>
        </div>
        <div class="ticket-fila">
          <span>Hora</span>
          <span>19:15 · 3D</span>
        </div>
        <div class="ticket-fila">
          <span>Sala</span>
          <span>Sala 4 — Cine Vicenta</span>
        </div>
        <div class="ticket-fila">
          <span>Asientos</span>
          <span class="ticket-asientos">
            <Tag v-for="codigo in tienda.asientosSeleccionados" :key="codigo" :value="codigo" severity="warn"
              style="font-family: 'DM Mono', monospace; font-size: 11px" />
          </span>
        </div>

        <Divider />

        <div class="ticket-total">
          <span>Total pagado</span>
          <span class="ticket-total-val">L. {{ tienda.totalFinal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="confirmacion-acciones">
        <Button label="Ver más películas" @click="enrutador.push('/')" />
        <Button label="Mis reservas" severity="secondary" outlined @click="enrutador.push('/cuenta')" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
const enrutador = useRouter()

// Genera número de reserva — luego vendrá del backend
const numeroReserva = computed(() => {
  const num = Math.floor(Math.random() * 9000 + 1000)
  return `RES-2026-0${num}`
})
</script>

<style scoped>
.vista-confirmacion {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.confirmacion-card {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 14px;
  padding: 38px;
  width: 480px;
  text-align: center;
}

.icono-exito {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: rgba(30, 120, 60, 0.1);
  border: 1.5px solid rgba(30, 120, 60, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
  color: #1e783c;
}

.confirmacion-titulo {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--text);
  margin-bottom: 5px;
}

.confirmacion-sub {
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 24px;
}

/* ── Ticket ── */
.ticket-card {
  background: var(--bg);
  border-radius: 10px;
  padding: 18px;
  text-align: left;
  margin-bottom: 22px;
  border: 1px dashed var(--border2);
}

.ticket-codigo {
  font-family: 'DM Mono', monospace;
  font-size: 20px;
  font-weight: 500;
  color: var(--sinopia);
  letter-spacing: 3px;
  text-align: center;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--border);
}

.ticket-fila {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 12px;
  margin-bottom: 7px;
}

.ticket-fila span:first-child {
  color: var(--text3);
}

.ticket-fila span:last-child {
  color: var(--text);
  font-weight: 500;
  text-align: right;
}

.ticket-asientos {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: flex-end;
}

.ticket-total {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
}

.ticket-total span:first-child {
  color: var(--text2);
}

.ticket-total-val {
  color: var(--sinopia);
  font-family: 'DM Mono', monospace;
}

/* ── Acciones ── */
.confirmacion-acciones {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
