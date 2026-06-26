const API_BASE = import.meta.env.VITE_API_BASE_URL as string

export interface Genero {
  id: string
  nombre: string
}

export interface Idioma {
  id: string
  nombre: string
}

export interface Movie {
  id: number
  titulo: string
  sinopsis: string | null
  poster_url: string | null
  id_genero: string | null
  id_idioma: string | null
  fecha_estreno: string | null
  activo: boolean
  generos: Genero | null
  idiomas: Idioma | null
}

export interface UpdateMoviePayload {
  titulo?: string
  sinopsis?: string
  poster_url?: string
  id_genero?: number
  id_idioma?: number
  fecha_estreno?: string
}

export async function getMovie(id: number): Promise<Movie | null> {
  const res = await fetch(`${API_BASE}/peliculas/${id}`)
  if (!res.ok) throw new Error(`Error al cargar la película (${res.status})`)
  return res.json() as Promise<Movie | null>
}

export async function updateMovie(id: number, payload: UpdateMoviePayload): Promise<Movie> {
  const res = await fetch(`${API_BASE}/peliculas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error al actualizar la película (${res.status})`)
  return res.json() as Promise<Movie>
}

export async function getGeneros(): Promise<Genero[]> {
  const res = await fetch(`${API_BASE}/generos`)
  if (!res.ok) throw new Error(`Error al cargar géneros (${res.status})`)
  return res.json() as Promise<Genero[]>
}

export async function getIdiomas(): Promise<Idioma[]> {
  const res = await fetch(`${API_BASE}/idiomas`)
  if (!res.ok) throw new Error(`Error al cargar idiomas (${res.status})`)
  return res.json() as Promise<Idioma[]>
}
