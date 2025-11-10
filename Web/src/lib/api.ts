import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Only log in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔵 API URL:', API_URL);
}

/**
 * Axios Instance Configuration
 * 
 * - withCredentials: true - Enables sending HttpOnly cookies with requests
 * - timeout: 30000 - 30 second timeout for all requests
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Critical: Sends HttpOnly refresh token cookie
  timeout: 30000,
});

/**
 * Request Interceptor
 * 
 * Attaches access token to every request if available
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    }

    // Attach access token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles authentication errors (401, 403) and provides user-friendly error messages
 * 
 * Error Handling Strategy:
 * - 401 Unauthorized: Token expired/invalid → Redirect to login
 * - 403 Forbidden: Insufficient permissions → Show permission denied message
 * - 5xx Server errors: Show generic error message
 * - Network errors: Show connection error message
 */
api.interceptors.response.use(
  (response) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Response:', response.status, response.config.url);
    }
    return response;
  },
  (error: AxiosError) => {
    // Extract error details
    const status = error.response?.status;
    const url = error.config?.url;
    const errorMessage = (error.response?.data as any)?.message || error.message;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response Error:', {
        status,
        url,
        message: errorMessage,
      });
    }

    // Handle different error scenarios
    if (typeof window !== 'undefined') {
      switch (status) {
        case 401: {
          // Unauthorized: Token expired or invalid
          console.warn('[API] 401 Unauthorized - Redirecting to login');
          
          // Clear auth state
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          
          // Show toast notification
          toast.error('انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى', {
            description: 'Your session has expired. Please login again.',
            duration: 5000,
          });

          // Redirect to login after a short delay
          setTimeout(() => {
            const currentPath = window.location.pathname;
            // Don't redirect if already on login page
            if (currentPath !== '/login') {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }, 1000);

          break;
        }

        case 403: {
          // Forbidden: User doesn't have permission for this resource
          console.warn('[API] 403 Forbidden - Insufficient permissions');
          
          toast.error('ليس لديك الصلاحية لتنفيذ هذه العملية', {
            description: 'You do not have permission to perform this action.',
            duration: 5000,
          });

          break;
        }

        case 404: {
          // Not Found
          toast.error('المورد المطلوب غير موجود', {
            description: 'The requested resource was not found.',
            duration: 4000,
          });

          break;
        }

        case 500:
        case 502:
        case 503:
        case 504: {
          // Server errors
          toast.error('حدث خطأ في الخادم', {
            description: 'A server error occurred. Please try again later.',
            duration: 5000,
          });

          break;
        }

        default: {
          // Network error or timeout
          if (!error.response) {
            toast.error('فشل الاتصال بالخادم', {
              description: 'Unable to connect to the server. Please check your internet connection.',
              duration: 5000,
            });
          } else if (errorMessage) {
            // Show backend error message if available
            toast.error(errorMessage, {
              duration: 4000,
            });
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
