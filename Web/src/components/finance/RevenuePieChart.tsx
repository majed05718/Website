'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Revenue Pie Chart - مصادر الإيرادات
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'
import type { RevenueSource } from '@/types/finance'

interface RevenuePieChartProps {
  sources: RevenueSource[]
  isLoading?: boolean
}

export function RevenuePieChart({ sources, isLoading }: RevenuePieChartProps) {
  /**
   * تنسيق القيمة في Tooltip
   */
  const formatValue = (value: number) => {
    return `${value.toLocaleString()} ريال`;
  };

  /**
   * Custom label للنسب
   */
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // لا تظهر للنسب الصغيرة جداً

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="14"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        مصادر الإيرادات
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={sources}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {sources.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value: number, name: string, props: any) => [
              formatValue(value),
              props.payload.name
            ]}
          />
          
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const item = sources.find(s => s.name === entry.payload.name);
              return `${value} (${item?.percentage.toFixed(1)}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend إضافي مع القيم */}
      <div className="mt-4 space-y-2">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              <span className="text-gray-700">{source.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {source.value.toLocaleString()} ريال
              </span>
              <span className="text-gray-500">
                {source.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
