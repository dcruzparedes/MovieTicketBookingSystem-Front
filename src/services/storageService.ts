const API_BASE = import.meta.env.VITE_API_BASE_URL as string

/**
 * Sube el póster de una película al backend, que lo guarda localmente
 * (carpeta /uploads/posters) y actualiza el campo poster_url de la película.
 *
 * @returns la película actualizada, con su nuevo poster_url.
 */
export async function uploadPosterPelicula(id: number, file: File): Promise<{ poster_url: string }> {
  const formData = new FormData()
  formData.append('poster', file)

  const res = await fetch(`${API_BASE}/peliculas/${id}/poster`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string }
    throw new Error(data.message ?? `No se pudo subir el póster (${res.status})`)
  }

  return res.json()
}
