'use client';

import { Calendar, CheckCircle, Clock, XCircle, UserX, TrendingUp } from 'lucide-react';
import type { AppointmentStats } from '@/types/appointment';

interface AppointmentStatsProps {
  stats: AppointmentStats;
}

export function AppointmentStats({ stats }: AppointmentStatsProps) {
  const statCards = [
    {
      title: 'إجمالي المواعيد',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `${stats.todayAppointments} موعد اليوم`,
    },
    {
      title: 'مجدولة',
      value: stats.scheduled,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: 'في الانتظار',
    },
    {
      title: 'مؤكدة',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${stats.upcomingThisWeek} هذا الأسبوع`,
    },
    {
      title: 'مكتملة',
      value: stats.completed,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: `${stats.completionRate}% نسبة الإنجاز`,
    },
    {
      title: 'ملغاة',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: 'تم الإلغاء',
    },
    {
      title: 'لم يحضر',
      value: stats.noShow,
      icon: UserX,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      change: 'عدم حضور',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-600 mb-1">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        );
      })}
    </div>
  );
}
