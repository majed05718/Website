import { ExcelColumn, ExcelError, ExcelWarning } from '@/types/excel'

/**
 * Validate imported Excel data
 */
export function validateImportData(
  data: any[][],
  mappings: ExcelColumn[]
): { errors: ExcelError[], warnings: ExcelWarning[] } {
  const errors: ExcelError[] = []
  const warnings: ExcelWarning[] = []
  
  // Check if required fields are mapped
  const requiredFields = ['title', 'property_type', 'listing_type', 'price']
  const mappedFields = mappings
    .filter(m => m.targetField)
    .map(m => m.targetField)
  
  for (const field of requiredFields) {
    if (!mappedFields.includes(field)) {
      errors.push({
        row: 0,
        column: field,
        message: `الحقل المطلوب "${field}" غير مربوط`,
        value: null
      })
    }
  }
  
  // Validate each row
  data.forEach((row, index) => {
    const rowNumber = index + 2 // Excel rows start at 2 (1 is header)
    
    mappings.forEach((mapping, colIndex) => {
      if (!mapping.targetField) return
      
      const value = row[colIndex]
      const field = mapping.targetField
      
      // Check required fields
      if (mapping.required && (value === null || value === undefined || value === '')) {
        errors.push({
          row: rowNumber,
          column: mapping.sourceColumn,
          message: 'هذا الحقل مطلوب',
          value
        })
        return
      }
      
      if (!value && value !== 0) return // Skip empty optional fields
      
      // Type validation
      if (mapping.type === 'number') {
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value
        if (isNaN(numValue)) {
          errors.push({
            row: rowNumber,
            column: mapping.sourceColumn,
            message: 'يجب أن يكون رقماً',
            value
          })
        }
      }
      
      // Specific field validations
      if (field === 'property_type') {
        const validTypes = ['apartment', 'villa', 'land', 'commercial', 'شقة', 'فيلا', 'أرض', 'تجاري', 'أخرى']
        const valueStr = String(value).toLowerCase().trim()
        if (!validTypes.some(t => t.toLowerCase() === valueStr)) {
          warnings.push({
            row: rowNumber,
            column: mapping.sourceColumn,
            message: `نوع غير معروف: "${value}". سيتم استخدام "أخرى"`,
            value
          })
        }
      }
      
      if (field === 'listing_type') {
        const validTypes = ['sale', 'rent', 'بيع', 'إيجار']
        const valueStr = String(value).toLowerCase().trim()
        if (!validTypes.some(t => t.toLowerCase() === valueStr)) {
          errors.push({
            row: rowNumber,
            column: mapping.sourceColumn,
            message: `نوع عرض غير صحيح: "${value}". القيم المسموحة: بيع، إيجار`,
            value
          })
        }
      }
      
      if (field === 'price') {
        const price = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value
        if (price <= 0) {
          errors.push({
            row: rowNumber,
            column: mapping.sourceColumn,
            message: 'السعر يجب أن يكون أكبر من صفر',
            value
          })
        }
      }
      
      if (field === 'area') {
        const area = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value
        if (area <= 0) {
          warnings.push({
            row: rowNumber,
            column: mapping.sourceColumn,
            message: 'المساحة يجب أن تكون أكبر من صفر',
            value
          })
        }
      }
    })
  })
  
  return { errors, warnings }
}

/**
 * Transform Excel data to API format
 */
export function transformToApiFormat(
  data: any[][],
  mappings: ExcelColumn[]
): any[] {
  return data.map(row => {
    const property: any = {}
    
    mappings.forEach((mapping, index) => {
      if (!mapping.targetField) return
      
      let value = row[index]
      
      // Skip empty values
      if (value === null || value === undefined || value === '') return
      
      // Type conversions
      if (mapping.type === 'number') {
        value = typeof value === 'string' 
          ? parseFloat(value.replace(/[^\d.-]/g, '')) 
          : Number(value)
      }
      
      // Field-specific transformations
      if (mapping.targetField === 'property_type') {
        const typeMap: any = {
          'شقة': 'apartment',
          'فيلا': 'villa',
          'أرض': 'land',
          'تجاري': 'commercial'
        }
        value = typeMap[value] || value
      }
      
      if (mapping.targetField === 'listing_type') {
        const listingMap: any = {
          'بيع': 'sale',
          'إيجار': 'rent'
        }
        value = listingMap[value] || value
      }
      
      property[mapping.targetField] = value
    })
    
    // Set default status if not provided
    if (!property.status) {
      property.status = 'available'
    }
    
    return property
  })
}
