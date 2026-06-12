import { ENV } from '../config/env';

// Token en memoria (MVP — para producción usar SecureStore)
let _accessToken: string | null = null;

export function setToken(token: string | null) {
  _accessToken = token;
}

export function getToken(): string | null {
  return _accessToken;
}

// ─── Error tipado ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Cliente base ─────────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${ENV.API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // envía cookies (refresh token)
    });
  } catch {
    throw new ApiError(0, 'Sin conexión al servidor. Verificá que el backend esté corriendo.');
  }

  // Intentar parsear siempre como JSON
  let body: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const msg =
      (body as { message?: string })?.message ??
      `Error ${response.status}`;
    throw new ApiError(response.status, msg, body);
  }

  return body as T;
}

// ─── Métodos HTTP ─────────────────────────────────────────────────────────────
export const apiClient = {
  get<T>(path: string) {
    return request<T>(path, { method: 'GET' });
  },

  post<T>(path: string, data?: unknown) {
    return request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  patch<T>(path: string, data?: unknown) {
    return request<T>(path, {
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
};
