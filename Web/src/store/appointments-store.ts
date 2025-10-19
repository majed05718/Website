import { create } from 'zustand';
import type { Appointment, AppointmentFilters, AppointmentStats } from '@/types/appointment';

interface AppointmentsState {
  appointments: Appointment[];
  calendarAppointments: Appointment[];
  selectedAppointment: Appointment | null;
  stats: AppointmentStats | null;
  isLoading: boolean;
  error: string | null;
  filters: AppointmentFilters;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  selectedDate: Date;
  viewMode: 'calendar' | 'list';

  setAppointments: (appointments: Appointment[]) => void;
  setCalendarAppointments: (appointments: Appointment[]) => void;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  setStats: (stats: AppointmentStats) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<AppointmentFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setPagination: (totalPages: number, totalCount: number) => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'calendar' | 'list') => void;
  reset: () => void;
}

const initialFilters: AppointmentFilters = {
  search: '',
  type: 'all',
  status: 'all',
};

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: [],
  calendarAppointments: [],
  selectedAppointment: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  selectedDate: new Date(),
  viewMode: 'calendar',

  setAppointments: (appointments) => set({ appointments }),
  setCalendarAppointments: (appointments) => set({ calendarAppointments: appointments }),
  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
  setStats: (stats) => set({ stats }),

  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [appointment, ...state.appointments],
      calendarAppointments: [...state.calendarAppointments, appointment],
      totalCount: state.totalCount + 1,
    })),

  updateAppointment: (id, data) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
      calendarAppointments: state.calendarAppointments.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
      selectedAppointment:
        state.selectedAppointment?.id === id
          ? { ...state.selectedAppointment, ...data }
          : state.selectedAppointment,
    })),

  removeAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id),
      calendarAppointments: state.calendarAppointments.filter((a) => a.id !== id),
      selectedAppointment:
        state.selectedAppointment?.id === id ? null : state.selectedAppointment,
      totalCount: Math.max(0, state.totalCount - 1),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1,
    })),

  resetFilters: () => set({ filters: initialFilters, currentPage: 1 }),
  setPage: (page) => set({ currentPage: page }),
  setPagination: (totalPages, totalCount) => set({ totalPages, totalCount }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),

  reset: () =>
    set({
      appointments: [],
      calendarAppointments: [],
      selectedAppointment: null,
      stats: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      selectedDate: new Date(),
      viewMode: 'calendar',
    }),
}));
