import { ref } from 'vue';
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
  async forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },
  async resetPassword(token: string, newPassword: string) {
    return api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  },
  async resendActivation(email: string) {
    return api.post<{ message: string }>('/auth/resend-activation', { email });
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

export const sesionVersion = ref(0);

export function notificarCambioSesion(): void {
  sesionVersion.value++;
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
  api.post('/auth/logout', {}).catch(() => {});
  Cookies.remove('token');
  localStorage.removeItem('user');
  notificarCambioSesion();
}

export function rutaPorRol(rol: string): string {
  const rutas: Record<string, string> = {
    admin: '/admin/peliculas',
    recepcionista: '/recepcionista',
    cliente: '/',
  };
  return rutas[rol] ?? '/';
}
