'use client';

import { Search, Filter, X, Calendar as CalendarIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppointmentsStore } from '@/store/appointments-store';
import type { AppointmentType, AppointmentStatus } from '@/types/appointment';

interface AppointmentsFiltersProps {
  onViewModeChange?: (mode: 'calendar' | 'list') => void;
}

export function AppointmentsFilters({ onViewModeChange }: AppointmentsFiltersProps) {
  const { filters, setFilters, resetFilters, viewMode, setViewMode } = useAppointmentsStore();

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && value !== ''
  ).length;

  const appointmentTypes: { value: AppointmentType | 'all'; label: string }[] = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'viewing', label: 'معاينة عقار' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'contract_signing', label: 'توقيع عقد' },
    { value: 'handover', label: 'تسليم عقار' },
    { value: 'inspection', label: 'فحص عقار' },
    { value: 'other', label: 'أخرى' },
  ];

  const appointmentStatuses: { value: AppointmentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'scheduled', label: 'مجدول' },
    { value: 'confirmed', label: 'مؤكد' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'no_show', label: 'لم يحضر' },
  ];

  const handleViewModeChange = (mode: 'calendar' | 'list') => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن موعد..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pr-10"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => setFilters({ type: value as AppointmentType | 'all' })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="نوع الموعد" />
          </SelectTrigger>
          <SelectContent>
            {appointmentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters({ status: value as AppointmentStatus | 'all' })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {appointmentStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
          >
            <X className="h-4 w-4 ml-1" />
            مسح الفلاتر
          </Button>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('calendar')}
            className="rounded-l-none"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            className="rounded-r-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
