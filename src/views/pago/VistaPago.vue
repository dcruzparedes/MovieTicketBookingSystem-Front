<template>
  <div class="vista-pago">
    <div class="pago-layout">

      <!-- Columna izquierda: formulario -->
      <div class="pago-form">
        <button class="btn-volver" @click="enrutador.push('/asientos')">
          ← Cambiar asientos
        </button>

        <div class="pago-titulo">Confirmar pago</div>

        <!-- Sección 1: Método de pago -->
        <div class="seccion-pago">
          <div class="seccion-titulo">
            <span class="paso-dot">1</span>
            Método de pago
          </div>
          <MetodoPago />
        </div>

        <!-- Sección 2: Cupón -->
        <div class="seccion-pago">
          <div class="seccion-titulo">
            <span class="paso-dot">2</span>
            Cupón de descuento
          </div>
          <CuponDescuento />
        </div>

        <!-- Sección 3: Resumen -->
        <div class="seccion-pago">
          <div class="seccion-titulo">
            <span class="paso-dot">3</span>
            Resumen
          </div>
          <ResumenReserva />
        </div>

        <!-- Acciones -->
        <div class="pago-acciones">
          <Button label="Confirmar y pagar" fluid size="large" @click="confirmarPago" />
          <Button label="Simular error de pago" severity="danger" outlined size="small" @click="simularError" />
        </div>

        <div class="pago-seguro">
          🔒 Pago seguro · Asientos reservados por
          <span class="timer-inline">{{ tienda.temporizadorFormateado }}</span>
        </div>
      </div>

      <!-- Columna derecha: resumen compacto -->
      <div class="pago-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-titulo">Resumen</div>
          <div class="sidebar-pelicula">
            {{ tienda.funcionActual?.tituloPelicula ?? 'Alien: Romulus' }}
          </div>
          <div class="sidebar-meta">19:15 · Vie 12 Jun</div>

          <div class="sidebar-asientos">
            <Tag v-for="codigo in tienda.asientosSeleccionados" :key="codigo" :value="codigo" severity="warn"
              style="font-family: 'DM Mono', monospace; font-size: 11px" />
          </div>

          <Divider />

          <div class="sidebar-total">
            <span>Total</span>
            <span class="sidebar-total-val">L. {{ tienda.totalFinal.toFixed(2) }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import MetodoPago from '@/components/pago/MetodoPago.vue'
import CuponDescuento from '@/components/pago/CuponDescuento.vue'
import ResumenReserva from '@/components/pago/ResumenReserva.vue'
import { useReservaStore } from '@/stores/reserva'

const tienda = useReservaStore()
const enrutador = useRouter()

function confirmarPago() {
  enrutador.push('/confirmacion')
}

function simularError() {
  enrutador.push('/error-pago')
}
</script>

<style scoped>
.vista-pago {
  background: var(--bg);
  min-height: 100vh;
}

.btn-volver {
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

.btn-volver:hover {
  color: var(--sinopia);
}

.pago-layout {
  max-width: 860px;
  margin: 0 auto;
  padding: 28px 24px;
  display: flex;
  gap: 22px;
  align-items: flex-start;
}

.pago-form {
  flex: 1;
}

.pago-titulo {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  color: var(--text);
  margin-bottom: 18px;
}

/* ── Secciones ── */
.seccion-pago {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 12px;
}

.seccion-titulo {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.paso-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--darkred);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Acciones ── */
.pago-acciones {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.pago-seguro {
  text-align: center;
  font-size: 11px;
  color: var(--text3);
}

.timer-inline {
  color: var(--sinopia);
  font-family: 'DM Mono', monospace;
}

/* ── Sidebar ── */
.pago-sidebar {
  width: 220px;
  flex-shrink: 0;
}

.sidebar-card {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 18px;
  position: sticky;
  top: 16px;
}

.sidebar-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}

.sidebar-pelicula {
  font-family: 'DM Serif Display', serif;
  font-size: 15px;
  color: var(--text);
  margin-bottom: 4px;
}

.sidebar-meta {
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 10px;
}

.sidebar-asientos {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.sidebar-total {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.sidebar-total-val {
  color: var(--sinopia);
  font-family: 'DM Mono', monospace;
}
</style>
