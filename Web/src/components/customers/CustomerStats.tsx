'use client';

import { Users, UserCheck, UserPlus, TrendingUp, DollarSign, Star } from 'lucide-react';
import type { CustomerStats as Stats } from '@/types/customer';
import { formatCurrency } from '@/lib/customers-utils';

interface CustomerStatsProps {
  stats: Stats;
}

export function CustomerStats({ stats }: CustomerStatsProps) {
  const statCards = [
    {
      title: 'إجمالي العملاء',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `${stats.newThisMonth} جديد هذا الشهر`,
    },
    {
      title: 'عملاء نشطون',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${Math.round((stats.active / stats.total) * 100)}% من الإجمالي`,
    },
    {
      title: 'عملاء محتملون',
      value: stats.potential,
      icon: UserPlus,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: 'فرص جديدة',
    },
    {
      title: 'إجمالي الإيرادات',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: 'من جميع العملاء',
      isLarge: true,
    },
    {
      title: 'متوسط التقييم',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: 'من 5.0',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {stat.title}
            </h3>
            <p className={`font-bold text-gray-900 mb-1 ${stat.isLarge ? 'text-2xl' : 'text-3xl'}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
