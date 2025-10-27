# ⚡ دليل سريع - Backend Excel Service

<div dir="rtl">

## 🎯 الأساسيات

### الملفات الرئيسية
```
api/src/customers/
├── excel.service.ts        → الخدمة الرئيسية
├── excel.controller.ts     → API endpoints
└── customers-excel.module.ts  → Module
```

---

## 🚀 البداية السريعة

### 1. Import الـ Module

```typescript
// في customers.module.ts
import { CustomersExcelModule } from './customers-excel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    CustomersExcelModule  // ← أضف هذا
  ]
})
export class CustomersModule {}
```

### 2. استخدام الـ Service

```typescript
import { ExcelService } from './excel.service';

constructor(private excelService: ExcelService) {}

// Import
const result = await this.excelService.importCustomersFromExcel(
  file,
  mapping,
  { duplicateHandling: 'skip' }
);

// Export
const buffer = await this.excelService.exportCustomersToExcel(
  filters,
  columns,
  { includeStatistics: true }
);
```

---

## 📡 API Endpoints

### Import
```bash
POST /customers/excel/import
Content-Type: multipart/form-data

{
  file: [Excel file],
  mapping: [...],
  duplicateHandling: "skip"
}
```

### Preview
```bash
POST /customers/excel/preview
Content-Type: multipart/form-data

{
  file: [Excel file],
  mapping: [...],
  previewRows: 10
}
```

### Export
```bash
POST /customers/excel/export
Content-Type: application/json

{
  filters: { type: ["buyer"] },
  columns: ["name", "phone", "email"],
  includeStatistics: true
}
```

### Templates
```bash
GET /customers/excel/templates
GET /customers/excel/templates/:id/download
```

---

## 🔍 Validation Rules

### المطلوبة ⚠️
- **name**: 3+ أحرف
- **phone**: +966501234567
- **type**: buyer|seller|tenant|landlord

### الاختيارية ✓
- **email**: format صحيح
- **budgetMin**: > 0, < budgetMax
- **status**: active|inactive|archived

---

## ⚡ Performance

```typescript
// Default: 100 rows/batch
{ batchSize: 100 }

// Large imports: 500 rows/batch
{ batchSize: 500 }
```

---

## 🔄 Duplicate Handling

```typescript
// تخطي المكرر
{ duplicateHandling: 'skip' }

// تحديث الموجود
{ duplicateHandling: 'update' }

// إيقاف العملية
{ duplicateHandling: 'error' }
```

---

## ❌ Error Messages

جميع رسائل الخطأ **بالعربي**:
- "رقم الهاتف مطلوب"
- "رقم الهاتف غير صحيح"
- "البريد الإلكتروني غير صحيح"
- "نوع العميل غير صحيح"
- "الميزانية يجب أن تكون أكبر من صفر"

---

## 📊 Response Format

### Import Result
```typescript
{
  success: true,
  totalRows: 1000,
  validRows: 950,
  invalidRows: 50,
  insertedRows: 900,
  updatedRows: 50,
  skippedRows: 0,
  errors: [...],
  warnings: [...],
  duration: 15
}
```

### Preview Result
```typescript
{
  totalRows: 1000,
  validRows: 950,
  preview: [
    {
      row: 2,
      data: { name: "أحمد", ... },
      isValid: true,
      errors: []
    }
  ]
}
```

---

## 🧪 Testing (Quick)

```typescript
// Import test
const file = createMockFile([...data]);
const result = await service.importCustomersFromExcel(
  file, mapping, {}
);
expect(result.insertedRows).toBe(100);

// Export test
const buffer = await service.exportCustomersToExcel(
  {}, columns, {}
);
expect(buffer).toBeInstanceOf(Buffer);
```

---

## 🔧 Configuration

```typescript
// في customers-excel.module.ts
MulterModule.register({
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB
  }
})
```

---

## 📖 التوثيق الكامل

→ [EXCEL_SERVICE_README.md](/workspace/api/src/customers/EXCEL_SERVICE_README.md)

---

## ✅ Checklist

- [ ] import CustomersExcelModule
- [ ] اختبر Import endpoint
- [ ] اختبر Export endpoint
- [ ] اختبر Preview endpoint
- [ ] دمج مع Frontend
- [ ] كتابة tests

---

**جاهز! 🚀**

</div>
