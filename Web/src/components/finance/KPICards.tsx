'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * KPI Cards - بطاقات مؤشرات الأداء المالي
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import type { FinanceKPI } from '@/types/finance'
import { CHART_COLORS } from '@/types/finance'

interface KPICardsProps {
  kpi: FinanceKPI
  isLoading?: boolean
}

export function KPICards({ kpi, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  /**
   * رسم Sparkline بسيط
   */
  const renderSparkline = (data: number[], color: string) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width="60" height="20" className="opacity-50">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* الإيرادات الشهرية */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              الإيرادات الشهرية
            </p>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {kpi.revenue.current.toLocaleString()} ريال
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {kpi.revenue.change > 0 ? (
                <ArrowUp className="w-4 h-4 text-green-600" />
              ) : kpi.revenue.change < 0 ? (
                <ArrowDown className="w-4 h-4 text-red-600" />
              ) : (
                <Minus className="w-4 h-4 text-gray-600" />
              )}
              <span className={`text-sm font-medium ${
                kpi.revenue.change > 0 ? 'text-green-600' :
                kpi.revenue.change < 0 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {Math.abs(kpi.revenue.change)}%
              </span>
            </div>
            {renderSparkline(kpi.revenue.sparkline, CHART_COLORS.revenue)}
          </div>
        </div>
      </Card>

      {/* المصروفات الشهرية */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              المصروفات الشهرية
            </p>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {kpi.expenses.current.toLocaleString()} ريال
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {kpi.expenses.change > 0 ? (
                <ArrowUp className="w-4 h-4 text-red-600" />
              ) : kpi.expenses.change < 0 ? (
                <ArrowDown className="w-4 h-4 text-green-600" />
              ) : (
                <Minus className="w-4 h-4 text-gray-600" />
              )}
              <span className={`text-sm font-medium ${
                kpi.expenses.change > 0 ? 'text-red-600' :
                kpi.expenses.change < 0 ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {Math.abs(kpi.expenses.change)}%
              </span>
            </div>
            {renderSparkline(kpi.expenses.sparkline, CHART_COLORS.expenses)}
          </div>
        </div>
      </Card>

      {/* صافي الربح */}
      <Card className="p-6 hover:shadow-lg transition-shadow border-blue-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              صافي الربح
            </p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {kpi.netProfit.amount.toLocaleString()} ريال
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              الهامش:
            </span>
            <span className="text-sm font-medium text-blue-600">
              {kpi.netProfit.margin.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* نمو الإيرادات */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              نمو الإيرادات
            </p>
            <div className={`p-2 rounded-lg ${
              kpi.revenueGrowth.trend === 'up' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {kpi.revenueGrowth.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
          
          <div>
            <p className={`text-2xl font-bold ${
              kpi.revenueGrowth.percentage >= 0 ? 'text-green-900' : 'text-red-900'
            }`}>
              {kpi.revenueGrowth.percentage > 0 ? '+' : ''}
              {kpi.revenueGrowth.percentage.toFixed(1)}%
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            {kpi.revenueGrowth.trend === 'up' ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              kpi.revenueGrowth.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpi.revenueGrowth.trend === 'up' ? 'اتجاه صاعد' : 'اتجاه هابط'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
