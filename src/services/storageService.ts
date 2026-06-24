/**
 * Flujo de subida:
 *  1. POST /api/storage/presigned-url  → backend devuelve una URL firmada de S3
 *  2. PUT <uploadUrl>                  → frontend sube el archivo directo a S3
 *  3. Retorna la URL pública del póster para persistirla junto a la película
 *
 * El backend es el único que maneja credenciales AWS; el frontend nunca las ve.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL as string
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET as string
const S3_REGION = import.meta.env.VITE_S3_REGION as string

interface PresignedUrlResponse {
  uploadUrl: string
  key: string
}

/**
 * Genera un nombre de archivo único para evitar colisiones en S3.
 * Ejemplo: "posters/1718649600000-batman.jpg"
 */
function buildS3Key(file: File): string {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const slug = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 40)
  return `posters/${Date.now()}-${slug}.${ext}`
}

/**
 * Sube un póster a S3 y retorna su URL pública.
 *
 * @throws Error si la solicitud de presigned URL o la subida fallan.
 */
export async function uploadPoster(file: File): Promise<string> {
  const key = buildS3Key(file)

  const presignRes = await fetch(`${API_BASE}/storage/presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, contentType: file.type }),
  })

  if (!presignRes.ok) {
    throw new Error(`No se pudo obtener la URL de subida (${presignRes.status})`)
  }

  const { uploadUrl } = (await presignRes.json()) as PresignedUrlResponse

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!uploadRes.ok) {
    throw new Error(`La subida a S3 falló (${uploadRes.status})`)
  }

  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`
}
