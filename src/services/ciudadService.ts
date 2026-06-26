import { api } from './api'

export interface Ciudad {
  id: string
  nombre: string
  created_at: string
}

export async function getCiudades(): Promise<Ciudad[]> {
  return api.get<Ciudad[]>('/ciudades')
}

export async function createCiudad(nombre: string): Promise<Ciudad> {
  return api.post<Ciudad>('/ciudades', { nombre })
}

export async function updateCiudad(id: string, nombre: string): Promise<Ciudad> {
  return api.patch<Ciudad>(`/ciudades/${id}`, { nombre })
}

export async function deleteCiudad(id: string): Promise<unknown> {
  return api.delete<unknown>(`/ciudades/${id}`)
}
