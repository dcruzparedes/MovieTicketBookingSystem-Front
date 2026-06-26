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

export async function createCine(payload: CreateCinePayload): Promise<Cine> {
  return api.post<Cine>('/cines', payload)
}