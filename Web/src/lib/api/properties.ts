import api from '../api';
import { Property, PropertyFilters, CreatePropertyDto, UpdatePropertyDto } from '@/types/property';

export interface PropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  pageSize: number;
}

export const propertiesApi = {
  async getProperties(filters: PropertyFilters = {}, page = 1, pageSize = 12): Promise<PropertiesResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minArea) params.append('minArea', filters.minArea.toString());
    if (filters.maxArea) params.append('maxArea', filters.maxArea.toString());
    
    params.append('page', page.toString());
    params.append('limit', pageSize.toString());

    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  },

  async getPropertyById(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  async createProperty(data: CreatePropertyDto): Promise<Property> {
    const response = await api.post('/properties', data);
    return response.data;
  },

  async updateProperty(id: string, data: UpdatePropertyDto): Promise<Property> {
    const response = await api.patch(`/properties/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/properties/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  },

  async getStats() {
    const response = await api.get('/properties/stats');
    return response.data;
  },
};