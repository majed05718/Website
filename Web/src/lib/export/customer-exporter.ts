/**
 * ═══════════════════════════════════════════════════════════════
 * Customer Exporter - تصدير العملاء
 * ═══════════════════════════════════════════════════════════════
 * 
 * دوال لتصدير بيانات العملاء إلى Excel/CSV/PDF
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { ExportConfig, CustomerExportColumn } from '@/types/export'
import type { Customer } from '@/types/customer'
import { AVAILABLE_COLUMNS } from '@/types/export'

/**
 * تصدير العملاء إلى ملف
 */
export async function exportCustomersToFile(
  config: ExportConfig,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    // جلب البيانات
    onProgress?.(10)
    const customers = await fetchCustomersForExport(config)
    
    // تحويل البيانات
    onProgress?.(30)
    const data = transformCustomersData(customers, config)
    
    // التصدير حسب النوع
    onProgress?.(50)
    
    if (config.format === 'xlsx') {
      await exportToExcel(data, config)
    } else if (config.format === 'csv') {
      await exportToCSV(data, config)
    } else if (config.format === 'pdf') {
      await exportToPDF(data, config)
    }
    
    onProgress?.(100)
  } catch (error) {
    console.error('Export error:', error)
    throw new Error('فشل في تصدير البيانات')
  }
}

/**
 * جلب بيانات العملاء للتصدير
 */
async function fetchCustomersForExport(config: ExportConfig): Promise<Customer[]> {
  // في البيئة الحقيقية، سيتم جلب البيانات من API
  // هنا نستخدم بيانات تجريبية
  
  // محاكاة تأخير API
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // بيانات تجريبية
  const sampleCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => ({
    id: `customer-${i + 1}`,
    officeId: 'office-1',
    name: `عميل ${i + 1}`,
    phone: `0${500000000 + i}`,
    email: i % 2 === 0 ? `customer${i + 1}@example.com` : undefined,
    type: ['buyer', 'seller', 'tenant', 'landlord'][i % 4] as any,
    status: ['active', 'inactive', 'potential'][i % 3] as any,
    city: ['الرياض', 'جدة', 'الدمام', 'مكة'][i % 4],
    preferredContactMethod: 'phone' as any,
    propertiesCount: Math.floor(Math.random() * 10),
    contractsCount: Math.floor(Math.random() * 5),
    activeContractsCount: Math.floor(Math.random() * 2),
    createdAt: new Date(2024, 0, i + 1).toISOString(),
    updatedAt: new Date(2024, 9, i + 1).toISOString(),
    lastContactDate: i % 3 === 0 ? new Date(2024, 9, i + 1).toISOString() : undefined,
    source: ['موقع إلكتروني', 'إعلان', 'إحالة', 'زيارة مباشرة'][i % 4],
    tags: i % 2 === 0 ? ['VIP', 'مهتم'] : undefined,
    rating: i % 5 + 1
  }))
  
  // تطبيق الفلاتر حسب نوع التصدير
  if (config.exportType === 'selected') {
    return sampleCustomers.filter(c => config.selectedIds.includes(c.id))
  } else if (config.exportType === 'date-range') {
    const from = new Date(config.dateRange.from)
    const to = new Date(config.dateRange.to)
    return sampleCustomers.filter(c => {
      const created = new Date(c.createdAt)
      return created >= from && created <= to
    })
  }
  
  return sampleCustomers
}

/**
 * تحويل بيانات العملاء حسب الأعمدة المحددة
 */
function transformCustomersData(
  customers: Customer[],
  config: ExportConfig
): any[][] {
  // إنشاء الصف الأول (Headers)
  const headers = config.columns.map(colKey => {
    const columnInfo = AVAILABLE_COLUMNS.find(col => col.key === colKey)
    return columnInfo?.label || colKey
  })
  
  // إضافة عمود الترقيم إذا كان مفعلاً
  if (config.styling.autoNumbering) {
    headers.unshift('#')
  }
  
  // تحويل بيانات العملاء
  const rows = customers.map((customer, index) => {
    const row = config.columns.map(colKey => {
      return formatCustomerValue(customer, colKey)
    })
    
    // إضافة الترقيم
    if (config.styling.autoNumbering) {
      row.unshift(index + 1)
    }
    
    return row
  })
  
  return [headers, ...rows]
}

/**
 * تنسيق قيمة العميل للعمود
 */
function formatCustomerValue(customer: Customer, column: CustomerExportColumn): any {
  switch (column) {
    case 'name':
      return customer.name
    case 'phone':
      return customer.phone
    case 'email':
      return customer.email || '-'
    case 'type':
      return formatCustomerType(customer.type)
    case 'status':
      return formatCustomerStatus(customer.status)
    case 'city':
      return customer.city || '-'
    case 'source':
      return customer.source || '-'
    case 'createdAt':
      return formatDate(customer.createdAt)
    case 'lastContactDate':
      return customer.lastContactDate ? formatDate(customer.lastContactDate) : '-'
    case 'tags':
      return customer.tags?.join(', ') || '-'
    case 'rating':
      return customer.rating || '-'
    case 'nationalId':
      return customer.nationalId || '-'
    case 'address':
      return customer.address || '-'
    case 'assignedStaffName':
      return customer.assignedStaffName || '-'
    case 'viewingsCount':
      return customer.propertiesCount || 0
    case 'interestedPropertiesCount':
      return customer.propertiesCount || 0
    case 'notes':
      return customer.notes || '-'
    case 'budget':
      return '-' // يتم جلبها من بيانات إضافية
    case 'preferredCities':
      return '-'
    case 'preferredPropertyTypes':
      return '-'
    default:
      return '-'
  }
}

/**
 * تنسيق نوع العميل
 */
function formatCustomerType(type: string): string {
  const types: Record<string, string> = {
    buyer: 'مشتري',
    seller: 'بائع',
    tenant: 'مستأجر',
    landlord: 'مالك',
    both: 'مشتري/بائع'
  }
  return types[type] || type
}

/**
 * تنسيق حالة العميل
 */
function formatCustomerStatus(status: string): string {
  const statuses: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    potential: 'محتمل',
    archived: 'مؤرشف'
  }
  return statuses[status] || status
}

/**
 * تنسيق التاريخ
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA')
}

/**
 * التصدير إلى Excel
 */
async function exportToExcel(data: any[][], config: ExportConfig): Promise<void> {
  // إنشاء Workbook
  const wb = XLSX.utils.book_new()
  
  // إنشاء Worksheet
  const ws = XLSX.utils.aoa_to_sheet(data)
  
  // تطبيق التنسيق إذا كان مفعلاً
  if (config.styling.includeHeader) {
    // تنسيق صف الـ header
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })]
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0066CC' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
      }
    }
  }
  
  // تعيين عرض الأعمدة
  const colWidths = data[0].map(() => ({ wch: 20 }))
  ws['!cols'] = colWidths
  
  // إضافة الإحصائيات إذا كانت مفعلة
  if (config.styling.includeStats) {
    const statsRow = data.length + 2
    XLSX.utils.sheet_add_aoa(ws, [
      [''],
      ['الإحصائيات:'],
      [`إجمالي العملاء: ${data.length - 1}`],
      [`تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`]
    ], { origin: `A${statsRow}` })
  }
  
  // إضافة الورقة إلى الكتاب
  XLSX.utils.book_append_sheet(wb, ws, 'العملاء')
  
  // حفظ الملف
  const filename = `customers-${new Date().toISOString().split('T')[0]}.xlsx`
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, filename)
}

/**
 * التصدير إلى CSV
 */
async function exportToCSV(data: any[][], config: ExportConfig): Promise<void> {
  // تحويل البيانات إلى CSV
  const csv = data.map(row => row.join(',')).join('\n')
  
  // إضافة BOM للدعم العربي
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  
  const filename = `customers-${new Date().toISOString().split('T')[0]}.csv`
  saveAs(blob, filename)
}

/**
 * التصدير إلى PDF
 */
async function exportToPDF(data: any[][], config: ExportConfig): Promise<void> {
  // ملاحظة: يتطلب مكتبة jsPDF
  // هنا نستخدم placeholder
  
  const text = data.map(row => row.join('\t')).join('\n')
  const blob = new Blob([text], { type: 'application/pdf' })
  
  const filename = `customers-${new Date().toISOString().split('T')[0]}.pdf`
  saveAs(blob, filename)
  
  // في البيئة الحقيقية:
  // import jsPDF from 'jspdf'
  // const doc = new jsPDF()
  // doc.text(text, 10, 10)
  // doc.save(filename)
}
