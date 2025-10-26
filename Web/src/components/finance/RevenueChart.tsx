'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Revenue Chart - رسم الإيرادات vs المصروفات
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { MonthlyChartData } from '@/types/finance'
import { CHART_COLORS } from '@/types/finance'

interface RevenueChartProps {
  data: MonthlyChartData[]
  isLoading?: boolean
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  /**
   * تنسيق القيمة في Tooltip
   */
  const formatValue = (value: number) => {
    return `${value.toLocaleString()} ريال`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        الإيرادات والمصروفات (آخر 12 شهر)
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
            formatter={formatValue}
            labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          <Line
            type="monotone"
            dataKey="revenue"
            name="الإيرادات"
            stroke={CHART_COLORS.revenue}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS.revenue, r: 4 }}
            activeDot={{ r: 6 }}
          />
          
          <Line
            type="monotone"
            dataKey="expenses"
            name="المصروفات"
            stroke={CHART_COLORS.expenses}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS.expenses, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
