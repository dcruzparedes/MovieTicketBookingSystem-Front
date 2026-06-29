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

export interface PerfilUsuario {
  id: string
  nombre: string
  email: string
  telefono: string | null
  notificaciones_activas: boolean
  estado: string
}

export function obtenerUsuario(id: number) {
  return api.get<PerfilUsuario>(`/usuarios/${id}`)
}

export interface ActualizarPerfilPayload {
  nombre?: string
  email?: string
  telefono?: string
}

export function actualizarPerfil(id: number, payload: ActualizarPerfilPayload) {
  return api.put<PerfilUsuario>(`/usuarios/${id}`, payload)
}

export function actualizarPassword(id: number, oldPassword: string, newPassword: string) {
  return api.put<{ message: string }>(`/usuarios/${id}/password`, { oldPassword, newPassword })
}

export function alternarNotificaciones(id: number) {
  return api.patch<string>(`/usuarios/${id}/notifications`, {})
}

export interface ClienteAdmin {
  id: string
  nombre: string
  email: string
  telefono: string | null
  estado: string
  created_at: string
  reservas_count: number
  roles: { nombre: string }
}

export interface ClientesPaginados {
  data: ClienteAdmin[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ClientesFiltro {
  q?: string
  estado?: string
  page?: number
  limit?: number
}

export function listarClientes(filtro: ClientesFiltro = {}) {
  const params = new URLSearchParams()
  if (filtro.q) params.set('q', filtro.q)
  if (filtro.estado) params.set('estado', filtro.estado)
  params.set('page', String(filtro.page ?? 1))
  params.set('limit', String(filtro.limit ?? 10))
  return api.get<ClientesPaginados>(`/usuarios?${params.toString()}`)
}

export function cambiarEstadoCliente(id: number, status: 'activo' | 'inactivo' | 'bloqueado') {
  return api.patch<{ message: string; id: number; status: string }>(`/usuarios/${id}/status`, {
    body: JSON.stringify({ status }),
  })
}

export interface UsuarioAdmin {
  id: string
  nombre: string
  email: string
  telefono: string | null
  estado: string
  created_at: string
  roles: { id: string; nombre: string }
}

export interface UsuariosPaginados {
  data: UsuarioAdmin[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface AdminCrearUsuarioPayload {
  nombre: string
  email: string
  password: string
  telefono?: string
  rolId: number
}

export function listarTodosUsuarios(filtro: ClientesFiltro = {}) {
  const params = new URLSearchParams()
  if (filtro.q) params.set('q', filtro.q)
  if (filtro.estado) params.set('estado', filtro.estado)
  params.set('page', String(filtro.page ?? 1))
  params.set('limit', String(filtro.limit ?? 20))
  return api.get<UsuariosPaginados>(`/usuarios/todos?${params.toString()}`)
}

export function adminCrearUsuario(payload: AdminCrearUsuarioPayload) {
  return api.post<UsuarioAdmin>('/usuarios/admin-create', payload)
}

export function actualizarRolUsuario(id: string, rolId: number) {
  return api.patch<UsuarioAdmin>(`/usuarios/${id}/rol`, { rolId })
}

export function actualizarEstadoUsuario(id: string, status: 'activo' | 'inactivo') {
  return api.patch<{ message: string; id: string; status: string }>(`/usuarios/${id}/status`, { status })
}

export function eliminarUsuario(id: string) {
  return api.delete<{ message: string }>(`/usuarios/${id}`)
}
