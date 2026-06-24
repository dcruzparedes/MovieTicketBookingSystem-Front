const API_BASE = import.meta.env.VITE_API_BASE_URL as string

export interface Genero {
  id: number
  nombre: string
}

export interface Idioma {
  id: number
  nombre: string
}

export interface CreatePeliculaPayload {
  titulo: string
  sinopsis?: string
  poster_url?: string
  id_genero?: number
  id_idioma?: number
  fecha_estreno?: string
  id_usuario: number
}

export async function fetchGeneros(): Promise<Genero[]> {
  const res = await fetch(`${API_BASE}/generos`)
  if (!res.ok) throw new Error(`Error al cargar géneros (${res.status})`)
  return res.json()
}

export async function fetchIdiomas(): Promise<Idioma[]> {
  const res = await fetch(`${API_BASE}/idiomas`)
  if (!res.ok) throw new Error(`Error al cargar idiomas (${res.status})`)
  return res.json()
}

export async function createPelicula(payload: CreatePeliculaPayload): Promise<unknown> {
  const res = await fetch(`${API_BASE}/peliculas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(data.message ?? `Error ${res.status}`)
  }
  return res.json()
}

export function getCurrentUserId(): number {
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const u = JSON.parse(raw) as { id?: string | number }
      if (u.id) return Number(u.id)
    }
  } catch {}
  return 1
}
