/**
 * ═══════════════════════════════════════════════════════════════
 * Maintenance Types - أنواع بيانات الصيانة
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * أولوية الطلب
 */
export type MaintenancePriority = 'urgent' | 'high' | 'medium' | 'low'

/**
 * حالة الطلب
 */
export type MaintenanceStatus = 
  | 'new'           // جديد
  | 'assigned'      // تم الإسناد
  | 'in_progress'   // قيد التنفيذ
  | 'completed'     // مكتمل
  | 'cancelled'     // ملغي

/**
 * نوع المشكلة
 */
export type IssueType = 
  | 'electrical'    // كهرباء
  | 'plumbing'      // سباكة
  | 'ac'            // تكييف
  | 'carpentry'     // نجارة
  | 'painting'      // دهان
  | 'general'       // عام
  | 'other'         // أخرى

/**
 * طلب صيانة
 */
export interface MaintenanceRequest {
  id: string
  trackingCode: string           // TRACK-XXXXX
  requestNumber: string          // REQ-2025-0001
  propertyId: string
  propertyName?: string
  tenantName: string
  tenantPhone: string
  tenantEmail?: string
  issueType: IssueType
  description: string
  images?: string[]
  priority: MaintenancePriority
  status: MaintenanceStatus
  assignedTo?: string            // staff member ID
  assignedToName?: string
  expectedCompletionDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  // Computed
  elapsedTime?: string           // XX hours/days
  isOverdue?: boolean
}

/**
 * إحصائيات الصيانة
 */
export interface MaintenanceStats {
  openRequests: number
  inProgressRequests: number
  completedThisMonth: number
  averageClosingTime: number     // بالساعات
  overdueRequests?: number
  totalRequests?: number
}

/**
 * سجل الطلب
 */
export interface MaintenanceHistory {
  id: string
  requestId: string
  status: MaintenanceStatus
  changedBy: string
  changedByName?: string
  notes?: string
  createdAt: string
}

/**
 * فلاتر الطلبات
 */
export interface MaintenanceFilters {
  status?: MaintenanceStatus[]
  priority?: MaintenancePriority[]
  issueType?: IssueType[]
  propertyId?: string
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

/**
 * DTO لإنشاء طلب صيانة
 */
export interface CreateMaintenanceRequestDto {
  propertyId: string
  tenantName: string
  tenantPhone: string
  tenantEmail?: string
  issueType: IssueType
  description: string
  images?: File[]
  priority: MaintenancePriority
  assignedTo?: string
}

/**
 * DTO لتحديث طلب صيانة
 */
export interface UpdateMaintenanceRequestDto {
  priority?: MaintenancePriority
  status?: MaintenanceStatus
  assignedTo?: string
  expectedCompletionDate?: string
  notes?: string
}

/**
 * DTO للإسناد
 */
export interface AssignMaintenanceDto {
  assignedTo: string
  expectedCompletionDate?: string
  notes?: string
}

/**
 * DTO للتتبع
 */
export interface TrackRequestDto {
  trackingCode: string
}

/**
 * معلومات التتبع
 */
export interface TrackingInfo {
  request: MaintenanceRequest
  timeline: MaintenanceHistory[]
}

/**
 * تسميات الأولويات
 */
export const PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  urgent: 'عاجل',
  high: 'عالي',
  medium: 'متوسط',
  low: 'منخفض'
}

/**
 * ألوان الأولويات
 */
export const PRIORITY_COLORS: Record<MaintenancePriority, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800'
}

/**
 * تسميات الحالات
 */
export const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  new: 'جديد',
  assigned: 'تم الإسناد',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي'
}

/**
 * ألوان الحالات
 */
export const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

/**
 * تسميات أنواع المشاكل
 */
export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  electrical: 'كهرباء',
  plumbing: 'سباكة',
  ac: 'تكييف',
  carpentry: 'نجارة',
  painting: 'دهان',
  general: 'عام',
  other: 'أخرى'
}

/**
 * أيقونات أنواع المشاكل
 */
export const ISSUE_TYPE_ICONS: Record<IssueType, string> = {
  electrical: 'Zap',
  plumbing: 'Droplet',
  ac: 'Wind',
  carpentry: 'Hammer',
  painting: 'Paintbrush',
  general: 'Wrench',
  other: 'MoreHorizontal'
}

/**
 * ألوان أنواع المشاكل
 */
export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  electrical: 'text-yellow-600',
  plumbing: 'text-blue-600',
  ac: 'text-cyan-600',
  carpentry: 'text-amber-600',
  painting: 'text-purple-600',
  general: 'text-gray-600',
  other: 'text-slate-600'
}
