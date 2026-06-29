import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AsientoFuncionBackend } from '@/services/reservaService'

// ── Tipos del backend ──
export type EstadoAsientoBackend = 'disponible' | 'bloqueado' | 'reservado' | 'vendido'
export type TipoAsiento = 'VIP' | 'ESTANDAR'

// ── Tipos visuales del mapa ──
export type EstadoAsiento = 'disponible' | 'ocupado' | 'bloqueado' | 'seleccionado' | 'vip'

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

// ── Mapeo de estado backend → estado visual ──
function mapearEstado(estadoReal: EstadoAsientoBackend, tipo: TipoAsiento): EstadoAsiento {
  if (estadoReal === 'bloqueado') return 'bloqueado'
  if (estadoReal === 'reservado' || estadoReal === 'vendido') return 'ocupado'
  return tipo === 'VIP' ? 'vip' : 'disponible'
}

export const useReservaStore = defineStore('reserva', () => {
  // ── Función seleccionada ──
  const funcionActual = ref<Funcion | null>(null)

  // ── Mapa de asientos ──
  const asientos = ref<Asiento[]>([])
  const filas = ref(8)
  const columnas = ref(10)

  function construirMapaAsientosDesdeBackend(data: AsientoFuncionBackend[]) {
    filas.value = new Set(data.map((a) => a.asientos.fila)).size
    columnas.value = data.reduce((max, a) => Math.max(max, a.asientos.columna), 0)

    asientos.value = data
      .map((a) => ({
        id: a.id,
        codigo: a.asientos.codigo,
        fila: a.asientos.fila.trim(), // CHAR(2) en Postgres rellena con espacios
        columna: a.asientos.columna,
        tipo: a.asientos.tipo,
        estadoReal: a.estado,
        estado: mapearEstado(a.estado, a.asientos.tipo),
      }))
      .sort((x, y) => x.fila.localeCompare(y.fila) || x.columna - y.columna)
  }

  // ── Selección ──
  const asientosSeleccionados = ref<string[]>([]) // códigos ej. ["B3", "C4"]
  const idsSeleccionados = ref<string[]>([]) // IDs del backend ej. ["55", "56"]
  const MAX_ASIENTOS = 8

  function alternarAsiento(codigo: string) {
    const asiento = asientos.value.find((a) => a.codigo === codigo)
    if (!asiento || asiento.estado === 'ocupado' || asiento.estado === 'bloqueado') return

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

      // El temporizador arranca con la primera selección, no con el bloqueo
      // en el backend (eso pasa después, al continuar al pago).
      if (asientosSeleccionados.value.length === 1 && !intervaloTemporizador) {
        iniciarTemporizador()
      }
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
  const PRECIO_ESTANDAR = 120
  const PRECIO_VIP = 180

  const preciosPorTipo: Record<TipoAsiento, number> = {
    ESTANDAR: PRECIO_ESTANDAR,
    VIP: PRECIO_VIP,
  }

  const subtotal = computed(() => {
    return asientosSeleccionados.value.reduce((acum, codigo) => {
      const asiento = asientos.value.find((a) => a.codigo === codigo)
      const precio = asiento ? (preciosPorTipo[asiento.tipo] ?? PRECIO_ESTANDAR) : PRECIO_ESTANDAR
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

  // ── Conflicto de concurrencia (error 409 del backend al bloquear) ──
  const asientosEnConflicto = ref<string[]>([]) // códigos ej. ["B-03", "B-04"]

  // Re-construye el mapa con el estado real más reciente del backend y separa,
  // de la selección previa, los asientos que alguien más se quedó mientras tanto.
  function sincronizarTrasConflicto(data: AsientoFuncionBackend[]) {
    const seleccionPrevia = new Set(asientosSeleccionados.value)
    construirMapaAsientosDesdeBackend(data)

    const seleccionVigente: string[] = []
    const idsVigentes: string[] = []
    const codigosConflicto: string[] = []

    asientos.value.forEach((asiento) => {
      if (!seleccionPrevia.has(asiento.codigo)) return
      if (asiento.estado === 'ocupado' || asiento.estado === 'bloqueado') {
        codigosConflicto.push(asiento.codigo)
      } else {
        asiento.estado = 'seleccionado'
        seleccionVigente.push(asiento.codigo)
        idsVigentes.push(asiento.id)
      }
    })

    asientosSeleccionados.value = seleccionVigente
    idsSeleccionados.value = idsVigentes
    asientosEnConflicto.value = codigosConflicto
    return codigosConflicto
  }

  function limpiarConflicto() {
    asientosEnConflicto.value = []
  }

  // ── Pago ──
  const metodoPago = ref<'tarjeta' | 'efectivo'>('tarjeta')
  const codigoCupon = ref<string>('')
  const descuento = ref<number>(0)
  const idCupon = ref<string | null>(null)

  const totalFinal = computed(() => Math.max(0, subtotal.value - descuento.value))

  function aplicarCupon(codigo: string, tipo: 'porcentaje' | 'fijo', valor: number, id: string) {
    codigoCupon.value = codigo
    idCupon.value = id
    if (tipo === 'porcentaje') {
      descuento.value = Math.round(subtotal.value * (valor / 100))
    } else {
      descuento.value = valor
    }
  }

  function limpiarCupon() {
    codigoCupon.value = ''
    idCupon.value = null
    descuento.value = 0
  }

  function seleccionarFuncion(funcion: Funcion) {
    funcionActual.value = funcion
  }

  // ── Reserva en nombre de un cliente (flujo de recepcionista) ──
  const idUsuarioReserva = ref<string | null>(null)

  function establecerClienteReserva(idCliente: string) {
    idUsuarioReserva.value = idCliente
    metodoPago.value = 'efectivo'
  }

  function limpiarClienteReserva() {
    idUsuarioReserva.value = null
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
    construirMapaAsientosDesdeBackend,
    alternarAsiento,
    limpiarSeleccion,
    // Temporizador
    segundosRestantes,
    temporizadorFormateado,
    iniciarTemporizador,
    limpiarTemporizador,
    // Conflictos
    asientosEnConflicto,
    sincronizarTrasConflicto,
    limpiarConflicto,
    // Pago
    metodoPago,
    codigoCupon,
    descuento,
    idCupon,
    totalFinal,
    aplicarCupon,
    limpiarCupon,
    seleccionarFuncion,
    // Reserva en nombre de un cliente
    idUsuarioReserva,
    establecerClienteReserva,
    limpiarClienteReserva,
  }
})
