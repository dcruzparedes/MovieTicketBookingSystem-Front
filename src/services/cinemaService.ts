import { api } from './api'

export interface Cine {
  id: number
  nombre: string
  id_ciudad: number
  direccion: string | null
  created_at: string
}

export interface CreateCinePayload {
  nombre: string
  id_ciudad: number
  direccion: string
}

export async function getCines(): Promise<Cine[]> {
  return api.get<Cine[]>('/cines')
}

export async function createCine(payload: CreateCinePayload): Promise<Cine> {
  return api.post<Cine>('/cines', payload)
}