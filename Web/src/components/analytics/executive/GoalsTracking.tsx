'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Goals Tracking - تتبع الأهداف
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, DollarSign, Star } from 'lucide-react'
import type { Goal } from '@/types/analytics'

interface GoalsTrackingProps {
  goals: Goal[]
  isLoading?: boolean
}

export function GoalsTracking({ goals, isLoading }: GoalsTrackingProps) {
  /**
   * الأيقونة حسب المعرف
   */
  const getIcon = (id: string) => {
    if (id.includes('revenue')) return <DollarSign className="w-6 h-6" />
    if (id.includes('deals')) return <TrendingUp className="w-6 h-6" />
    if (id.includes('occupancy')) return <Target className="w-6 h-6" />
    if (id.includes('satisfaction')) return <Star className="w-6 h-6" />
    return <Target className="w-6 h-6" />
  }

  /**
   * حالة الهدف
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'مكتمل', color: 'bg-green-100 text-green-800' }
      case 'on-track':
        return { label: 'على المسار', color: 'bg-blue-100 text-blue-800' }
      case 'at-risk':
        return { label: 'في خطر', color: 'bg-yellow-100 text-yellow-800' }
      case 'off-track':
        return { label: 'خارج المسار', color: 'bg-red-100 text-red-800' }
      default:
        return { label: 'غير معروف', color: 'bg-gray-100 text-gray-800' }
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-10"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">تتبع الأهداف الشهرية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal) => {
          const statusInfo = getStatusInfo(goal.status)
          
          return (
            <Card key={goal.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                >
                  {getIcon(goal.id)}
                </div>

                {/* Title */}
                <h4 className="font-semibold text-gray-900">
                  {goal.title}
                </h4>

                {/* Current vs Target */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {Number(goal.current).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {goal.target.toLocaleString()} {goal.unit}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {goal.percentage.toFixed(1)}% مكتمل
                  </p>
                </div>

                {/* Animated Progress Bar */}
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(goal.percentage, 100)}%`,
                        background: `linear-gradient(90deg, ${goal.color} 0%, ${goal.color}cc 100%)`
                      }}
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between pt-2">
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                  {goal.daysRemaining !== undefined && (
                    <span className="text-xs text-gray-500">
                      {goal.daysRemaining} يوم متبقي
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
