import axios from 'axios';
import type { 
  Appointment, 
  AppointmentFormData,
  AppointmentFilters,
  AppointmentsResponse,
  AppointmentStats
} from '@/types/appointment';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
  const url = `${API_URL}/appointments?page=${page}&limit=${limit}${queryString ? '&' + queryString : ''}`;
  const response = await axios.get<AppointmentsResponse>(url);
  return response.data;
}

// Get single appointment
export async function getAppointment(id: string): Promise<Appointment> {
  const response = await axios.get<Appointment>(`${API_URL}/appointments/${id}`);
  return response.data;
}

// Get appointments for specific date range (for calendar)
export async function getAppointmentsByDateRange(
  startDate: string,
  endDate: string
): Promise<Appointment[]> {
  const response = await axios.get<Appointment[]>(
    `${API_URL}/appointments/calendar?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
}

// Create appointment
export async function createAppointment(data: AppointmentFormData): Promise<Appointment> {
  const response = await axios.post<Appointment>(`${API_URL}/appointments`, data);
  return response.data;
}

// Update appointment
export async function updateAppointment(
  id: string,
  data: Partial<AppointmentFormData>
): Promise<Appointment> {
  const response = await axios.patch<Appointment>(`${API_URL}/appointments/${id}`, data);
  return response.data;
}

// Delete appointment
export async function deleteAppointment(id: string): Promise<void> {
  await axios.delete(`${API_URL}/appointments/${id}`);
}

// Update status
export async function updateAppointmentStatus(
  id: string,
  status: string,
  notes?: string
): Promise<Appointment> {
  const response = await axios.patch<Appointment>(
    `${API_URL}/appointments/${id}/status`,
    { status, notes }
  );
  return response.data;
}

// Cancel appointment
export async function cancelAppointment(
  id: string,
  reason: string
): Promise<Appointment> {
  const response = await axios.patch<Appointment>(
    `${API_URL}/appointments/${id}/cancel`,
    { reason }
  );
  return response.data;
}

// Mark as completed
export async function completeAppointment(
  id: string,
  notes?: string
): Promise<Appointment> {
  const response = await axios.patch<Appointment>(
    `${API_URL}/appointments/${id}/complete`,
    { notes }
  );
  return response.data;
}

// Get statistics
export async function getAppointmentStats(): Promise<AppointmentStats> {
  const response = await axios.get<AppointmentStats>(`${API_URL}/appointments/stats`);
  return response.data;
}

// Send reminder
export async function sendReminder(id: string, type: string): Promise<void> {
  await axios.post(`${API_URL}/appointments/${id}/remind`, { type });
}

// Check availability
export async function checkAvailability(
  date: string,
  startTime: string,
  endTime: string,
  staffId?: string
): Promise<{ available: boolean; conflicts: Appointment[] }> {
  const response = await axios.post(`${API_URL}/appointments/check-availability`, {
    date,
    startTime,
    endTime,
    staffId,
  });
  return response.data;
}

// Get today's appointments
export async function getTodayAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  const response = await axios.get<Appointment[]>(
    `${API_URL}/appointments/today?date=${today}`
  );
  return response.data;
}

// Get upcoming appointments
export async function getUpcomingAppointments(limit: number = 5): Promise<Appointment[]> {
  const response = await axios.get<Appointment[]>(
    `${API_URL}/appointments/upcoming?limit=${limit}`
  );
  return response.data;
}
