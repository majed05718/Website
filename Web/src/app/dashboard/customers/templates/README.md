# 📁 Templates Page - صفحة القوالب

## نظرة عامة

صفحة متكاملة لإدارة قوالب Excel للعملاء، توفر قوالب جاهزة وإمكانية إنشاء قوالب مخصصة.

---

## 🏗️ البنية

```
templates/
├── page.tsx                          # الصفحة الرئيسية
└── README.md                         # هذا الملف
```

---

## 📋 المكونات المستخدمة

```typescript
import { TemplatesGallery } from '@/components/customers/templates/TemplatesGallery'
import { CustomTemplateCreator } from '@/components/customers/templates/CustomTemplateCreator'
import { MyTemplates } from '@/components/customers/templates/MyTemplates'
```

---

## 🎯 الوظائف الرئيسية

### 1. عرض القوالب الجاهزة
- 5 قوالب محددة مسبقاً
- لكل نوع من العملاء
- عرض في grid layout

### 2. إدارة القوالب المخصصة
- إنشاء قالب جديد
- تعديل قالب موجود
- حذف قالب

### 3. تحميل القوالب
- Excel (.xlsx) مع تنسيق كامل
- CSV (.csv) للبساطة
- مع/بدون أمثلة

---

## 🔄 State Management

```typescript
// القوالب المخصصة (localStorage محاكي)
const [customTemplates, setCustomTemplates] = useState<Template[]>([])

// نافذة إنشاء/تعديل
const [showCustomCreator, setShowCustomCreator] = useState(false)

// القالب المراد تعديله
const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
```

---

## 🎨 UI/UX

- **Layout**: Grid 2 columns (responsive)
- **Colors**: أزرق (#0066CC) + ألوان حسب النوع
- **RTL**: دعم كامل للعربية
- **Loading**: حالة تحميل أثناء التنزيل
- **Feedback**: Toast notifications

---

## 🚀 التطوير المستقبلي

### Backend Integration
```typescript
// حفظ في قاعدة البيانات بدلاً من State
const saveTemplate = async (template: Template) => {
  const response = await fetch('/api/customers/templates/custom', {
    method: 'POST',
    body: JSON.stringify(template)
  })
  return response.json()
}
```

### LocalStorage Persistence
```typescript
// حفظ القوالب المخصصة
useEffect(() => {
  const saved = localStorage.getItem('customTemplates')
  if (saved) {
    setCustomTemplates(JSON.parse(saved))
  }
}, [])

useEffect(() => {
  localStorage.setItem('customTemplates', JSON.stringify(customTemplates))
}, [customTemplates])
```

---

## 📝 ملاحظات

- القوالب المخصصة حالياً في state فقط (تُفقد عند إعادة التحميل)
- للإنتاج: احفظ في backend أو localStorage
- Data validation في Excel تحتاج ExcelJS للدعم الكامل

---

## 🔗 روابط ذات صلة

- [التوثيق الكامل](/TEMPLATES_COMPLETION.md)
- [دليل المستخدم](/TEMPLATES_GUIDE.md)
- [مكونات القوالب](/Web/src/components/customers/templates/)
- [Template Generator](/Web/src/lib/export/template-generator.ts)
