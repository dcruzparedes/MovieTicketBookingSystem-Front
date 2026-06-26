import { api } from './api'

export interface Sala {
  id: string
  nombre: string
  id_cine: string
  filas: number
  columnas: number
  created_at: string
}

export interface CreateSalaPayload {
  nombre: string
  id_cine: number
  filas: number
  columnas: number
}

export async function createSala(payload: CreateSalaPayload): Promise<Sala> {
  return api.post<Sala>('/salas', payload)
}
