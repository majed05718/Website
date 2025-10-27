'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Cash Flow Chart - التدفق النقدي
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { CashFlow } from '@/types/finance'
import { CHART_COLORS } from '@/types/finance'

interface CashFlowChartProps {
  data: CashFlow[]
  isLoading?: boolean
}

export function CashFlowChart({ data, isLoading }: CashFlowChartProps) {
  /**
   * تنسيق القيمة في Tooltip
   */
  const formatValue = (value: number) => {
    return `${value.toLocaleString()} ريال`;
  };

  /**
   * Custom Tooltip
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const inflow = payload.find((p: any) => p.dataKey === 'inflow')?.value || 0;
    const outflow = payload.find((p: any) => p.dataKey === 'outflow')?.value || 0;
    const net = inflow - outflow;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">الداخل:</span>
            <span className="text-sm font-medium text-green-700">
              {formatValue(inflow)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">الخارج:</span>
            <span className="text-sm font-medium text-red-700">
              {formatValue(outflow)}
            </span>
          </div>
          <div className="pt-1 mt-1 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">الصافي:</span>
              <span className={`text-sm font-bold ${
                net >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {net >= 0 ? '+' : ''}{formatValue(net)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6 lg:col-span-2">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 lg:col-span-2">
      <h3 className="text-lg font-semibold mb-4">
        التدفق النقدي (آخر 6 أشهر)
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            {/* Gradient للداخل */}
            <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
            </linearGradient>
            {/* Gradient للخارج */}
            <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.expenses} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.expenses} stopOpacity={0} />
            </linearGradient>
          </defs>
          
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
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          
          {/* Area للداخل */}
          <Area
            type="monotone"
            dataKey="inflow"
            name="الداخل"
            stroke={CHART_COLORS.revenue}
            strokeWidth={2}
            fill="url(#colorInflow)"
          />
          
          {/* Area للخارج */}
          <Area
            type="monotone"
            dataKey="outflow"
            name="الخارج"
            stroke={CHART_COLORS.expenses}
            strokeWidth={2}
            fill="url(#colorOutflow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
