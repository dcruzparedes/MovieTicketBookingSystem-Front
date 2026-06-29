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

export interface UpdateFuncionPayload {
  id_pelicula?: number
  id_sala?: number
  fecha_hora?: string
  estado?: string
}

// Flat row used by the FuncionesView table
export interface FuncionRow {
  id: string
  id_pelicula: string
  id_sala: string
  peliculaTitulo: string
  cinemaNombre: string
  salaNombre: string
  fecha: string // YYYY-MM-DD
  hora: string  // HH:MM
  estado: string
}

// Raw shapes from GET /peliculas (which embeds funciones)
interface RawFuncionSala {
  id: string
  nombre: string
  cines?: { nombre: string }
}

interface RawFuncion {
  id: string
  id_pelicula: string
  fecha_hora: string
  estado: string
  salas: RawFuncionSala
}

interface RawPelicula {
  id: string
  titulo: string
  funciones?: RawFuncion[]
}

function mapToRow(f: RawFuncion, peliculaTitulo: string): FuncionRow {
  const [datePart, timePart] = f.fecha_hora.split('T')
  return {
    id: String(f.id),
    id_pelicula: String(f.id_pelicula),
    id_sala: String(f.salas?.id ?? ''),
    peliculaTitulo,
    cinemaNombre: f.salas?.cines?.nombre ?? '—',
    salaNombre: f.salas?.nombre ?? '—',
    fecha: datePart ?? '',
    hora: (timePart ?? '').substring(0, 5),
    estado: f.estado,
  }
}

export async function getFunciones(): Promise<FuncionRow[]> {
  const peliculas = await api.get<RawPelicula[]>('/peliculas')
  const rows: FuncionRow[] = []
  for (const p of peliculas) {
    for (const f of p.funciones ?? []) {
      rows.push(mapToRow(f, p.titulo))
    }
  }
  rows.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
  return rows
}

export async function getFuncion(id: string): Promise<FuncionRow | null> {
  const all = await getFunciones()
  return all.find((f) => f.id === id) ?? null
}

export async function getReservasActivasCount(id: string): Promise<number> {
  const reservas = await api.get<unknown[]>(`/funciones/${id}/reservas-activas`)
  return reservas.length
}

export async function createFuncion(payload: CreateFuncionPayload): Promise<Funcion> {
  return api.post<Funcion>('/funciones', payload)
}

export async function updateFuncion(id: string, payload: UpdateFuncionPayload): Promise<Funcion> {
  return api.patch<Funcion>(`/funciones/${id}`, payload)
}

export async function cancelarFuncion(id: string): Promise<void> {
  await api.patch<unknown>(`/funciones/${id}/cancelar`, {})
}
