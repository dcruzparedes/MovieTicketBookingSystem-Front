import { api } from './api';
import Cookies from 'js-cookie';

export interface RegisterResponse {
  user: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    estado: string;
    created_at: string;
    roles: { nombre: string };
  };
  confirmation_token: string;
  message: string;
}

export const authService = {
  async register(userData: { nombre: string; email: string; password: string; telefono?: string }) {
    return api.post<RegisterResponse>('/auth/register', userData);
  },
};

// ── Sesión (lectura del token/usuario guardados por LoginView) ──

export interface UsuarioSesion {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: string;
}

export function getUsuarioActual(): UsuarioSesion | null {
  const token = Cookies.get('token');
  if (!token) return null;

  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as UsuarioSesion;
  } catch {
    return null;
  }
}

export function estaAutenticado(): boolean {
  return getUsuarioActual() !== null;
}

export function tieneRol(...roles: string[]): boolean {
  const usuario = getUsuarioActual();
  return usuario !== null && roles.includes(usuario.rol);
}

export function cerrarSesion(): void {
  Cookies.remove('token');
  localStorage.removeItem('user');
}

export function rutaPorRol(rol: string): string {
  const rutas: Record<string, string> = {
    admin: '/admin',
    recepcionista: '/recepcionista',
    cliente: '/',
  };
  return rutas[rol] ?? '/';
}
