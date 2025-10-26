'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Expenses Donut Chart - المصروفات حسب النوع
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
import type { ExpenseCategory } from '@/types/finance'

interface ExpensesDonutChartProps {
  categories: ExpenseCategory[]
  isLoading?: boolean
}

export function ExpensesDonutChart({ categories, isLoading }: ExpensesDonutChartProps) {
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

    if (percent < 0.05) return null;

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

  // حساب إجمالي المصروفات
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.value, 0);

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          المصروفات حسب النوع
        </h3>
        <div className="text-sm text-gray-600">
          الإجمالي: <span className="font-bold text-red-600">
            {totalExpenses.toLocaleString()} ريال
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          {/* Donut Chart - مع innerRadius */}
          <Pie
            data={categories}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {categories.map((entry, index) => (
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
              const item = categories.find(c => c.name === entry.payload.name);
              return `${value} (${item?.percentage.toFixed(1)}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend مفصل */}
      <div className="mt-4 space-y-2">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-gray-700">{category.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-red-600">
                {category.value.toLocaleString()} ريال
              </span>
              <span className="text-gray-500 min-w-[50px] text-left">
                {category.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
