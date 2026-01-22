import axios from 'axios';

export type ApiErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export function mapApiError(e: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(e)) {
    const data = e.response?.data;

    if (!data) return 'No se ha recibido respuesta del servidor.';
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.message)) return data.message.join(' | ');

    if (e.response?.status === 401) return 'Credenciales incorrectas.';
  }
  return fallback;
}
