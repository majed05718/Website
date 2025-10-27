/**
 * ═══════════════════════════════════════════════════════════════
 * Excel Mapper - محول أعمدة Excel (Legacy Wrapper)
 * ═══════════════════════════════════════════════════════════════
 * 
 * هذا ملف wrapper للتوافق مع الكود القديم
 * يستخدم column-matcher.ts الجديد بشكل داخلي
 * 
 * @deprecated استخدم column-matcher.ts مباشرة للمشاريع الجديدة
 */

import { ExcelColumn } from '@/types/excel'
import {
  matchColumns,
  SYSTEM_FIELDS,
  type ColumnMatch,
  type SystemField,
} from './column-matcher'

// Re-export للتوافق مع الكود القديم
export { SYSTEM_FIELDS as FIELD_MAPPINGS }

/**
 * تحويل ColumnMatch إلى ExcelColumn (للتوافق مع النوع القديم)
 */
function convertToExcelColumn(match: ColumnMatch, systemFields: SystemField[]): ExcelColumn {
  const field = systemFields.find(f => f.key === match.systemField)
  
  return {
    sourceColumn: match.excelColumn,
    targetField: match.systemField || '',
    confidence: Math.round(match.confidence * 100), // تحويل من 0-1 إلى 0-100
    required: field?.required || false,
    type: (field?.type || 'string') as 'string' | 'number' | 'boolean' | 'array',
  }
}

/**
 * مطابقة تلقائية لأعمدة Excel مع حقول قاعدة البيانات
 * 
 * @deprecated استخدم matchColumns من column-matcher.ts
 * @param excelColumns قائمة أعمدة Excel
 * @returns قائمة المطابقات
 */
export function autoMapColumns(excelColumns: string[]): ExcelColumn[] {
  // استخدام column-matcher الجديد
  const matches = matchColumns(excelColumns, SYSTEM_FIELDS, 0.7)
  
  // تحويل إلى النوع القديم للتوافق
  return matches.map(match => convertToExcelColumn(match, SYSTEM_FIELDS))
}

/**
 * الحصول على قائمة الحقول المتاحة لقائمة الاختيار
 * 
 * @deprecated استخدم SYSTEM_FIELDS من column-matcher.ts
 */
export const AVAILABLE_FIELDS = SYSTEM_FIELDS.map(field => ({
  value: field.key,
  label: field.label,
  required: field.required,
}))

/**
 * ملاحظة للمطورين:
 * ════════════════════
 * 
 * هذا الملف موجود للتوافق مع الكود القديم فقط.
 * 
 * للمشاريع الجديدة أو التحديثات، استخدم:
 * 
 * ```typescript
 * import { matchColumns } from '@/lib/excel/column-matcher'
 * 
 * const matches = matchColumns(excelColumns)
 * ```
 * 
 * المزايا:
 * - Levenshtein Distance algorithm
 * - نسب ثقة أدق (0-1 بدلاً من 0-100)
 * - اقتراحات ذكية
 * - إحصائيات متقدمة
 * - أفضل في التعامل مع الأخطاء الإملائية
 * 
 * راجع: column-matcher.ts و COLUMN_MATCHER_README.md
 */
