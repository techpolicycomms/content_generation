import api from './api';

interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles?: string[];
  };
}

export async function signup(email: string, password: string, name: string): Promise<AuthResult> {
  const { data } = await api.post('/auth/signup', { email, password, name });
  storeToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const { data } = await api.post('/auth/login', { email, password });
  storeToken(data.token);
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/auth/me');
  return data;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('greenloop_token');
    window.location.href = '/';
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('greenloop_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

function storeToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('greenloop_token', token);
  }
}
