'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Top Properties Table - أعلى 10 عقارات ربحاً
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { ProfitableProperty } from '@/types/finance'

interface TopPropertiesTableProps {
  properties: ProfitableProperty[]
  isLoading?: boolean
}

export function TopPropertiesTable({ properties, isLoading }: TopPropertiesTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        أعلى 10 عقارات ربحاً
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                #
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                العقار
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الإيرادات
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                المصروفات
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                صافي الربح
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                ROI
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الاتجاه
              </th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property, index) => (
              <tr 
                key={property.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* الترتيب */}
                <td className="py-3 px-4 text-sm text-gray-600">
                  {index + 1}
                </td>
                
                {/* اسم العقار */}
                <td className="py-3 px-4">
                  <Link 
                    href={`/dashboard/properties/${property.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {property.name}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
                
                {/* الإيرادات */}
                <td className="py-3 px-4 text-sm text-green-600 font-medium">
                  {property.revenue.toLocaleString()} ريال
                </td>
                
                {/* المصروفات */}
                <td className="py-3 px-4 text-sm text-red-600 font-medium">
                  {property.expenses.toLocaleString()} ريال
                </td>
                
                {/* صافي الربح */}
                <td className="py-3 px-4 text-sm font-bold text-gray-900">
                  {property.netProfit.toLocaleString()} ريال
                </td>
                
                {/* ROI */}
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    property.roi >= 15 ? 'bg-green-100 text-green-800' :
                    property.roi >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {property.roi.toFixed(1)}%
                  </span>
                </td>
                
                {/* الاتجاه */}
                <td className="py-3 px-4">
                  {property.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {properties.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          لا توجد بيانات متاحة
        </div>
      )}
    </Card>
  )
}
