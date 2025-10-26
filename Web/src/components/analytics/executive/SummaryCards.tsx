'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Executive Summary Cards - بطاقات الملخص التنفيذي
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Building, Users, TrendingUp as Growth } from 'lucide-react'
import type { ExecutiveSummaryCard } from '@/types/analytics'

interface SummaryCardsProps {
  cards: ExecutiveSummaryCard[]
  isLoading?: boolean
}

export function SummaryCards({ cards, isLoading }: SummaryCardsProps) {
  /**
   * رسم Sparkline
   */
  const renderSparkline = (data: number[], color: string) => {
    if (!data || data.length === 0) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 40 - ((value - min) / range) * 40
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width="100" height="40" className="opacity-70">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  /**
   * الأيقونة حسب المعرف
   */
  const getIcon = (id: string) => {
    switch (id) {
      case 'revenue':
        return <DollarSign className="w-8 h-8" />
      case 'profit':
        return <TrendingUp className="w-8 h-8" />
      case 'properties':
        return <Building className="w-8 h-8" />
      case 'occupancy':
        return <Users className="w-8 h-8" />
      default:
        return <Growth className="w-8 h-8" />
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded w-48"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card
          key={card.id}
          className="p-8 hover:shadow-xl transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`
          }}
        >
          <div className="space-y-4">
            {/* Icon و Title */}
            <div className="flex items-center justify-between">
              <div className="text-gray-600">
                {getIcon(card.id)}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {card.title}
              </div>
            </div>

            {/* القيمة الكبيرة */}
            <div>
              <p className="text-5xl font-bold text-gray-900">
                {typeof card.value === 'number' 
                  ? card.value.toLocaleString('ar-SA')
                  : card.value}
                {card.unit && (
                  <span className="text-2xl text-gray-600 mr-2">{card.unit}</span>
                )}
              </p>
            </div>

            {/* Change و Sparkline */}
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2">
                {card.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : card.trend === 'down' ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : null}
                <span className={`text-lg font-bold ${
                  card.trend === 'up' ? 'text-green-600' :
                  card.trend === 'down' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {card.change > 0 ? '+' : ''}{card.change}%
                </span>
              </div>
              {renderSparkline(card.sparkline, card.color)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
