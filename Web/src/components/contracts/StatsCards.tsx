'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Stats Cards - بطاقات الإحصائيات
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { 
  FileText, 
  XCircle, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react'
import type { ContractStats } from '@/types/contract'

interface StatsCardsProps {
  stats: ContractStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const cards = [
    {
      title: 'العقود النشطة',
      value: stats.totalActive,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'المنتهية (هذا الشهر)',
      value: stats.expiredThisMonth,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'القيمة الإجمالية',
      value: `${stats.totalActiveValue.toLocaleString()} ريال`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'قاربت على الانتهاء',
      value: stats.expiringIn30Days,
      subtitle: '(خلال 30 يوم)',
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {card.value}
                </p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                )}
              </div>
              
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
