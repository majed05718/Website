import type { Customer, CustomerType, CustomerStatus } from '@/types/customer';

// Get customer type label in Arabic
export function getCustomerTypeLabel(type: CustomerType): string {
  const labels: Record<CustomerType, string> = {
    buyer: 'مشتري',
    seller: 'بائع',
    tenant: 'مستأجر',
    landlord: 'مؤجر',
    both: 'بائع ومشتري',
  };
  return labels[type] || type;
}

// Get customer type color
export function getCustomerTypeColor(type: CustomerType): string {
  const colors: Record<CustomerType, string> = {
    buyer: 'bg-blue-100 text-blue-800',
    seller: 'bg-green-100 text-green-800',
    tenant: 'bg-purple-100 text-purple-800',
    landlord: 'bg-orange-100 text-orange-800',
    both: 'bg-indigo-100 text-indigo-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

// Get customer status label in Arabic
export function getCustomerStatusLabel(status: CustomerStatus): string {
  const labels: Record<CustomerStatus, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    potential: 'محتمل',
    archived: 'مؤرشف',
  };
  return labels[status] || status;
}

// Get customer status color
export function getCustomerStatusColor(status: CustomerStatus): string {
  const colors: Record<CustomerStatus, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    potential: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Saudi format: +966 5X XXX XXXX
  if (cleaned.startsWith('966')) {
    return `+966 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // Local format: 05X XXX XXXX
  if (cleaned.startsWith('05')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
}

// Validate Saudi phone number
export function isValidSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Should start with 05 and be 10 digits OR start with 9665 and be 12 digits
  return (
    (cleaned.startsWith('05') && cleaned.length === 10) ||
    (cleaned.startsWith('9665') && cleaned.length === 12)
  );
}

// Validate Saudi National ID
export function isValidNationalId(id: string): boolean {
  const cleaned = id.replace(/\D/g, '');
  
  // Should be 10 digits and start with 1 or 2
  if (cleaned.length !== 10) return false;
  if (!['1', '2'].includes(cleaned[0])) return false;
  
  return true;
}

// Calculate customer value/score
export function calculateCustomerValue(customer: Customer): number {
  let score = 0;
  
  // Active contracts boost
  score += (customer.activeContractsCount || 0) * 20;
  
  // Total contracts
  score += (customer.contractsCount || 0) * 10;
  
  // Financial contribution
  if (customer.totalSpent) {
    score += Math.min(customer.totalSpent / 10000, 30); // Max 30 points
  }
  
  // Rating
  if (customer.rating) {
    score += customer.rating * 4; // Max 20 points
  }
  
  // Recency - contacted in last 30 days
  if (customer.lastContactDate) {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(customer.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceContact < 30) {
      score += 20;
    }
  }
  
  return Math.round(score);
}

// Get customer value tier
export function getCustomerValueTier(customer: Customer): {
  tier: 'VIP' | 'High' | 'Medium' | 'Low';
  label: string;
  color: string;
} {
  const value = calculateCustomerValue(customer);
  
  if (value >= 80) {
    return { tier: 'VIP', label: 'عميل مميز', color: 'text-purple-600' };
  } else if (value >= 50) {
    return { tier: 'High', label: 'عميل مهم', color: 'text-blue-600' };
  } else if (value >= 25) {
    return { tier: 'Medium', label: 'عميل متوسط', color: 'text-green-600' };
  } else {
    return { tier: 'Low', label: 'عميل جديد', color: 'text-gray-600' };
  }
}

// Format currency
export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date in Arabic
export function formatDate(date: string | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Format relative time (e.g., "منذ 3 أيام")
export function formatRelativeTime(date: string | undefined): string {
  if (!date) return '-';
  
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`;
  return `منذ ${Math.floor(diffDays / 365)} سنوات`;
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate random avatar color
export function getAvatarColor(id: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ];
  
  // Use ID to consistently get same color for same customer
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
