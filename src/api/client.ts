import { config } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return useAuthStore.getState().token;
  }

  private async handleUnauthorized(): Promise<void> {
    await useAuthStore.getState().clearAuth();
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    // Deduplicate concurrent refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(new URL('/api/users/refresh-token', this.baseUrl).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return false;

      const data = (await response.json()) as { token?: string; refreshedToken?: string; exp: number };
      const newToken = data.refreshedToken ?? data.token;
      if (!newToken) return false;
      const user = useAuthStore.getState().user;
      if (user) {
        await useAuthStore.getState().setAuth(user, newToken);
      }
      return true;
    } catch {
      return false;
    }
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private log(method: string, url: string, body?: unknown) {
    if (config.isDev) {
      let safeBody = '';
      if (body && typeof body === 'object') {
        const redacted = { ...(body as Record<string, unknown>) };
        for (const key of ['password', 'token', 'secret', 'refreshToken']) {
          if (key in redacted) redacted[key] = '[REDACTED]';
        }
        safeBody = JSON.stringify(redacted).slice(0, 200);
      }
      console.log(`[API] ${method} ${url}`, safeBody);
    }
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.log(options.method ?? 'GET', url, options.body);

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401) {
      // Attempt token refresh before giving up
      const refreshed = await this.attemptTokenRefresh();
      if (refreshed) {
        // Retry the original request with the new token
        const newToken = this.getToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
        }
        const retryResponse = await fetch(url, { ...fetchOptions, headers });
        if (retryResponse.ok) {
          if (retryResponse.status === 204) return undefined as T;
          return retryResponse.json() as Promise<T>;
        }
      }

      // Refresh failed or retry failed — clear auth
      await this.handleUnauthorized();
      throw new ApiError('Unauthorized', 401);
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new ApiError(errorBody, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }

  async postFormData<T>(path: string, fileUri: string, fileName: string): Promise<T> {
    const url = this.buildUrl(path);
    const token = this.getToken();

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg',
    } as unknown as Blob);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Do not set Content-Type — let fetch set the multipart boundary

    this.log('POST (FormData)', url);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new ApiError(errorBody, response.status);
    }

    return response.json() as Promise<T>;
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiClient = new ApiClient(config.apiUrl);
