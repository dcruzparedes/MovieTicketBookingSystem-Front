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
