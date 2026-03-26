const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function login(role: 'admin' | 'user' = 'user'): Promise<string> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const { token } = await response.json();
  localStorage.setItem('cloudiflow_jwt', token);
  return token;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('cloudiflow_jwt');
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken() || (await login()); // Auto-login for dev ease

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token expired, clear and retry once
    localStorage.removeItem('cloudiflow_jwt');
    const newToken = await login();
    return apiFetch(endpoint, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `API error: ${response.status}`);
  }

  return response.json();
}
