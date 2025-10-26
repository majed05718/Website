'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Revenue Breakdown - تفصيل الإيرادات
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { RevenueBreakdownData } from '@/types/analytics'

interface RevenueBreakdownProps {
  data: RevenueBreakdownData[]
  isLoading?: boolean
}

export function RevenueBreakdown({ data, isLoading }: RevenueBreakdownProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        تفصيل الإيرادات (آخر 6 أشهر)
      </h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value: number) => `${value.toLocaleString()} ريال`}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          
          <Bar dataKey="rent" name="إيجارات" stackId="a" fill="#10b981" />
          <Bar dataKey="sales" name="مبيعات" stackId="a" fill="#3b82f6" />
          <Bar dataKey="commissions" name="عمولات" stackId="a" fill="#f97316" />
          <Bar dataKey="maintenance" name="صيانة" stackId="a" fill="#eab308" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
