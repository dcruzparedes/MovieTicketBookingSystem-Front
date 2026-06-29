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

export interface CuponParaActualizar {
    codigo?: string
    tipo?: string
    valor?: number
    fecha_expiracion?: string
    usos_maximos?: number
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
    const data = await res.json().catch(() => ({} as { message?: string }))
    return data.message ?? fallback
}

export async function getCupones(): Promise<Cupon[]> {
    const res = await fetch(`${API_BASE}/cupones`);
    if(!res.ok){
        throw new Error('Cupones no existen.');
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
        throw new Error(await parseErrorMessage(res, `Error: ${res.status}`));
    }
    return res.json();
}

export async function actualizarCupon(id: number, datos: CuponParaActualizar): Promise<Cupon> {
    const res = await fetch(`${API_BASE}/cupones/${id}`, {
        method: 'PATCH',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(datos)
    });
    if(!res.ok){
        throw new Error(await parseErrorMessage(res, `Error: ${res.status}`));
    }
    return res.json();
}

export async function eliminarCupon(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/cupones/${id}`, {
        method: 'DELETE',
    });
    if(!res.ok){
        throw new Error(await parseErrorMessage(res, `Error: ${res.status}`));
    }
}

export async function cambiarEstadoCupon(id: number, activo: boolean){
    const res = await fetch(`${API_BASE}/cupones/${id}/estado`, {
        method: 'PATCH',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({activo})
    });
    if(!res.ok){
        throw new Error(await parseErrorMessage(res, `Error: ${res.status}`));
    }
    return res.json();
}
