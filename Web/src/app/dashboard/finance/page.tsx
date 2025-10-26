'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Finance Page - صفحة التقارير المالية
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import {
  KPICards,
  DateRangeFilter,
  RevenueChart,
  RevenuePieChart,
  ExpensesDonutChart,
  CashFlowChart,
  TopPropertiesTable,
  ActiveContractsTable,
  BudgetSection,
  ProfitLossStatement,
  ReportGenerator
} from '@/components/finance'
import type {
  DateRange,
  FinanceDashboardData,
  ReportConfig
} from '@/types/finance'

export default function FinancePage() {
  // ═══════════════════════════════════════════════════════════
  // State Management
  // ═══════════════════════════════════════════════════════════
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()).toISOString().split('T')[0],
    to: endOfMonth(new Date()).toISOString().split('T')[0]
  })

  const [data, setData] = useState<FinanceDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ═══════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════

  /**
   * جلب البيانات المالية
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // في الحقيقة: API call
      // const response = await fetch(`/api/finance/dashboard?from=${dateRange.from}&to=${dateRange.to}`)
      // const data = await response.json()
      
      // الآن: بيانات تجريبية
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData(MOCK_DATA)
    } catch (error) {
      console.error('Error fetching finance data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  /**
   * Effect: جلب البيانات عند تغيير النطاق الزمني
   */
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ═══════════════════════════════════════════════════════════
  // Report Generation
  // ═══════════════════════════════════════════════════════════

  /**
   * توليد تقرير
   */
  const handleGenerateReport = async (config: ReportConfig) => {
    try {
      toast.loading('جاري توليد التقرير...')
      
      // في الحقيقة: API call
      // const response = await fetch('/api/finance/reports/generate', {
      //   method: 'POST',
      //   body: JSON.stringify(config)
      // })
      // const { fileUrl, fileName } = await response.json()
      // window.open(fileUrl, '_blank')
      
      // الآن: محاكاة
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('تم توليد التقرير بنجاح!')
      // محاكاة التنزيل
      console.log('Generated report with config:', config)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('حدث خطأ في توليد التقرير')
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            التقارير المالية
          </h1>
          <p className="text-gray-600 mt-1">
            لوحة تحكم شاملة للأداء المالي
          </p>
        </div>
        
        <ReportGenerator onGenerate={handleGenerateReport} />
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {/* KPI Cards */}
      <KPICards kpi={data?.kpi!} isLoading={isLoading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data?.monthlyData || []} isLoading={isLoading} />
        <RevenuePieChart sources={data?.revenueSources || []} isLoading={isLoading} />
        <ExpensesDonutChart categories={data?.expenseCategories || []} isLoading={isLoading} />
        <CashFlowChart data={data?.cashFlow || []} isLoading={isLoading} />
      </div>

      {/* Tables */}
      <TopPropertiesTable properties={data?.topProperties || []} isLoading={isLoading} />
      <ActiveContractsTable contracts={data?.activeContracts || []} isLoading={isLoading} />

      {/* Budget Section */}
      <BudgetSection budget={data?.budget!} isLoading={isLoading} />

      {/* Profit & Loss Statement */}
      <ProfitLossStatement statement={data?.profitLoss!} isLoading={isLoading} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Mock Data - بيانات تجريبية
// ═══════════════════════════════════════════════════════════

const MOCK_DATA: FinanceDashboardData = {
  // KPI
  kpi: {
    revenue: {
      current: 450000,
      previous: 380000,
      change: 18.4,
      sparkline: [350000, 380000, 400000, 420000, 450000]
    },
    expenses: {
      current: 280000,
      previous: 290000,
      change: -3.4,
      sparkline: [300000, 290000, 285000, 280000, 280000]
    },
    netProfit: {
      amount: 170000,
      margin: 37.8
    },
    revenueGrowth: {
      percentage: 18.4,
      trend: 'up'
    }
  },

  // Monthly Data للرسوم البيانية
  monthlyData: [
    { month: 'يناير', revenue: 350000, expenses: 250000, profit: 100000 },
    { month: 'فبراير', revenue: 380000, expenses: 260000, profit: 120000 },
    { month: 'مارس', revenue: 400000, expenses: 270000, profit: 130000 },
    { month: 'أبريل', revenue: 420000, expenses: 275000, profit: 145000 },
    { month: 'مايو', revenue: 450000, expenses: 280000, profit: 170000 },
    { month: 'يونيو', revenue: 480000, expenses: 285000, profit: 195000 },
    { month: 'يوليو', revenue: 500000, expenses: 290000, profit: 210000 },
    { month: 'أغسطس', revenue: 520000, expenses: 295000, profit: 225000 },
    { month: 'سبتمبر', revenue: 490000, expenses: 288000, profit: 202000 },
    { month: 'أكتوبر', revenue: 510000, expenses: 292000, profit: 218000 },
    { month: 'نوفمبر', revenue: 530000, expenses: 298000, profit: 232000 },
    { month: 'ديسمبر', revenue: 550000, expenses: 300000, profit: 250000 }
  ],

  // مصادر الإيرادات
  revenueSources: [
    { name: 'إيجارات', value: 300000, percentage: 66.7, color: '#10B981' },
    { name: 'مبيعات', value: 80000, percentage: 17.8, color: '#3B82F6' },
    { name: 'عمولات', value: 50000, percentage: 11.1, color: '#F59E0B' },
    { name: 'صيانة', value: 15000, percentage: 3.3, color: '#8B5CF6' },
    { name: 'أخرى', value: 5000, percentage: 1.1, color: '#6B7280' }
  ],

  // فئات المصروفات
  expenseCategories: [
    { name: 'رواتب', value: 120000, percentage: 42.9, color: '#EF4444' },
    { name: 'صيانة', value: 70000, percentage: 25.0, color: '#F59E0B' },
    { name: 'تسويق', value: 50000, percentage: 17.9, color: '#3B82F6' },
    { name: 'مرافق', value: 30000, percentage: 10.7, color: '#8B5CF6' },
    { name: 'أخرى', value: 10000, percentage: 3.6, color: '#6B7280' }
  ],

  // التدفق النقدي
  cashFlow: [
    { month: 'يناير', inflow: 400000, outflow: 250000, net: 150000 },
    { month: 'فبراير', inflow: 420000, outflow: 260000, net: 160000 },
    { month: 'مارس', inflow: 450000, outflow: 270000, net: 180000 },
    { month: 'أبريل', inflow: 480000, outflow: 275000, net: 205000 },
    { month: 'مايو', inflow: 500000, outflow: 280000, net: 220000 },
    { month: 'يونيو', inflow: 520000, outflow: 285000, net: 235000 }
  ],

  // أعلى 10 عقارات ربحاً
  topProperties: [
    { id: '1', name: 'فيلا الرياض الفاخرة', revenue: 80000, expenses: 20000, netProfit: 60000, roi: 18.5, trend: 'up' },
    { id: '2', name: 'برج جدة السكني', revenue: 75000, expenses: 22000, netProfit: 53000, roi: 16.2, trend: 'up' },
    { id: '3', name: 'مجمع الدمام التجاري', revenue: 70000, expenses: 25000, netProfit: 45000, roi: 14.8, trend: 'down' },
    { id: '4', name: 'شقق الخبر الراقية', revenue: 65000, expenses: 20000, netProfit: 45000, roi: 15.3, trend: 'up' },
    { id: '5', name: 'فيلا مكة المكرمة', revenue: 60000, expenses: 18000, netProfit: 42000, roi: 16.8, trend: 'up' },
    { id: '6', name: 'عمارة المدينة السكنية', revenue: 55000, expenses: 20000, netProfit: 35000, roi: 12.1, trend: 'down' },
    { id: '7', name: 'محل الطائف التجاري', revenue: 50000, expenses: 15000, netProfit: 35000, roi: 17.5, trend: 'up' },
    { id: '8', name: 'شاليه أبها السياحي', revenue: 45000, expenses: 18000, netProfit: 27000, roi: 13.2, trend: 'up' },
    { id: '9', name: 'مكتب الظهران الإداري', revenue: 40000, expenses: 15000, netProfit: 25000, roi: 14.7, trend: 'down' },
    { id: '10', name: 'استراحة الجبيل', revenue: 35000, expenses: 12000, netProfit: 23000, roi: 15.9, trend: 'up' }
  ],

  // العقود النشطة
  activeContracts: [
    { id: '1', contractNumber: 'CON-2025-0001', monthlyValue: 25000, endDate: '2025-12-31', daysRemaining: 240, paymentProgress: 85 },
    { id: '2', contractNumber: 'CON-2025-0002', monthlyValue: 20000, endDate: '2025-06-30', daysRemaining: 60, paymentProgress: 92 },
    { id: '3', contractNumber: 'CON-2025-0003', monthlyValue: 18000, endDate: '2025-11-15', daysRemaining: 195, paymentProgress: 75 },
    { id: '4', contractNumber: 'CON-2025-0004', monthlyValue: 15000, endDate: '2025-03-20', daysRemaining: 25, paymentProgress: 95 },
    { id: '5', contractNumber: 'CON-2025-0005', monthlyValue: 12000, endDate: '2025-09-10', daysRemaining: 138, paymentProgress: 68 }
  ],

  // الميزانية
  budget: {
    target: 300000,
    actual: 280000,
    remaining: 20000,
    percentage: 93.3,
    categories: [
      { name: 'رواتب', allocated: 130000, spent: 120000, remaining: 10000 },
      { name: 'صيانة', allocated: 80000, spent: 70000, remaining: 10000 },
      { name: 'تسويق', allocated: 50000, spent: 50000, remaining: 0 },
      { name: 'مرافق', allocated: 30000, spent: 30000, remaining: 0 },
      { name: 'أخرى', allocated: 10000, spent: 10000, remaining: 0 }
    ]
  },

  // قائمة الدخل
  profitLoss: {
    period: {
      from: new Date().toISOString(),
      to: new Date().toISOString()
    },
    revenue: {
      rentals: 300000,
      sales: 80000,
      commissions: 50000,
      other: 20000,
      total: 450000
    },
    expenses: {
      salaries: 120000,
      maintenance: 70000,
      marketing: 50000,
      utilities: 30000,
      other: 10000,
      total: 280000
    },
    netProfitLoss: 170000
  }
}
