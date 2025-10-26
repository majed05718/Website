'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Budget Section - تخطيط الميزانية
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import type { Budget } from '@/types/finance'

interface BudgetSectionProps {
  budget: Budget
  isLoading?: boolean
}

export function BudgetSection({ budget, isLoading }: BudgetSectionProps) {
  // تحديد ما إذا كان هناك تحذير (تجاوز 90%)
  const isWarning = budget.percentage >= 90;
  const isExceeded = budget.percentage >= 100;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">تخطيط الميزانية الشهرية</h3>
          {isWarning && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isExceeded ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">
                {isExceeded ? 'تجاوزت الميزانية!' : 'قريب من الحد!'}
              </span>
            </div>
          )}
        </div>

        {/* الملخص الرئيسي */}
        <div className={`p-4 rounded-lg border-2 ${
          isExceeded ? 'bg-red-50 border-red-200' :
          isWarning ? 'bg-yellow-50 border-yellow-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">الميزانية المستهدفة</p>
              <p className="text-lg font-bold text-gray-900">
                {budget.target.toLocaleString()} ريال
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">الإنفاق الفعلي</p>
              <p className={`text-lg font-bold ${
                isExceeded ? 'text-red-700' : 
                isWarning ? 'text-yellow-700' : 
                'text-green-700'
              }`}>
                {budget.actual.toLocaleString()} ريال
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">المتبقي</p>
              <p className={`text-lg font-bold ${
                budget.remaining < 0 ? 'text-red-700' : 'text-green-700'
              }`}>
                {budget.remaining >= 0 ? '+' : ''}
                {budget.remaining.toLocaleString()} ريال
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">التقدم</span>
              <span className={`font-bold ${
                isExceeded ? 'text-red-700' : 
                isWarning ? 'text-yellow-700' : 
                'text-gray-700'
              }`}>
                {budget.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isExceeded ? 'bg-red-500' : 
                  isWarning ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* التفصيل حسب الفئات */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            التفصيل حسب الفئات
          </h4>
          <div className="space-y-3">
            {budget.categories.map((category, index) => {
              const categoryPercentage = (category.spent / category.allocated) * 100;
              const isCategoryWarning = categoryPercentage >= 90;
              
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-600">
                        {category.spent.toLocaleString()} / {category.allocated.toLocaleString()} ريال
                      </span>
                      {isCategoryWarning && (
                        <AlertTriangle className="w-3 h-3 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          categoryPercentage >= 100 ? 'bg-red-500' :
                          categoryPercentage >= 90 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{categoryPercentage.toFixed(0)}%</span>
                      <span>المتبقي: {category.remaining.toLocaleString()} ريال</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
