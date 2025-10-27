# صفحة استيراد العقارات من Excel

صفحة متقدمة لاستيراد العقارات بشكل مجمع من ملفات Excel أو CSV مع مطابقة ذكية للأعمدة والتحقق من البيانات.

## المميزات

### 1. رفع الملفات (File Upload)
- ✅ دعم ملفات Excel (.xlsx, .xls)
- ✅ دعم ملفات CSV (.csv)
- ✅ Drag & Drop
- ✅ عرض اسم الملف وحجمه
- ✅ إمكانية حذف الملف

### 2. مطابقة الأعمدة الذكية (AI Column Mapping)
- ✅ مطابقة تلقائية للأعمدة باستخدام الذكاء الاصطناعي
- ✅ دعم الأسماء العربية والإنجليزية
- ✅ نسبة ثقة للمطابقة (Confidence Score)
- ✅ إمكانية التعديل اليدوي
- ✅ علامات بصرية للمطابقات الصحيحة وغير المؤكدة

### 3. ملخص التحقق (Validation Summary)
- ✅ عدد الصفوف الإجمالي
- ✅ عدد الصفوف الصحيحة (أخضر)
- ✅ عدد التحذيرات (أصفر)
- ✅ عدد الأخطاء (أحمر)
- ✅ شريط تقدم ملون
- ✅ قائمة تفصيلية بالأخطاء والتحذيرات

### 4. معاينة البيانات (Data Preview)
- ✅ عرض أول 10 صفوف
- ✅ تلوين الصفوف حسب الحالة:
  - 🟢 أخضر: بيانات صحيحة
  - 🟡 أصفر: تحذيرات
  - 🔴 أحمر: أخطاء
- ✅ أيقونات توضيحية لكل صف
- ✅ رسائل تفصيلية للأخطاء والتحذيرات

### 5. شريط التقدم (Import Progress)
- ✅ نسبة الإنجاز المئوية
- ✅ عدد العقارات المعالجة / الإجمالي
- ✅ تقدير الوقت المتبقي
- ✅ سرعة الاستيراد (عقار/ثانية)
- ✅ ملخص النجاح والفشل

## البنية التقنية

### المكونات (Components)

```
/components/properties/import/
├── ExcelUploader.tsx        # رفع الملفات
├── ColumnMapper.tsx          # مطابقة الأعمدة
├── DataPreview.tsx           # معاينة البيانات
├── ValidationSummary.tsx     # ملخص التحقق
├── ImportProgress.tsx        # شريط التقدم
└── index.ts                  # Exports
```

### المكتبات المساعدة

```
/lib/excel/
├── parser.ts        # تحليل Excel و CSV
├── mapper.ts        # مطابقة الأعمدة الذكية
└── validator.ts     # التحقق من البيانات
```

### الأنواع (Types)

```
/types/excel.ts
├── ParsedExcelData
├── ExcelColumn
├── ExcelError
└── ExcelWarning
```

## كيفية الاستخدام

### 1. رفع الملف
```typescript
// المستخدم يرفع ملف Excel أو CSV
// يتم تحليله تلقائياً
const parsedData = await parseExcelFile(file)
// أو
const parsedData = await parseCSVFile(file)
```

### 2. مطابقة الأعمدة
```typescript
// مطابقة تلقائية
const mappings = autoMapColumns(parsedData.headers)

// المستخدم يمكنه تعديل المطابقة يدوياً
```

### 3. التحقق من البيانات
```typescript
const { errors, warnings } = validateImportData(
  parsedData.data,
  mappings
)
```

### 4. الاستيراد
```typescript
const properties = transformToApiFormat(
  parsedData.data,
  mappings
)
await importProperties(properties)
```

## الحقول المدعومة

### حقول مطلوبة (Required)
- **العنوان** (title)
- **نوع العقار** (property_type): شقة، فيلا، أرض، تجاري
- **نوع العرض** (listing_type): بيع، إيجار
- **السعر** (price)

### حقول اختيارية (Optional)
- الوصف (description)
- المساحة (area)
- غرف النوم (bedrooms)
- دورات المياه (bathrooms)
- المدينة (city)
- الحي (district)
- الموقع (location)
- الحالة (status)

## API Endpoints

```typescript
// استيراد العقارات
POST /api/properties/import/confirm
Body: { properties: Property[] }

// تنزيل القالب
GET /api/properties/template

// تصدير العقارات
GET /api/properties/export
```

## الخطوات (Steps)

1. **رفع الملف** (Upload)
2. **ربط الأعمدة** (Mapping)
3. **معاينة** (Preview)
4. **استيراد** (Importing) - مع progress bar
5. **اكتمل** (Complete)

## ملاحظات

- يدعم RTL بالكامل
- يستخدم shadcn/ui components
- يستخدم react-hook-form + zod للنماذج
- يستخدم xlsx library لتحليل Excel
- يستخدم papaparse لتحليل CSV
- Loading states في كل خطوة
- Error handling شامل
- Toast notifications

## أمثلة

### مثال على ملف Excel صحيح

| العنوان | نوع العقار | نوع العرض | السعر | المساحة | غرف النوم |
|---------|-----------|----------|-------|---------|----------|
| شقة فاخرة | شقة | بيع | 500000 | 200 | 3 |
| فيلا عصرية | فيلا | إيجار | 8000 | 400 | 5 |

### مثال على التحذيرات

- نوع عقار غير معروف → سيتم استخدام "أخرى"
- مساحة صفر أو سالبة

### مثال على الأخطاء

- حقل مطلوب فارغ
- نوع عرض غير صحيح
- سعر صفر أو سالب
- قيمة غير رقمية في حقل رقمي

## التطوير المستقبلي

- [ ] دعم استيراد الصور
- [ ] استيراد متعدد الأوراق (Multiple sheets)
- [ ] تصدير تقرير الأخطاء
- [ ] حفظ mapping templates
- [ ] معاينة الصور قبل الاستيراد
