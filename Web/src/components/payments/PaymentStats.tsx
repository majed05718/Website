'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Payment Stats - إحصائيات المدفوعات السريعة
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PaymentStatsProps {
  collectionRate: number
  averageAmount: number
  fastestPayment: number
  averageDelay: number
  isLoading?: boolean
}

export function PaymentStats({
  collectionRate,
  averageAmount,
  fastestPayment,
  averageDelay,
  isLoading
}: PaymentStatsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="text-lg font-semibold">إحصائيات سريعة</h3>
      </div>

      <div className="space-y-4">
        {/* معدل التحصيل */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">معدل التحصيل</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-green-600">
              {collectionRate}%
            </span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
        </div>

        {/* متوسط المبلغ */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">متوسط المبلغ</span>
          <span className="text-sm font-bold">
            {averageAmount.toLocaleString()} ر.س
          </span>
        </div>

        {/* أسرع دفع */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">أسرع دفع</span>
          <span className="text-sm font-bold text-green-600">
            {fastestPayment} {fastestPayment === 1 ? 'يوم' : 'أيام'}
          </span>
        </div>

        {/* متوسط التأخير */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">متوسط التأخير</span>
          <span className={`text-sm font-bold ${
            averageDelay > 7 ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {averageDelay} {averageDelay === 1 ? 'يوم' : 'أيام'}
          </span>
        </div>
      </div>
    </Card>
  )
}
