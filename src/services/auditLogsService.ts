import { api } from './api'

export interface AuditLog {
  id: string
  id_usuario: string | null
  id_auditor: string | null
  accion: string
  detalle: string | null
  created_at: string
  usuarios: { id: string; nombre: string; email: string } | null
  realizado_por: { id: string; nombre: string; email: string } | null
}

export interface AuditLogsFilter {
  accion?: string
  id_usuario?: number
  id_auditor?: number
  fecha_inicio?: string
  fecha_final?: string
  q?: string
  page?: number
  limit?: number
}

export interface AuditLogsRes {
  data: AuditLog[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export async function getAuditLogs(filters: AuditLogsFilter = {}): Promise<AuditLogsRes> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  const qs = params.toString()
  return api.get<AuditLogsRes>(`/audit-logs${qs ? '?' + qs : ''}`)
}
