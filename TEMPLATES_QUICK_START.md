# ⚡ بداية سريعة - نظام قوالب Excel

<div dir="rtl">

## 🎯 للمستخدمين

### 3 خطوات فقط!

#### 1️⃣ اذهب للصفحة
```
/dashboard/customers/templates
```

#### 2️⃣ اختر قالباً
- **للمبتدئين**: القالب الأساسي
- **للمشترين**: قالب المشترين
- **للبائعين**: قالب البائعين
- **للمستأجرين**: قالب المستأجرين
- **سريع**: القالب السريع

#### 3️⃣ حمّل القالب
- اضغط زر **"تحميل"**
- افتح الملف في Excel
- املأ البيانات
- استورد إلى النظام

✅ **انتهيت!**

---

## 💻 للمطورين

### التثبيت

```bash
# المكتبات مثبتة مسبقاً
npm install xlsx file-saver
```

### الاستخدام الأساسي

```typescript
import { downloadTemplate } from '@/lib/export/template-generator'
import { PREDEFINED_TEMPLATES } from '@/types/template'

// تحميل قالب جاهز
const basicTemplate = {
  ...PREDEFINED_TEMPLATES[0],
  id: 'basic-1',
  createdAt: new Date().toISOString()
}

await downloadTemplate(basicTemplate, {
  format: 'xlsx',
  includeExamples: true,
  includeInstructions: true,
  includeValidation: true
})
```

### إنشاء قالب مخصص برمجياً

```typescript
import type { Template } from '@/types/template'

const customTemplate: Template = {
  id: 'custom-1',
  name: 'قالب VIP',
  nameEn: 'vip-template',
  description: 'للعملاء المميزين',
  type: 'custom',
  icon: 'FileSpreadsheet',
  isCustom: true,
  columnsCount: 5,
  createdAt: new Date().toISOString(),
  fields: [
    { key: 'name', label: 'الاسم', required: true, type: 'text' },
    { key: 'phone', label: 'الهاتف', required: true, type: 'phone' },
    // ... المزيد من الحقول
  ]
}

await downloadTemplate(customTemplate, {
  format: 'xlsx',
  includeExamples: true,
  includeInstructions: true,
  includeValidation: true
})
```

### استخدام المكونات

```typescript
import {
  TemplatesGallery,
  TemplateCard,
  MyTemplates,
  CustomTemplateCreator
} from '@/components/customers/templates'

// في صفحتك
<TemplatesGallery templates={templates} />
```

---

## 📦 الملفات الرئيسية

```
Web/src/
├── types/template.ts                    # Types
├── app/dashboard/customers/templates/
│   └── page.tsx                         # الصفحة
├── components/customers/templates/
│   ├── TemplatesGallery.tsx
│   ├── TemplateCard.tsx
│   ├── MyTemplates.tsx
│   └── CustomTemplateCreator.tsx
└── lib/export/
    └── template-generator.ts            # Generator
```

---

## 🎨 القوالب الجاهزة

| القالب | الأعمدة | الاستخدام |
|--------|---------|-----------|
| الأساسي | 13 | عام |
| المشترين | 10 | مشترين |
| البائعين | 9 | بائعين |
| المستأجرين | 8 | مستأجرين |
| السريع | 5 | إضافة سريعة |

---

## 🔗 روابط مفيدة

- 📖 [التوثيق الكامل](/TEMPLATES_COMPLETION.md)
- 📘 [دليل المستخدم](/TEMPLATES_GUIDE.md)
- 💻 [دليل المطورين](/Web/src/app/dashboard/customers/templates/README.md)

---

## ✅ Checklist

### للمستخدمين
- [ ] ذهبت لصفحة القوالب
- [ ] حمّلت قالباً
- [ ] ملأت البيانات
- [ ] استوردت للنظام

### للمطورين
- [ ] قرأت التوثيق
- [ ] فهمت البنية
- [ ] جربت المكونات
- [ ] جاهز للتخصيص

---

**جاهز؟ ابدأ الآن! 🚀**

</div>
