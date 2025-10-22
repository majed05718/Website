import axios from 'axios';
import type { 
  Appointment, 
  AppointmentFormData,
  AppointmentFilters,
  AppointmentsResponse,
  AppointmentStats
} from '@/types/appointment';

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'حدث خطأ في الاتصال بالخادم');
  }

  return response.json();
};

function buildQueryString(filters: AppointmentFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

// Get appointments with filters
export async function getAppointments(
  filters: AppointmentFilters = {},
  page: number = 1,
  limit: number = 50
): Promise<AppointmentsResponse> {
  const queryString = buildQueryString(filters);
  const endpoint = `/appointments?page=${page}&limit=${limit}${queryString ? '&' + queryString : ''}`;
  return apiCall(endpoint);
}

// Get single appointment
export async function getAppointment(id: string): Promise<Appointment> {
  return apiCall(`/appointments/${id}`);
}

// Get appointments for specific date range (for calendar)
export async function getAppointmentsByDateRange(
  startDate: string,
  endDate: string
): Promise<Appointment[]> {
  return apiCall(`/appointments/calendar?startDate=${startDate}&endDate=${endDate}`);
}

// Create appointment
export async function createAppointment(data: AppointmentFormData): Promise<Appointment> {
  return apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update appointment
export async function updateAppointment(
  id: string,
  data: Partial<AppointmentFormData>
): Promise<Appointment> {
  return apiCall(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Delete appointment
export async function deleteAppointment(id: string): Promise<void> {
  return apiCall(`/appointments/${id}`, {
    method: 'DELETE',
  });
}

// Update status
export async function updateAppointmentStatus(
  id: string,
  status: string,
  notes?: string
): Promise<Appointment> {
  return apiCall(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
}

// Cancel appointment
export async function cancelAppointment(
  id: string,
  reason: string
): Promise<Appointment> {
  return apiCall(`/appointments/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

// Mark as completed
export async function completeAppointment(
  id: string,
  notes?: string
): Promise<Appointment> {
  return apiCall(`/appointments/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

// Get statistics
export async function getAppointmentStats(): Promise<AppointmentStats> {
  return apiCall('/appointments/stats');
}

// Send reminder
export async function sendReminder(id: string, type: string): Promise<void> {
  return apiCall(`/appointments/${id}/remind`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

// Check availability
export async function checkAvailability(
  date: string,
  startTime: string,
  endTime: string,
  staffId?: string
): Promise<{ available: boolean; conflicts: Appointment[] }> {
  return apiCall('/appointments/check-availability', {
    method: 'POST',
    body: JSON.stringify({ date, startTime, endTime, staffId }),
  });
}

// Get today's appointments
export async function getTodayAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  return apiCall(`/appointments/today?date=${today}`);
}

// Get upcoming appointments
export async function getUpcomingAppointments(limit: number = 5): Promise<Appointment[]> {
  return apiCall(`/appointments/upcoming?limit=${limit}`);
}
