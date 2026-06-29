import { api } from './api'
import type { EstadoAsientoBackend, TipoAsiento } from '@/stores/reserva'

export interface AsientoFuncionBackend {
  id: string
  estado: EstadoAsientoBackend
  asientos: {
    fila: string
    columna: number
    codigo: string
    tipo: TipoAsiento
  }
}

export interface Reserva {
  id: number,
  id_usuario: number,
  id_funcion: number,
  estado: 'Confirmada' | 'Completada' | 'Cancelada'
  formato: string
  numero_reserva: string,
  created_at: string;
  updated_at: string | null;

  usuarios?: { nombre: string; email: string },
  funciones: Funcion,
  reservaAsientos: ReservaAsiento[],
  pagos: Pago[],
}

export interface Funcion {
  fecha_hora: string,
  formato?: string | null,
  peliculas: Pelicula,
  salas: Sala,
}

export interface Pelicula {
  id: number,
  titulo: string,
  sinopsis: string,
  duracion: number,
  clasificacion: string,
  poster_url: string,
  idioma: string,
  subtitulada: boolean,
}

export interface Sala {
  id: number,
  nombre: string,
  cines: Cine,
}

export interface Cine {
  id: number,
  nombre: string,
  ciudad: string,
  direccion: string,
}

export interface ReservaAsiento {
  id: number,
  asientosfuncion: AsientoFuncion,
}

export interface AsientoFuncion {
  id: number,
  asientos: Asiento,
}

export interface Asiento {
  id: number,
  codigo: string,
}

export interface Pago {
  id: number,
  metodo: string,
  monto_final: number,
  estado: string,
  referencia: string,
  created_at: string,
}

export interface ReservasFilter {
  id_usuario?: number,
  id_pelicula?: number,
  id_cine?: number,
  fecha_inicio?: string,
  fecha_final?: string,
  estado?: string,
  numero_reserva?: string,
  page?: number,
  limit?: number,
}

export interface ReservasRes {
  data: Reserva[],
  meta: {
    page: number,
    limit: number
  }
}

export interface CalcResr {
  reserva: string,
  monto_total: number,
  porcentaje_de_reembolso: number,
  monto_de_reembolso: number,
}

export async function getReservas(filters: ReservasFilter = {}): Promise<ReservasRes> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const data = await api.get<ReservasRes>(`/reservas?${params.toString()}`);
  if(!data){
    throw new Error('Reservas no existen.');
  }
  return data;
}

export async function exportReservas(): Promise<void> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
  const res = await fetch(`${API_BASE_URL}/reservas/export`)
  if (!res.ok) {
    throw new Error('No se pudo exportar las reservas.')
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reportes_reservas_${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface CancelarReservaResponse {
  message: string
  reembolso: { porcentaje: number; monto: number } | null
}

export async function cancelReserva(id: number){
  const res = await api.patch<CancelarReservaResponse>(`/reservas/${id}/cancelar`, {});
  if(!res){
    throw new Error(`No se pudo cacnelar la reserva.`)
  }
  return res;
}

export async function getPeliculas(){
  const res = await api.get<Pelicula[]>(`/peliculas`);
  if(!res){
    throw new Error(`Peliculas no encontradas.`)
  }
  return res;
}

export async function calcularReembolso(id: number){
  const res = await api.get<CalcResr>(`/reembolso/${id}/calculo`);
  if(!res){
    throw new Error(`Peliculas no encontradas.`)
  }
  return res;
}

export function getAsientosPorFuncion(idFuncion: string | number) {
  return api.get<AsientoFuncionBackend[]>(`/funciones/${idFuncion}/asientos`)
}

export interface BloqueoAsientosResponse {
  message: string
  bloqueado_hasta: string
}

export function bloquearAsientos(
  idFuncion: string | number,
  idsAsientosFuncion: string[],
  minutos: number,
  idUsuario: number,
) {
  return api.post<BloqueoAsientosResponse>(`/funciones/${idFuncion}/asientos/bloquear`, {
    ids_asientos_funcion: idsAsientosFuncion.map(Number),
    minutos,
    id_usuario: idUsuario,
  })
}

export interface CrearReservaPayload {
  id_usuario: number
  id_funcion: number
  id_asientos: number[]
}

export interface ReservaCreada {
  id: string
  numero_reserva: string
  id_usuario: string
  id_funcion: string
  estado: string
  created_at: string
  updated_at: string | null
}

export function crearReserva(payload: CrearReservaPayload) {
  return api.post<ReservaCreada>('/reservas', payload)
}
