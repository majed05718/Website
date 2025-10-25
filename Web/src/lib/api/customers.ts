import axios from 'axios';
import type { 
  Customer, 
  CustomerFormData, 
  CustomerFilters,
  CustomersResponse,
  CustomerDetailsResponse,
  CustomerNote,
  CustomerInteraction,
  CustomerStats
} from '@/types/customer';

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

// Helper function to build query string
function buildQueryString(filters: CustomerFilters): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all') {
      if (Array.isArray(value)) {
        params.append(key, value.join(','));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
}

// Get all customers with filters
export async function getCustomers(
  filters: CustomerFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<CustomersResponse> {
  const queryString = buildQueryString(filters);
  const endpoint = `/api/customers?page=${page}&limit=${limit}${queryString ? '&' + queryString : ''}`;
  return apiCall(endpoint);
}

// Get single customer with full details
export async function getCustomer(id: string): Promise<CustomerDetailsResponse> {
  return apiCall(`/api/customers/${id}`);
}

// Create new customer
export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  return apiCall('/api/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update customer
export async function updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
  return apiCall(`/api/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Delete customer
export async function deleteCustomer(id: string): Promise<void> {
  return apiCall(`/api/customers/${id}`, {
    method: 'DELETE',
  });
}

// Get customer statistics
export async function getCustomerStats(): Promise<CustomerStats> {
  return apiCall('/api/customers/stats');
}

// ===== Notes Management =====

// Get customer notes
export async function getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
  return apiCall(`/api/customers/${customerId}/notes`);
}

// Add note
export async function addCustomerNote(
  customerId: string, 
  content: string,
  isImportant: boolean = false,
  tags?: string[]
): Promise<CustomerNote> {
  return apiCall(`/api/customers/${customerId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content, isImportant, tags }),
  });
}

// Update note
export async function updateCustomerNote(
  customerId: string,
  noteId: string,
  data: { content?: string; isImportant?: boolean; tags?: string[] }
): Promise<CustomerNote> {
  return apiCall(`/api/customers/${customerId}/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Delete note
export async function deleteCustomerNote(customerId: string, noteId: string): Promise<void> {
  return apiCall(`/api/customers/${customerId}/notes/${noteId}`, {
    method: 'DELETE',
  });
}

// ===== Interactions Management =====

// Get customer interactions
export async function getCustomerInteractions(customerId: string): Promise<CustomerInteraction[]> {
  return apiCall(`/api/customers/${customerId}/interactions`);
}

// Add interaction
export async function addCustomerInteraction(
  customerId: string,
  data: {
    type: string;
    description: string;
    date: string;
    propertyId?: string;
    contractId?: string;
    outcome?: string;
    nextFollowUp?: string;
  }
): Promise<CustomerInteraction> {
  return apiCall(`/api/customers/${customerId}/interactions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ===== Property Relationships =====

// Link customer to property
export async function linkCustomerToProperty(
  customerId: string,
  propertyId: string,
  relationship: 'owner' | 'tenant' | 'interested' | 'viewed'
): Promise<void> {
  return apiCall(`/api/customers/${customerId}/properties`, {
    method: 'POST',
    body: JSON.stringify({ propertyId, relationship }),
  });
}

// Remove property link
export async function unlinkCustomerFromProperty(
  customerId: string,
  propertyId: string
): Promise<void> {
  return apiCall(`/api/customers/${customerId}/properties/${propertyId}`, {
    method: 'DELETE',
  });
}

// ===== Search & Autocomplete =====

// Search customers (for autocomplete)
export async function searchCustomers(query: string, limit: number = 10): Promise<Customer[]> {
  return apiCall(`/api/customers/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

// Get recent customers
export async function getRecentCustomers(limit: number = 5): Promise<Customer[]> {
  return apiCall(`/api/customers/recent?limit=${limit}`);
}

// ===== Bulk Operations =====

// Bulk update customers
export async function bulkUpdateCustomers(
  ids: string[],
  data: Partial<CustomerFormData>
): Promise<void> {
  return apiCall('/api/customers/bulk', {
    method: 'PATCH',
    body: JSON.stringify({ ids, data }),
  });
}

// Bulk delete customers
export async function bulkDeleteCustomers(ids: string[]): Promise<void> {
  return apiCall('/api/customers/bulk', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

// Export customers to Excel
export async function exportCustomers(filters: CustomerFilters = {}): Promise<Blob> {
  const queryString = buildQueryString(filters);
  const response = await axios.get(
    `${API_URL}/api/customers/export?${queryString}`,
    { responseType: 'blob' }
  );
  return response.data;
}
