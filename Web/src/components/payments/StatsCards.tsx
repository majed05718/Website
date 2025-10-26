'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Stats Cards - بطاقات KPI للمدفوعات
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { 
  DollarSign, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import type { PaymentStats } from '@/types/payment'

interface StatsCardsProps {
  stats: PaymentStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* إجمالي المدفوعات (هذا الشهر) */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              إجمالي المدفوعات
            </p>
            <p className="text-xs text-gray-500">(هذا الشهر)</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalThisMonth.toLocaleString()} ريال
          </p>
          
          {/* مقارنة بالشهر السابق */}
          <div className="flex items-center gap-1">
            {stats.percentageChange > 0 ? (
              <ArrowUp className="w-4 h-4 text-green-600" />
            ) : stats.percentageChange < 0 ? (
              <ArrowDown className="w-4 h-4 text-red-600" />
            ) : null}
            <span className={`text-sm font-medium ${
              stats.percentageChange > 0 ? 'text-green-600' :
              stats.percentageChange < 0 ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {Math.abs(stats.percentageChange)}%
            </span>
            <span className="text-xs text-gray-500">
              عن الشهر السابق
            </span>
          </div>
        </div>
      </Card>

      {/* المدفوعات المستحقة */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              المدفوعات المستحقة
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalDue.toLocaleString()} ريال
          </p>
          <p className="text-sm text-gray-600">
            {stats.dueCount} فاتورة
          </p>
        </div>
      </Card>

      {/* المدفوعات المتأخرة */}
      <Card className="p-6 hover:shadow-lg transition-shadow border-red-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-red-600 font-medium mb-1">
              المدفوعات المتأخرة
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-bold text-red-900">
            {stats.totalOverdue.toLocaleString()} ريال
          </p>
          <p className="text-sm text-red-600">
            {stats.overdueCount} فاتورة
          </p>
          {stats.oldestOverdueDays > 0 && (
            <p className="text-xs text-red-500">
              أقدم فاتورة: {stats.oldestOverdueDays} يوم
            </p>
          )}
        </div>
      </Card>

      {/* معدل التحصيل */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              معدل التحصيل
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            {stats.collectionTrend === 'up' ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-2xl font-bold text-gray-900">
            {stats.collectionRate}%
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  stats.collectionRate >= 80 ? 'bg-green-500' :
                  stats.collectionRate >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${stats.collectionRate}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              stats.collectionTrend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.collectionTrend === 'up' ? '↑' : '↓'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
