/**
 * ═══════════════════════════════════════════════════════════════
 * Settings Types - أنواع بيانات الإعدادات
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Theme
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Font
 */
export type FontFamily = 'Cairo' | 'Tajawal' | 'Almarai'

/**
 * Font Size
 */
export type FontSize = 'small' | 'medium' | 'large'

/**
 * Role
 */
export type UserRole = 'admin' | 'manager' | 'agent' | 'support'

/**
 * User Status
 */
export type UserStatus = 'active' | 'inactive'

/**
 * معلومات المكتب
 */
export interface OfficeInfo {
  name: string
  logo?: string
  phone: string
  email: string
  address: string
  location?: {
    lat: number
    lng: number
  }
  description?: string
  workingHours?: {
    from: string
    to: string
    days: string[]
  }
}

/**
 * إعدادات المظهر
 */
export interface AppearanceSettings {
  theme: Theme
  primaryColor: string
  fontFamily: FontFamily
  fontSize: FontSize
}

/**
 * إعدادات الإشعارات
 */
export interface NotificationSettings {
  inApp: {
    newAppointment: boolean
    newCustomer: boolean
    whatsappMessage: boolean
    maintenanceRequest: boolean
    paymentDue: boolean
  }
  email: {
    dailySummary: boolean
    weeklyReport: boolean
    importantAlerts: boolean
  }
  sms: {
    todayAppointments: boolean
    urgentAlerts: boolean
  }
  sound: boolean
}

/**
 * موظف/مستخدم
 */
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: UserRole
  status: UserStatus
  permissions?: string[]
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

/**
 * دور مخصص
 */
export interface CustomRole {
  id: string
  name: string
  description?: string
  permissions: string[]
  usersCount: number
  createdAt: string
}

/**
 * صلاحية
 */
export interface Permission {
  module: string
  actions: string[]              // ['view', 'add', 'edit', 'delete', 'export']
}

/**
 * سجل النشاط
 */
export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'exported'
  module: string                 // properties, customers, etc
  itemId?: string
  itemName?: string
  ipAddress: string
  details?: any
  createdAt: string
}

/**
 * إعدادات التكاملات
 */
export interface IntegrationSettings {
  whatsapp?: {
    enabled: boolean
    apiKey?: string
    phoneNumber?: string
    status?: 'connected' | 'disconnected'
  }
  googleMaps?: {
    enabled: boolean
    apiKey?: string
  }
  smtp?: {
    enabled: boolean
    host: string
    port: number
    username: string
    password: string
    fromEmail: string
    fromName: string
  }
  sms?: {
    enabled: boolean
    provider: string
    apiKey: string
    senderId: string
  }
}

/**
 * نسخة احتياطية
 */
export interface Backup {
  id: string
  filename: string
  size: number                   // bytes
  duration: number               // seconds
  includeFiles: boolean
  includeLog: boolean
  isEncrypted: boolean
  createdAt: string
  status: 'completed' | 'failed' | 'in_progress'
}

/**
 * إعدادات النسخ الاحتياطي
 */
export interface BackupSettings {
  autoBackup: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  retention: number              // days
  storage: 'local' | 'cloud'
  cloudProvider?: string
}

/**
 * إعدادات متقدمة
 */
export interface AdvancedSettings {
  database: {
    maxConnections: number
    queryTimeout: number
  }
  api: {
    rateLimit: number
    version: string
  }
  debugMode: boolean
}

/**
 * Webhook
 */
export interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  secret?: string
  createdAt: string
}

/**
 * تسميات الأدوار
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'مدير',
  manager: 'مسؤول',
  agent: 'وكيل',
  support: 'دعم فني'
}

/**
 * ألوان الأدوار
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  agent: 'bg-green-100 text-green-800',
  support: 'bg-gray-100 text-gray-800'
}

/**
 * تسميات حالات المستخدم
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'نشط',
  inactive: 'غير نشط'
}

/**
 * ألوان حالات المستخدم
 */
export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800'
}

/**
 * الألوان المتاحة
 */
export const PRESET_COLORS = [
  { name: 'أزرق', value: '#3b82f6' },
  { name: 'أخضر', value: '#10b981' },
  { name: 'برتقالي', value: '#f97316' },
  { name: 'بنفسجي', value: '#8b5cf6' },
  { name: 'وردي', value: '#ec4899' },
  { name: 'أحمر', value: '#ef4444' },
  { name: 'أصفر', value: '#eab308' },
  { name: 'سماوي', value: '#06b6d4' },
  { name: 'رمادي', value: '#6b7280' },
  { name: 'أسود', value: '#1f2937' }
]
