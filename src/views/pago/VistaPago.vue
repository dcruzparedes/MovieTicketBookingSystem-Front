<template>
  <div class="vista-pago">
    <NavBar @logo-click="irAHome" @home-click="irAHome" />
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
          <Button
            label="Confirmar y pagar"
            fluid
            size="large"
            :loading="procesando"
            @click="confirmarPago"
          />
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
          <div class="sidebar-meta">
            {{ tienda.funcionActual ? `${tienda.funcionActual.hora} · ${tienda.funcionActual.fecha}` : '' }}
          </div>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'
import NavBar from '@/components/NavBar.vue'
import MetodoPago from '@/components/pago/MetodoPago.vue'
import CuponDescuento from '@/components/pago/CuponDescuento.vue'
import ResumenReserva from '@/components/pago/ResumenReserva.vue'
import { useReservaStore } from '@/stores/reserva'
import { crearReserva } from '@/services/reservaService'
import { crearPago, crearPagoEfectivo } from '@/services/pagoService'
import { isApiError } from '@/services/api'
import { getCurrentUserId } from '@/services/movieService'

const tienda = useReservaStore()
const enrutador = useRouter()
const procesando = ref(false)

async function confirmarPago() {
  if (!tienda.funcionActual || procesando.value) return

  procesando.value = true
  try {
    const reserva = await crearReserva({
      id_usuario: getCurrentUserId(),
      id_funcion: Number(tienda.funcionActual.id),
      id_asientos: tienda.idsSeleccionados.map(Number),
    })

    const montoOriginal = tienda.subtotal.toFixed(2)
    const montoDescuento = tienda.descuento.toFixed(2)
    const montoFinal = tienda.totalFinal.toFixed(2)

    if (tienda.metodoPago === 'efectivo') {
      await crearPagoEfectivo({
        id_reserva: Number(reserva.id),
        monto_original: montoOriginal,
        monto_descuento: montoDescuento,
        monto_final: montoFinal,
      })
    } else {
      await crearPago({
        id_reserva: Number(reserva.id),
        monto_original: montoOriginal,
        monto_descuento: montoDescuento,
        monto_final: montoFinal,
        metodo: 'tarjeta',
      })
    }

    tienda.limpiarTemporizador()
    enrutador.push({ path: '/confirmacion', query: { numero: reserva.numero_reserva } })
  } catch (error) {
    const motivo = isApiError(error) ? error.message : 'No se pudo procesar el pago. Intenta de nuevo.'
    enrutador.push({ path: '/error-pago', query: { motivo } })
  } finally {
    procesando.value = false
  }
}

function irAHome() {
  tienda.limpiarSeleccion()
  enrutador.push('/')
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
