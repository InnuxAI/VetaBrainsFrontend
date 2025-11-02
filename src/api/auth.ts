import { api, API_BASE } from './http';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user';
    domains: string[];
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function adminExists(): Promise<boolean> {
  const { data } = await api.get('/auth/admin-exists');
  return !!data?.exists;
}

export async function signup(payload: {
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}
