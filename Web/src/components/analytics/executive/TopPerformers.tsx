'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Top Performers - أفضل الموظفين
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import type { TopPerformer } from '@/types/analytics'

interface TopPerformersProps {
  performers: TopPerformer[]
  isLoading?: boolean
}

export function TopPerformers({ performers, isLoading }: TopPerformersProps) {
  /**
   * Emoji للترتيب
   */
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank.toString()
  }

  /**
   * تقييم بالنجوم
   */
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    if (hasHalf) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />)
    }
    const remainingStars = 5 - stars.length
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        أفضل الموظفين أداءً
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الترتيب
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الموظف
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الإيرادات
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الصفقات
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                معدل التحويل
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                رضا العملاء
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الأداء
              </th>
            </tr>
          </thead>
          <tbody>
            {performers.map((performer) => (
              <tr
                key={performer.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  performer.rank <= 3 ? 'bg-yellow-50/30' : ''
                }`}
              >
                {/* الترتيب */}
                <td className="py-4 px-4 text-center">
                  <span className="text-2xl">
                    {getRankEmoji(performer.rank)}
                  </span>
                </td>

                {/* الموظف */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {performer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.name}</p>
                    </div>
                  </div>
                </td>

                {/* الإيرادات */}
                <td className="py-4 px-4 text-sm font-medium text-green-600">
                  {performer.revenue.toLocaleString()} ريال
                </td>

                {/* الصفقات */}
                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {performer.deals}
                </td>

                {/* معدل التحويل */}
                <td className="py-4 px-4">
                  <span className={`text-sm font-medium ${
                    performer.conversionRate >= 70 ? 'text-green-600' :
                    performer.conversionRate >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {performer.conversionRate}%
                  </span>
                </td>

                {/* رضا العملاء */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    {renderStars(performer.satisfaction)}
                    <span className="text-xs text-gray-600 mr-1">
                      {performer.satisfaction.toFixed(1)}
                    </span>
                  </div>
                </td>

                {/* الأداء */}
                <td className="py-4 px-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{performer.performance}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          performer.performance >= 90 ? 'bg-green-500' :
                          performer.performance >= 70 ? 'bg-blue-500' :
                          performer.performance >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${performer.performance}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
