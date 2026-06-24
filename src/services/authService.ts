import { api } from './api';

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
