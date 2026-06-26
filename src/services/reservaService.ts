import { api } from './api'
import type { EstadoAsientoBackend, TipoAsiento } from '@/stores/reserva'

export interface AsientoFuncionBackend {
  id: string
  estado: EstadoAsientoBackend
  asientos: {
    fila: string
    columna: number
    codigo: string
    tipo: TipoAsiento
  }
}

export function getAsientosPorFuncion(idFuncion: string | number) {
  return api.get<AsientoFuncionBackend[]>(`/funciones/${idFuncion}/asientos`)
}

export interface BloqueoAsientosResponse {
  message: string
  bloqueado_hasta: string
}

export function bloquearAsientos(
  idFuncion: string | number,
  idsAsientosFuncion: string[],
  minutos: number,
) {
  return api.post<BloqueoAsientosResponse>(`/funciones/${idFuncion}/asientos/bloquear`, {
    ids_asientos_funcion: idsAsientosFuncion.map(Number),
    minutos,
  })
}
