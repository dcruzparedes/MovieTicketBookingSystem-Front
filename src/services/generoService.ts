const API_BASE = import.meta.env.VITE_API_BASE_URL as string

export interface Genero {
  id: number
  nombre: string
}

export async function fetchGeneros(): Promise<Genero[]> {
  const res = await fetch(`${API_BASE}/generos`)
  if (!res.ok) throw new Error(`Error al cargar géneros (${res.status})`)
  return res.json()
}

export async function createGenero(data: { nombre: string }): Promise<Genero> {
  const res = await fetch(`${API_BASE}/generos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Error al crear género (${res.status})`)
  return res.json()
}

export async function updateGenero(id: number, data: { nombre: string }): Promise<Genero> {
  const res = await fetch(`${API_BASE}/generos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Error al actualizar género (${res.status})`)
  return res.json()
}

export async function deleteGenero(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/generos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Error al eliminar género (${res.status})`)
}
