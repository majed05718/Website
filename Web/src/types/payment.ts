/**
 * ═══════════════════════════════════════════════════════════════
 * Payment Types - أنواع بيانات المدفوعات
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * حالة الدفعة
 */
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled'

/**
 * نوع الدفعة
 */
export type PaymentType = 'rent' | 'sale' | 'commission' | 'deposit' | 'maintenance'

/**
 * طريقة الدفع
 */
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'check'

/**
 * الدفعة
 */
export interface Payment {
  id: string
  paymentNumber: string           // PMT-2025-0001
  propertyId: string
  propertyName?: string
  customerId: string
  customerName?: string
  amount: number
  type: PaymentType
  status: PaymentStatus
  method?: PaymentMethod
  dueDate: string
  paidDate?: string
  createdAt: string
  updatedAt?: string
  notes?: string
  invoiceUrl?: string
  receiptUrl?: string
  daysOverdue?: number            // محسوب: إذا متأخر
}

/**
 * فلاتر المدفوعات
 */
export interface PaymentFilters {
  status?: PaymentStatus[]
  type?: PaymentType[]
  method?: PaymentMethod[]
  propertyId?: string[]
  customerId?: string[]
  amountMin?: number
  amountMax?: number
  dateFrom?: string
  dateTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  search?: string                 // رقم/عميل/عقار
  lateDays?: number              // متأخر أكثر من X أيام
  dueInDays?: number             // مستحق خلال X أيام
}

/**
 * إحصائيات المدفوعات
 */
export interface PaymentStats {
  totalPayments: {
    current: number                // الشهر الحالي
    previous: number               // الشهر السابق
    change: number                 // نسبة التغيير
    sparkline: number[]            // بيانات sparkline
  }
  duePayments: {
    count: number
    amount: number
  }
  overduePayments: {
    count: number
    amount: number
    oldest: number                 // أقدم متأخر (أيام)
  }
  collectionRate: {
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }
  quickStats: {
    averageAmount: number
    fastestPayment: number         // أسرع دفع (أيام)
    averageDelay: number           // متوسط التأخير (أيام)
  }
}

/**
 * بيانات الرسم البياني الشهري
 */
export interface MonthlyPaymentData {
  month: string
  amount: number
  count: number
  previousYear?: number           // للمقارنة
}

/**
 * توزيع حالات الدفعات
 */
export interface PaymentStatusDistribution {
  status: PaymentStatus
  count: number
  amount: number
  percentage: number
  color: string
}

/**
 * توزيع طرق الدفع
 */
export interface PaymentMethodDistribution {
  method: PaymentMethod
  count: number
  amount: number
  percentage: number
}

/**
 * بيانات الرسم الشهري حسب النوع
 */
export interface MonthlyTypeData {
  month: string
  rent: number
  sale: number
  commission: number
  deposit: number
  maintenance: number
}

/**
 * إجراء جماعي
 */
export interface BulkAction {
  type: 'mark_paid' | 'send_reminder' | 'export' | 'delete'
  paymentIds: string[]
  data?: any                      // بيانات إضافية
}

/**
 * تذكير
 */
export interface PaymentReminder {
  type: 'whatsapp' | 'email' | 'sms'
  message: string
  paymentIds: string[]
}

/**
 * سجل الدفعة (Timeline)
 */
export interface PaymentHistory {
  id: string
  paymentId: string
  action: string                  // created, sent, paid, cancelled
  description: string
  userId?: string
  userName?: string
  createdAt: string
}

/**
 * إنشاء دفعة جديدة
 */
export interface CreatePaymentDto {
  propertyId: string
  customerId: string
  amount: number
  type: PaymentType
  method?: PaymentMethod
  dueDate: string
  notes?: string
  generateInvoice?: boolean
}

/**
 * تحديث دفعة
 */
export interface UpdatePaymentDto {
  amount?: number
  type?: PaymentType
  method?: PaymentMethod
  status?: PaymentStatus
  dueDate?: string
  paidDate?: string
  notes?: string
}

/**
 * وضع علامة كمدفوع
 */
export interface MarkAsPaidDto {
  paidDate: string
  method: PaymentMethod
  notes?: string
}

/**
 * تصدير المدفوعات
 */
export interface ExportPaymentsDto {
  filters: PaymentFilters
  columns: string[]
  format: 'excel' | 'csv' | 'pdf'
}

/**
 * بيانات Dashboard الكاملة
 */
export interface PaymentsDashboardData {
  stats: PaymentStats
  recentPayments: Payment[]
  monthlyData: MonthlyPaymentData[]
  statusDistribution: PaymentStatusDistribution[]
  methodDistribution: PaymentMethodDistribution[]
  monthlyTypeData: MonthlyTypeData[]
  overduePayments: Payment[]
}

/**
 * تسميات حالات الدفع
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'مدفوع',
  pending: 'معلق',
  overdue: 'متأخر',
  cancelled: 'ملغي'
}

/**
 * ألوان حالات الدفع
 */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

/**
 * تسميات أنواع الدفع
 */
export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  rent: 'إيجار',
  sale: 'بيع',
  commission: 'عمولة',
  deposit: 'تأمين',
  maintenance: 'صيانة'
}

/**
 * ألوان أنواع الدفع
 */
export const PAYMENT_TYPE_COLORS: Record<PaymentType, string> = {
  rent: 'bg-blue-100 text-blue-800',
  sale: 'bg-green-100 text-green-800',
  commission: 'bg-orange-100 text-orange-800',
  deposit: 'bg-purple-100 text-purple-800',
  maintenance: 'bg-yellow-100 text-yellow-800'
}

/**
 * تسميات طرق الدفع
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'نقدي',
  bank_transfer: 'تحويل بنكي',
  credit_card: 'بطاقة ائتمان',
  check: 'شيك'
}

/**
 * أيقونات طرق الدفع
 */
export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  cash: '💵',
  bank_transfer: '🏦',
  credit_card: '💳',
  check: '📄'
}

/**
 * ألوان الرسوم البيانية
 */
export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899'
}
