import apiClient from '@/api/apiClient';
import type { AuthResponse } from '../models/auth.response';
import type { CreateUserDto } from '../models/create-user.dto';
import type { LoginUserDto } from '../models/login-user.dto';
import type { User } from '../models/user.model';

function mapAuthResponseToUser(data: AuthResponse): User {
  // El login no devuelve fullName/isActive, así que ponemos defaults seguros
  return {
    id: data.id,
    email: data.email,
    fullName: data.fullName ?? '',
    isActive: data.isActive ?? true,
    role: data.role ?? 'cashier',
  };
}

export async function loginUser(payload: LoginUserDto) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);

  if (!data?.token) {
    throw new Error('Login OK pero no se recibió token');
  }

  return {
    token: data.token,
    user: mapAuthResponseToUser(data),
  };
}

export async function registerUser(payload: CreateUserDto) {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);

  if (!data?.token) {
    throw new Error('Registro OK pero no se recibió token');
  }

  return {
    token: data.token,
    user: mapAuthResponseToUser(data),
  };
}
