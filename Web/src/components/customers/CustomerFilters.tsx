'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCustomersStore } from '@/store/customers-store';
import type { CustomerType, CustomerStatus } from '@/types/customer';

interface CustomerFiltersProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function CustomerFilters({ viewMode, onViewModeChange }: CustomerFiltersProps) {
  const { filters, setFilters, resetFilters } = useCustomersStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const handleReset = () => {
    resetFilters();
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن عميل..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Quick Filters */}
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => setFilters({ type: value as CustomerType | 'all' })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="نوع العميل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="buyer">مشتري</SelectItem>
            <SelectItem value="seller">بائع</SelectItem>
            <SelectItem value="tenant">مستأجر</SelectItem>
            <SelectItem value="landlord">مؤجر</SelectItem>
            <SelectItem value="both">بائع ومشتري</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => setFilters({ status: value as CustomerStatus | 'all' })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
            <SelectItem value="potential">محتمل</SelectItem>
            <SelectItem value="archived">مؤرشف</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="ml-2 h-4 w-4" />
              فلاتر متقدمة
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center bg-primary">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>فلاتر متقدمة</SheetTitle>
              <SheetDescription>
                اختر الفلاتر لتضييق نطاق البحث
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <Input
                  type="text"
                  placeholder="مثال: الرياض"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({ city: e.target.value || undefined })}
                />
              </div>

              {/* Active Contracts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العقود النشطة
                </label>
                <Select
                  value={filters.hasActiveContracts === undefined ? 'all' : String(filters.hasActiveContracts)}
                  onValueChange={(value) => 
                    setFilters({ hasActiveContracts: value === 'all' ? undefined : value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="true">لديهم عقود نشطة</SelectItem>
                    <SelectItem value="false">بدون عقود نشطة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range - Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الإضافة
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">من</label>
                    <Input
                      type="date"
                      value={filters.createdFrom || ''}
                      onChange={(e) => setFilters({ createdFrom: e.target.value || undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">إلى</label>
                    <Input
                      type="date"
                      value={filters.createdTo || ''}
                      onChange={(e) => setFilters({ createdTo: e.target.value || undefined })}
                    />
                  </div>
                </div>
              </div>

              {/* Date Range - Last Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  آخر تواصل
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">من</label>
                    <Input
                      type="date"
                      value={filters.lastContactFrom || ''}
                      onChange={(e) => setFilters({ lastContactFrom: e.target.value || undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">إلى</label>
                    <Input
                      type="date"
                      value={filters.lastContactTo || ''}
                      onChange={(e) => setFilters({ lastContactTo: e.target.value || undefined })}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  تطبيق الفلاتر
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex-1"
                >
                  <X className="ml-2 h-4 w-4" />
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-l-none"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-r-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              بحث: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ search: '' })}
              />
            </Badge>
          )}
          {filters.type && filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              النوع: {filters.type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ type: 'all' })}
              />
            </Badge>
          )}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              الحالة: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ status: 'all' })}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            مسح الكل
          </Button>
        </div>
      )}
    </div>
  );
}
