import { ExcelColumn } from '@/types/excel'

interface FieldMapping {
  dbField: string
  arabicNames: string[]
  englishNames: string[]
  aliases: string[]
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'array'
}

const FIELD_MAPPINGS: FieldMapping[] = [
  {
    dbField: 'title',
    arabicNames: ['العنوان', 'الاسم', 'عنوان العقار', 'اسم العقار'],
    englishNames: ['title', 'name', 'property name', 'property title'],
    aliases: ['عنوان', 'اسم'],
    required: true,
    type: 'string'
  },
  {
    dbField: 'description',
    arabicNames: ['الوصف', 'التفاصيل', 'تفاصيل العقار', 'الشرح'],
    englishNames: ['description', 'details', 'info'],
    aliases: ['وصف', 'تفصيل'],
    required: false,
    type: 'string'
  },
  {
    dbField: 'property_type',
    arabicNames: ['نوع العقار', 'النوع', 'التصنيف', 'فئة العقار'],
    englishNames: ['type', 'property type', 'category'],
    aliases: ['نوع'],
    required: true,
    type: 'string'
  },
  {
    dbField: 'listing_type',
    arabicNames: ['نوع العرض', 'للبيع أو الإيجار', 'نوع الإعلان', 'العرض'],
    englishNames: ['listing type', 'for sale or rent', 'offer type'],
    aliases: ['عرض'],
    required: true,
    type: 'string'
  },
  {
    dbField: 'price',
    arabicNames: ['السعر', 'المبلغ', 'القيمة', 'التكلفة'],
    englishNames: ['price', 'amount', 'value', 'cost'],
    aliases: ['سعر', 'مبلغ'],
    required: true,
    type: 'number'
  },
  {
    dbField: 'area',
    arabicNames: ['المساحة', 'المساحة الكلية', 'المساحة بالمتر', 'المساحة م²'],
    englishNames: ['area', 'size', 'space', 'sqm'],
    aliases: ['مساحة'],
    required: false,
    type: 'number'
  },
  {
    dbField: 'bedrooms',
    arabicNames: ['غرف النوم', 'عدد الغرف', 'الغرف', 'غرف'],
    englishNames: ['bedrooms', 'rooms', 'bed', 'bedroom count'],
    aliases: ['غرف نوم'],
    required: false,
    type: 'number'
  },
  {
    dbField: 'bathrooms',
    arabicNames: ['دورات المياه', 'الحمامات', 'عدد الحمامات', 'دورات'],
    englishNames: ['bathrooms', 'bath', 'bathroom count'],
    aliases: ['حمامات', 'دورات مياه'],
    required: false,
    type: 'number'
  },
  {
    dbField: 'city',
    arabicNames: ['المدينة', 'المنطقة الإدارية'],
    englishNames: ['city', 'region'],
    aliases: ['مدينة'],
    required: false,
    type: 'string'
  },
  {
    dbField: 'district',
    arabicNames: ['الحي', 'المنطقة', 'الحي السكني'],
    englishNames: ['district', 'neighborhood', 'area'],
    aliases: ['حي'],
    required: false,
    type: 'string'
  },
  {
    dbField: 'location',
    arabicNames: ['الموقع', 'العنوان الكامل', 'الموقع الجغرافي'],
    englishNames: ['location', 'address', 'full address'],
    aliases: ['موقع'],
    required: false,
    type: 'string'
  },
  {
    dbField: 'status',
    arabicNames: ['الحالة', 'حالة العقار', 'الوضع'],
    englishNames: ['status', 'state', 'property status'],
    aliases: ['حالة'],
    required: false,
    type: 'string'
  }
]

/**
 * Smart auto-mapping: match Excel columns to database fields
 */
export function autoMapColumns(excelColumns: string[]): ExcelColumn[] {
  return excelColumns.map(col => {
    const normalized = col.trim().toLowerCase()
    
    let bestMatch: FieldMapping | null = null
    let confidence = 0
    
    for (const mapping of FIELD_MAPPINGS) {
      // Exact match (100% confidence)
      if (mapping.arabicNames.some(name => name.toLowerCase() === normalized)) {
        bestMatch = mapping
        confidence = 100
        break
      }
      if (mapping.englishNames.some(name => name.toLowerCase() === normalized)) {
        bestMatch = mapping
        confidence = 100
        break
      }
      
      // Partial match (70% confidence)
      const partialScore = calculatePartialMatch(normalized, mapping)
      if (partialScore > confidence) {
        bestMatch = mapping
        confidence = partialScore
      }
    }
    
    return {
      sourceColumn: col,
      targetField: bestMatch?.dbField || '',
      confidence,
      required: bestMatch?.required || false,
      type: bestMatch?.type || 'string'
    }
  })
}

function calculatePartialMatch(input: string, mapping: FieldMapping): number {
  let score = 0
  const allNames = [
    ...mapping.arabicNames,
    ...mapping.englishNames,
    ...mapping.aliases
  ].map(n => n.toLowerCase())
  
  for (const name of allNames) {
    if (input.includes(name) || name.includes(input)) {
      score = Math.max(score, 70)
    }
  }
  
  return score
}

/**
 * Get list of available fields for mapping dropdown
 */
export const AVAILABLE_FIELDS = FIELD_MAPPINGS.map(m => ({
  value: m.dbField,
  label: m.arabicNames[0],
  required: m.required
}))
