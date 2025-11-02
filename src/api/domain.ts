import { api } from './http';

export interface Domain {
  id: string;
  name: string;
  display_name?: string;
  icon?: string;
  description?: string;
}

export async function fetchDomains(): Promise<Domain[]> {
  const { data } = await api.get('/domains');
  return data;
}
