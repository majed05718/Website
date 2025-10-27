'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Market Insights - رؤى السوق
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign,
  ArrowRight 
} from 'lucide-react'
import Link from 'next/link'
import type { MarketInsight } from '@/types/analytics'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface MarketInsightsProps {
  insights: MarketInsight[]
  isLoading?: boolean
}

export function MarketInsights({ insights, isLoading }: MarketInsightsProps) {
  /**
   * الأيقونة حسب النوع
   */
  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="w-6 h-6" />
      case 'trend':
        return <TrendingUp className="w-6 h-6" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />
      case 'alert':
        return <Target className="w-6 h-6" />
      case 'info':
        return <DollarSign className="w-6 h-6" />
      default:
        return <Lightbulb className="w-6 h-6" />
    }
  }

  /**
   * اللون حسب النوع
   */
  const getColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'text-blue-600 bg-blue-50'
      case 'trend':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-orange-600 bg-orange-50'
      case 'alert':
        return 'text-red-600 bg-red-50'
      case 'info':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-gray-200 rounded w-10"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">رؤى السوق</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className="p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="space-y-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColor(insight.type)}`}>
                {getIcon(insight.type)}
              </div>

              {/* Title */}
              <h4 className="font-semibold text-gray-900">
                {insight.title}
              </h4>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {insight.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(insight.date), { 
                    addSuffix: true, 
                    locale: ar 
                  })}
                </span>
                {insight.actionUrl && (
                  <Link
                    href={insight.actionUrl}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    عرض
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
