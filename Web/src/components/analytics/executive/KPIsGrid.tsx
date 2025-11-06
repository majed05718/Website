'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * KPIs Grid - شبكة مؤشرات الأداء
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react'
import type { KPI } from '@/types/analytics'

interface KPIsGridProps {
  kpis: KPI[]
  isLoading?: boolean
}

export function KPIsGrid({ kpis, isLoading }: KPIsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi) => {
        const isAboveTarget = kpi.target && Number(kpi.value) > kpi.target
        const percentageOfTarget = kpi.target 
          ? ((Number(kpi.value) / kpi.target) * 100).toFixed(0)
          : null

        return (
          <Card key={kpi.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              {/* Title */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </p>
                {kpi.target && (
                  <Target className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Value */}
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {typeof kpi.value === 'number' 
                    ? kpi.value.toLocaleString('ar-SA')
                    : kpi.value}
                  {kpi.unit && (
                    <span className="text-lg text-gray-600 mr-2">{kpi.unit}</span>
                  )}
                </p>
              </div>

              {/* Change & Target */}
              <div className="flex items-center justify-between">
                {/* Change */}
                {kpi.change !== undefined && (
                  <div className="flex items-center gap-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : kpi.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : null}
                    <span className={`text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-green-600' :
                      kpi.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                  </div>
                )}

                {/* Target */}
                {kpi.target && (
                  <div>
                    {isAboveTarget ? (
                      <Badge className="bg-green-100 text-green-800">
                        {percentageOfTarget}% من الهدف
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {percentageOfTarget}% من الهدف
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Bar للهدف */}
              {kpi.target && (
                <div className="pt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isAboveTarget ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min(Number(percentageOfTarget), 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>الحالي: {Number(kpi.value).toLocaleString()}</span>
                    <span>الهدف: {kpi.target.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
