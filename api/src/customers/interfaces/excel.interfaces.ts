/**
 * ═══════════════════════════════════════════════════════════════
 * Excel Interfaces - واجهات معالجة Excel
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * مطابقة الأعمدة من Excel إلى حقول النظام
 */
export interface ColumnMapping {
  excelColumn: string;      // اسم العمود في Excel
  systemField: string;      // اسم الحقل في النظام
  required?: boolean;       // هل الحقل مطلوب
  transform?: string;       // دالة تحويل (optional)
}

/**
 * خيارات الاستيراد
 */
export interface ImportOptions {
  duplicateHandling?: 'skip' | 'update' | 'error';  // معالجة التكرار
  validateOnly?: boolean;                             // معاينة فقط (بدون حفظ)
  batchSize?: number;                                 // حجم الدفعة (default: 100)
  skipInvalidRows?: boolean;                          // تخطي الصفوف غير الصحيحة
}

/**
 * نتيجة الاستيراد
 */
export interface ImportResult {
  success: boolean;                    // هل نجحت العملية
  totalRows: number;                   // إجمالي الصفوف
  validRows: number;                   // الصفوف الصحيحة
  invalidRows: number;                 // الصفوف غير الصحيحة
  insertedRows: number;                // الصفوف المدرجة
  updatedRows: number;                 // الصفوف المحدثة
  skippedRows: number;                 // الصفوف المتخطاة
  errors: RowError[];                  // قائمة الأخطاء
  warnings: RowError[];                // قائمة التحذيرات
  preview?: CustomerPreview[];         // معاينة البيانات (في حالة validateOnly)
  duration?: number;                   // مدة العملية (بالثواني)
}

/**
 * خطأ على مستوى الصف
 */
export interface RowError {
  row: number;                         // رقم الصف
  field: string;                       // اسم الحقل
  error: string;                       // رسالة الخطأ (عربي)
  value: any;                          // القيمة المرفوضة
  severity: 'error' | 'warning';       // شدة الخطأ
}

/**
 * معاينة بيانات العميل
 */
export interface CustomerPreview {
  row: number;                         // رقم الصف
  data: Partial<CustomerData>;         // بيانات العميل
  isValid: boolean;                    // هل البيانات صحيحة
  isDuplicate: boolean;                // هل مكرر
  errors: RowError[];                  // أخطاء هذا الصف
}

/**
 * بيانات العميل من Excel
 */
export interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  type: 'buyer' | 'seller' | 'tenant' | 'landlord';
  status?: 'active' | 'inactive' | 'archived';
  city?: string;
  address?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredCities?: string;
  preferredPropertyTypes?: string;
  source?: string;
  assignedStaff?: string;
  notes?: string;
}

/**
 * فلاتر العملاء للتصدير
 */
export interface CustomerFilters {
  type?: string[];                     // أنواع العملاء
  status?: string[];                   // حالات العملاء
  city?: string;                       // المدينة
  source?: string;                     // المصدر
  dateFrom?: Date;                     // من تاريخ
  dateTo?: Date;                       // إلى تاريخ
  search?: string;                     // بحث نصي
  ids?: string[];                      // معرفات محددة
}

/**
 * خيارات التصدير
 */
export interface ExportOptions {
  includeStatistics?: boolean;         // تضمين إحصائيات
  applyFormatting?: boolean;           // تطبيق التنسيق
  includeHeader?: boolean;             // تضمين header
  fileName?: string;                   // اسم الملف
}

/**
 * إحصائيات العملاء
 */
export interface CustomerStatistics {
  total: number;                       // إجمالي العملاء
  byType: Record<string, number>;      // حسب النوع
  byStatus: Record<string, number>;    // حسب الحالة
  byCity: Record<string, number>;      // حسب المدينة
  bySource: Record<string, number>;    // حسب المصدر
}

/**
 * معلومات القالب
 */
export interface TemplateInfo {
  id: string;                          // معرف القالب
  name: string;                        // اسم القالب
  nameEn: string;                      // الاسم بالإنجليزية
  description: string;                 // الوصف
  type: 'basic' | 'buyers' | 'sellers' | 'tenants' | 'quick' | 'custom';
  columnsCount: number;                // عدد الأعمدة
  fields: TemplateField[];             // الحقول
}

/**
 * حقل في القالب
 */
export interface TemplateField {
  key: string;                         // مفتاح الحقل
  label: string;                       // التسمية (عربي)
  required: boolean;                   // هل مطلوب
  type: 'text' | 'number' | 'email' | 'phone' | 'dropdown' | 'date' | 'textarea';
  options?: string[];                  // خيارات (للـ dropdown)
  example?: string;                    // مثال
}

/**
 * نتيجة validation
 */
export interface ValidationResult {
  isValid: boolean;                    // هل صحيح
  errors: RowError[];                  // الأخطاء
  warnings: RowError[];                // التحذيرات
}

/**
 * معلومات الدفعة (للـ progress tracking)
 */
export interface BatchInfo {
  batchNumber: number;                 // رقم الدفعة
  totalBatches: number;                // إجمالي الدفعات
  processedRows: number;               // الصفوف المعالجة
  totalRows: number;                   // إجمالي الصفوف
  percentage: number;                  // النسبة المئوية
}
