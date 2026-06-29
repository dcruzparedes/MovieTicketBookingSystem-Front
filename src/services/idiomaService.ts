import { api } from './api'

export interface Idioma {
  id: string
  nombre: string
}

export async function getIdiomas(): Promise<Idioma[]> {
  return api.get<Idioma[]>('/idiomas')
}

export async function createIdioma(nombre: string): Promise<Idioma> {
  return api.post<Idioma>('/idiomas', { nombre })
}

export async function updateIdioma(id: string, nombre: string): Promise<Idioma> {
  return api.patch<Idioma>(`/idiomas/${id}`, { nombre })
}

export async function deleteIdioma(id: string): Promise<unknown> {
  return api.delete<unknown>(`/idiomas/${id}`)
}
