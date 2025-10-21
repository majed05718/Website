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

// Dynamic API URL for Replit
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();
console.log('🔵 API URL:', API_URL);

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
  const url = `${API_URL}/customers?page=${page}&limit=${limit}${queryString ? '&' + queryString : ''}`;
  
  const response = await axios.get<CustomersResponse>(url);
  return response.data;
}

// Get single customer with full details
export async function getCustomer(id: string): Promise<CustomerDetailsResponse> {
  const response = await axios.get<CustomerDetailsResponse>(`${API_URL}/customers/${id}`);
  return response.data;
}

// Create new customer
export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  const response = await axios.post<Customer>(`${API_URL}/customers`, data);
  return response.data;
}

// Update customer
export async function updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
  const response = await axios.patch<Customer>(`${API_URL}/customers/${id}`, data);
  return response.data;
}

// Delete customer
export async function deleteCustomer(id: string): Promise<void> {
  await axios.delete(`${API_URL}/customers/${id}`);
}

// Get customer statistics
export async function getCustomerStats(): Promise<CustomerStats> {
  const response = await axios.get<CustomerStats>(`${API_URL}/customers/stats`);
  return response.data;
}

// ===== Notes Management =====

// Get customer notes
export async function getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
  const response = await axios.get<CustomerNote[]>(`${API_URL}/customers/${customerId}/notes`);
  return response.data;
}

// Add note
export async function addCustomerNote(
  customerId: string, 
  content: string,
  isImportant: boolean = false,
  tags?: string[]
): Promise<CustomerNote> {
  const response = await axios.post<CustomerNote>(
    `${API_URL}/customers/${customerId}/notes`,
    { content, isImportant, tags }
  );
  return response.data;
}

// Update note
export async function updateCustomerNote(
  customerId: string,
  noteId: string,
  data: { content?: string; isImportant?: boolean; tags?: string[] }
): Promise<CustomerNote> {
  const response = await axios.patch<CustomerNote>(
    `${API_URL}/customers/${customerId}/notes/${noteId}`,
    data
  );
  return response.data;
}

// Delete note
export async function deleteCustomerNote(customerId: string, noteId: string): Promise<void> {
  await axios.delete(`${API_URL}/customers/${customerId}/notes/${noteId}`);
}

// ===== Interactions Management =====

// Get customer interactions
export async function getCustomerInteractions(customerId: string): Promise<CustomerInteraction[]> {
  const response = await axios.get<CustomerInteraction[]>(
    `${API_URL}/customers/${customerId}/interactions`
  );
  return response.data;
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
  const response = await axios.post<CustomerInteraction>(
    `${API_URL}/customers/${customerId}/interactions`,
    data
  );
  return response.data;
}

// ===== Property Relationships =====

// Link customer to property
export async function linkCustomerToProperty(
  customerId: string,
  propertyId: string,
  relationship: 'owner' | 'tenant' | 'interested' | 'viewed'
): Promise<void> {
  await axios.post(`${API_URL}/customers/${customerId}/properties`, {
    propertyId,
    relationship
  });
}

// Remove property link
export async function unlinkCustomerFromProperty(
  customerId: string,
  propertyId: string
): Promise<void> {
  await axios.delete(`${API_URL}/customers/${customerId}/properties/${propertyId}`);
}

// ===== Search & Autocomplete =====

// Search customers (for autocomplete)
export async function searchCustomers(query: string, limit: number = 10): Promise<Customer[]> {
  const response = await axios.get<Customer[]>(
    `${API_URL}/customers/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return response.data;
}

// Get recent customers
export async function getRecentCustomers(limit: number = 5): Promise<Customer[]> {
  const response = await axios.get<Customer[]>(
    `${API_URL}/customers/recent?limit=${limit}`
  );
  return response.data;
}

// ===== Bulk Operations =====

// Bulk update customers
export async function bulkUpdateCustomers(
  ids: string[],
  data: Partial<CustomerFormData>
): Promise<void> {
  await axios.patch(`${API_URL}/customers/bulk`, { ids, data });
}

// Bulk delete customers
export async function bulkDeleteCustomers(ids: string[]): Promise<void> {
  await axios.delete(`${API_URL}/customers/bulk`, { data: { ids } });
}

// Export customers to Excel
export async function exportCustomers(filters: CustomerFilters = {}): Promise<Blob> {
  const queryString = buildQueryString(filters);
  const response = await axios.get(
    `${API_URL}/customers/export?${queryString}`,
    { responseType: 'blob' }
  );
  return response.data;
}
