import CuponesView from "@/views/admin/CuponesView.vue";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

interface Cupon {
    id: number
    codigo: string
    tipo: string
    valor: number
    fecha_expiracion: string
    usos_maximos: number
    usos_actuales: number
    activo: boolean
}

interface CuponParaAgregra {
    codigo: string
    tipo: string
    valor: number
    fecha_expiracion: string
    usos_maximos: number
    activo: boolean
}

export async function getCupones(): Promise<Cupon[]> {
    const res = await fetch(`${API_BASE}/cupones`);
    if(!res.ok){
        throw new Error('Cupones not found.');
    }
    return res.json();
}

export async function nuevoCupon(nuevoCupon: CuponParaAgregra){
    const res = await fetch(`${API_BASE}/cupones`, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(nuevoCupon)
    });
    if(!res.ok){
        throw new Error(`Error: ${res.status}`);
    }
    return res.json;
}

export async function cambiarEstadoCupon(id: number, activo: boolean){
    const res = await fetch(`${API_BASE}/cupones/${id}/estado`, {
        method: 'PATCH',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({activo})
    });
    if(!res.ok){
        throw new Error(`Error: ${res.status}`);
    }
    return res.json;
}