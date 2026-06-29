import { api } from './api'

export interface CrearPagoPayload {
  id_reserva: number
  monto_original: string
  monto_descuento: string
  monto_final: string
  metodo: string
  id_cupon?: number
}

export interface CrearPagoEfectivoPayload {
  id_reserva: number
  monto_original: string
  monto_descuento: string
  monto_final: string
  id_cupon?: number
}

export interface PagoCreado {
  id: string
  id_reserva: string
  monto_original: string
  monto_descuento: string
  monto_final: string
  metodo: string
  estado: string
}

export function crearPago(payload: CrearPagoPayload) {
  return api.post<PagoCreado>('/pagos', payload)
}

export function crearPagoEfectivo(payload: CrearPagoEfectivoPayload) {
  return api.post<PagoCreado>('/pagos/efectivo', payload)
}
