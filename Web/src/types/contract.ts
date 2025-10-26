/**
 * ═══════════════════════════════════════════════════════════════
 * Contract Types - أنواع العقود
 * ═══════════════════════════════════════════════════════════════
 */

// نوع العقد
export type ContractType = 'rental' | 'sale' | 'maintenance';

// حالة العقد
export type ContractStatus = 'active' | 'expired' | 'cancelled' | 'pending';

// الحالة المالية
export type PaymentStatus = 'paid' | 'partial' | 'due';

// العقد
export interface Contract {
  id: string;
  contractNumber: string;        // CON-2025-0001
  type: ContractType;            // نوع العقد
  status: ContractStatus;        // حالة العقد
  
  // الأطراف
  propertyId: string;            // العقار
  propertyName?: string;
  clientId: string;              // العميل/الطرف الثاني
  clientName?: string;
  
  // المبالغ
  totalAmount: number;           // القيمة الإجمالية
  paidAmount: number;            // المبلغ المدفوع
  remainingAmount: number;       // المبلغ المتبقي
  
  // التواريخ
  startDate: string;             // تاريخ البداية
  endDate: string;               // تاريخ الانتهاء
  signedDate: string;            // تاريخ التوقيع
  
  // معلومات إضافية
  terms?: string;                // شروط العقد
  notes?: string;                // ملاحظات
  attachments?: string[];        // مرفقات
  
  // الحالة المحسوبة
  paymentStatus?: PaymentStatus; // حالة الدفع
  daysRemaining?: number;        // الأيام المتبقية
  paymentProgress?: number;      // نسبة الدفع (0-100)
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

// فلاتر العقود
export interface ContractFilters {
  type?: ContractType[];
  status?: ContractStatus[];
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;              // البحث بالرقم أو الاسم
  paymentStatus?: PaymentStatus[];
}

// إحصائيات العقود
export interface ContractStats {
  totalActive: number;           // إجمالي النشطة
  expiredThisMonth: number;      // المنتهية هذا الشهر
  totalActiveValue: number;      // القيمة الإجمالية للنشطة
  expiringIn30Days: number;      // قاربت على الانتهاء (30 يوم)
  needsRenewal: number;          // تحتاج تجديد
  overduePayments: number;       // مدفوعات متأخرة
}

// خيارات العرض
export type ViewMode = 'table' | 'grid' | 'timeline';

// تسميات نوع العقد
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  rental: 'إيجار',
  sale: 'بيع',
  maintenance: 'صيانة'
};

// تسميات حالة العقد
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: 'نشط',
  expired: 'منتهي',
  cancelled: 'ملغي',
  pending: 'معلق'
};

// تسميات الحالة المالية
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'مدفوع',
  partial: 'جزئي',
  due: 'مستحق'
};

// ألوان نوع العقد
export const CONTRACT_TYPE_COLORS: Record<ContractType, string> = {
  rental: 'bg-blue-100 text-blue-800',
  sale: 'bg-green-100 text-green-800',
  maintenance: 'bg-purple-100 text-purple-800'
};

// ألوان حالة العقد
export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
};

// ألوان الحالة المالية
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  due: 'bg-red-100 text-red-800'
};
