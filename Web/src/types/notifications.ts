/**
 * ═══════════════════════════════════════════════════════════════
 * Notifications Types - أنواع بيانات الإشعارات
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * نوع الإشعار
 */
export type NotificationType = 
  | 'appointment'      // موعد
  | 'customer'         // عميل
  | 'whatsapp'         // رسالة واتساب
  | 'maintenance'      // صيانة
  | 'payment'          // دفعة
  | 'contract'         // عقد
  | 'property'         // عقار
  | 'system'           // نظام

/**
 * حالة الإشعار
 */
export type NotificationStatus = 'unread' | 'read'

/**
 * إشعار
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  link?: string                  // رابط للصفحة ذات الصلة
  status: NotificationStatus
  userId: string                 // للمستلم
  createdAt: string
  readAt?: string
}

/**
 * فلاتر الإشعارات
 */
export interface NotificationFilters {
  type?: NotificationType[]
  status?: NotificationStatus
  dateFrom?: string
  dateTo?: string
}

/**
 * إحصائيات الإشعارات
 */
export interface NotificationStats {
  total: number
  unread: number
  todayCount: number
}

/**
 * تسميات أنواع الإشعارات
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  appointment: 'موعد',
  customer: 'عميل',
  whatsapp: 'واتساب',
  maintenance: 'صيانة',
  payment: 'دفعة',
  contract: 'عقد',
  property: 'عقار',
  system: 'نظام'
}

/**
 * أيقونات أنواع الإشعارات
 */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  appointment: 'Calendar',
  customer: 'Users',
  whatsapp: 'MessageCircle',
  maintenance: 'Wrench',
  payment: 'DollarSign',
  contract: 'FileText',
  property: 'Building',
  system: 'Bell'
}

/**
 * ألوان أنواع الإشعارات
 */
export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  appointment: 'text-blue-600 bg-blue-100',
  customer: 'text-green-600 bg-green-100',
  whatsapp: 'text-emerald-600 bg-emerald-100',
  maintenance: 'text-orange-600 bg-orange-100',
  payment: 'text-purple-600 bg-purple-100',
  contract: 'text-indigo-600 bg-indigo-100',
  property: 'text-cyan-600 bg-cyan-100',
  system: 'text-gray-600 bg-gray-100'
}
