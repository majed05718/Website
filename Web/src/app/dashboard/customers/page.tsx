'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerStats as StatsCards } from '@/components/customers/CustomerStats';
import { CustomerPagination } from '@/components/customers/CustomerPagination';
import { useCustomersStore } from '@/store/customers-store';
import { getCustomers, getCustomerStats, exportCustomers } from '@/lib/api/customers';

export default function CustomersPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    customers,
    stats,
    filters,
    currentPage,
    totalPages,
    totalCount,
    isLoading,
    setCustomers,
    setStats,
    setLoading,
    setError,
    setPagination,
  } = useCustomersStore();

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCustomers(filters, currentPage, 20);
      setCustomers(response.data);
      setPagination(response.totalPages, response.total);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('حدث خطأ في تحميل العملاء');
      toast.error('حدث خطأ في تحميل العملاء');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await getCustomerStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Reload when filters or page changes
  useEffect(() => {
    fetchCustomers();
  }, [filters, currentPage]);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportCustomers(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير العملاء بنجاح');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ في تصدير العملاء');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">العملاء</h1>
          <p className="text-gray-600 mt-1">
            إدارة عملائك ومتابعة تعاملاتهم
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="ml-2 h-4 w-4" />
            {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </Button>
          <Button onClick={() => router.push('/dashboard/customers/new')}>
            <Plus className="ml-2 h-4 w-4" />
            عميل جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Filters */}
      <CustomerFilters 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل العملاء...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            لا توجد عملاء
          </h3>
          <p className="mt-2 text-gray-600">
            {Object.keys(filters).some(key => filters[key as keyof typeof filters])
              ? 'لم يتم العثور على عملاء مطابقين للفلاتر'
              : 'ابدأ بإضافة عميل جديد'}
          </p>
          {!Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
            <Button
              className="mt-4"
              onClick={() => router.push('/dashboard/customers/new')}
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة عميل جديد
            </Button>
          )}
        </div>
      )}

      {/* Customers Grid/List */}
      {!isLoading && customers.length > 0 && (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                viewMode={viewMode}
                onRefresh={fetchCustomers}
              />
            ))}
          </div>

          {/* Pagination */}
          <CustomerPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        </>
      )}
    </div>
  );
}
