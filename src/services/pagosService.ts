const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface Pago{
  id: number,
  metodo: string,
  monto_final: number,
  estado: string,
  referencia_externa: string,
  created_at: string,
  reservas: reservas
}

interface reservas {
    usuarios: usuarios
}

interface usuarios {
    email: string
}

export async function getPagos(): Promise<Pago[]>{
    const res = await fetch(`${BASE_URL}/pagos`);
    if(!res.ok){
        throw new Error(`Pagos no existen.`);
    }
    return res.json();
} 