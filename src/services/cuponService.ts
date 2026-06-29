import { api } from './api'

export interface CuponValidado {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'fijo'
  valor: string
  usos_restantes: number | null
}

export interface ValidarCuponResponse {
  valido: boolean
  mensaje: string
  cupon?: CuponValidado
}

export function validarCupon(codigo: string) {
  return api.post<ValidarCuponResponse>('/cupones/validar', { codigo })
}
