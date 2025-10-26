/**
 * ═══════════════════════════════════════════════════════════════
 * Column Matcher - مطابقة أعمدة Excel الذكية
 * ═══════════════════════════════════════════════════════════════
 * 
 * يستخدم Levenshtein Distance Algorithm لمطابقة أعمدة Excel
 * مع حقول النظام بذكاء مع دعم العربية والإنجليزية
 */

/**
 * نوع حقل النظام
 */
export interface SystemField {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
}

/**
 * نتيجة المطابقة لعمود واحد
 */
export interface ColumnMatch {
  excelColumn: string
  systemField: string | null
  confidence: number
  suggestions?: Array<{
    field: string
    confidence: number
  }>
}

/**
 * مستوى الثقة في المطابقة
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low'

/**
 * معلومات مستوى الثقة
 */
export interface ConfidenceInfo {
  level: ConfidenceLevel
  color: string
  description: string
}

/**
 * قاموس المرادفات لكل حقل
 * يحتوي على المصطلحات العربية والإنجليزية المختلفة
 */
const SYNONYMS_DICTIONARY: Record<string, string[]> = {
  title: [
    'العنوان',
    'عنوان',
    'Title',
    'الاسم',
    'اسم',
    'Name',
    'المسمى',
    'اسم العقار',
    'عنوان العقار',
  ],
  description: [
    'الوصف',
    'وصف',
    'Description',
    'التفاصيل',
    'تفاصيل',
    'Details',
    'الشرح',
    'شرح',
  ],
  property_type: [
    'النوع',
    'نوع',
    'Type',
    'نوع العقار',
    'Property Type',
    'التصنيف',
    'تصنيف',
    'Category',
    'الفئة',
  ],
  listing_type: [
    'نوع العرض',
    'العرض',
    'عرض',
    'Listing Type',
    'نوع الإعلان',
    'للبيع أو الإيجار',
    'Offer Type',
  ],
  price: [
    'السعر',
    'سعر',
    'Price',
    'المبلغ',
    'مبلغ',
    'Amount',
    'القيمة',
    'قيمة',
    'Value',
    'التكلفة',
    'تكلفة',
    'Cost',
  ],
  area: [
    'المساحة',
    'مساحة',
    'Area',
    'Size',
    'المساحة بالمتر',
    'المساحة الكلية',
    'المساحة م²',
    'Space',
  ],
  bedrooms: [
    'غرف النوم',
    'غرف نوم',
    'Bedrooms',
    'عدد الغرف',
    'الغرف',
    'غرف',
    'Rooms',
    'Bed',
  ],
  bathrooms: [
    'دورات المياه',
    'دورات مياه',
    'Bathrooms',
    'الحمامات',
    'حمامات',
    'Bath',
    'عدد الحمامات',
    'دورات',
  ],
  city: [
    'المدينة',
    'مدينة',
    'City',
    'المنطقة الإدارية',
    'Region',
  ],
  district: [
    'الحي',
    'حي',
    'District',
    'المنطقة',
    'منطقة',
    'Area',
    'Neighborhood',
    'الحي السكني',
  ],
  location: [
    'الموقع',
    'موقع',
    'Location',
    'العنوان الكامل',
    'Address',
    'الموقع الجغرافي',
  ],
  status: [
    'الحالة',
    'حالة',
    'Status',
    'حالة العقار',
    'الوضع',
    'وضع',
    'State',
  ],
}

/**
 * حقول النظام الافتراضية
 */
export const SYSTEM_FIELDS: SystemField[] = [
  { key: 'title', label: 'العنوان', type: 'string', required: true },
  { key: 'description', label: 'الوصف', type: 'string', required: false },
  { key: 'property_type', label: 'نوع العقار', type: 'string', required: true },
  { key: 'listing_type', label: 'نوع العرض', type: 'string', required: true },
  { key: 'price', label: 'السعر', type: 'number', required: true },
  { key: 'area', label: 'المساحة', type: 'number', required: false },
  { key: 'bedrooms', label: 'غرف النوم', type: 'number', required: false },
  { key: 'bathrooms', label: 'دورات المياه', type: 'number', required: false },
  { key: 'city', label: 'المدينة', type: 'string', required: false },
  { key: 'district', label: 'الحي', type: 'string', required: false },
  { key: 'location', label: 'الموقع', type: 'string', required: false },
  { key: 'status', label: 'الحالة', type: 'string', required: false },
]

/**
 * حساب Levenshtein Distance بين نصين
 * يقيس عدد التغييرات المطلوبة لتحويل نص إلى آخر
 * 
 * @param str1 النص الأول
 * @param str2 النص الثاني
 * @returns المسافة بين النصين
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  
  // إنشاء مصفوفة ثنائية الأبعاد
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0))
  
  // تهيئة الصف والعمود الأول
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }
  
  // حساب المسافة
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // حذف
        matrix[i][j - 1] + 1,      // إضافة
        matrix[i - 1][j - 1] + cost // استبدال
      )
    }
  }
  
  return matrix[len1][len2]
}

/**
 * حساب نسبة التشابه بين نصين باستخدام Levenshtein Distance
 * 
 * @param str1 النص الأول
 * @param str2 النص الثاني
 * @returns نسبة التشابه من 0 إلى 1
 */
function calculateSimilarity(str1: string, str2: string): number {
  // تطبيع النصوص (lowercase وإزالة المسافات)
  const normalized1 = str1.toLowerCase().trim()
  const normalized2 = str2.toLowerCase().trim()
  
  // إذا كانت متطابقة تماماً
  if (normalized1 === normalized2) {
    return 1.0
  }
  
  // حساب المسافة
  const distance = levenshteinDistance(normalized1, normalized2)
  const maxLength = Math.max(normalized1.length, normalized2.length)
  
  // تحويل المسافة إلى نسبة تشابه
  const similarity = 1 - distance / maxLength
  
  return Math.max(0, similarity)
}

/**
 * البحث عن أفضل مطابقة لعمود Excel في قاموس المرادفات
 * 
 * @param excelColumn اسم عمود Excel
 * @param fieldKey مفتاح حقل النظام
 * @param synonyms قائمة المرادفات
 * @returns أعلى نسبة تشابه
 */
function findBestMatch(
  excelColumn: string,
  fieldKey: string,
  synonyms: string[]
): number {
  let bestSimilarity = 0
  
  for (const synonym of synonyms) {
    const similarity = calculateSimilarity(excelColumn, synonym)
    bestSimilarity = Math.max(bestSimilarity, similarity)
    
    // إذا وجدنا تطابق تام، لا داعي للمتابعة
    if (similarity === 1.0) {
      break
    }
  }
  
  // مطابقة إضافية مع مفتاح الحقل نفسه
  const keyMatch = calculateSimilarity(excelColumn, fieldKey)
  bestSimilarity = Math.max(bestSimilarity, keyMatch)
  
  return bestSimilarity
}

/**
 * تحديد مستوى الثقة بناءً على النسبة
 * 
 * @param confidence نسبة الثقة (0-1)
 * @returns معلومات مستوى الثقة
 */
export function getConfidenceLevel(confidence: number): ConfidenceInfo {
  if (confidence >= 0.9) {
    return {
      level: 'high',
      color: 'green',
      description: 'مؤكد - تطابق عالي',
    }
  } else if (confidence >= 0.7) {
    return {
      level: 'medium',
      color: 'yellow',
      description: 'محتمل - تطابق متوسط',
    }
  } else {
    return {
      level: 'low',
      color: 'red',
      description: 'غير مؤكد - تطابق ضعيف',
    }
  }
}

/**
 * مطابقة أعمدة Excel مع حقول النظام بذكاء
 * 
 * @param excelColumns قائمة أعمدة Excel
 * @param systemFields حقول النظام (اختياري، سيستخدم الافتراضي)
 * @param minConfidence الحد الأدنى للثقة للمطابقة التلقائية (default: 0.7)
 * @returns قائمة المطابقات مع الاقتراحات
 */
export function matchColumns(
  excelColumns: string[],
  systemFields: SystemField[] = SYSTEM_FIELDS,
  minConfidence: number = 0.7
): ColumnMatch[] {
  const matches: ColumnMatch[] = []
  
  // معالجة كل عمود من أعمدة Excel
  for (const excelColumn of excelColumns) {
    // تخطي الأعمدة الفارغة
    if (!excelColumn || excelColumn.trim() === '') {
      continue
    }
    
    // حساب نسبة التطابق مع كل حقل في النظام
    const similarities: Array<{ field: string; confidence: number }> = []
    
    for (const systemField of systemFields) {
      const synonyms = SYNONYMS_DICTIONARY[systemField.key] || []
      const confidence = findBestMatch(excelColumn, systemField.key, synonyms)
      
      similarities.push({
        field: systemField.key,
        confidence: confidence,
      })
    }
    
    // ترتيب حسب نسبة التطابق (من الأعلى للأقل)
    similarities.sort((a, b) => b.confidence - a.confidence)
    
    // أفضل مطابقة
    const bestMatch = similarities[0]
    
    // تحديد المطابقة النهائية
    let finalMatch: ColumnMatch
    
    if (bestMatch.confidence >= minConfidence) {
      // مطابقة مؤكدة
      finalMatch = {
        excelColumn,
        systemField: bestMatch.field,
        confidence: bestMatch.confidence,
      }
      
      // إضافة اقتراحات بديلة (أفضل 3)
      const alternatives = similarities
        .slice(1, 4)
        .filter(s => s.confidence >= 0.5)
      
      if (alternatives.length > 0) {
        finalMatch.suggestions = alternatives
      }
    } else {
      // لا توجد مطابقة مؤكدة، عرض اقتراحات فقط
      finalMatch = {
        excelColumn,
        systemField: null,
        confidence: bestMatch.confidence,
        suggestions: similarities.slice(0, 3).filter(s => s.confidence >= 0.3),
      }
    }
    
    matches.push(finalMatch)
  }
  
  return matches
}

/**
 * البحث عن أفضل مطابقة لحقل نظام معين
 * مفيد عند التحقق من وجود حقل مطلوب
 * 
 * @param systemFieldKey مفتاح حقل النظام
 * @param matches قائمة المطابقات
 * @returns المطابقة أو null
 */
export function findMatchForField(
  systemFieldKey: string,
  matches: ColumnMatch[]
): ColumnMatch | null {
  return matches.find(m => m.systemField === systemFieldKey) || null
}

/**
 * التحقق من وجود جميع الحقول المطلوبة
 * 
 * @param matches قائمة المطابقات
 * @param systemFields حقول النظام
 * @returns قائمة الحقول المطلوبة المفقودة
 */
export function findMissingRequiredFields(
  matches: ColumnMatch[],
  systemFields: SystemField[] = SYSTEM_FIELDS
): SystemField[] {
  const matchedFields = new Set(
    matches.filter(m => m.systemField).map(m => m.systemField)
  )
  
  return systemFields.filter(
    field => field.required && !matchedFields.has(field.key)
  )
}

/**
 * إحصائيات المطابقة
 */
export interface MatchStatistics {
  total: number
  matched: number
  unmatched: number
  highConfidence: number
  mediumConfidence: number
  lowConfidence: number
  missingRequired: string[]
}

/**
 * حساب إحصائيات المطابقة
 * 
 * @param matches قائمة المطابقات
 * @param systemFields حقول النظام
 * @returns الإحصائيات
 */
export function getMatchStatistics(
  matches: ColumnMatch[],
  systemFields: SystemField[] = SYSTEM_FIELDS
): MatchStatistics {
  const matched = matches.filter(m => m.systemField !== null).length
  const unmatched = matches.length - matched
  
  let highConfidence = 0
  let mediumConfidence = 0
  let lowConfidence = 0
  
  for (const match of matches) {
    if (match.systemField) {
      const level = getConfidenceLevel(match.confidence).level
      if (level === 'high') highConfidence++
      else if (level === 'medium') mediumConfidence++
      else lowConfidence++
    }
  }
  
  const missingRequired = findMissingRequiredFields(matches, systemFields).map(
    f => f.label
  )
  
  return {
    total: matches.length,
    matched,
    unmatched,
    highConfidence,
    mediumConfidence,
    lowConfidence,
    missingRequired,
  }
}

/**
 * تصدير قاموس المرادفات للاستخدام الخارجي
 */
export { SYNONYMS_DICTIONARY }
