'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Payment Charts - الرسوم البيانية للمدفوعات
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type {
  MonthlyPaymentData,
  PaymentStatusDistribution,
  PaymentMethodDistribution,
  MonthlyTypeData
} from '@/types/payment'
import { CHART_COLORS } from '@/types/payment'

interface PaymentChartsProps {
  monthlyData: MonthlyPaymentData[]
  statusDistribution: PaymentStatusDistribution[]
  methodDistribution: PaymentMethodDistribution[]
  monthlyTypeData: MonthlyTypeData[]
  isLoading?: boolean
}

export function PaymentCharts({
  monthlyData,
  statusDistribution,
  methodDistribution,
  monthlyTypeData,
  isLoading
}: PaymentChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Revenue Over Time */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">
          الإيرادات خلال الوقت (آخر 12 شهر)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
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
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} ريال`, 'الإيرادات']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={CHART_COLORS.primary}
              strokeWidth={3}
              fill="url(#colorAmount)"
            />
            {monthlyData[0]?.previousYear !== undefined && (
              <Line
                type="monotone"
                dataKey="previousYear"
                stroke={CHART_COLORS.info}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="السنة السابقة"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Chart 2: Payment Status Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          توزيع حالات الدفع
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
              label={({ percentage }) => `${percentage.toFixed(0)}%`}
              labelLine={false}
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()} ريال`}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => {
                const item = statusDistribution.find(s => s.status === entry.payload.status)
                return `${value} (${item?.count || 0})`
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Chart 3: Payment Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          طرق الدفع
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={methodDistribution} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <YAxis 
              type="category"
              dataKey="method"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              width={100}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value.toLocaleString()} ريال (${props.payload.percentage.toFixed(1)}%)`,
                'المبلغ'
              ]}
            />
            <Bar 
              dataKey="amount" 
              fill={CHART_COLORS.success}
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Chart 4: Monthly Type Comparison */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">
          المقارنة الشهرية حسب النوع (آخر 6 أشهر)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyTypeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              formatter={(value: number) => `${value.toLocaleString()} ريال`}
            />
            <Legend />
            <Bar dataKey="rent" name="إيجار" fill="#3B82F6" stackId="a" />
            <Bar dataKey="sale" name="بيع" fill="#10B981" stackId="a" />
            <Bar dataKey="commission" name="عمولة" fill="#F59E0B" stackId="a" />
            <Bar dataKey="deposit" name="تأمين" fill="#8B5CF6" stackId="a" />
            <Bar dataKey="maintenance" name="صيانة" fill="#EC4899" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
