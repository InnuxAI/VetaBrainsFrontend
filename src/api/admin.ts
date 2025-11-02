import { api } from './http';
import type { Domain } from './domain';

export async function adminListUsers() {
  const { data } = await api.get('/users');
  return data;
}
export async function adminUpdateUser(userId: string, payload: any) {
  const { data } = await api.put(`/users/${userId}`, payload);
  return data;
}
export async function adminSetUserDomains(userId: string, domains: string[]) {
  const { data } = await api.put(`/admin/users/${userId}/domains`, { domains });
  return data;
}
export async function listDomains(): Promise<Domain[]> {
  const { data } = await api.get('/domains');
  return data;
}
export async function createDomain(payload: { name: string; display_name?: string; description?: string; icon?: string }) {
  const { data } = await api.post('/domains', payload);
  return data;
}
export async function updateDomain(id: string, payload: Partial<{ display_name: string; description: string; icon: string }>) {
  const { data } = await api.put(`/domains/${id}`, payload);
  return data;
}
