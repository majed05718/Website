'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Maintenance Stats - إحصائيات الصيانة
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, Wrench } from 'lucide-react'
import type { MaintenanceStats } from '@/types/maintenance'

interface MaintenanceStatsProps {
  stats: MaintenanceStats
  isLoading?: boolean
}

export function MaintenanceStats({ stats, isLoading }: MaintenanceStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-gray-200 rounded w-10"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'طلبات مفتوحة',
      value: stats.openRequests,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      badge: 'bg-red-100 text-red-800'
    },
    {
      title: 'قيد التنفيذ',
      value: stats.inProgressRequests,
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'مكتملة (هذا الشهر)',
      value: stats.completedThisMonth,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      badge: 'bg-green-100 text-green-800'
    },
    {
      title: 'متوسط وقت الإغلاق',
      value: `${stats.averageClosingTime} ساعة`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      badge: 'bg-blue-100 text-blue-800'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <Badge className={card.badge}>
                {typeof card.value === 'number' ? card.value : card.value}
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {card.value}
            </p>
          </Card>
        )
      })}
    </div>
  )
}
