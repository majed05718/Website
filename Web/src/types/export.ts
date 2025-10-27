/**
 * ═══════════════════════════════════════════════════════════════
 * Export Types - أنواع التصدير
 * ═══════════════════════════════════════════════════════════════
 */

// تنسيق الملف
export type ExportFormat = 'xlsx' | 'csv' | 'pdf'

// نوع التصدير
export type ExportType = 'all' | 'selected' | 'filtered' | 'date-range'

// الأعمدة المتاحة للتصدير (العملاء)
export type CustomerExportColumn =
  | 'name'
  | 'phone'
  | 'email'
  | 'type'
  | 'status'
  | 'budget'
  | 'preferredCities'
  | 'preferredPropertyTypes'
  | 'source'
  | 'createdAt'
  | 'lastContactDate'
  | 'viewingsCount'
  | 'interestedPropertiesCount'
  | 'notes'
  | 'city'
  | 'address'
  | 'nationalId'
  | 'assignedStaffName'
  | 'tags'
  | 'rating'

// خيارات التنسيق
export interface ExportStyling {
  includeHeader: boolean
  includeLogo: boolean
  includeOfficeInfo: boolean
  autoNumbering: boolean
  includeStats: boolean
}

// نطاق زمني
export interface DateRange {
  from: string
  to: string
}

// إعدادات التصدير
export interface ExportConfig {
  exportType: ExportType
  selectedIds: string[]
  dateRange: DateRange
  columns: CustomerExportColumn[]
  format: ExportFormat
  styling: ExportStyling
}

// سجل التصدير
export interface ExportHistoryItem {
  id: string
  filename: string
  format: ExportFormat
  date: string
  rowCount: number
  fileSize: string
  downloadUrl?: string
}

// معلومات الأعمدة
export interface ColumnInfo {
  key: CustomerExportColumn
  label: string
  description?: string
  required?: boolean
  category: 'basic' | 'contact' | 'preferences' | 'stats' | 'other'
}

// الأعمدة المتاحة مع معلوماتها
export const AVAILABLE_COLUMNS: ColumnInfo[] = [
  // أساسية
  {
    key: 'name',
    label: 'الاسم',
    description: 'اسم العميل الكامل',
    required: true,
    category: 'basic'
  },
  {
    key: 'phone',
    label: 'رقم الهاتف',
    description: 'رقم هاتف العميل',
    required: true,
    category: 'contact'
  },
  {
    key: 'email',
    label: 'البريد الإلكتروني',
    category: 'contact'
  },
  {
    key: 'type',
    label: 'النوع',
    description: 'نوع العميل (مشتري/بائع/مستأجر/مالك)',
    category: 'basic'
  },
  {
    key: 'status',
    label: 'الحالة',
    description: 'حالة العميل (نشط/محتمل/غير نشط)',
    category: 'basic'
  },
  
  // معلومات إضافية
  {
    key: 'nationalId',
    label: 'الهوية الوطنية',
    category: 'basic'
  },
  {
    key: 'city',
    label: 'المدينة',
    category: 'contact'
  },
  {
    key: 'address',
    label: 'العنوان',
    category: 'contact'
  },
  
  // التفضيلات
  {
    key: 'budget',
    label: 'الميزانية',
    description: 'نطاق الميزانية (من-إلى)',
    category: 'preferences'
  },
  {
    key: 'preferredCities',
    label: 'المدن المفضلة',
    category: 'preferences'
  },
  {
    key: 'preferredPropertyTypes',
    label: 'أنواع العقارات المفضلة',
    category: 'preferences'
  },
  
  // معلومات إضافية
  {
    key: 'source',
    label: 'مصدر العميل',
    description: 'من أين جاء العميل',
    category: 'other'
  },
  {
    key: 'assignedStaffName',
    label: 'الموظف المسؤول',
    category: 'other'
  },
  {
    key: 'tags',
    label: 'الوسوم',
    category: 'other'
  },
  {
    key: 'rating',
    label: 'التقييم',
    description: 'تقييم العميل (1-5)',
    category: 'other'
  },
  
  // التواريخ والإحصائيات
  {
    key: 'createdAt',
    label: 'تاريخ التسجيل',
    category: 'stats'
  },
  {
    key: 'lastContactDate',
    label: 'آخر تفاعل',
    category: 'stats'
  },
  {
    key: 'viewingsCount',
    label: 'عدد المعاينات',
    description: 'عدد المعاينات التي قام بها',
    category: 'stats'
  },
  {
    key: 'interestedPropertiesCount',
    label: 'عدد العقارات المهتم بها',
    category: 'stats'
  },
  
  // الملاحظات
  {
    key: 'notes',
    label: 'الملاحظات',
    category: 'other'
  }
]

// تجميع الأعمدة حسب الفئة
export const COLUMN_CATEGORIES: Record<ColumnInfo['category'], { label: string, columns: ColumnInfo[] }> = {
  basic: {
    label: 'معلومات أساسية',
    columns: AVAILABLE_COLUMNS.filter(c => c.category === 'basic')
  },
  contact: {
    label: 'معلومات الاتصال',
    columns: AVAILABLE_COLUMNS.filter(c => c.category === 'contact')
  },
  preferences: {
    label: 'التفضيلات',
    columns: AVAILABLE_COLUMNS.filter(c => c.category === 'preferences')
  },
  stats: {
    label: 'الإحصائيات',
    columns: AVAILABLE_COLUMNS.filter(c => c.category === 'stats')
  },
  other: {
    label: 'معلومات إضافية',
    columns: AVAILABLE_COLUMNS.filter(c => c.category === 'other')
  }
}
