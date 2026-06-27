const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

interface Politica{
    id: number
    horas_antes_minimo: number
    horas_antes_maximo: number
    porcentaje_reembolso: number
}

interface BodyPolitica{
    horas_antes_minimo: number
    horas_antes_maximo: number
    porcentaje_reembolso: number
}

export async function getPoliticas(): Promise<Politica[]> {
    const res = await fetch(`${API_BASE}/politica-cancelacion`);
    if(!res.ok){
        throw new Error('Politicas de Cancelacion no existen.');
    }
    return res.json();
}

export async function crearPolitica(nuevaPolitica: BodyPolitica){
    const res = await fetch(`${API_BASE}/politica-cancelacion`, {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(nuevaPolitica)
    });
    if(!res.ok){
        throw new Error(`Error: ${res.status}`);
    }
    return res.json;
}

export async function editPolitica(id: number, editarPolitica: BodyPolitica){
    const res = await fetch(`${API_BASE}/politica-cancelacion/${id}`, {
        method: 'PUT',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(editarPolitica)
    });
    if(!res.ok){
        throw new Error(`Error: ${res.status}`);
    }
    return res.json;
}