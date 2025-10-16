export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending';
export type PropertyType = 'apartment' | 'villa' | 'land' | 'commercial' | 'building';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  district: string;
  address: string;
  images: string[];
  features: string[];
  owner_id: string;
  office_id: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  search?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  district: string;
  address: string;
  images: string[];
  features: string[];
  office_id: string;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  id: string;
}