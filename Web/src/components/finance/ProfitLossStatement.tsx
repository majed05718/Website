'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Profit & Loss Statement - قائمة الدخل
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { ProfitLossStatement } from '@/types/finance'

interface ProfitLossStatementProps {
  statement: ProfitLossStatement
  isLoading?: boolean
}

export function ProfitLossStatementComponent({ 
  statement, 
  isLoading 
}: ProfitLossStatementProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  const isProfit = statement.netProfitLoss >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">قائمة الدخل</h3>
        <div className="text-sm text-gray-600">
          {new Date(statement.period.from).toLocaleDateString('ar-SA')}
          {' - '}
          {new Date(statement.period.to).toLocaleDateString('ar-SA')}
        </div>
      </div>

      <div className="space-y-6">
        {/* الإيرادات */}
        <div>
          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            الإيرادات
          </h4>
          
          <div className="space-y-2 mr-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">├─ إيجارات</span>
              <span className="font-medium">
                {statement.revenue.rentals.toLocaleString()} ريال
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">├─ مبيعات</span>
              <span className="font-medium">
                {statement.revenue.sales.toLocaleString()} ريال
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">├─ عمولات</span>
              <span className="font-medium">
                {statement.revenue.commissions.toLocaleString()} ريال
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">└─ أخرى</span>
              <span className="font-medium">
                {statement.revenue.other.toLocaleString()} ريال
              </span>
            </div>
          </div>
          
          <div className="h-px bg-gray-300 my-3"></div>
          
          <div className="flex justify-between font-semibold text-green-700">
            <span>إجمالي الإيرادات</span>
            <span>{statement.revenue.total.toLocaleString()} ريال</span>
          </div>
        </div>

        {/* المصروفات */}
        <div>
          <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            المصروفات
          </h4>
          
          <div className="space-y-2 mr-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">├─ رواتب</span>
              <span className="font-medium">
                {statement.expenses.salaries.toLocaleString()} ريال
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">├─ صيانة</span>
              <span className="font-medium">
                {statement.expenses.maintenance.toLocaleString()} ريال
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">├─ تسويق</span>
              <span className="font-medium">
                {statement.expenses.marketing.toLocaleString()} ريال
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">├─ مرافق</span>
              <span className="font-medium">
                {statement.expenses.utilities.toLocaleString()} ريال
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">└─ أخرى</span>
              <span className="font-medium">
                {statement.expenses.other.toLocaleString()} ريال
              </span>
            </div>
          </div>
          
          <div className="h-px bg-gray-300 my-3"></div>
          
          <div className="flex justify-between font-semibold text-red-700">
            <span>إجمالي المصروفات</span>
            <span>{statement.expenses.total.toLocaleString()} ريال</span>
          </div>
        </div>

        {/* خط فاصل رئيسي */}
        <div className="h-1 bg-gray-900 rounded"></div>

        {/* صافي الربح/الخسارة */}
        <div className={`p-4 rounded-lg ${
          isProfit ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-lg font-bold ${
              isProfit ? 'text-green-900' : 'text-red-900'
            }`}>
              {isProfit ? 'صافي الربح' : 'صافي الخسارة'}
            </span>
            <span className={`text-2xl font-bold ${
              isProfit ? 'text-green-900' : 'text-red-900'
            }`}>
              {isProfit ? '+' : '-'}
              {Math.abs(statement.netProfitLoss).toLocaleString()} ريال
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
