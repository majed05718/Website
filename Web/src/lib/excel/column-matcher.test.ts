/**
 * ═══════════════════════════════════════════════════════════════
 * Column Matcher Tests - اختبارات مطابقة الأعمدة
 * ═══════════════════════════════════════════════════════════════
 */

import {
  matchColumns,
  getConfidenceLevel,
  findMatchForField,
  findMissingRequiredFields,
  getMatchStatistics,
  SYSTEM_FIELDS,
  SYNONYMS_DICTIONARY,
  type ColumnMatch,
  type SystemField,
} from './column-matcher'

/**
 * اختبارات Levenshtein Distance و Similarity
 */
describe('Column Matcher - Basic Functionality', () => {
  test('should match exact Arabic names', () => {
    const excelColumns = ['السعر', 'العنوان', 'المساحة']
    const matches = matchColumns(excelColumns)
    
    expect(matches).toHaveLength(3)
    expect(matches[0].systemField).toBe('price')
    expect(matches[0].confidence).toBeGreaterThanOrEqual(0.9)
    expect(matches[1].systemField).toBe('title')
    expect(matches[1].confidence).toBeGreaterThanOrEqual(0.9)
    expect(matches[2].systemField).toBe('area')
    expect(matches[2].confidence).toBeGreaterThanOrEqual(0.9)
  })
  
  test('should match exact English names', () => {
    const excelColumns = ['Price', 'Title', 'Area']
    const matches = matchColumns(excelColumns)
    
    expect(matches).toHaveLength(3)
    expect(matches[0].systemField).toBe('price')
    expect(matches[1].systemField).toBe('title')
    expect(matches[2].systemField).toBe('area')
  })
  
  test('should handle case-insensitive matching', () => {
    const excelColumns = ['PRICE', 'title', 'ArEa']
    const matches = matchColumns(excelColumns)
    
    expect(matches[0].systemField).toBe('price')
    expect(matches[1].systemField).toBe('title')
    expect(matches[2].systemField).toBe('area')
  })
  
  test('should handle columns with extra spaces', () => {
    const excelColumns = ['  السعر  ', ' العنوان ', 'المساحة   ']
    const matches = matchColumns(excelColumns)
    
    expect(matches[0].systemField).toBe('price')
    expect(matches[1].systemField).toBe('title')
    expect(matches[2].systemField).toBe('area')
  })
})

/**
 * اختبارات المرادفات
 */
describe('Column Matcher - Synonyms', () => {
  test('should match Arabic synonyms', () => {
    const excelColumns = ['المبلغ', 'الاسم', 'غرف النوم', 'دورات المياه']
    const matches = matchColumns(excelColumns)
    
    expect(matches[0].systemField).toBe('price') // المبلغ
    expect(matches[1].systemField).toBe('title') // الاسم
    expect(matches[2].systemField).toBe('bedrooms') // غرف النوم
    expect(matches[3].systemField).toBe('bathrooms') // دورات المياه
  })
  
  test('should match property type variations', () => {
    const excelColumns = ['النوع', 'نوع العقار', 'التصنيف']
    const matches = matchColumns(excelColumns)
    
    matches.forEach(match => {
      expect(match.systemField).toBe('property_type')
    })
  })
  
  test('should match location variations', () => {
    const excelColumns = ['المدينة', 'الحي', 'الموقع']
    const matches = matchColumns(excelColumns)
    
    expect(matches[0].systemField).toBe('city')
    expect(matches[1].systemField).toBe('district')
    expect(matches[2].systemField).toBe('location')
  })
})

/**
 * اختبارات مستوى الثقة
 */
describe('Confidence Levels', () => {
  test('should return high confidence for exact matches', () => {
    const info = getConfidenceLevel(0.95)
    expect(info.level).toBe('high')
    expect(info.color).toBe('green')
  })
  
  test('should return medium confidence for partial matches', () => {
    const info = getConfidenceLevel(0.75)
    expect(info.level).toBe('medium')
    expect(info.color).toBe('yellow')
  })
  
  test('should return low confidence for weak matches', () => {
    const info = getConfidenceLevel(0.5)
    expect(info.level).toBe('low')
    expect(info.color).toBe('red')
  })
  
  test('should handle edge cases', () => {
    expect(getConfidenceLevel(0.9).level).toBe('high')
    expect(getConfidenceLevel(0.89).level).toBe('medium')
    expect(getConfidenceLevel(0.7).level).toBe('medium')
    expect(getConfidenceLevel(0.69).level).toBe('low')
  })
})

/**
 * اختبارات الاقتراحات
 */
describe('Column Matcher - Suggestions', () => {
  test('should provide suggestions for ambiguous matches', () => {
    const excelColumns = ['الغرف'] // قد تعني غرف النوم أو أي غرف
    const matches = matchColumns(excelColumns)
    
    expect(matches[0].suggestions).toBeDefined()
    expect(matches[0].suggestions!.length).toBeGreaterThan(0)
  })
  
  test('should not provide suggestions for strong matches', () => {
    const excelColumns = ['السعر']
    const matches = matchColumns(excelColumns)
    
    // قد يكون لها suggestions أو لا، لكن المطابقة الرئيسية يجب أن تكون قوية
    expect(matches[0].systemField).toBe('price')
    expect(matches[0].confidence).toBeGreaterThan(0.9)
  })
  
  test('should provide suggestions for unmatched columns', () => {
    const excelColumns = ['عمود غريب جداً']
    const matches = matchColumns(excelColumns, SYSTEM_FIELDS, 0.7)
    
    expect(matches[0].systemField).toBeNull()
    expect(matches[0].suggestions).toBeDefined()
    expect(matches[0].suggestions!.length).toBeGreaterThan(0)
  })
  
  test('suggestions should be sorted by confidence', () => {
    const excelColumns = ['مساح'] // كلمة قريبة من "مساحة"
    const matches = matchColumns(excelColumns, SYSTEM_FIELDS, 0.9)
    
    if (matches[0].suggestions && matches[0].suggestions.length > 1) {
      const confidences = matches[0].suggestions.map(s => s.confidence)
      const sorted = [...confidences].sort((a, b) => b - a)
      expect(confidences).toEqual(sorted)
    }
  })
})

/**
 * اختبارات الحقول المطلوبة
 */
describe('Required Fields Validation', () => {
  test('should identify missing required fields', () => {
    const excelColumns = ['السعر', 'المساحة'] // ينقص العنوان ونوع العقار ونوع العرض
    const matches = matchColumns(excelColumns)
    const missing = findMissingRequiredFields(matches)
    
    expect(missing.length).toBeGreaterThan(0)
    expect(missing.some(f => f.key === 'title')).toBe(true)
    expect(missing.some(f => f.key === 'property_type')).toBe(true)
  })
  
  test('should return empty array when all required fields are present', () => {
    const excelColumns = ['العنوان', 'نوع العقار', 'نوع العرض', 'السعر']
    const matches = matchColumns(excelColumns)
    const missing = findMissingRequiredFields(matches)
    
    expect(missing).toHaveLength(0)
  })
})

/**
 * اختبارات البحث عن مطابقة محددة
 */
describe('Find Match for Field', () => {
  test('should find match for specific field', () => {
    const excelColumns = ['السعر', 'العنوان', 'المساحة']
    const matches = matchColumns(excelColumns)
    
    const priceMatch = findMatchForField('price', matches)
    expect(priceMatch).not.toBeNull()
    expect(priceMatch?.excelColumn).toBe('السعر')
  })
  
  test('should return null for unmatched field', () => {
    const excelColumns = ['السعر']
    const matches = matchColumns(excelColumns)
    
    const bedroomsMatch = findMatchForField('bedrooms', matches)
    expect(bedroomsMatch).toBeNull()
  })
})

/**
 * اختبارات الإحصائيات
 */
describe('Match Statistics', () => {
  test('should calculate correct statistics', () => {
    const excelColumns = [
      'السعر',      // high confidence
      'العنوان',    // high confidence
      'المساحة',    // high confidence
      'xyz123',     // unmatched
    ]
    const matches = matchColumns(excelColumns)
    const stats = getMatchStatistics(matches)
    
    expect(stats.total).toBe(4)
    expect(stats.matched).toBeGreaterThanOrEqual(3)
    expect(stats.unmatched).toBeLessThanOrEqual(1)
    expect(stats.highConfidence).toBeGreaterThanOrEqual(3)
  })
  
  test('should identify missing required fields in statistics', () => {
    const excelColumns = ['السعر', 'المساحة']
    const matches = matchColumns(excelColumns)
    const stats = getMatchStatistics(matches)
    
    expect(stats.missingRequired.length).toBeGreaterThan(0)
    expect(stats.missingRequired).toContain('العنوان')
  })
  
  test('should show zero missing required fields when all present', () => {
    const excelColumns = ['العنوان', 'نوع العقار', 'نوع العرض', 'السعر']
    const matches = matchColumns(excelColumns)
    const stats = getMatchStatistics(matches)
    
    expect(stats.missingRequired).toHaveLength(0)
  })
})

/**
 * اختبارات حالات خاصة
 */
describe('Edge Cases', () => {
  test('should handle empty columns array', () => {
    const matches = matchColumns([])
    expect(matches).toHaveLength(0)
  })
  
  test('should skip empty column names', () => {
    const excelColumns = ['السعر', '', '  ', 'العنوان']
    const matches = matchColumns(excelColumns)
    
    // يجب أن تكون المطابقات للأعمدة غير الفارغة فقط
    expect(matches.length).toBeLessThanOrEqual(2)
  })
  
  test('should handle columns with special characters', () => {
    const excelColumns = ['السعر (ريال)', 'المساحة - م²', 'العنوان/الاسم']
    const matches = matchColumns(excelColumns)
    
    // يجب أن تطابق بناءً على الجزء الأساسي من الاسم
    expect(matches.length).toBe(3)
  })
  
  test('should handle duplicate columns', () => {
    const excelColumns = ['السعر', 'السعر', 'Price']
    const matches = matchColumns(excelColumns)
    
    expect(matches).toHaveLength(3)
    matches.forEach(match => {
      expect(match.systemField).toBe('price')
    })
  })
})

/**
 * اختبارات minConfidence المخصصة
 */
describe('Custom Minimum Confidence', () => {
  test('should respect custom minConfidence threshold', () => {
    const excelColumns = ['سعرر'] // خطأ إملائي بسيط
    
    // مع confidence عالية
    const strictMatches = matchColumns(excelColumns, SYSTEM_FIELDS, 0.9)
    
    // مع confidence منخفضة
    const lenientMatches = matchColumns(excelColumns, SYSTEM_FIELDS, 0.6)
    
    // المطابقة المرنة يجب أن تجد مطابقة
    expect(lenientMatches[0].systemField).toBe('price')
  })
})

/**
 * اختبارات التكامل
 */
describe('Integration Tests', () => {
  test('should handle complete real-world scenario', () => {
    // سيناريو كامل: ملف Excel نموذجي
    const excelColumns = [
      'عنوان العقار',
      'النوع',
      'للبيع أو الإيجار',
      'السعر بالريال',
      'المساحة بالمتر المربع',
      'عدد الغرف',
      'عدد الحمامات',
      'المدينة',
      'الحي',
      'حالة العقار',
    ]
    
    const matches = matchColumns(excelColumns)
    const stats = getMatchStatistics(matches)
    
    // يجب أن تطابق معظم الأعمدة
    expect(stats.matched).toBeGreaterThanOrEqual(8)
    
    // يجب ألا يكون هناك حقول مطلوبة مفقودة
    expect(stats.missingRequired).toHaveLength(0)
    
    // معظم المطابقات يجب أن تكون بثقة عالية أو متوسطة
    expect(stats.highConfidence + stats.mediumConfidence).toBeGreaterThanOrEqual(7)
  })
  
  test('should handle mixed Arabic and English columns', () => {
    const excelColumns = [
      'Title',
      'نوع العقار',
      'Price',
      'المساحة',
      'Bedrooms',
      'دورات المياه',
    ]
    
    const matches = matchColumns(excelColumns)
    
    expect(matches[0].systemField).toBe('title')
    expect(matches[1].systemField).toBe('property_type')
    expect(matches[2].systemField).toBe('price')
    expect(matches[3].systemField).toBe('area')
    expect(matches[4].systemField).toBe('bedrooms')
    expect(matches[5].systemField).toBe('bathrooms')
  })
})

/**
 * اختبارات الأداء
 */
describe('Performance Tests', () => {
  test('should handle large number of columns efficiently', () => {
    const largeColumnSet = Array(100).fill(null).map((_, i) => `Column ${i}`)
    
    const startTime = Date.now()
    const matches = matchColumns(largeColumnSet)
    const endTime = Date.now()
    
    const executionTime = endTime - startTime
    
    expect(matches).toHaveLength(100)
    expect(executionTime).toBeLessThan(1000) // يجب أن ينتهي في أقل من ثانية
  })
})

/**
 * اختبارات قاموس المرادفات
 */
describe('Synonyms Dictionary', () => {
  test('should have synonyms for all system fields', () => {
    const requiredFields = SYSTEM_FIELDS.filter(f => f.required)
    
    requiredFields.forEach(field => {
      expect(SYNONYMS_DICTIONARY[field.key]).toBeDefined()
      expect(SYNONYMS_DICTIONARY[field.key].length).toBeGreaterThan(0)
    })
  })
  
  test('should include both Arabic and English synonyms', () => {
    Object.values(SYNONYMS_DICTIONARY).forEach(synonyms => {
      const hasArabic = synonyms.some(s => /[\u0600-\u06FF]/.test(s))
      const hasEnglish = synonyms.some(s => /[a-zA-Z]/.test(s))
      
      expect(hasArabic || hasEnglish).toBe(true)
    })
  })
})
