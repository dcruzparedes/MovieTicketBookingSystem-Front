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

export interface UpdateSalaPayload {
  nombre?: string
  id_cine?: number
  filas?: number
  columnas?: number
}

export async function getSala(id: number): Promise<Sala> {
  return api.get<Sala>(`/salas/${id}`)
}

export async function createSala(payload: CreateSalaPayload): Promise<Sala> {
  return api.post<Sala>('/salas', payload)
}

export async function updateSala(id: number, payload: UpdateSalaPayload): Promise<void> {
  await api.put<unknown>(`/salas/${id}`, payload)
}
