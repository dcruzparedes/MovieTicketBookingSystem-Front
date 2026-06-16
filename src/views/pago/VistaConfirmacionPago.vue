<template>
  <div class="vista-confirmacion">
    <div class="confirmacion-card animado" style="--delay: 0ms">

      <!-- Ícono de éxito -->
      <div class="icono-wrap animado" style="--delay: 80ms">
        <Avatar icon="pi pi-check" size="xlarge" :style="{
          background: 'rgba(30,120,60,0.1)',
          color: '#1e783c',
          border: '1.5px solid rgba(30,120,60,0.3)',
          width: '64px',
          height: '64px',
          fontSize: '26px'
        }" shape="circle" />
      </div>

      <div class="confirmacion-titulo animado" style="--delay: 140ms">¡Reserva confirmada!</div>
      <div class="confirmacion-sub animado" style="--delay: 180ms">
        <i class="pi pi-envelope" style="font-size: 12px" />
        Te enviamos los detalles a tu correo electrónico
      </div>

      <!-- Ticket -->
      <div class="ticket-card animado" style="--delay: 220ms">
        <div class="ticket-codigo">{{ numeroReserva }}</div>

        <div class="ticket-fila">
          <span><i class="pi pi-video" /> Película</span>
          <span>{{ tienda.funcionActual?.tituloPelicula ?? 'Alien: Romulus' }}</span>
        </div>
        <div class="ticket-fila">
          <span><i class="pi pi-calendar" /> Fecha</span>
          <span>Viernes 12 Jun, 2026</span>
        </div>
        <div class="ticket-fila">
          <span><i class="pi pi-clock" /> Hora</span>
          <span>19:15 · 3D</span>
        </div>
        <div class="ticket-fila">
          <span><i class="pi pi-map-marker" /> Sala</span>
          <span>Sala 4 — Cine Vicenta</span>
        </div>
        <div class="ticket-fila">
          <span><i class="pi pi-th-large" /> Asientos</span>
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
      <div class="confirmacion-acciones animado" style="--delay: 300ms">
        <Button label="Ver más películas" icon="pi pi-film" @click="enrutador.push('/')" />
        <Button label="Mis reservas" icon="pi pi-ticket" severity="secondary" outlined
          @click="enrutador.push({ path: '/perfil', query: { tab: 'reservas' } })" />
        <Button icon="pi pi-print" severity="secondary" text v-tooltip="'Imprimir ticket'" @click="imprimir" />
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
import Avatar from 'primevue/avatar'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
const enrutador = useRouter()

const numeroReserva = computed(() => {
  const num = Math.floor(Math.random() * 9000 + 1000)
  return `RES-2026-0${num}`
})

function imprimir() {
  window.print()
}
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

.icono-wrap {
  margin: 0 auto 16px;
  display: flex;
  justify-content: center;
}

.confirmacion-titulo {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  color: var(--text);
  margin-bottom: 6px;
}

.confirmacion-sub {
  font-size: 13px;
  color: var(--text3);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  margin-bottom: 8px;
}

.ticket-fila span:first-child {
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 5px;
}

.ticket-fila span:first-child .pi {
  font-size: 11px;
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
  font-size: 14px;
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
  align-items: center;
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
