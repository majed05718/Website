'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Sales Funnel - قمع المبيعات
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import type { FunnelStage } from '@/types/analytics'

interface SalesFunnelProps {
  stages: FunnelStage[]
  isLoading?: boolean
}

export function SalesFunnel({ stages, isLoading }: SalesFunnelProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  // حساب أقصى عرض للقمع
  const maxCount = Math.max(...stages.map(s => s.count))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">
        قمع المبيعات (Sales Funnel)
      </h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const width = (stage.count / maxCount) * 100
          const prevStage = stages[index - 1]
          const conversion = prevStage 
            ? ((stage.count / prevStage.count) * 100).toFixed(0)
            : null

          return (
            <div key={index} className="space-y-2">
              {/* اسم المرحلة والعدد */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">{stage.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">{stage.count}</span>
                  {conversion && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {conversion}% conversion
                    </span>
                  )}
                </div>
              </div>
              
              {/* الشريط */}
              <div className="relative h-12 flex items-center">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(135deg, ${stage.color} 0%, ${stage.color}cc 100%)`,
                    boxShadow: `0 4px 6px -1px ${stage.color}40`
                  }}
                >
                  <span className="text-white font-semibold text-sm">
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* الإجمالي */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">معدل التحويل الإجمالي</span>
          <span className="text-lg font-bold text-green-600">
            {((stages[stages.length - 1].count / stages[0].count) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  )
}
