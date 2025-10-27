/**
 * ═══════════════════════════════════════════════════════════════
 * Template Types - أنواع القوالب
 * ═══════════════════════════════════════════════════════════════
 */

// نوع القالب
export type TemplateType = 'basic' | 'buyers' | 'sellers' | 'tenants' | 'quick' | 'custom'

// حقل في القالب
export interface TemplateField {
  key: string
  label: string
  required: boolean
  type: 'text' | 'number' | 'email' | 'phone' | 'dropdown' | 'date' | 'textarea'
  options?: string[] // للـ dropdown
  example?: string
  description?: string
}

// القالب
export interface Template {
  id: string
  name: string
  nameEn: string
  description: string
  type: TemplateType
  icon: string
  fields: TemplateField[]
  columnsCount: number
  isCustom: boolean
  userId?: string
  createdAt: string
  updatedAt?: string
}

// إعدادات تحميل القالب
export interface TemplateDownloadOptions {
  format: 'xlsx' | 'csv'
  includeExamples: boolean
  includeInstructions: boolean
  includeValidation: boolean
}

// القوالب الجاهزة
export const PREDEFINED_TEMPLATES: Omit<Template, 'id' | 'userId' | 'createdAt'>[] = [
  {
    name: 'القالب الأساسي',
    nameEn: 'basic-template',
    description: 'قالب شامل يحتوي على جميع الحقول الأساسية للعملاء',
    type: 'basic',
    icon: 'FileSpreadsheet',
    columnsCount: 13,
    isCustom: false,
    fields: [
      { key: 'name', label: 'الاسم', required: true, type: 'text', example: 'أحمد محمد' },
      { key: 'phone', label: 'رقم الهاتف', required: true, type: 'phone', example: '0501234567' },
      { key: 'email', label: 'البريد الإلكتروني', required: false, type: 'email', example: 'ahmed@example.com' },
      { key: 'nationalId', label: 'الهوية الوطنية', required: false, type: 'text', example: '1234567890' },
      { 
        key: 'type', 
        label: 'النوع', 
        required: true, 
        type: 'dropdown',
        options: ['مشتري', 'بائع', 'مستأجر', 'مالك'],
        example: 'مشتري'
      },
      { 
        key: 'status', 
        label: 'الحالة', 
        required: false, 
        type: 'dropdown',
        options: ['نشط', 'غير نشط', 'محتمل', 'مؤرشف'],
        example: 'نشط'
      },
      { key: 'city', label: 'المدينة', required: false, type: 'text', example: 'الرياض' },
      { key: 'address', label: 'العنوان', required: false, type: 'text', example: 'حي العليا' },
      { key: 'budget', label: 'الميزانية', required: false, type: 'text', example: '500000-800000' },
      { key: 'preferredCities', label: 'المدن المفضلة', required: false, type: 'text', example: 'الرياض، جدة' },
      { key: 'source', label: 'مصدر العميل', required: false, type: 'text', example: 'موقع إلكتروني' },
      { key: 'assignedStaff', label: 'الموظف المسؤول', required: false, type: 'text', example: 'محمد أحمد' },
      { key: 'notes', label: 'الملاحظات', required: false, type: 'textarea', example: 'ملاحظات إضافية' }
    ]
  },
  {
    name: 'قالب المشترين',
    nameEn: 'buyers-template',
    description: 'قالب مخصص للمشترين مع حقول الميزانية والتفضيلات',
    type: 'buyers',
    icon: 'ShoppingCart',
    columnsCount: 10,
    isCustom: false,
    fields: [
      { key: 'name', label: 'الاسم', required: true, type: 'text', example: 'خالد السالم' },
      { key: 'phone', label: 'رقم الهاتف', required: true, type: 'phone', example: '0551234567' },
      { key: 'email', label: 'البريد الإلكتروني', required: false, type: 'email', example: 'khalid@example.com' },
      { key: 'budget', label: 'الميزانية (من-إلى)', required: true, type: 'text', example: '500000-800000' },
      { key: 'preferredCities', label: 'المدن المفضلة', required: false, type: 'text', example: 'الرياض، الدمام' },
      { key: 'preferredPropertyTypes', label: 'نوع العقار المطلوب', required: false, type: 'text', example: 'شقة، فيلا' },
      { key: 'bedrooms', label: 'عدد الغرف', required: false, type: 'number', example: '3' },
      { key: 'purchaseTimeframe', label: 'إطار الشراء', required: false, type: 'text', example: 'خلال 3 أشهر' },
      { key: 'source', label: 'مصدر العميل', required: false, type: 'text', example: 'إعلان' },
      { key: 'notes', label: 'الملاحظات', required: false, type: 'textarea', example: 'مهتم بشقق العليا' }
    ]
  },
  {
    name: 'قالب البائعين',
    nameEn: 'sellers-template',
    description: 'قالب مخصص للبائعين مع تفاصيل العقار المعروض',
    type: 'sellers',
    icon: 'Home',
    columnsCount: 9,
    isCustom: false,
    fields: [
      { key: 'name', label: 'الاسم', required: true, type: 'text', example: 'فاطمة أحمد' },
      { key: 'phone', label: 'رقم الهاتف', required: true, type: 'phone', example: '0559876543' },
      { key: 'email', label: 'البريد الإلكتروني', required: false, type: 'email', example: 'fatimah@example.com' },
      { key: 'propertyType', label: 'نوع العقار', required: true, type: 'text', example: 'فيلا' },
      { key: 'propertyLocation', label: 'موقع العقار', required: true, type: 'text', example: 'الرياض - العليا' },
      { key: 'propertyArea', label: 'مساحة العقار', required: false, type: 'number', example: '400' },
      { key: 'askingPrice', label: 'السعر المطلوب', required: true, type: 'number', example: '2000000' },
      { key: 'listingDate', label: 'تاريخ العرض', required: false, type: 'date', example: '2024-01-15' },
      { key: 'notes', label: 'الملاحظات', required: false, type: 'textarea', example: 'فيلا جديدة بحالة ممتازة' }
    ]
  },
  {
    name: 'قالب المستأجرين',
    nameEn: 'tenants-template',
    description: 'قالب مخصص للمستأجرين مع الميزانية الشهرية والمدة',
    type: 'tenants',
    icon: 'Key',
    columnsCount: 8,
    isCustom: false,
    fields: [
      { key: 'name', label: 'الاسم', required: true, type: 'text', example: 'نورة الغامدي' },
      { key: 'phone', label: 'رقم الهاتف', required: true, type: 'phone', example: '0503334444' },
      { key: 'email', label: 'البريد الإلكتروني', required: false, type: 'email', example: 'noura@example.com' },
      { key: 'monthlyBudget', label: 'الميزانية الشهرية', required: true, type: 'number', example: '5000' },
      { key: 'preferredCities', label: 'المدن المفضلة', required: false, type: 'text', example: 'مكة، جدة' },
      { key: 'leaseDuration', label: 'مدة الإيجار المطلوبة', required: false, type: 'text', example: 'سنة واحدة' },
      { key: 'moveInDate', label: 'تاريخ السكن المتوقع', required: false, type: 'date', example: '2024-02-01' },
      { key: 'notes', label: 'الملاحظات', required: false, type: 'textarea', example: 'يفضل شقة مفروشة' }
    ]
  },
  {
    name: 'القالب السريع',
    nameEn: 'quick-template',
    description: 'قالب مبسط للإضافة السريعة مع 5 حقول أساسية فقط',
    type: 'quick',
    icon: 'Zap',
    columnsCount: 5,
    isCustom: false,
    fields: [
      { key: 'name', label: 'الاسم', required: true, type: 'text', example: 'محمد الشمري' },
      { key: 'phone', label: 'رقم الهاتف', required: true, type: 'phone', example: '0555556666' },
      { 
        key: 'type', 
        label: 'النوع', 
        required: true, 
        type: 'dropdown',
        options: ['مشتري', 'بائع', 'مستأجر', 'مالك'],
        example: 'مشتري'
      },
      { 
        key: 'status', 
        label: 'الحالة', 
        required: true, 
        type: 'dropdown',
        options: ['نشط', 'غير نشط', 'محتمل'],
        example: 'نشط'
      },
      { key: 'notes', label: 'الملاحظات', required: false, type: 'textarea', example: 'ملاحظات سريعة' }
    ]
  }
]

// جميع الحقول المتاحة للقوالب المخصصة
export const AVAILABLE_TEMPLATE_FIELDS: TemplateField[] = [
  { key: 'name', label: 'الاسم', required: true, type: 'text', description: 'اسم العميل الكامل' },
  { key: 'phone', label: 'رقم الهاتف', required: true, type: 'phone', description: 'رقم الهاتف الأساسي' },
  { key: 'email', label: 'البريد الإلكتروني', required: false, type: 'email', description: 'البريد الإلكتروني للتواصل' },
  { key: 'nationalId', label: 'الهوية الوطنية', required: false, type: 'text', description: 'رقم الهوية الوطنية' },
  { 
    key: 'type', 
    label: 'النوع', 
    required: true, 
    type: 'dropdown',
    options: ['مشتري', 'بائع', 'مستأجر', 'مالك'],
    description: 'نوع العميل'
  },
  { 
    key: 'status', 
    label: 'الحالة', 
    required: false, 
    type: 'dropdown',
    options: ['نشط', 'غير نشط', 'محتمل', 'مؤرشف'],
    description: 'حالة العميل'
  },
  { key: 'city', label: 'المدينة', required: false, type: 'text', description: 'مدينة العميل' },
  { key: 'address', label: 'العنوان', required: false, type: 'text', description: 'العنوان التفصيلي' },
  { key: 'budget', label: 'الميزانية', required: false, type: 'text', description: 'نطاق الميزانية (من-إلى)' },
  { key: 'preferredCities', label: 'المدن المفضلة', required: false, type: 'text', description: 'المدن المفضلة للبحث' },
  { key: 'preferredPropertyTypes', label: 'أنواع العقارات المفضلة', required: false, type: 'text', description: 'أنواع العقارات المهتم بها' },
  { key: 'source', label: 'مصدر العميل', required: false, type: 'text', description: 'كيف وصل العميل إلينا' },
  { key: 'assignedStaff', label: 'الموظف المسؤول', required: false, type: 'text', description: 'الموظف المكلف بالعميل' },
  { key: 'notes', label: 'الملاحظات', required: false, type: 'textarea', description: 'ملاحظات إضافية' }
]
