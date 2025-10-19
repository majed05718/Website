import { create } from 'zustand';
import type { Customer, CustomerFilters, CustomerStats } from '@/types/customer';

interface CustomersState {
  // Data
  customers: Customer[];
  selectedCustomer: Customer | null;
  stats: CustomerStats | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: CustomerFilters;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  
  // Actions - Data
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setStats: (stats: CustomerStats) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
  
  // Actions - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Filters
  setFilters: (filters: Partial<CustomerFilters>) => void;
  resetFilters: () => void;
  
  // Actions - Pagination
  setPage: (page: number) => void;
  setPagination: (totalPages: number, totalCount: number) => void;
  
  // Actions - Utilities
  reset: () => void;
}

const initialFilters: CustomerFilters = {
  search: '',
  type: 'all',
  status: 'all',
  city: undefined,
  hasActiveContracts: undefined,
  assignedStaffId: undefined,
  tags: [],
};

export const useCustomersStore = create<CustomersState>((set) => ({
  // Initial State
  customers: [],
  selectedCustomer: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: initialFilters,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  
  // Data Actions
  setCustomers: (customers) => set({ customers }),
  
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  
  setStats: (stats) => set({ stats }),
  
  addCustomer: (customer) =>
    set((state) => ({
      customers: [customer, ...state.customers],
      totalCount: state.totalCount + 1,
    })),
  
  updateCustomer: (id, data) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
      selectedCustomer:
        state.selectedCustomer?.id === id
          ? { ...state.selectedCustomer, ...data }
          : state.selectedCustomer,
    })),
  
  removeCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
      selectedCustomer:
        state.selectedCustomer?.id === id ? null : state.selectedCustomer,
      totalCount: Math.max(0, state.totalCount - 1),
    })),
  
  // UI Actions
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  // Filter Actions
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),
  
  resetFilters: () =>
    set({
      filters: initialFilters,
      currentPage: 1,
    }),
  
  // Pagination Actions
  setPage: (page) => set({ currentPage: page }),
  
  setPagination: (totalPages, totalCount) =>
    set({ totalPages, totalCount }),
  
  // Utilities
  reset: () =>
    set({
      customers: [],
      selectedCustomer: null,
      stats: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
    }),
}));
