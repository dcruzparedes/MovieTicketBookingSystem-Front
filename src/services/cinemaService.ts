import { api } from './api'

export interface Cine {
  id: string
  nombre: string
  id_ciudad: string
  direccion: string | null
  created_at: string
}

export interface CreateCinePayload {
  nombre: string
  id_ciudad: number
  direccion: string
}

export interface UpdateCinePayload {
  nombre?: string
  id_ciudad?: number
  direccion?: string
}

export async function getCines(): Promise<Cine[]> {
  return api.get<Cine[]>('/cines')
}

export async function createCine(payload: CreateCinePayload): Promise<Cine> {
  return api.post<Cine>('/cines', payload)
}

export async function updateCine(id: number, payload: UpdateCinePayload): Promise<void> {
  await api.put<unknown>(`/cines/${id}`, payload)
}

export async function getCineFunciones(id: number): Promise<unknown[]> {
  return api.get<unknown[]>(`/cines/${id}/funciones`)
}