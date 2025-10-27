'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Executive Dashboard - لوحة التحكم التنفيذية
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share, Printer, Calendar } from 'lucide-react'
import {
  SummaryCards,
  RevenueBreakdown,
  SalesFunnel,
  KPIsGrid,
  TopPerformers,
  MarketInsights,
  GoalsTracking
} from '@/components/analytics/executive'
import type {
  ExecutiveSummaryCard,
  RevenueBreakdownData,
  FunnelStage,
  KPI,
  TopPerformer,
  MarketInsight,
  Goal
} from '@/types/analytics'

export default function ExecutiveDashboardPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            لوحة التحكم التنفيذية
          </h1>
          <p className="text-gray-600 mt-1">
            نظرة شاملة على الأداء والإحصائيات الرئيسية
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 ml-2" />
            آخر 30 يوم
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير الكل
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards cards={MOCK_SUMMARY_CARDS} isLoading={isLoading} />

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueBreakdown data={MOCK_REVENUE_BREAKDOWN} isLoading={isLoading} />
        </div>
        <SalesFunnel stages={MOCK_FUNNEL_STAGES} isLoading={isLoading} />
      </div>

      {/* KPIs Grid */}
      <KPIsGrid kpis={MOCK_KPIS} isLoading={isLoading} />

      {/* Top Performers */}
      <TopPerformers performers={MOCK_TOP_PERFORMERS} isLoading={isLoading} />

      {/* Market Insights */}
      <MarketInsights insights={MOCK_MARKET_INSIGHTS} isLoading={isLoading} />

      {/* Goals Tracking */}
      <GoalsTracking goals={MOCK_GOALS} isLoading={isLoading} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════

const MOCK_SUMMARY_CARDS: ExecutiveSummaryCard[] = [
  {
    id: 'revenue',
    title: 'إجمالي الإيرادات',
    value: 2450000,
    change: 15,
    trend: 'up',
    sparkline: [2100000, 2200000, 2300000, 2350000, 2450000],
    unit: 'ريال',
    color: '#10b981'
  },
  {
    id: 'profit',
    title: 'صافي الربح',
    value: 612500,
    change: 12,
    trend: 'up',
    sparkline: [500000, 520000, 550000, 580000, 612500],
    unit: 'ريال',
    color: '#3b82f6'
  },
  {
    id: 'properties',
    title: 'العقارات النشطة',
    value: 150,
    change: 5,
    trend: 'up',
    sparkline: [142, 145, 147, 148, 150],
    unit: 'عقار',
    color: '#f97316'
  },
  {
    id: 'occupancy',
    title: 'معدل الإشغال',
    value: 85,
    change: 3,
    trend: 'up',
    sparkline: [80, 81, 83, 84, 85],
    unit: '%',
    color: '#8b5cf6'
  }
]

const MOCK_REVENUE_BREAKDOWN: RevenueBreakdownData[] = [
  { month: 'يناير', rent: 300000, sales: 150000, commissions: 50000, maintenance: 20000, total: 520000 },
  { month: 'فبراير', rent: 320000, sales: 160000, commissions: 55000, maintenance: 22000, total: 557000 },
  { month: 'مارس', rent: 340000, sales: 170000, commissions: 60000, maintenance: 25000, total: 595000 },
  { month: 'أبريل', rent: 360000, sales: 180000, commissions: 65000, maintenance: 28000, total: 633000 },
  { month: 'مايو', rent: 380000, sales: 190000, commissions: 70000, maintenance: 30000, total: 670000 },
  { month: 'يونيو', rent: 400000, sales: 200000, commissions: 75000, maintenance: 32000, total: 707000 }
]

const MOCK_FUNNEL_STAGES: FunnelStage[] = [
  { name: 'Prospects', count: 500, percentage: 100, color: '#1e3a8a' },
  { name: 'Qualified Leads', count: 300, percentage: 60, color: '#1e40af' },
  { name: 'Property Viewings', count: 180, percentage: 60, color: '#3b82f6' },
  { name: 'Offers', count: 90, percentage: 50, color: '#60a5fa' },
  { name: 'Closed Deals', count: 54, percentage: 60, color: '#10b981' }
]

const MOCK_KPIS: KPI[] = [
  {
    id: 'avg-contract',
    title: 'متوسط قيمة العقد',
    value: 15000,
    change: 12,
    trend: 'up',
    unit: 'ريال'
  },
  {
    id: 'clv',
    title: 'Customer Lifetime Value',
    value: 45000,
    change: 8,
    trend: 'up',
    unit: 'ريال'
  },
  {
    id: 'cpa',
    title: 'Cost Per Acquisition',
    value: 2500,
    change: -5,
    trend: 'down',
    target: 2000,
    unit: 'ريال'
  },
  {
    id: 'rev-emp',
    title: 'Revenue Per Employee',
    value: 120000,
    change: 10,
    trend: 'up',
    target: 100000,
    unit: 'ريال/شهر'
  },
  {
    id: 'prop-emp',
    title: 'Properties Per Employee',
    value: 25,
    change: 4,
    trend: 'up',
    unit: 'عقار'
  },
  {
    id: 'deal-time',
    title: 'Average Deal Time',
    value: 18,
    change: -10,
    trend: 'down',
    target: 15,
    unit: 'يوم'
  }
]

const MOCK_TOP_PERFORMERS: TopPerformer[] = [
  {
    id: '1',
    rank: 1,
    name: 'أحمد محمد العتيبي',
    revenue: 850000,
    deals: 45,
    conversionRate: 75,
    satisfaction: 4.8,
    performance: 95
  },
  {
    id: '2',
    rank: 2,
    name: 'فاطمة علي السعيد',
    revenue: 720000,
    deals: 38,
    conversionRate: 70,
    satisfaction: 4.7,
    performance: 92
  },
  {
    id: '3',
    rank: 3,
    name: 'خالد سعد المطيري',
    revenue: 680000,
    deals: 35,
    conversionRate: 68,
    satisfaction: 4.6,
    performance: 88
  },
  {
    id: '4',
    rank: 4,
    name: 'نورة حسن القحطاني',
    revenue: 650000,
    deals: 32,
    conversionRate: 65,
    satisfaction: 4.5,
    performance: 85
  },
  {
    id: '5',
    rank: 5,
    name: 'عبدالله فهد الدوسري',
    revenue: 620000,
    deals: 30,
    conversionRate: 63,
    satisfaction: 4.4,
    performance: 82
  }
]

const MOCK_MARKET_INSIGHTS: MarketInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    icon: 'lightbulb',
    title: 'فرصة ذهبية',
    description: 'العقارات في حي العليا تحقق عوائد أعلى بـ 20% من المتوسط',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/dashboard/properties?filter=area:al-olaya',
    color: '#3b82f6'
  },
  {
    id: '2',
    type: 'trend',
    icon: 'trending-up',
    title: 'طلب متزايد',
    description: 'هناك زيادة 15% في الطلب على الشقق الصغيرة (1-2 غرف)',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#10b981'
  },
  {
    id: '3',
    type: 'warning',
    icon: 'alert-triangle',
    title: 'تنبيه',
    description: 'معدل الإشغال انخفض 5% مقارنة بالشهر الماضي في حي النرجس',
    date: new Date().toISOString(),
    color: '#f97316'
  },
  {
    id: '4',
    type: 'alert',
    icon: 'target',
    title: 'عقود قاربت على الانتهاء',
    description: '3 عقود تنتهي خلال 30 يوم - يُنصح بالتجديد المبكر',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/dashboard/contracts?filter=expiring-soon',
    color: '#ef4444'
  },
  {
    id: '5',
    type: 'info',
    icon: 'dollar-sign',
    title: 'ارتفاع الأسعار',
    description: 'متوسط سعر الإيجار ارتفع 8% في الربع الأخير',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#8b5cf6'
  }
]

const MOCK_GOALS: Goal[] = [
  {
    id: 'revenue-goal',
    title: 'الإيرادات الشهرية',
    target: 500000,
    current: 420000,
    percentage: 84,
    unit: 'ريال',
    daysRemaining: 8,
    status: 'on-track',
    color: '#10b981'
  },
  {
    id: 'deals-goal',
    title: 'عدد الصفقات',
    target: 50,
    current: 38,
    percentage: 76,
    unit: 'صفقة',
    daysRemaining: 8,
    status: 'on-track',
    color: '#3b82f6'
  },
  {
    id: 'occupancy-goal',
    title: 'معدل الإشغال',
    target: 90,
    current: 85,
    percentage: 94.4,
    unit: '%',
    status: 'at-risk',
    color: '#f97316'
  },
  {
    id: 'satisfaction-goal',
    title: 'رضا العملاء',
    target: 4.5,
    current: 4.3,
    percentage: 95.6,
    unit: '/5',
    status: 'on-track',
    color: '#eab308'
  }
]
