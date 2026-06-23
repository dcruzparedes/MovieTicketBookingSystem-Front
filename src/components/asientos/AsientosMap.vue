<template>
  <div class="mapa-asientos" :class="{ 'modo-preview': preview }">
    <!-- Pantalla -->
    <div class="etiqueta-pantalla">Pantalla</div>
    <div class="barra-pantalla"></div>

    <!-- Grid -->
    <div class="scroll-asientos">
      <div class="grilla-asientos">
        <div v-for="fila in etiquetasFilas" :key="fila" class="fila-asientos">
          <div class="etiqueta-fila">{{ fila }}</div>
          <div
            v-for="asiento in asientosPorFila(fila)"
            :key="asiento.codigo"
            :class="claseAsiento(asiento)"
            @click="manejarClick(asiento)"
          >
            {{ asiento.columna }}
          </div>
        </div>
      </div>
    </div>

    <!-- Leyenda (oculta en modo preview) -->
    <div v-if="!preview" class="leyenda-asientos">
      <div class="item-leyenda">
        <div class="punto-leyenda disponible"></div>
        <span>Disponible</span>
      </div>
      <div class="item-leyenda">
        <div class="punto-leyenda seleccionado"></div>
        <span>Seleccionado</span>
      </div>
      <div class="item-leyenda">
        <div class="punto-leyenda ocupado"></div>
        <span>Ocupado</span>
      </div>
      <div class="item-leyenda">
        <div class="punto-leyenda vip"></div>
        <span>VIP</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReservaStore } from '@/stores/reserva'
import type { Asiento } from '@/stores/reserva'

const props = withDefaults(
  defineProps<{
    preview?: boolean
    filas?: number
    columnas?: number
  }>(),
  { preview: false, filas: undefined, columnas: undefined },
)

const tienda = useReservaStore()

const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const asientosPreview = computed<Asiento[]>(() => {
  const cantFilas = Math.max(1, Math.min(26, props.filas ?? 8))
  const cantCols = Math.max(1, Math.min(30, props.columnas ?? 10))
  const resultado: Asiento[] = []
  for (let r = 0; r < cantFilas; r++) {
    const fila = ROW_LABELS[r] ?? ''
    for (let c = 1; c <= cantCols; c++) {
      resultado.push({
        id: `p-${fila}${c}`,
        codigo: `${fila}${c}`,
        fila,
        columna: c,
        tipo: 'regular',
        estado: 'disponible',
        estadoReal: 'disponible',
      })
    }
  }
  return resultado
})

const asientosActivos = computed(() => (props.preview ? asientosPreview.value : tienda.asientos))

const etiquetasFilas = computed(() => {
  const filas = new Set(asientosActivos.value.map((a) => a.fila))
  return [...filas]
})

function asientosPorFila(fila: string): Asiento[] {
  return asientosActivos.value.filter((a) => a.fila === fila)
}

function claseAsiento(asiento: Asiento) {
  return ['asiento', asiento.estado]
}

function manejarClick(asiento: Asiento) {
  if (props.preview) return
  if (asiento.estado === 'ocupado') return
  tienda.alternarAsiento(asiento.codigo)
}
</script>

<style scoped>
.mapa-asientos {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.etiqueta-pantalla {
  text-align: center;
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 5px;
  width: 100%;
  max-width: 420px;
}

.barra-pantalla {
  background: var(--orange);
  opacity: 0.25;
  border-radius: 2px;
  height: 3px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto 22px;
}

.scroll-asientos { overflow-x: auto; }

.grilla-asientos {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
}

.fila-asientos {
  display: flex;
  gap: 6px;
  align-items: center;
}

.etiqueta-fila {
  width: 20px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: var(--text3);
  flex-shrink: 0;
}

/* ── Asiento base ── */
.asiento {
  width: 28px;
  height: 24px;
  border-radius: 4px 4px 2px 2px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  transition: all 0.12s;
  cursor: pointer;
  user-select: none;
}

.asiento.disponible {
  background: var(--bg);
  border-color: var(--border2);
  color: var(--text3);
}
.asiento.disponible:hover {
  background: rgba(243, 80, 10, 0.12);
  border-color: var(--tangelo);
  color: var(--tangelo);
}
.asiento.seleccionado {
  background: var(--tangelo);
  border-color: var(--tangelo);
  color: #fff;
}
.asiento.ocupado {
  background: rgba(42, 10, 6, 0.07);
  border-color: rgba(42, 10, 6, 0.15);
  color: rgba(42, 10, 6, 0.25);
  cursor: not-allowed;
}
.asiento.vip {
  background: rgba(243, 113, 0, 0.08);
  border-color: rgba(243, 113, 0, 0.3);
  color: rgba(243, 113, 0, 0.5);
}
.asiento.vip:hover {
  background: rgba(243, 113, 0, 0.18);
  border-color: var(--orange);
  color: var(--orange);
}

/* ── Modo preview ── */
.modo-preview .asiento {
  cursor: default;
  pointer-events: none;
}

/* ── Leyenda ── */
.leyenda-asientos {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  flex-wrap: wrap;
}
.item-leyenda {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text2);
}
.punto-leyenda {
  width: 14px;
  height: 12px;
  border-radius: 3px 3px 2px 2px;
  border: 1px solid;
}
.punto-leyenda.disponible  { background: var(--bg); border-color: var(--border2); }
.punto-leyenda.seleccionado { background: var(--tangelo); border-color: var(--tangelo); }
.punto-leyenda.ocupado     { background: rgba(42,10,6,.07); border-color: rgba(42,10,6,.15); }
.punto-leyenda.vip         { background: rgba(243,113,0,.08); border-color: rgba(243,113,0,.3); }
</style>
