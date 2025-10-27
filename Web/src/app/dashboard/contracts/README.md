# 📄 صفحة العقود - Contracts Page

## نظرة عامة

صفحة متكاملة لإدارة جميع العقود مع فلاتر متقدمة وخيارات عرض متنوعة وإحصائيات شاملة.

---

## 📁 البنية

```
contracts/
├── page.tsx                          # الصفحة الرئيسية
└── README.md                         # هذا الملف

components/contracts/
├── StatsCards.tsx                    # بطاقات الإحصائيات
├── ContractsFilters.tsx              # الفلاتر المتقدمة
├── ContractsTable.tsx                # عرض الجدول
├── ContractCard.tsx                  # عرض البطاقات (Grid)
└── index.ts                          # Exports

types/
└── contract.ts                       # Types & Interfaces
```

---

## 🎯 المميزات الرئيسية

### 1. Stats Cards (الإحصائيات)
- ✅ إجمالي العقود النشطة
- ✅ العقود المنتهية (هذا الشهر)
- ✅ القيمة الإجمالية للعقود النشطة
- ✅ عقود قاربت على الانتهاء (خلال 30 يوم)

### 2. Quick Actions (إجراءات سريعة)
- ✅ عقود قاربت على الانتهاء
- ✅ عقود بحاجة لتجديد
- ✅ عقود بمدفوعات متأخرة

### 3. Filters (الفلاتر)
- ✅ النوع (إيجار، بيع، صيانة)
- ✅ الحالة (نشط، منتهي، ملغي، معلق)
- ✅ تاريخ البداية (من-إلى)
- ✅ تاريخ الانتهاء (من-إلى)
- ✅ البحث (رقم العقد، اسم العميل، اسم العقار)
- ✅ الحالة المالية (مدفوع، جزئي، مستحق)

### 4. View Options (خيارات العرض)
- ✅ **Table View**: جدول تفصيلي
- ✅ **Grid View**: بطاقات
- 🔜 **Timeline View**: (قيد التطوير)

### 5. Contract Display (عرض العقد)
- ✅ رقم العقد (auto-generated: CON-2025-0001)
- ✅ النوع (badge ملون)
- ✅ الحالة (badge ملون)
- ✅ العقار (link)
- ✅ العميل (link)
- ✅ القيمة الإجمالية
- ✅ تاريخ البداية والانتهاء
- ✅ الأيام المتبقية (إذا نشط)
- ✅ الحالة المالية (badge + progress bar)
- ✅ نسبة الدفع (0-100%)

### 6. Actions (الإجراءات)
- ✅ عرض التفاصيل
- ✅ تعديل
- ✅ طباعة
- ✅ إنهاء العقد (للعقود النشطة فقط)

---

## 💻 الاستخدام

### عرض الصفحة
```typescript
// URL
/dashboard/contracts

// الصفحة تعرض تلقائياً:
// - الإحصائيات
// - Quick Actions
// - الفلاتر
// - قائمة العقود
```

### البحث والفلترة
```typescript
// البحث النصي
filters.search = "CON-2025-0001"  // رقم العقد
filters.search = "أحمد محمد"      // اسم العميل
filters.search = "فيلا العليا"    // اسم العقار

// الفلترة حسب النوع
filters.type = ['rental', 'sale']

// الفلترة حسب الحالة
filters.status = ['active', 'pending']

// الفلترة حسب التاريخ
filters.startDateFrom = '2024-01-01'
filters.startDateTo = '2024-12-31'

// الفلترة حسب الحالة المالية
filters.paymentStatus = ['partial', 'due']
```

### تغيير وضع العرض
```typescript
setViewMode('table')    // جدول
setViewMode('grid')     // شبكة
setViewMode('timeline') // (قيد التطوير)
```

---

## 🎨 التصميم

### الألوان

#### نوع العقد
- **إيجار** (rental): `bg-blue-100 text-blue-800`
- **بيع** (sale): `bg-green-100 text-green-800`
- **صيانة** (maintenance): `bg-purple-100 text-purple-800`

#### حالة العقد
- **نشط** (active): `bg-green-100 text-green-800`
- **منتهي** (expired): `bg-gray-100 text-gray-800`
- **ملغي** (cancelled): `bg-red-100 text-red-800`
- **معلق** (pending): `bg-yellow-100 text-yellow-800`

#### الحالة المالية
- **مدفوع** (paid): `bg-green-100 text-green-800`
- **جزئي** (partial): `bg-yellow-100 text-yellow-800`
- **مستحق** (due): `bg-red-100 text-red-800`

---

## 📊 حسابات تلقائية

### الأيام المتبقية
```typescript
const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
```

### نسبة الدفع
```typescript
const getPaymentProgress = (contract: Contract): number => {
  if (contract.totalAmount === 0) return 0
  return Math.round((contract.paidAmount / contract.totalAmount) * 100)
}
```

### الحالة المالية
```typescript
const getPaymentStatus = (contract: Contract) => {
  const progress = getPaymentProgress(contract)
  if (progress === 100) return 'paid'      // مدفوع
  if (progress > 0) return 'partial'       // جزئي
  return 'due'                             // مستحق
}
```

---

## 🔗 API Integration

### Endpoints
```typescript
// جلب جميع العقود
GET /api/contracts
Query: filters, pagination

// جلب الإحصائيات
GET /api/contracts/stats

// جلب عقد محدد
GET /api/contracts/:id

// إنشاء عقد جديد
POST /api/contracts

// تحديث عقد
PUT /api/contracts/:id

// إنهاء عقد
POST /api/contracts/:id/terminate

// طباعة عقد
GET /api/contracts/:id/print
```

---

## 🎯 User Flow

### 1. الوصول للصفحة
```
User → /dashboard/contracts
↓
عرض الإحصائيات
↓
عرض Quick Actions
↓
عرض الفلاتر (مطوية)
↓
عرض العقود (Table/Grid)
```

### 2. البحث عن عقد
```
User → يكتب في البحث
↓
Filter يتطبق تلقائياً
↓
العقود المطابقة تظهر
```

### 3. إنشاء عقد جديد
```
User → يضغط "عقد جديد"
↓
ينتقل لصفحة /dashboard/contracts/new
↓
يملأ النموذج (wizard/stepper)
↓
يحفظ
↓
يعود للقائمة
```

### 4. عرض تفاصيل عقد
```
User → يضغط "عرض" أو على رقم العقد
↓
ينتقل لصفحة /dashboard/contracts/:id
↓
يرى جميع التفاصيل
```

---

## 🔄 States

```typescript
// Contract Status
'active'    // نشط
'expired'   // منتهي
'cancelled' // ملغي
'pending'   // معلق

// Contract Type
'rental'      // إيجار
'sale'        // بيع
'maintenance' // صيانة

// Payment Status (محسوبة)
'paid'    // مدفوع (100%)
'partial' // جزئي (1-99%)
'due'     // مستحق (0%)

// View Mode
'table'    // جدول
'grid'     // شبكة
'timeline' // خط زمني
```

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Grid: 3 columns
- Table: جميع الأعمدة

### Tablet (768px - 1024px)
- Grid: 2 columns
- Table: scroll أفقي

### Mobile (< 768px)
- Grid: 1 column
- Table: يتحول لـ cards تلقائياً

---

## ♿ Accessibility

- ✅ RTL support كامل
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ ARIA labels
- ✅ Color contrast (WCAG AA)

---

## 🚀 التطوير المستقبلي

### Phase 2
- [ ] Timeline view
- [ ] Bulk actions (تعليق/إلغاء متعدد)
- [ ] Export to Excel/PDF
- [ ] Advanced search

### Phase 3
- [ ] Email notifications (قرب الانتهاء)
- [ ] Auto-renewal
- [ ] Contract templates
- [ ] E-signature integration

---

## 🧪 Testing

### Manual Tests
- ✅ عرض العقود
- ✅ الفلاتر (جميع الأنواع)
- ✅ البحث
- ✅ تغيير وضع العرض
- ✅ الإجراءات (عرض، تعديل، طباعة، إنهاء)

### Unit Tests (TODO)
```typescript
describe('ContractsPage', () => {
  it('should display contracts')
  it('should filter by type')
  it('should filter by status')
  it('should search contracts')
  it('should calculate days remaining')
  it('should calculate payment progress')
})
```

---

## 📝 ملاحظات

- رقم العقد يتم توليده تلقائياً: `CON-YYYY-XXXX`
- الأيام المتبقية تُحسب تلقائياً للعقود النشطة
- نسبة الدفع تُحسب: `(paidAmount / totalAmount) * 100`
- الحالة المالية تُحدد حسب نسبة الدفع
- Links للعقار والعميل تعمل مع الصفحات الأخرى

---

**Status**: ✅ Complete and Ready  
**Version**: 1.0.0  
**Last Updated**: 2024-10-26
