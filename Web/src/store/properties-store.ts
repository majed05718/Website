import { create } from 'zustand';
import { Property, PropertyFilters } from '@/types/property';

interface PropertiesState {
  properties: Property[];
  selectedProperty: Property | null;
  filters: PropertyFilters;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  setProperties: (properties: Property[]) => void;
  setSelectedProperty: (property: Property | null) => void;
  setFilters: (filters: PropertyFilters) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setTotalCount: (count: number) => void;
  setCurrentPage: (page: number) => void;
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (id: string) => void;
  clearFilters: () => void;
  reset: () => void;
}

const initialFilters: PropertyFilters = {
  search: '',
  type: undefined,
  status: undefined,
  city: '',
  minPrice: undefined,
  maxPrice: undefined,
  minArea: undefined,
  maxArea: undefined,
};

export const usePropertiesStore = create<PropertiesState>((set) => ({
  properties: [],
  selectedProperty: null,
  filters: initialFilters,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 12,

  setProperties: (properties) => set({ properties }),
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters },
    currentPage: 1 
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setTotalCount: (count) => set({ totalCount: count }),
  setCurrentPage: (page) => set({ currentPage: page }),
  addProperty: (property) => set((state) => ({ 
    properties: [property, ...state.properties],
    totalCount: state.totalCount + 1
  })),
  updateProperty: (property) => set((state) => ({
    properties: state.properties.map(p => p.id === property.id ? property : p),
    selectedProperty: state.selectedProperty?.id === property.id ? property : state.selectedProperty
  })),
  deleteProperty: (id) => set((state) => ({
    properties: state.properties.filter(p => p.id !== id),
    totalCount: state.totalCount - 1,
    selectedProperty: state.selectedProperty?.id === id ? null : state.selectedProperty
  })),
  clearFilters: () => set({ 
    filters: initialFilters,
    currentPage: 1
  }),
  reset: () => set({
    properties: [],
    selectedProperty: null,
    filters: initialFilters,
    isLoading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
  }),
}));