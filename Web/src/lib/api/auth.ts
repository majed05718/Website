import api from '../api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    phone: string;
    email?: string;
    name: string;
    role: string;
    officeId: string;
  };
  message: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  message: string;
}

export interface LogoutRequest {
  logoutFrom: 'current' | 'all';
}

export interface ProfileResponse {
  success: boolean;
  user: {
    id: string;
    phone: string;
    email?: string;
    role: string;
    officeId: string;
  };
}

export const authApi = {
  /**
   * Login with phone number and password
   * Sets accessToken in localStorage and refreshToken in HttpOnly cookie
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/api/auth/login', credentials);
    
    // Store access token in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('auth_token', response.data.accessToken);
    }
    
    // Store user in localStorage
    if (response.data.user) {
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Refresh access token using HttpOnly refresh token cookie
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post('/api/auth/refresh');
    
    // Update access token in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('auth_token', response.data.accessToken);
    }
    
    return response.data;
  },

  /**
   * Logout current session or all sessions
   */
  async logout(options: LogoutRequest = { logoutFrom: 'current' }): Promise<void> {
    try {
      await api.post('/api/auth/logout', options);
    } finally {
      // Always clear local storage, even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await api.post('/api/auth/profile');
    return response.data;
  },
};
