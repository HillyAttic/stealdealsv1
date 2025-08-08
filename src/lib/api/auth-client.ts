import { AuthError } from '@/lib/errors/auth-errors';
import { AuthErrorCodes } from '@/types/auth';
import { 
  LoginFormData, 
  RegisterFormData, 
  GoogleAuthData,
  LoginResponse,
  RegisterResponse,
  GoogleAuthResponse
} from '@/lib/validations/auth';

export interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
}

export class AuthApiClient {
  private baseUrl: string;
  private timeout: number;
  private csrfToken: string | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.timeout = options.timeout || 10000;
  }

  private async getCSRFToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await fetch('/api/auth/csrf', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const data = await response.json();
      this.csrfToken = data.token;
      return this.csrfToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw new AuthError(
        AuthErrorCodes.INVALID_CREDENTIALS,
        'Failed to initialize security token. Please refresh the page.'
      );
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    let isTimedOut = false;
    
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, this.timeout);

    // Get CSRF token for non-GET requests
    let headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (options.method && options.method !== 'GET') {
      try {
        const csrfToken = await this.getCSRFToken();
        headers['x-csrf-token'] = csrfToken;
      } catch (error) {
        // If CSRF token fails, continue without it for now
        console.warn('Failed to get CSRF token:', error);
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: 'include',
        headers
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        if (isTimedOut) {
          throw new AuthError(
            AuthErrorCodes.INVALID_CREDENTIALS,
            'Request timed out. Please check your connection and try again.'
          );
        } else {
          throw new AuthError(
            AuthErrorCodes.INVALID_CREDENTIALS,
            'Request was cancelled.'
          );
        }
      }
      
      throw AuthError.fromApiError(error);
    }
  }

  async login(data: LoginFormData): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/api/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async register(data: RegisterFormData): Promise<RegisterResponse> {
    return this.makeRequest<RegisterResponse>('/api/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async googleAuth(data: GoogleAuthData): Promise<GoogleAuthResponse> {
    return this.makeRequest<GoogleAuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.makeRequest<{ success: boolean }>('/api/auth/user/logout', {
      method: 'POST'
    });
  }

  async refreshToken(): Promise<{ success: boolean; token: string }> {
    return this.makeRequest<{ success: boolean; token: string }>('/api/auth/user/refresh', {
      method: 'POST'
    });
  }

  async checkSession(): Promise<{ success: boolean; user?: any }> {
    return this.makeRequest<{ success: boolean; user?: any }>('/api/auth/check', {
      method: 'GET'
    });
  }
}

// Create singleton instance
export const authApiClient = new AuthApiClient();

// Utility functions for common operations
export const authApi = {
  login: (data: LoginFormData) => authApiClient.login(data),
  register: (data: RegisterFormData) => authApiClient.register(data),
  googleAuth: (data: GoogleAuthData) => authApiClient.googleAuth(data),
  logout: () => authApiClient.logout(),
  refreshToken: () => authApiClient.refreshToken(),
  checkSession: () => authApiClient.checkSession()
};