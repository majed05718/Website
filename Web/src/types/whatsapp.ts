/**
 * ═══════════════════════════════════════════════════════════════
 * WhatsApp Types - أنواع بيانات WhatsApp
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * حالة الرسالة
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

/**
 * اتجاه الرسالة
 */
export type MessageDirection = 'incoming' | 'outgoing'

/**
 * نوع الوسائط
 */
export type MediaType = 'image' | 'document' | 'audio' | 'video' | 'location'

/**
 * فئة القالب
 */
export type TemplateCategory = 
  | 'welcome'       // ترحيب
  | 'properties'    // عقارات
  | 'appointments'  // مواعيد
  | 'follow_up'     // متابعة
  | 'thanks'        // شكر
  | 'general'       // عام

/**
 * رسالة WhatsApp
 */
export interface WhatsAppMessage {
  id: string
  conversationId: string
  whatsappMessageId?: string
  direction: MessageDirection
  content: string
  mediaUrl?: string
  mediaType?: MediaType
  status: MessageStatus
  sentAt: string
  deliveredAt?: string
  readAt?: string
  createdAt: string
}

/**
 * محادثة WhatsApp
 */
export interface WhatsAppConversation {
  id: string
  customerId: string
  customerPhone: string
  customerName: string
  customerAvatar?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  isArchived: boolean
  isStarred: boolean
  isOnline?: boolean
  isTyping?: boolean
  createdAt: string
  updatedAt: string
}

/**
 * قالب رسالة
 */
export interface WhatsAppTemplate {
  id: string
  name: string
  category: TemplateCategory
  content: string
  variables: string[]              // ['name', 'property', 'date']
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

/**
 * معلومات العميل في الـ Panel
 */
export interface CustomerInfo {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  type: 'buyer' | 'seller' | 'tenant' | 'landlord'
  customerSince: string
  interestedProperties?: Array<{
    id: string
    thumbnail?: string
    title: string
    price: number
    status: string
  }>
  upcomingAppointments?: Array<{
    id: string
    date: string
    time: string
    property: string
    status: string
  }>
  notes?: string
}

/**
 * فلاتر المحادثات
 */
export interface ConversationFilters {
  search?: string
  filter?: 'all' | 'unread' | 'starred' | 'archived'
}

/**
 * DTO لإرسال رسالة
 */
export interface SendMessageDto {
  conversationId: string
  content: string
  mediaUrl?: string
  mediaType?: MediaType
}

/**
 * DTO لإرسال قالب
 */
export interface SendTemplateDto {
  conversationId: string
  templateId: string
  variables: Record<string, string>
}

/**
 * DTO لإنشاء قالب
 */
export interface CreateTemplateDto {
  name: string
  category: TemplateCategory
  content: string
  variables: string[]
}

/**
 * DTO لتحديث قالب
 */
export interface UpdateTemplateDto {
  name?: string
  category?: TemplateCategory
  content?: string
  variables?: string[]
  isActive?: boolean
}

/**
 * تسميات الحالات
 */
export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  sending: 'جارٍ الإرسال',
  sent: 'تم الإرسال',
  delivered: 'تم التوصيل',
  read: 'تمت القراءة',
  failed: 'فشل'
}

/**
 * تسميات فئات القوالب
 */
export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  welcome: 'ترحيب',
  properties: 'عقارات',
  appointments: 'مواعيد',
  follow_up: 'متابعة',
  thanks: 'شكر',
  general: 'عام'
}

/**
 * أيقونات الحالات
 */
export const MESSAGE_STATUS_ICONS: Record<MessageStatus, string> = {
  sending: '⏳',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
  failed: '❌'
}
