import { api } from './api'

export interface Rol {
  id: number
  nombre: string
}

export function listarRoles() {
  return api.get<Rol[]>('/roles')
}
