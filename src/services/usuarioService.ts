import { api } from './api'

export interface ClienteBackend {
  id: string
  nombre: string
  email: string
  telefono: string | null
  estado: string
}

export function buscarClientes(q: string) {
  return api.get<ClienteBackend[]>(`/usuarios/search?q=${encodeURIComponent(q)}`)
}
