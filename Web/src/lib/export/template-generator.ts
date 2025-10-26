/**
 * ═══════════════════════════════════════════════════════════════
 * Template Generator - منشئ قوالب Excel
 * ═══════════════════════════════════════════════════════════════
 * 
 * دوال لإنشاء وتحميل قوالب Excel مع data validation وتعليمات
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Template, TemplateDownloadOptions } from '@/types/template'

/**
 * تحميل قالب Excel
 */
export async function downloadTemplate(
  template: Template,
  options: TemplateDownloadOptions
): Promise<void> {
  try {
    if (options.format === 'xlsx') {
      await generateExcelTemplate(template, options)
    } else {
      await generateCSVTemplate(template, options)
    }
  } catch (error) {
    console.error('Template generation error:', error)
    throw new Error('فشل في إنشاء القالب')
  }
}

/**
 * إنشاء قالب Excel
 */
async function generateExcelTemplate(
  template: Template,
  options: TemplateDownloadOptions
): Promise<void> {
  // إنشاء workbook جديد
  const wb = XLSX.utils.book_new()
  
  // === Sheet 1: البيانات ===
  const dataSheet = createDataSheet(template, options)
  XLSX.utils.book_append_sheet(wb, dataSheet, 'البيانات')
  
  // === Sheet 2: التعليمات (إذا كان مفعلاً) ===
  if (options.includeInstructions) {
    const instructionsSheet = createInstructionsSheet(template)
    XLSX.utils.book_append_sheet(wb, instructionsSheet, 'التعليمات')
  }
  
  // حفظ الملف
  const filename = `${template.nameEn}-${Date.now()}.xlsx`
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, filename)
}

/**
 * إنشاء sheet البيانات
 */
function createDataSheet(
  template: Template,
  options: TemplateDownloadOptions
): XLSX.WorkSheet {
  // إنشاء Headers
  const headers = template.fields.map(field => field.label)
  
  // إنشاء صف الأمثلة (إذا كان مفعلاً)
  const exampleRow = options.includeExamples
    ? template.fields.map(field => field.example || '')
    : []
  
  // البيانات
  const data = options.includeExamples
    ? [headers, exampleRow]
    : [headers]
  
  // إنشاء الـ worksheet
  const ws = XLSX.utils.aoa_to_sheet(data)
  
  // === تطبيق التنسيق ===
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  
  // تنسيق الـ header (صف أول)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!ws[cellAddress]) continue
    
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
      fill: { fgColor: { rgb: '0066CC' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
    }
  }
  
  // تنسيق صف الأمثلة (رمادي و italic)
  if (options.includeExamples) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col })
      if (!ws[cellAddress]) continue
      
      ws[cellAddress].s = {
        font: { italic: true, color: { rgb: '666666' } },
        fill: { fgColor: { rgb: 'F5F5F5' } },
        alignment: { horizontal: 'right' }
      }
    }
  }
  
  // === Data Validation (Dropdowns) ===
  if (options.includeValidation) {
    template.fields.forEach((field, index) => {
      if (field.type === 'dropdown' && field.options) {
        // إضافة data validation للعمود بالكامل
        const colLetter = XLSX.utils.encode_col(index)
        const validationRange = `${colLetter}2:${colLetter}1000` // من الصف 2 للصف 1000
        
        if (!ws['!dataValidation']) {
          ws['!dataValidation'] = {}
        }
        
        // Note: XLSX library قد لا تدعم data validation بشكل كامل
        // في البيئة الحقيقية، استخدم ExcelJS للدعم الكامل
        ws['!dataValidation'][validationRange] = {
          type: 'list',
          allowBlank: true,
          formula1: `"${field.options.join(',')}"`,
          showErrorMessage: true,
          errorTitle: 'قيمة غير صحيحة',
          error: `يرجى اختيار من: ${field.options.join('، ')}`
        }
      }
    })
  }
  
  // تعيين عرض الأعمدة
  ws['!cols'] = template.fields.map(field => {
    if (field.type === 'textarea' || field.key === 'notes') {
      return { wch: 40 }
    } else if (field.type === 'email') {
      return { wch: 25 }
    } else {
      return { wch: 20 }
    }
  })
  
  return ws
}

/**
 * إنشاء sheet التعليمات
 */
function createInstructionsSheet(template: Template): XLSX.WorkSheet {
  const instructions = [
    ['تعليمات استخدام القالب'],
    [''],
    ['معلومات القالب:'],
    [`- اسم القالب: ${template.name}`],
    [`- عدد الأعمدة: ${template.columnsCount}`],
    [`- الحقول المطلوبة: ${template.fields.filter(f => f.required).length}`],
    [''],
    ['كيفية الملء:'],
    ['1. املأ البيانات ابتداءً من الصف الثاني (الصف الأول للعناوين)'],
    ['2. الحقول المطلوبة مميزة بعلامة * يجب ملؤها'],
    ['3. للحقول ذات القائمة المنسدلة، اختر من الخيارات المتاحة'],
    ['4. اترك الحقول الاختيارية فارغة إذا لم تكن متوفرة'],
    [''],
    ['الحقول المطلوبة:'],
    ...template.fields
      .filter(f => f.required)
      .map(f => [`- ${f.label}: ${f.description || 'مطلوب'}`]),
    [''],
    ['الحقول الاختيارية:'],
    ...template.fields
      .filter(f => !f.required)
      .map(f => [`- ${f.label}: ${f.description || 'اختياري'}`]),
    [''],
    ['أمثلة:'],
    ...template.fields.map(f => [`- ${f.label}: ${f.example || 'مثال غير متوفر'}`]),
    [''],
    ['ملاحظات هامة:'],
    ['- تأكد من عدم تغيير أسماء الأعمدة في الصف الأول'],
    ['- احفظ الملف بصيغة .xlsx أو .xls'],
    ['- تجنب الصفوف الفارغة بين البيانات'],
    ['- استخدم النسخ واللصق من Excel إذا كان لديك بيانات موجودة'],
    [''],
    ['للدعم:'],
    ['إذا واجهت أي مشكلة، راجع التوثيق أو اتصل بالدعم الفني']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(instructions)
  
  // تنسيق العنوان الرئيسي
  if (ws['A1']) {
    ws['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: '0066CC' } },
      alignment: { horizontal: 'center' }
    }
  }
  
  // تنسيق العناوين الفرعية
  const headerRows = [2, 7, 13, 16, 19, 25]
  headerRows.forEach(row => {
    const cellAddress = `A${row + 1}`
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: 'E8F4FF' } }
      }
    }
  })
  
  // تعيين عرض العمود
  ws['!cols'] = [{ wch: 80 }]
  
  return ws
}

/**
 * إنشاء قالب CSV
 */
async function generateCSVTemplate(
  template: Template,
  options: TemplateDownloadOptions
): Promise<void> {
  // إنشاء Headers
  const headers = template.fields.map(field => field.label)
  
  // إنشاء صف الأمثلة
  const exampleRow = options.includeExamples
    ? template.fields.map(field => field.example || '')
    : []
  
  // البيانات
  const data = options.includeExamples
    ? [headers, exampleRow]
    : [headers]
  
  // تحويل إلى CSV
  const csv = data.map(row => row.join(',')).join('\n')
  
  // إضافة BOM للدعم العربي
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  
  const filename = `${template.nameEn}-${Date.now()}.csv`
  saveAs(blob, filename)
}

/**
 * تحويل قالب إلى بيانات للمعاينة
 */
export function generatePreviewData(template: Template): any[][] {
  const headers = template.fields.map(field => field.label)
  const examples = template.fields.map(field => field.example || '-')
  
  return [headers, examples]
}
