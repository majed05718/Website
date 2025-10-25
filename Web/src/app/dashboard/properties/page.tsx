'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertiesStore } from '@/store/properties-store';
import { propertiesApi } from '@/lib/api/properties';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertiesFilters } from '@/components/properties/PropertiesFilters';
import { PropertiesPagination } from '@/components/properties/PropertiesPagination';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Loader2, Upload, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PropertiesPage() {
  const router = useRouter();
  const {
    properties = [],
    filters,
    currentPage,
    pageSize,
    totalCount,
    isLoading,
    error,
    setProperties,
    setFilters,
    setCurrentPage,
    setTotalCount,
    setLoading,
    setError,
    deleteProperty,
    clearFilters,
  } = usePropertiesStore();

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // جلب العقارات
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await propertiesApi.getProperties(filters, currentPage, pageSize);
      setProperties(response.data);
      setTotalCount(response.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء جلب العقارات';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // تحميل العقارات عند تغيير الفلاتر أو الصفحة
  useEffect(() => {
    fetchProperties();
  }, [filters, currentPage]);

  // حذف عقار
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟')) {
      return;
    }

    try {
      setIsDeleting(id);
      await propertiesApi.deleteProperty(id);
      deleteProperty(id);
      toast.success('تم حذف العقار بنجاح');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'حدث خطأ أثناء حذف العقار';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#0066CC]" />
            العقارات
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة وعرض جميع العقارات ({totalCount} عقار)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/properties/export')}
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/properties/import')}
          >
            <Upload className="w-4 h-4 ml-2" />
            استيراد Excel
          </Button>
          <Link href="/dashboard/properties/new">
            <Button className="bg-[#0066CC] hover:bg-[#0052A3] gap-2">
              <Plus className="w-5 h-5" />
              إضافة عقار جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <PropertiesFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#0066CC] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل العقارات...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <Button onClick={fetchProperties} variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && properties.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا توجد عقارات
          </h3>
          <p className="text-gray-600 mb-6">
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? 'لم يتم العثور على عقارات تطابق معايير البحث'
              : 'ابدأ بإضافة أول عقار لك'}
          </p>
          {Object.keys(filters).some(key => filters[key as keyof typeof filters]) ? (
            <Button onClick={clearFilters} variant="outline">
              مسح الفلاتر
            </Button>
          ) : (
            <Link href="/dashboard/properties/new">
              <Button className="bg-[#0066CC] hover:bg-[#0052A3]">
                <Plus className="w-5 h-5 ml-2" />
                إضافة عقار جديد
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Properties Grid */}
      {!isLoading && !error && properties.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          <PropertiesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}