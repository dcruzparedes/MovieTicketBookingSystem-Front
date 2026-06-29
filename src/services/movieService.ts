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

interface Usuario {
  id: number,
  nombre: string,
  email: string,
  password_hash: string,
  telefono: string,
  id_rol: number,
  notificaciones_activas: boolean,
  created_at: string,
  updated_at: string
}

export async function fetchGeneros(): Promise<Genero[]> {
  const res = await fetch(`${API_BASE}/generos`)
  if (!res.ok) throw new Error(`Error al cargar géneros (${res.status})`)
  return res.json()
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const res = await fetch(`${API_BASE}/usuarios/todos/simple`)
  if (!res.ok) throw new Error(`Error al cargar usuarios (${res.status})`)
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

export async function fetchCines(){
  const res = await fetch(`${API_BASE}/cines`);
  if(!res.ok){
    throw new Error(`Cines not found: ${res.status}`);
  }
  return res.json();
}

export async function fetchCiudades(){
  const res = await fetch(`${API_BASE}/ciudades`);
  if(!res.ok){
    throw new Error(`Ciudades not found: ${res.status}`);
  }
  return res.json();
}

export async function getPeliculas(){
  const res = await fetch(`${API_BASE}/peliculas`)
  if(!res.ok){
    throw new Error(`Peliculas no encontradas: ${res.status}`)
  }
  return res.json();
}

export async function updatePelicula(id: number, payload: Partial<CreatePeliculaPayload>): Promise<unknown> {
  const res = await fetch(`${API_BASE}/peliculas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(data.message ?? `Error ${res.status}`)
  }
  return res.json()
}

export async function updateEstadoPelicula(id: number, activo: boolean): Promise<unknown> {
  const res = await fetch(`${API_BASE}/peliculas/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activo }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(data.message ?? `Error ${res.status}`)
  }
  return res.json()
}

export async function getPeliculaById(id: number): Promise<unknown> {
  const res = await fetch(`${API_BASE}/peliculas/${id}`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(data.message ?? `Error ${res.status}`)
  }
  return res.json()
}

export async function deletePelicula(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/peliculas/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { message?: string }
    throw new Error(data.message ?? `Error ${res.status}`)
  }
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
