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

  funciones: Funcion,
  reservaAsientos: ReservaAsiento[],
  pagos: Pago[],
}

export interface Funcion {
  fecha_hora: string,
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

export interface Export {
  message: string,
  filePath: string
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

export async function exportReservas(){
  const res = await api.get<Export>(`/reservas/export`);
  if(!res){
    throw new Error(`No se pudo exportar las reservas.`)
  }
  return res;
}

export async function cancelReserva(id: number){
  const res = await api.patch(`/reservas/${id}/cancelar`);
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
) {
  return api.post<BloqueoAsientosResponse>(`/funciones/${idFuncion}/asientos/bloquear`, {
    ids_asientos_funcion: idsAsientosFuncion.map(Number),
    minutos,
  })
}
