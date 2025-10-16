'use client';

import { PropertyFilters, PropertyType, PropertyStatus } from '@/types/property';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { useState } from 'react';

interface PropertiesFiltersProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onClearFilters: () => void;
}

export function PropertiesFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: PropertiesFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cities = [
    'الرياض',
    'جدة',
    'مكة المكرمة',
    'المدينة المنورة',
    'الدمام',
    'الخبر',
    'الظهران',
    'تبوك',
    'أبها',
    'الطائف',
  ];

  const typeLabels: Record<PropertyType, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    land: 'أرض',
    commercial: 'تجاري',
    building: 'عمارة',
  };

  const statusLabels: Record<PropertyStatus, string> = {
    available: 'متاح',
    sold: 'مباع',
    rented: 'مؤجر',
    pending: 'قيد الانتظار',
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.type ||
    filters.status ||
    filters.city ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minArea ||
    filters.maxArea;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      {/* البحث والأزرار */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* حقل البحث */}
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="ابحث عن عقار..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pr-10"
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? 'إخفاء الفلاتر' : 'فلاتر متقدمة'}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="gap-2 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
              مسح الكل
            </Button>
          )}
        </div>
      </div>

      {/* الفلاتر المتقدمة */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* نوع العقار */}
          <div className="space-y-2">
            <Label>نوع العقار</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                handleFilterChange('type', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الحالة */}
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* المدينة */}
          <div className="space-y-2">
            <Label>المدينة</Label>
            <Select
              value={filters.city || 'all'}
              onValueChange={(value) =>
                handleFilterChange('city', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع المدن" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* السعر من */}
          <div className="space-y-2">
            <Label>السعر من</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) =>
                handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          {/* السعر إلى */}
          <div className="space-y-2">
            <Label>السعر إلى</Label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          {/* المساحة من */}
          <div className="space-y-2">
            <Label>المساحة من (م²)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minArea || ''}
              onChange={(e) =>
                handleFilterChange('minArea', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          {/* المساحة إلى */}
          <div className="space-y-2">
            <Label>المساحة إلى (م²)</Label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.maxArea || ''}
              onChange={(e) =>
                handleFilterChange('maxArea', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}