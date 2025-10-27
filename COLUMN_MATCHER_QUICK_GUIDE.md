# 🚀 دليل سريع - Column Matcher

## 📍 المسار
```
Web/src/lib/excel/column-matcher.ts
```

## ⚡ استخدام سريع

### 1. الاستيراد
```typescript
import { matchColumns } from '@/lib/excel/column-matcher'
```

### 2. المطابقة
```typescript
const excelColumns = ['السعر', 'العنوان', 'المساحة']
const matches = matchColumns(excelColumns)
```

### 3. النتيجة
```typescript
matches.forEach(match => {
  console.log(`${match.excelColumn} → ${match.systemField}`)
  console.log(`Confidence: ${(match.confidence * 100).toFixed(0)}%`)
})
```

---

## 🎯 أمثلة شائعة

### مثال 1: مطابقة أساسية
```typescript
const columns = ['السعر', 'العنوان', 'النوع', 'المساحة']
const matches = matchColumns(columns)

// النتيجة:
// السعر → price (100%)
// العنوان → title (100%)
// النوع → property_type (100%)
// المساحة → area (100%)
```

### مثال 2: التحقق من الحقول المطلوبة
```typescript
import { 
  matchColumns, 
  findMissingRequiredFields 
} from '@/lib/excel/column-matcher'

const matches = matchColumns(excelColumns)
const missing = findMissingRequiredFields(matches)

if (missing.length > 0) {
  console.error('Missing:', missing.map(f => f.label).join(', '))
}
```

### مثال 3: إحصائيات
```typescript
import { 
  matchColumns, 
  getMatchStatistics 
} from '@/lib/excel/column-matcher'

const matches = matchColumns(excelColumns)
const stats = getMatchStatistics(matches)

console.log(`Matched: ${stats.matched}/${stats.total}`)
console.log(`High confidence: ${stats.highConfidence}`)
```

### مثال 4: مع React
```typescript
import { matchColumns } from '@/lib/excel/column-matcher'

function MyComponent({ columns }: { columns: string[] }) {
  const matches = matchColumns(columns)
  
  return (
    <div>
      {matches.map(match => (
        <div key={match.excelColumn}>
          {match.excelColumn} → {match.systemField}
          ({(match.confidence * 100).toFixed(0)}%)
        </div>
      ))}
    </div>
  )
}
```

---

## 📊 مستويات الثقة

```typescript
0.9 - 1.0   🟢 High    مؤكد
0.7 - 0.89  🟡 Medium  محتمل
0.0 - 0.69  🔴 Low     غير مؤكد
```

---

## 🗂️ الحقول المدعومة

```typescript
✅ title          - العنوان
✅ price          - السعر
✅ property_type  - نوع العقار
✅ listing_type   - نوع العرض
✅ area           - المساحة
✅ bedrooms       - غرف النوم
✅ bathrooms      - دورات المياه
✅ city           - المدينة
✅ district       - الحي
✅ status         - الحالة
✅ location       - الموقع
✅ description    - الوصف
```

---

## 🔧 خيارات متقدمة

### تخصيص minConfidence
```typescript
// دقيق جداً
const strict = matchColumns(columns, undefined, 0.9)

// مرن
const flexible = matchColumns(columns, undefined, 0.6)
```

### إضافة حقول مخصصة
```typescript
import { matchColumns, SYSTEM_FIELDS } from '@/lib/excel/column-matcher'

const customFields = [
  ...SYSTEM_FIELDS,
  {
    key: 'floor',
    label: 'الطابق',
    type: 'number',
    required: false
  }
]

const matches = matchColumns(columns, customFields)
```

### إضافة مرادفات
```typescript
import { SYNONYMS_DICTIONARY } from '@/lib/excel/column-matcher'

SYNONYMS_DICTIONARY.price.push('الثمن', 'Cost')
```

---

## 🧪 الاختبارات

### تشغيل
```bash
npm test column-matcher.test.ts
```

### مثال اختبار
```typescript
test('should match Arabic names', () => {
  const columns = ['السعر', 'العنوان']
  const matches = matchColumns(columns)
  
  expect(matches[0].systemField).toBe('price')
  expect(matches[1].systemField).toBe('title')
})
```

---

## 📚 المزيد

للتفاصيل الكاملة، راجع:
- `COLUMN_MATCHER_README.md` - توثيق شامل
- `column-matcher.test.ts` - أمثلة الاختبارات
- `COLUMN_MATCHER_COMPLETION.md` - تقرير كامل

---

## 💡 نصائح

1. **استخدم الإحصائيات** للتحقق من جودة المطابقة
2. **تحقق من الحقول المطلوبة** قبل الاستيراد
3. **اعرض الاقتراحات** للمستخدم للأعمدة غير المؤكدة
4. **خصص minConfidence** حسب حالتك
5. **أضف مرادفات** لمصطلحاتك الخاصة

---

**استمتع بالمطابقة الذكية! 🎉**
