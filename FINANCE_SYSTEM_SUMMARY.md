# 📊 نظام التقارير المالية - ملخص شامل

<div dir="rtl">

## 🎯 نظرة عامة

نظام تقارير مالية متكامل للعقارات مع لوحة تحكم تفاعلية، رسوم بيانية، جداول تحليلية، ومولد تقارير احترافي.

---

## 📦 البنية الكاملة المطلوبة

```
finance/
├── page.tsx                          # الصفحة الرئيسية
└── README.md                         # التوثيق

components/finance/
├── KPICards.tsx                      # بطاقات KPI (4 بطاقات)
├── RevenueChart.tsx                  # الإيرادات vs المصروفات
├── RevenuePieChart.tsx               # مصادر الإيرادات
├── ExpensesDonutChart.tsx            # المصروفات حسب النوع
├── CashFlowChart.tsx                 # التدفق النقدي
├── TopPropertiesTable.tsx            # أعلى 10 عقارات
├── ActiveContractsTable.tsx          # العقود النشطة
├── BudgetSection.tsx                 # تخطيط الميزانية
├── ProfitLossStatement.tsx           # قائمة الدخل
├── ReportGenerator.tsx               # مولد التقارير
├── DateRangeFilter.tsx               # فلتر النطاق الزمني
└── index.ts                          # Exports

types/
└── finance.ts                        # ✅ تم إنشاؤه
```

---

## ✅ ما تم إنجازه

### 1. Types & Interfaces (✅ كامل)
- **FinanceKPI** - إحصائيات KPI
- **MonthlyChartData** - بيانات الرسوم الشهرية
- **RevenueSource** - مصادر الإيرادات
- **ExpenseCategory** - فئات المصروفات
- **CashFlow** - التدفق النقدي
- **ProfitableProperty** - العقارات المربحة
- **ActiveContract** - العقود النشطة
- **Budget** - الميزانية
- **ProfitLossStatement** - قائمة الدخل
- **ReportConfig** - إعدادات التقارير
- **FinanceDashboardData** - البيانات الكاملة

**الملف**: `/workspace/Web/src/types/finance.ts` (~250 سطر)

---

## 🎯 المكونات المطلوبة

### 1. KPICards.tsx (4 بطاقات)

```typescript
interface KPICardsProps {
  kpi: FinanceKPI;
  isLoading?: boolean;
}

// البطاقات:
// 1. الإيرادات الشهرية + sparkline
// 2. المصروفات الشهرية + sparkline
// 3. صافي الربح + الهامش
// 4. نمو الإيرادات + اتجاه
```

**المميزات**:
- مقارنة مع الشهر السابق (%)
- أيقونات ملونة
- Sparkline charts صغيرة
- Loading states

---

### 2. RevenueChart.tsx (Line Chart)

```typescript
interface RevenueChartProps {
  data: MonthlyChartData[];
  isLoading?: boolean;
}

// خطين:
// - الإيرادات (أخضر)
// - المصروفات (أحمر)
// آخر 12 شهر
```

**استخدام**: recharts
- LineChart
- Tooltip
- Legend
- Grid lines
- Responsive

---

### 3. RevenuePieChart.tsx (Pie Chart)

```typescript
interface RevenuePieChartProps {
  sources: RevenueSource[];
}

// مصادر الإيرادات:
// - إيجارات
// - مبيعات
// - عمولات
// - صيانة
// - أخرى
```

**المميزات**:
- ألوان مميزة لكل فئة
- Legend مع النسب
- Tooltip مع القيم

---

### 4. ExpensesDonutChart.tsx (Donut Chart)

```typescript
interface ExpensesDonutChartProps {
  categories: ExpenseCategory[];
}

// المصروفات حسب النوع:
// - رواتب
// - صيانة
// - تسويق
// - مرافق
// - أخرى
```

---

### 5. CashFlowChart.tsx (Area Chart)

```typescript
interface CashFlowChartProps {
  data: CashFlow[];
}

// التدفق النقدي (آخر 6 أشهر):
// - الداخل (أخضر)
// - الخارج (أحمر)
// - Filled areas
```

**استخدام**: AreaChart من recharts

---

### 6. TopPropertiesTable.tsx

```typescript
interface TopPropertiesTableProps {
  properties: ProfitableProperty[];
}

// Columns:
// - العقار
// - الإيرادات
// - المصروفات
// - صافي الربح
// - ROI %
// - Trend (↑/↓)
```

**المميزات**:
- Sorting
- Color coding
- Trend indicators
- Links للعقارات

---

### 7. ActiveContractsTable.tsx

```typescript
interface ActiveContractsTableProps {
  contracts: ActiveContract[];
}

// Columns:
// - العقد
// - القيمة الشهرية
// - تاريخ الانتهاء
// - الأيام المتبقية
// - الحالة المالية (progress bar)
```

---

### 8. BudgetSection.tsx

```typescript
interface BudgetSectionProps {
  budget: Budget;
}

// عرض:
// - الميزانية المستهدفة
// - الإنفاق الفعلي
// - المتبقي (progress bar)
// - تحذير إذا > 90%
// - Breakdown by category
```

**المميزات**:
- Progress bars ملونة
- تحذير أحمر عند التجاوز
- تفصيل حسب الفئات

---

### 9. ProfitLossStatement.tsx

```typescript
interface ProfitLossStatementProps {
  statement: ProfitLossStatement;
}

// قائمة الدخل:
// الإيرادات:
//   ├─ إيجارات
//   ├─ مبيعات
//   ├─ عمولات
//   └─ أخرى
// ═══════════════
// إجمالي الإيرادات
// 
// المصروفات:
//   ├─ رواتب
//   ├─ صيانة
//   └─ أخرى
// ═══════════════
// إجمالي المصروفات
// 
// ═══════════════
// صافي الربح/الخسارة
```

**التصميم**:
- Tree structure
- خطوط فاصلة
- تلوين (أخضر للربح، أحمر للخسارة)

---

### 10. ReportGenerator.tsx (Modal)

```typescript
interface ReportGeneratorProps {
  onGenerate: (config: ReportConfig) => Promise<void>;
}

// Modal يحتوي:
// 1. نوع التقرير (5 خيارات)
// 2. الفترة:
//    - من تاريخ
//    - إلى تاريخ
//    - Quick selects
// 3. التنسيق (PDF/Excel)
// 4. زر "إنشاء"
```

**المميزات**:
- Form validation
- Loading state أثناء التوليد
- Download automatic
- استخدام jsPDF و xlsx

---

### 11. DateRangeFilter.tsx

```typescript
interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

// نطاق مخصص + Quick selects:
// - هذا الشهر
// - الشهر السابق
// - آخر 3 أشهر
// - هذه السنة
// - السنة السابقة
```

---

## 🎨 التصميم

### الألوان

```typescript
const COLORS = {
  revenue: '#10B981',    // أخضر
  expenses: '#EF4444',   // أحمر
  profit: '#3B82F6',     // أزرق
  warning: '#F59E0B',    // برتقالي
  success: '#10B981',    // أخضر
};
```

### الخطوط
- **Heading**: 24px, bold
- **Subheading**: 18px, semibold
- **Body**: 14px
- **Small**: 12px

---

## 📊 بيانات تجريبية

```typescript
const MOCK_KPI: FinanceKPI = {
  revenue: {
    current: 450000,
    previous: 380000,
    change: 18.4,
    sparkline: [350, 380, 400, 420, 450]
  },
  expenses: {
    current: 280000,
    previous: 290000,
    change: -3.4,
    sparkline: [300, 290, 285, 280, 280]
  },
  netProfit: {
    amount: 170000,
    margin: 37.8
  },
  revenueGrowth: {
    percentage: 18.4,
    trend: 'up'
  }
};

const MOCK_REVENUE_SOURCES: RevenueSource[] = [
  { name: 'إيجارات', value: 300000, percentage: 66.7, color: '#10B981' },
  { name: 'مبيعات', value: 80000, percentage: 17.8, color: '#3B82F6' },
  { name: 'عمولات', value: 50000, percentage: 11.1, color: '#F59E0B' },
  { name: 'صيانة', value: 15000, percentage: 3.3, color: '#8B5CF6' },
  { name: 'أخرى', value: 5000, percentage: 1.1, color: '#6B7280' }
];
```

---

## 🔗 API Endpoints

```typescript
// جلب بيانات Dashboard
GET /api/finance/dashboard
Query: { from, to }
Response: FinanceDashboardData

// جلب الإيرادات
GET /api/finance/revenue
Query: { from, to }
Response: RevenueData

// جلب المصروفات
GET /api/finance/expenses
Query: { from, to }
Response: ExpensesData

// قائمة الدخل
GET /api/finance/profit-loss
Query: { from, to }
Response: ProfitLossStatement

// توليد تقرير
POST /api/finance/reports/generate
Body: ReportConfig
Response: { fileUrl, fileName }
```

---

## 💻 مثال الاستخدام

### الصفحة الرئيسية

```typescript
'use client'

export default function FinancePage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()).toISOString(),
    to: endOfMonth(new Date()).toISOString()
  });
  
  const [data, setData] = useState<FinanceDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, [dateRange]);
  
  const fetchData = async () => {
    setIsLoading(true);
    // في الحقيقة: const response = await fetch('/api/finance/dashboard', ...)
    // الآن: بيانات تجريبية
    setData(MOCK_DATA);
    setIsLoading(false);
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Date Range Filter */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />
      
      {/* KPI Cards */}
      <KPICards kpi={data?.kpi} isLoading={isLoading} />
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data?.monthlyData} />
        <RevenuePieChart sources={data?.revenueSources} />
        <ExpensesDonutChart categories={data?.expenseCategories} />
        <CashFlowChart data={data?.cashFlow} />
      </div>
      
      {/* Tables */}
      <TopPropertiesTable properties={data?.topProperties} />
      <ActiveContractsTable contracts={data?.activeContracts} />
      
      {/* Budget */}
      <BudgetSection budget={data?.budget} />
      
      {/* P&L Statement */}
      <ProfitLossStatement statement={data?.profitLoss} />
      
      {/* Report Generator */}
      <ReportGenerator onGenerate={handleGenerateReport} />
    </div>
  );
}
```

---

## 📋 خطة التنفيذ

### المرحلة 1: الأساسيات (تم ✅)
- [x] Types & Interfaces
- [x] البنية الأساسية

### المرحلة 2: المكونات الأساسية
- [ ] KPICards.tsx
- [ ] DateRangeFilter.tsx
- [ ] الصفحة الرئيسية (page.tsx)

### المرحلة 3: الرسوم البيانية
- [ ] RevenueChart.tsx
- [ ] RevenuePieChart.tsx
- [ ] ExpensesDonutChart.tsx
- [ ] CashFlowChart.tsx

### المرحلة 4: الجداول
- [ ] TopPropertiesTable.tsx
- [ ] ActiveContractsTable.tsx

### المرحلة 5: المكونات المتقدمة
- [ ] BudgetSection.tsx
- [ ] ProfitLossStatement.tsx
- [ ] ReportGenerator.tsx

---

## 📖 المكتبات المطلوبة

```json
{
  "dependencies": {
    "recharts": "^2.8.0",      // الرسوم البيانية
    "jspdf": "^2.5.1",         // توليد PDF
    "xlsx": "^0.18.5",         // توليد Excel
    "date-fns": "^2.30.0",     // معالجة التواريخ
    "react-hook-form": "^7.x", // النماذج
    "zod": "^3.x"              // Validation
  }
}
```

**جميعها مثبتة بالفعل في المشروع! ✅**

---

## 🎯 التقدم الحالي

```
✅ Types & Interfaces: 100%
⏳ المكونات: 0%
⏳ الصفحة الرئيسية: 0%
⏳ التوثيق: 50%

الإجمالي: ~10%
```

---

## 📝 ملاحظات

1. **Recharts**: مثبت ويعمل بشكل ممتاز
2. **البيانات التجريبية**: جاهزة للاختبار
3. **RTL**: جميع المكونات يجب أن تدعم RTL
4. **Responsive**: جميع المكونات responsive
5. **Loading States**: مهمة جداً
6. **Error Handling**: ضروري لكل API call

---

## 🚀 الخطوة التالية

**هل تريدني أن أكمل إنشاء المكونات؟**

يمكنني إنشاء:
1. KPICards.tsx (بطاقات KPI الأربع)
2. DateRangeFilter.tsx (فلتر التاريخ)
3. RevenueChart.tsx (رسم الإيرادات/المصروفات)
4. ثم باقي المكونات...
5. وأخيراً الصفحة الرئيسية

**أو**:
- هل تريد التركيز على مكون معين أولاً؟
- هل تريد مراجعة الـ Types أولاً؟

---

</div>
