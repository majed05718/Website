# 📊 صفحة تصدير العملاء - Customers Export

## 🎯 نظرة عامة

صفحة متقدمة لتصدير بيانات العملاء إلى Excel/CSV/PDF مع خيارات تخصيص شاملة ومعاينة قبل التصدير.

---

## 📁 البنية

```
Web/src/
├── app/dashboard/customers/export/
│   └── page.tsx                        # الصفحة الرئيسية
│
├── components/customers/export/
│   ├── ExportOptions.tsx              # خيارات التصدير (4 أنواع)
│   ├── ColumnSelector.tsx             # اختيار الأعمدة (20+)
│   ├── FormatOptions.tsx              # تنسيق الملف (Excel/CSV/PDF)
│   ├── ExportPreview.tsx              # معاينة البيانات
│   ├── ExportHistory.tsx              # سجل التصديرات (آخر 5)
│   ├── ExportProgress.tsx             # شريط التقدم
│   └── index.ts                       # Exports
│
├── types/
│   └── export.ts                       # Types & Interfaces
│
├── lib/export/
│   └── customer-exporter.ts            # Utility functions
│
└── components/ui/
    ├── radio-group.tsx                 # Radio Group component
    └── scroll-area.tsx                 # Scroll Area component
```

---

## 🎯 المميزات الرئيسية

### 1. خيارات التصدير المتعددة
- **تصدير الكل**: جميع العملاء في النظام
- **تصدير المحدد**: العملاء المحددين من القائمة
- **تصدير حسب الفلتر**: حسب الفلاتر المطبقة
- **تصدير حسب تاريخ**: في نطاق زمني محدد

### 2. اختيار الأعمدة المرنة
20+ عمود مجمعة حسب الفئات:
- معلومات أساسية (6 أعمدة)
- معلومات الاتصال (2 عمود)
- التفضيلات (3 أعمدة)
- الإحصائيات (4 أعمدة)
- معلومات إضافية (5+ أعمدة)

### 3. تنسيقات متعددة
- **Excel (.xlsx)**: مع تنسيق وألوان كاملة
- **CSV (.csv)**: ملف نصي بسيط
- **PDF (.pdf)**: للطباعة والمشاركة

### 4. خيارات تنسيق متقدمة
- Header ملون
- تضمين الشعار
- معلومات المكتب
- ترقيم تلقائي
- إحصائيات في آخر الملف

### 5. معاينة قبل التصدير
- عرض أول 5 صفوف
- الأعمدة المحددة
- التنسيق المطبق
- ملخص الإعدادات

### 6. سجل التصديرات
- حفظ آخر 5 عمليات
- إعادة التحميل بسهولة
- معلومات تفصيلية (الحجم، التاريخ، عدد الصفوف)

---

## 💻 الاستخدام البرمجي

### استيراد المكونات

```typescript
import {
  ExportOptions,
  ColumnSelector,
  FormatOptions,
  ExportPreview,
  ExportHistory,
  ExportProgress
} from '@/components/customers/export'
```

### استيراد الـ Types

```typescript
import type {
  ExportConfig,
  ExportFormat,
  ExportType,
  CustomerExportColumn,
  ExportStyling,
  ExportHistoryItem
} from '@/types/export'
```

### استخدام الـ Exporter

```typescript
import { exportCustomersToFile } from '@/lib/export/customer-exporter'

// إعداد التصدير
const config: ExportConfig = {
  exportType: 'all',
  selectedIds: [],
  dateRange: { from: '', to: '' },
  columns: ['name', 'phone', 'email', 'type', 'status'],
  format: 'xlsx',
  styling: {
    includeHeader: true,
    includeLogo: false,
    includeOfficeInfo: false,
    autoNumbering: true,
    includeStats: false
  }
}

// تنفيذ التصدير مع Progress
await exportCustomersToFile(config, (progress) => {
  console.log(`Progress: ${progress}%`)
})
```

---

## 🎨 التخصيص

### إضافة أعمدة جديدة

في `types/export.ts`:

```typescript
export type CustomerExportColumn =
  | 'name'
  | 'phone'
  // ... الأعمدة الحالية
  | 'customField'  // عمود جديد

// إضافة إلى AVAILABLE_COLUMNS
export const AVAILABLE_COLUMNS: ColumnInfo[] = [
  // ... الأعمدة الحالية
  {
    key: 'customField',
    label: 'الحقل المخصص',
    description: 'وصف الحقل',
    category: 'other'
  }
]
```

في `lib/export/customer-exporter.ts`:

```typescript
function formatCustomerValue(customer: Customer, column: CustomerExportColumn): any {
  switch (column) {
    // ... الحالات الحالية
    case 'customField':
      return customer.customField || '-'
    // ...
  }
}
```

### تخصيص التنسيق

```typescript
// تخصيص ألوان الـ Header
if (config.styling.includeHeader) {
  cell.s = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '0066CC' } },  // غير اللون هنا
    alignment: { horizontal: 'center', vertical: 'center' }
  }
}
```

---

## 📊 الأمثلة

### مثال 1: تصدير بسيط

```typescript
const simpleConfig: ExportConfig = {
  exportType: 'all',
  columns: ['name', 'phone', 'email'],
  format: 'csv',
  // ... باقي الإعدادات
}
```

### مثال 2: تصدير متقدم مع تنسيق

```typescript
const advancedConfig: ExportConfig = {
  exportType: 'filtered',
  columns: [
    'name', 'phone', 'email', 'type', 'status',
    'city', 'source', 'createdAt', 'rating'
  ],
  format: 'xlsx',
  styling: {
    includeHeader: true,
    includeLogo: true,
    includeOfficeInfo: true,
    autoNumbering: true,
    includeStats: true
  }
}
```

### مثال 3: تصدير حسب تاريخ

```typescript
const dateRangeConfig: ExportConfig = {
  exportType: 'date-range',
  dateRange: {
    from: '2024-01-01',
    to: '2024-12-31'
  },
  columns: ['name', 'phone', 'createdAt'],
  format: 'xlsx',
  // ...
}
```

---

## 🔧 التكامل مع API

### Backend Integration

```typescript
// في backend API
app.post('/api/customers/export', async (req, res) => {
  const { config } = req.body
  
  // جلب العملاء حسب الإعدادات
  const customers = await fetchCustomersForExport(config)
  
  // تحويل البيانات
  const data = transformCustomersData(customers, config)
  
  // إنشاء الملف
  const file = await createExportFile(data, config)
  
  // إرسال الملف
  res.download(file)
})
```

---

## 🎯 أفضل الممارسات

### 1. الأداء
- استخدم pagination للبيانات الكبيرة
- قم بمعالجة البيانات في batches
- أضف caching للنتائج المتكررة

### 2. الأمان
- تحقق من صلاحيات المستخدم
- sanitize البيانات قبل التصدير
- لا تصدّر بيانات حساسة بدون تشفير

### 3. UX
- أظهر progress للمستخدم
- امنح خيار الإلغاء
- احفظ التصديرات السابقة

---

## 📚 التوثيق

### للمستخدمين
- **CUSTOMERS_EXPORT_GUIDE.md** - دليل استخدام مصور

### للمطورين
- **CUSTOMERS_EXPORT_COMPLETION.md** - تقرير الإنجاز الكامل
- **CUSTOMERS_EXPORT_README.md** - هذا الملف

---

## 🐛 استكشاف الأخطاء

### مشكلة: التصدير بطيء
**الحل**: 
- قلل عدد الأعمدة
- استخدم CSV بدلاً من Excel
- صدّر على دفعات

### مشكلة: الأحرف العربية غير صحيحة
**الحل**:
- تأكد من استخدام UTF-8 encoding
- في CSV، تأكد من إضافة BOM

### مشكلة: الملف كبير جداً
**الحل**:
- استخدم الفلاتر لتقليل البيانات
- اختر أعمدة أقل
- استخدم CSV بدلاً من Excel

---

## 🚀 التطوير المستقبلي

- [ ] دعم تصدير الصور
- [ ] جدولة التصدير التلقائي
- [ ] تصدير إلى Google Sheets
- [ ] templates مخصصة للتصدير
- [ ] تصدير متعدد (multiple sheets)

---

## 📞 الدعم

للمشاكل أو الاستفسارات:
1. راجع التوثيق
2. تحقق من الأمثلة
3. راجع الكود المصدري مع comments

---

**تم التطوير بعناية فائقة ❤️**

**استمتع بالتصدير السهل والسريع! 🎉**
