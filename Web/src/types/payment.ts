/**
 * ═══════════════════════════════════════════════════════════════
 * Payment Types - أنواع المدفوعات
 * ═══════════════════════════════════════════════════════════════
 */

// نوع الدفعة
export type PaymentType = 'rent' | 'installment' | 'insurance' | 'fees' | 'other';

// حالة الدفعة
export type PaymentStatus = 'paid' | 'due' | 'overdue' | 'cancelled';

// طريقة الدفع
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'cheque' | 'online';

// الدفعة
export interface Payment {
  id: string;
  invoiceNumber: string;         // INV-2025-0001
  contractId: string;             // العقد
  contractNumber?: string;
  clientId: string;               // العميل
  clientName?: string;
  
  type: PaymentType;              // النوع
  amount: number;                 // المبلغ
  
  dueDate: string;                // تاريخ الاستحقاق
  paidDate?: string;              // تاريخ الدفع الفعلي
  status: PaymentStatus;          // الحالة
  
  paymentMethod?: PaymentMethod;  // طريقة الدفع
  
  // معلومات إضافية
  notes?: string;                 // ملاحظات
  reference?: string;             // رقم مرجعي
  attachments?: string[];         // مرفقات
  
  // الحالة المحسوبة
  daysOverdue?: number;           // الأيام المتأخرة
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

// إحصائيات المدفوعات
export interface PaymentStats {
  totalThisMonth: number;         // إجمالي المدفوعات هذا الشهر
  totalLastMonth: number;         // الشهر السابق (للمقارنة)
  percentageChange: number;       // نسبة التغيير
  
  totalDue: number;               // المستحقة
  dueCount: number;               // عدد الفواتير المستحقة
  
  totalOverdue: number;           // المتأخرة
  overdueCount: number;           // عدد الفواتير المتأخرة
  oldestOverdueDays: number;      // أقدم فاتورة متأخرة (أيام)
  
  collectionRate: number;         // معدل التحصيل (%)
  collectionTrend: 'up' | 'down' | 'stable'; // الاتجاه
}

// فلاتر المدفوعات
export interface PaymentFilters {
  status?: PaymentStatus[];
  type?: PaymentType[];
  paymentMethod?: PaymentMethod[];
  dueDateFrom?: string;
  dueDateTo?: string;
  paidDateFrom?: string;
  paidDateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  contractId?: string;
  clientId?: string;
  search?: string;              // رقم الفاتورة أو اسم العميل
}

// بيانات الرسم البياني
export interface ChartData {
  month: string;
  amount: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
}

// تسميات نوع الدفعة
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  rent: 'إيجار',
  installment: 'قسط',
  insurance: 'تأمين',
  fees: 'رسوم',
  other: 'أخرى'
};

// تسميات حالة الدفعة
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'مدفوع',
  due: 'مستحق',
  overdue: 'متأخر',
  cancelled: 'ملغي'
};

// تسميات طريقة الدفع
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'نقدي',
  bank_transfer: 'تحويل بنكي',
  credit_card: 'بطاقة ائتمان',
  cheque: 'شيك',
  online: 'دفع إلكتروني'
};

// ألوان حالة الدفعة
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-800',
  due: 'bg-orange-100 text-orange-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

// ألوان نوع الدفعة
export const PAYMENT_TYPE_COLORS: Record<PaymentType, string> = {
  rent: 'bg-blue-100 text-blue-800',
  installment: 'bg-purple-100 text-purple-800',
  insurance: 'bg-green-100 text-green-800',
  fees: 'bg-amber-100 text-amber-800',
  other: 'bg-gray-100 text-gray-800'
};
