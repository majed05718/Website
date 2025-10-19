// Customer Types - Full Implementation

export type CustomerType = 'buyer' | 'seller' | 'tenant' | 'landlord' | 'both';

export type CustomerStatus = 'active' | 'inactive' | 'potential' | 'archived';

export type ContactMethod = 'phone' | 'whatsapp' | 'email' | 'in_person';

export type InteractionType = 
  | 'call' 
  | 'meeting' 
  | 'property_viewing' 
  | 'contract_signing'
  | 'payment'
  | 'complaint'
  | 'inquiry'
  | 'follow_up';

export interface Customer {
  id: string;
  officeId: string;
  
  // معلومات أساسية
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  
  // التصنيف
  type: CustomerType;
  status: CustomerStatus;
  
  // معلومات إضافية
  address?: string;
  city?: string;
  preferredContactMethod: ContactMethod;
  notes?: string;
  
  // الارتباطات
  propertiesCount: number;        // عدد العقارات المرتبطة
  contractsCount: number;         // عدد العقود
  activeContractsCount: number;   // العقود النشطة
  
  // Tags للتصنيف
  tags?: string[];
  
  // الإحصائيات المالية
  totalSpent?: number;            // إجمالي المدفوع
  totalEarned?: number;           // إجمالي المكتسب (للبائعين)
  outstandingBalance?: number;    // الرصيد المستحق
  
  // التواريخ
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  
  // العلاقات
  assignedStaffId?: string;       // الموظف المسؤول
  assignedStaffName?: string;
  
  // Metadata
  source?: string;                // مصدر العميل (موقع، إعلان، إحالة)
  rating?: number;                // تقييم العميل (1-5)
}

export interface CustomerNote {
  id: string;
  customerId: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isImportant: boolean;
  tags?: string[];
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: InteractionType;
  description: string;
  date: string;
  staffId: string;
  staffName: string;
  propertyId?: string;            // إذا كانت مرتبطة بعقار
  propertyTitle?: string;
  contractId?: string;            // إذا كانت مرتبطة بعقد
  outcome?: string;               // نتيجة التعامل
  nextFollowUp?: string;          // موعد المتابعة القادم
  createdAt: string;
}

export interface CustomerProperty {
  id: string;
  customerId: string;
  propertyId: string;
  relationship: 'owner' | 'tenant' | 'interested' | 'viewed';
  
  // Property details (embedded for quick access)
  propertyTitle: string;
  propertyType: string;
  propertyStatus: string;
  propertyPrice: number;
  propertyImage?: string;
  
  // Dates
  startDate?: string;             // تاريخ البدء (للإيجار)
  endDate?: string;               // تاريخ الانتهاء
  viewedAt?: string;              // تاريخ المعاينة
  interestedAt?: string;          // تاريخ الاهتمام
  
  createdAt: string;
}

export interface CustomerContract {
  id: string;
  customerId: string;
  contractId: string;
  role: 'buyer' | 'seller' | 'tenant' | 'landlord';
  
  // Contract details (embedded)
  contractNumber: string;
  propertyTitle: string;
  contractType: string;
  status: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  
  // Payment info
  paidAmount: number;
  remainingAmount: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  
  createdAt: string;
}

// Form Types
export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  type: CustomerType;
  status: CustomerStatus;
  address?: string;
  city?: string;
  preferredContactMethod: ContactMethod;
  notes?: string;
  tags?: string[];
  source?: string;
  assignedStaffId?: string;
}

// Filter Types
export interface CustomerFilters {
  search?: string;
  type?: CustomerType | 'all';
  status?: CustomerStatus | 'all';
  city?: string;
  hasActiveContracts?: boolean;
  assignedStaffId?: string;
  tags?: string[];
  createdFrom?: string;
  createdTo?: string;
  lastContactFrom?: string;
  lastContactTo?: string;
}

// API Response Types
export interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerDetailsResponse {
  customer: Customer;
  properties: CustomerProperty[];
  contracts: CustomerContract[];
  interactions: CustomerInteraction[];
  notes: CustomerNote[];
}

// Statistics
export interface CustomerStats {
  total: number;
  active: number;
  potential: number;
  buyers: number;
  sellers: number;
  tenants: number;
  landlords: number;
  newThisMonth: number;
  totalRevenue: number;
  averageRating: number;
}
