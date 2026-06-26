import { api } from './api'

export interface Funcion {
  id: string
  id_pelicula: string
  id_sala: string
  fecha_hora: string
  estado: string
  created_at: string
}

export interface CreateFuncionPayload {
  id_pelicula: number
  id_sala: number
  fecha_hora: string
  estado: string
}

export async function createFuncion(payload: CreateFuncionPayload): Promise<Funcion> {
  return api.post<Funcion>('/funciones', payload)
}
