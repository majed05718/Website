/**
 * ═══════════════════════════════════════════════════════════════
 * Finance Types - أنواع البيانات المالية
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * إحصائيات المالية (KPI)
 */
export interface FinanceKPI {
  revenue: {
    current: number;              // الإيرادات الشهرية الحالية
    previous: number;             // الشهر السابق
    change: number;               // نسبة التغيير
    sparkline: number[];          // بيانات الرسم البياني الصغير
  };
  expenses: {
    current: number;              // المصروفات الشهرية الحالية
    previous: number;             // الشهر السابق
    change: number;               // نسبة التغيير
    sparkline: number[];          // بيانات الرسم البياني الصغير
  };
  netProfit: {
    amount: number;               // صافي الربح
    margin: number;               // هامش الربح (%)
  };
  revenueGrowth: {
    percentage: number;           // نسبة النمو
    trend: 'up' | 'down' | 'stable'; // الاتجاه
  };
}

/**
 * بيانات الرسم البياني الشهري
 */
export interface MonthlyChartData {
  month: string;                  // الشهر
  revenue: number;                // الإيرادات
  expenses: number;               // المصروفات
  profit: number;                 // الربح
}

/**
 * مصادر الإيرادات
 */
export interface RevenueSource {
  name: string;                   // المصدر
  value: number;                  // القيمة
  percentage: number;             // النسبة المئوية
  color: string;                  // اللون
}

/**
 * أنواع المصروفات
 */
export interface ExpenseCategory {
  name: string;                   // الفئة
  value: number;                  // القيمة
  percentage: number;             // النسبة المئوية
  color: string;                  // اللون
}

/**
 * التدفق النقدي
 */
export interface CashFlow {
  month: string;                  // الشهر
  inflow: number;                 // الداخل
  outflow: number;                // الخارج
  net: number;                    // الصافي
}

/**
 * عقار مربح
 */
export interface ProfitableProperty {
  id: string;
  name: string;                   // اسم العقار
  revenue: number;                // الإيرادات
  expenses: number;               // المصروفات
  netProfit: number;              // صافي الربح
  roi: number;                    // عائد الاستثمار (%)
  trend: 'up' | 'down';          // الاتجاه
}

/**
 * العقد النشط
 */
export interface ActiveContract {
  id: string;
  contractNumber: string;         // رقم العقد
  monthlyValue: number;           // القيمة الشهرية
  endDate: string;                // تاريخ الانتهاء
  daysRemaining: number;          // الأيام المتبقية
  paymentProgress: number;        // التقدم المالي (0-100)
}

/**
 * الميزانية
 */
export interface Budget {
  target: number;                 // المستهدف
  actual: number;                 // الفعلي
  remaining: number;              // المتبقي
  percentage: number;             // النسبة (0-100)
  categories: BudgetCategory[];   // التفصيل حسب الفئات
}

/**
 * فئة في الميزانية
 */
export interface BudgetCategory {
  name: string;                   // الفئة
  allocated: number;              // المخصص
  spent: number;                  // المنفق
  remaining: number;              // المتبقي
}

/**
 * قائمة الدخل
 */
export interface ProfitLossStatement {
  period: {
    from: string;
    to: string;
  };
  
  revenue: {
    rentals: number;              // إيجارات
    sales: number;                // مبيعات
    commissions: number;          // عمولات
    other: number;                // أخرى
    total: number;                // الإجمالي
  };
  
  expenses: {
    salaries: number;             // رواتب
    maintenance: number;          // صيانة
    marketing: number;            // تسويق
    utilities: number;            // مرافق
    other: number;                // أخرى
    total: number;                // الإجمالي
  };
  
  netProfitLoss: number;          // صافي الربح/الخسارة
}

/**
 * نوع التقرير
 */
export type ReportType = 
  | 'revenue'                     // تقرير الإيرادات
  | 'expenses'                    // تقرير المصروفات
  | 'profit-loss'                 // قائمة الدخل
  | 'cash-flow'                   // التدفق النقدي
  | 'comprehensive';              // تقرير شامل

/**
 * تنسيق التقرير
 */
export type ReportFormat = 'pdf' | 'excel';

/**
 * نطاق التاريخ
 */
export interface DateRange {
  from: string;
  to: string;
}

/**
 * خيارات سريعة للتاريخ
 */
export type QuickDateSelect = 
  | 'this-month'                  // هذا الشهر
  | 'last-month'                  // الشهر السابق
  | 'last-3-months'               // آخر 3 أشهر
  | 'this-year'                   // هذه السنة
  | 'last-year';                  // السنة السابقة

/**
 * إعدادات التقرير
 */
export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  dateRange: DateRange;
  includeCharts?: boolean;
  includeDetails?: boolean;
}

/**
 * بيانات Dashboard الكاملة
 */
export interface FinanceDashboardData {
  kpi: FinanceKPI;
  monthlyData: MonthlyChartData[];
  revenueSources: RevenueSource[];
  expenseCategories: ExpenseCategory[];
  cashFlow: CashFlow[];
  topProperties: ProfitableProperty[];
  activeContracts: ActiveContract[];
  budget: Budget;
  profitLoss: ProfitLossStatement;
}

/**
 * تسميات أنواع التقارير
 */
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  revenue: 'تقرير الإيرادات',
  expenses: 'تقرير المصروفات',
  'profit-loss': 'قائمة الدخل',
  'cash-flow': 'التدفق النقدي',
  comprehensive: 'تقرير شامل'
};

/**
 * تسميات النطاقات السريعة
 */
export const QUICK_DATE_LABELS: Record<QuickDateSelect, string> = {
  'this-month': 'هذا الشهر',
  'last-month': 'الشهر السابق',
  'last-3-months': 'آخر 3 أشهر',
  'this-year': 'هذه السنة',
  'last-year': 'السنة السابقة'
};

/**
 * ألوان الرسوم البيانية
 */
export const CHART_COLORS = {
  revenue: '#10B981',      // أخضر
  expenses: '#EF4444',     // أحمر
  profit: '#3B82F6',       // أزرق
  primary: '#0066CC',      // أزرق أساسي
  secondary: '#F59E0B',    // برتقالي
  success: '#10B981',      // أخضر
  danger: '#EF4444',       // أحمر
  warning: '#F59E0B',      // برتقالي
  info: '#3B82F6'          // أزرق
};
