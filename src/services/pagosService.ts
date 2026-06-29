const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface PaymentHistoy {
    pagos: Pago[],
    reembolsos: Reembolso[]
}

interface Pago{
  id: number,
  metodo: string,
  monto_final: number,
  estado: 'Completado' | 'Reembolsado',
  referencia_externa: string,
  created_at: string,
  reservas: reservas
}

interface Reembolso {
    id: number,
    id_pago: number         
    monto: number,
    estado: 'Pendiente' | 'Aprobado' | 'Rechazado',
    fecha_procesado: string,
    created_at: string
}

interface reservas {
    id: number
    usuarios: usuarios
}

interface usuarios {
    email: string
}

interface PaymentHistoryFiltersFilter {
    estado_pagos?: string,
    estado_reembolsos?: string,
    fecha_limite_pagos?: Date,
    fecha_limite_reembolsos?: Date
}

export async function getPagos(): Promise<Pago[]>{
    const res = await fetch(`${BASE_URL}/pagos`);
    if(!res.ok){
        throw new Error(`Pagos no existen.`);
    }
    return res.json();
} 

export async function getPaymentHistory(filters: PaymentHistoryFiltersFilter = {}): Promise<PaymentHistoy> {
  const params = new URLSearchParams();
    
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const res = await fetch(`${BASE_URL}/reembolso/pagos?${params.toString()}`);
  if(!res.ok){
    throw new Error('Historial de Pagos no existe.');
  }
  return res.json();
}

export async function cambiarEstadoPago(id: number, estado: string){
  const res = await fetch(`${BASE_URL}/pagos/${id}`, {
    method: 'PATCH',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({estado})
  })
  if(!res.ok){
    throw new Error('Pago no existe.');
  }
}

export async function cambiarEstadoReembolso(id: number, estado: string){
  const res = await fetch(`${BASE_URL}/reembolso/${id}`, {
    method: 'PATCH',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({estado})
  })
  if(!res.ok){
    throw new Error('Reembolso no existe.');
  }
}