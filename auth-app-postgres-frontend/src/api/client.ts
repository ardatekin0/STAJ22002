export class ApiError extends Error {
  status: number;
  validationErrors?: Record<string, string>;

  constructor(message: string, status: number, validationErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

const TOKEN_KEY = 'auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getToken = getStoredToken;
export const setToken = setStoredToken;
export const removeToken = removeStoredToken;

export function isTokenExpired(jwt: string): boolean {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

export const setUnauthorizedHandler = setOnUnauthorizedCallback;

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | null = null;

  if (options.body !== undefined && options.body !== null) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      body = typeof options.body === 'string' ? JSON.stringify(options.body) : JSON.stringify(options.body);
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const { body: _rawBody, ...restOptions } = options;
  const fetchOptions: RequestInit = {
    ...restOptions,
    headers,
  };

  if (body !== null) {
    fetchOptions.body = body;
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Ağ bağlantı hatası oluştu';
    throw new ApiError(errorMsg, 0);
  }

  if (!response.ok) {
    let errorMessage = `İşlem başarısız oldu (${response.status})`;
    let validationErrors: Record<string, string> | undefined = undefined;

    try {
      const text = await response.text();
      if (text && text.trim().length > 0) {
        try {
          const errorJson = JSON.parse(text);
          if (typeof errorJson === 'string') {
            errorMessage = errorJson;
          } else if (errorJson && typeof errorJson === 'object') {
            const errObj = errorJson as Record<string, unknown>;
            if ('hata' in errObj && typeof errObj.hata === 'string') {
              errorMessage = errObj.hata;
            } else if ('message' in errObj && typeof errObj.message === 'string') {
              errorMessage = errObj.message;
            } else {

              const keys = Object.keys(errObj);
              if (keys.length > 0 && typeof errObj[keys[0]] === 'string') {
                validationErrors = errorJson as Record<string, string>;
                errorMessage = Object.values(validationErrors).join(', ');
              }
            }
          }
        } catch {

          errorMessage = text;
        }
      }
    } catch {
    }

    if (response.status === 401) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      if (!errorMessage || errorMessage.startsWith('İşlem başarısız')) {
        errorMessage = 'Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapınız.';
      }
    } else if (response.status === 403) {
      if (!errorMessage || errorMessage.startsWith('İşlem başarısız')) {
        errorMessage = 'Bu işlem için yetkiniz bulunmamaktadır.';
      }
    } else if (response.status === 404) {
      if (!errorMessage || errorMessage.startsWith('İşlem başarısız')) {
        errorMessage = 'İstenen kayıt bulunamadı.';
      }
    } else if (response.status === 409) {
      if (!errorMessage || errorMessage.startsWith('İşlem başarısız')) {
        errorMessage = 'Çakışma veya mükerrer kayıt hatası.';
      }
    }

    throw new ApiError(errorMessage, response.status, validationErrors);
  }

  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return null as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}