import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Tipos del backend ──
export type EstadoAsientoBackend = 'disponible' | 'bloqueado' | 'reservado' | 'vendido'
export type TipoAsiento = 'regular' | 'vip' | 'reclinable'

// ── Tipos visuales del mapa ──
export type EstadoAsiento = 'disponible' | 'ocupado' | 'seleccionado' | 'vip'

export interface Asiento {
  id: string // BigInt serializado como string
  codigo: string // ej. "B5"
  fila: string
  columna: number
  tipo: TipoAsiento // viene del backend
  estado: EstadoAsiento // estado visual en el mapa
  estadoReal: EstadoAsientoBackend // estado real del backend
}

export interface Funcion {
  id: string
  tituloPelicula: string
  cine: string
  sala: string
  fecha: string
  hora: string
  formato: string
}

// ── Mock de asientos para desarrollo (sin backend) ──
interface AsientoMock {
  id: string
  codigo: string
  fila: string
  columna: number
  tipo: TipoAsiento
  estadoReal: EstadoAsientoBackend
}

function generarMockAsientos(cantFilas: number, cantColumnas: number): AsientoMock[] {
  const etiquetas: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const OCUPADOS_MOCK = [
    'A3',
    'A7',
    'B2',
    'B5',
    'B9',
    'C4',
    'D1',
    'D6',
    'E3',
    'E8',
    'F2',
    'F5',
    'G4',
    'G7',
    'H1',
    'H8',
  ]
  const FILAS_VIP_MOCK = ['G', 'H']
  const resultado: AsientoMock[] = []
  let idCounter = 1

  for (let f = 0; f < cantFilas; f++) {
    const etiquetaFila = etiquetas[f]
    if (!etiquetaFila) continue

    for (let c = 1; c <= cantColumnas; c++) {
      const codigo = `${etiquetaFila}${c}`
      resultado.push({
        id: String(idCounter++),
        codigo,
        fila: etiquetaFila,
        columna: c,
        tipo: FILAS_VIP_MOCK.includes(etiquetaFila) ? 'vip' : 'regular',
        estadoReal: OCUPADOS_MOCK.includes(codigo) ? 'reservado' : 'disponible',
      })
    }
  }
  return resultado
}

// ── Mapeo de estado backend → estado visual ──
function mapearEstado(estadoReal: EstadoAsientoBackend, tipo: TipoAsiento): EstadoAsiento {
  if (estadoReal === 'disponible') {
    return tipo === 'vip' || tipo === 'reclinable' ? 'vip' : 'disponible'
  }
  return 'ocupado' // bloqueado | reservado | vendido → ocupado visualmente
}

export const useReservaStore = defineStore('reserva', () => {
  // ── Función seleccionada ──
  const funcionActual = ref<Funcion | null>(null)

  // ── Mapa de asientos ──
  const asientos = ref<Asiento[]>([])
  const filas = ref(8)
  const columnas = ref(10)

  function construirMapaAsientos(
    cantFilas: number,
    cantColumnas: number,
    asientosMock?: AsientoMock[],
  ) {
    filas.value = cantFilas
    columnas.value = cantColumnas

    const fuente = asientosMock ?? generarMockAsientos(cantFilas, cantColumnas)

    asientos.value = fuente.map((a) => ({
      ...a,
      estado: mapearEstado(a.estadoReal, a.tipo),
    }))
  }

  // ── Selección ──
  const asientosSeleccionados = ref<string[]>([]) // códigos ej. ["B3", "C4"]
  const idsSeleccionados = ref<string[]>([]) // IDs del backend ej. ["55", "56"]
  const MAX_ASIENTOS = 8

  function alternarAsiento(codigo: string) {
    const asiento = asientos.value.find((a) => a.codigo === codigo)
    if (!asiento || asiento.estado === 'ocupado') return

    const indice = asientosSeleccionados.value.indexOf(codigo)
    if (indice > -1) {
      // Deseleccionar
      asientosSeleccionados.value.splice(indice, 1)
      idsSeleccionados.value.splice(indice, 1)
      asiento.estado = mapearEstado(asiento.estadoReal, asiento.tipo)
    } else {
      // Seleccionar
      if (asientosSeleccionados.value.length >= MAX_ASIENTOS) return
      asientosSeleccionados.value.push(codigo)
      idsSeleccionados.value.push(asiento.id)
      asiento.estado = 'seleccionado'
    }
  }

  function limpiarSeleccion() {
    asientos.value.forEach((a) => {
      if (a.estado === 'seleccionado') {
        a.estado = mapearEstado(a.estadoReal, a.tipo)
      }
    })
    asientosSeleccionados.value = []
    idsSeleccionados.value = []
  }

  // ── Precios ──
  const PRECIO_REGULAR = 120
  const PRECIO_VIP = 180
  const PRECIO_RECLINABLE = 220

  const preciosPorTipo: Record<TipoAsiento, number> = {
    regular: PRECIO_REGULAR,
    vip: PRECIO_VIP,
    reclinable: PRECIO_RECLINABLE,
  }

  const subtotal = computed(() => {
    return asientosSeleccionados.value.reduce((acum, codigo) => {
      const asiento = asientos.value.find((a) => a.codigo === codigo)
      const precio = asiento ? (preciosPorTipo[asiento.tipo] ?? PRECIO_REGULAR) : PRECIO_REGULAR
      return acum + precio
    }, 0)
  })

  // ── Temporizador ──
  const segundosRestantes = ref(600)
  let intervaloTemporizador: ReturnType<typeof setInterval> | null = null

  function iniciarTemporizador() {
    limpiarTemporizador()
    segundosRestantes.value = 600
    intervaloTemporizador = setInterval(() => {
      if (segundosRestantes.value > 0) {
        segundosRestantes.value--
      } else {
        limpiarTemporizador()
        limpiarSeleccion()
      }
    }, 1000)
  }

  function limpiarTemporizador() {
    if (intervaloTemporizador) {
      clearInterval(intervaloTemporizador)
      intervaloTemporizador = null
    }
  }

  const temporizadorFormateado = computed(() => {
    const minutos = Math.floor(segundosRestantes.value / 60)
    const segundos = segundosRestantes.value % 60
    return `${minutos}:${String(segundos).padStart(2, '0')}`
  })

  // ── Conflicto de concurrencia (error 409 del backend) ──
  const asientosEnConflicto = ref<string[]>([]) // códigos ej. ["B3", "B4"]

  function aplicarConflicto(codigosTomados: string[]) {
    asientosEnConflicto.value = codigosTomados
    codigosTomados.forEach((codigo) => {
      const asiento = asientos.value.find((a) => a.codigo === codigo)
      if (asiento) {
        asiento.estadoReal = 'reservado'
        asiento.estado = 'ocupado'
      }
      const indice = asientosSeleccionados.value.indexOf(codigo)
      if (indice > -1) {
        asientosSeleccionados.value.splice(indice, 1)
        idsSeleccionados.value.splice(indice, 1)
      }
    })
  }

  function limpiarConflicto() {
    asientosEnConflicto.value = []
  }

  return {
    // Estado
    funcionActual,
    asientos,
    filas,
    columnas,
    asientosSeleccionados,
    idsSeleccionados,
    subtotal,
    MAX_ASIENTOS,
    // Acciones del mapa
    construirMapaAsientos,
    alternarAsiento,
    limpiarSeleccion,
    // Temporizador
    segundosRestantes,
    temporizadorFormateado,
    iniciarTemporizador,
    limpiarTemporizador,
    // Conflictos
    asientosEnConflicto,
    aplicarConflicto,
    limpiarConflicto,
  }
})
