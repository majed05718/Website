'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Payments Page - صفحة المدفوعات الشاملة
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  StatsCards,
  PaymentsTable,
  PaymentFilters,
  PaymentCharts,
  BulkActions,
  OverdueAlerts,
  QuickActions,
  PaymentStats
} from '@/components/payments'
import type {
  Payment,
  PaymentFilters as FilterType,
  PaymentsDashboardData
} from '@/types/payment'

export default function PaymentsPage() {
  // ═══════════════════════════════════════════════════════════
  // State Management
  // ═══════════════════════════════════════════════════════════
  
  const [data, setData] = useState<PaymentsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterType>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showOverdueAlert, setShowOverdueAlert] = useState(true)

  // ═══════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // في الحقيقة: API call
      // const response = await fetch('/api/payments/dashboard', ...)
      
      // الآن: بيانات تجريبية
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData(MOCK_DATA)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ═══════════════════════════════════════════════════════════
  // Event Handlers
  // ═══════════════════════════════════════════════════════════

  const handleViewDetails = (payment: Payment) => {
    toast.info(`عرض تفاصيل الدفعة: ${payment.paymentNumber}`)
  }

  const handleEdit = (payment: Payment) => {
    toast.info(`تعديل الدفعة: ${payment.paymentNumber}`)
  }

  const handleMarkAsPaid = (payment?: Payment) => {
    if (payment) {
      toast.success(`تم وضع علامة كمدفوع: ${payment.paymentNumber}`)
    } else {
      toast.success(`تم وضع علامة كمدفوع لـ ${selectedIds.length} دفعة`)
      setSelectedIds([])
    }
  }

  const handleSendReminder = (payment?: Payment) => {
    if (payment) {
      toast.success(`تم إرسال تذكير: ${payment.paymentNumber}`)
    } else {
      toast.success(`تم إرسال ${selectedIds.length} تذكير`)
      setSelectedIds([])
    }
  }

  const handleExport = () => {
    toast.success('جاري التصدير...')
  }

  const handleDelete = () => {
    toast.error('تحذير: سيتم حذف الدفعات المحددة!')
  }

  const handleAddPayment = () => {
    toast.info('فتح نموذج إضافة دفعة جديدة')
  }

  const handleOverdueReport = () => {
    toast.info('جاري توليد تقرير المتأخرات...')
  }

  const handleViewOverdue = () => {
    setFilters({ ...filters, status: ['overdue'] })
    setShowOverdueAlert(false)
    toast.info('عرض المدفوعات المتأخرة فقط')
  }

  const handleResetFilters = () => {
    setFilters({})
    toast.info('تم إعادة تعيين الفلاتر')
  }

  // ═══════════════════════════════════════════════════════════
  // Computed Values
  // ═══════════════════════════════════════════════════════════

  const overduePayments = data?.overduePayments || []
  const overdueCount = overduePayments.length
  const overdueTotal = overduePayments.reduce((sum, p) => sum + p.amount, 0)

  // ═══════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            المدفوعات
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة وتتبع جميع المدفوعات
          </p>
        </div>
        
        <QuickActions
          onAddPayment={handleAddPayment}
          onSendReminders={() => handleSendReminder()}
          onOverdueReport={handleOverdueReport}
          onExportAll={handleExport}
        />
      </div>

      {/* Overdue Alerts */}
      {showOverdueAlert && overdueCount > 0 && (
        <OverdueAlerts
          count={overdueCount}
          totalAmount={overdueTotal}
          onView={handleViewOverdue}
          onSendReminders={() => handleSendReminder()}
          onDismiss={() => setShowOverdueAlert(false)}
        />
      )}

      {/* KPI Cards */}
      <StatsCards stats={data?.stats!} isLoading={isLoading} />

      {/* Charts */}
      <PaymentCharts
        monthlyData={data?.monthlyData || []}
        statusDistribution={data?.statusDistribution || []}
        methodDistribution={data?.methodDistribution || []}
        monthlyTypeData={data?.monthlyTypeData || []}
        isLoading={isLoading}
      />

      {/* Layout: Filters + Stats Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-3 space-y-6">
          <PaymentFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />

          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedIds.length}
            onMarkAsPaid={() => handleMarkAsPaid()}
            onSendReminders={() => handleSendReminder()}
            onExport={handleExport}
            onDelete={handleDelete}
            onDeselectAll={() => setSelectedIds([])}
          />

          {/* Payments Table */}
          <PaymentsTable
            payments={data?.recentPayments || []}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onMarkAsPaid={handleMarkAsPaid}
            onSendReminder={handleSendReminder}
          />
        </div>

        {/* Stats Sidebar */}
        <div>
          <PaymentStats
            collectionRate={data?.stats.collectionRate.percentage || 0}
            averageAmount={data?.stats.quickStats.averageAmount || 0}
            fastestPayment={data?.stats.quickStats.fastestPayment || 0}
            averageDelay={data?.stats.quickStats.averageDelay || 0}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Mock Data - بيانات تجريبية
// ═══════════════════════════════════════════════════════════

const MOCK_DATA: PaymentsDashboardData = {
  stats: {
    totalPayments: {
      current: 450000,
      previous: 380000,
      change: 18.4,
      sparkline: [350000, 380000, 400000, 420000, 450000]
    },
    duePayments: {
      count: 8,
      amount: 125000
    },
    overduePayments: {
      count: 5,
      amount: 75000,
      oldest: 15
    },
    collectionRate: {
      percentage: 85,
      trend: 'up'
    },
    quickStats: {
      averageAmount: 3500,
      fastestPayment: 1,
      averageDelay: 3
    }
  },

  recentPayments: [
    {
      id: '1',
      paymentNumber: 'PMT-2025-0001',
      propertyId: 'prop-1',
      propertyName: 'فيلا الرياض الفاخرة',
      customerId: 'cust-1',
      customerName: 'أحمد محمد',
      amount: 25000,
      type: 'rent',
      status: 'paid',
      method: 'bank_transfer',
      dueDate: '2025-01-15',
      paidDate: '2025-01-14',
      createdAt: '2025-01-01',
      invoiceUrl: '/invoices/1.pdf'
    },
    {
      id: '2',
      paymentNumber: 'PMT-2025-0002',
      propertyId: 'prop-2',
      propertyName: 'شقة جدة',
      customerId: 'cust-2',
      customerName: 'فاطمة علي',
      amount: 5000,
      type: 'commission',
      status: 'pending',
      dueDate: '2025-02-01',
      createdAt: '2025-01-15'
    },
    {
      id: '3',
      paymentNumber: 'PMT-2025-0003',
      propertyId: 'prop-3',
      propertyName: 'محل تجاري',
      customerId: 'cust-3',
      customerName: 'خالد سعد',
      amount: 15000,
      type: 'rent',
      status: 'overdue',
      dueDate: '2024-12-25',
      createdAt: '2024-12-01',
      daysOverdue: 12
    }
  ],

  monthlyData: [
    { month: 'يناير', amount: 350000, count: 45, previousYear: 320000 },
    { month: 'فبراير', amount: 380000, count: 48, previousYear: 340000 },
    { month: 'مارس', amount: 400000, count: 52, previousYear: 360000 },
    { month: 'أبريل', amount: 420000, count: 55, previousYear: 380000 },
    { month: 'مايو', amount: 450000, count: 58, previousYear: 400000 },
    { month: 'يونيو', amount: 480000, count: 60, previousYear: 420000 },
    { month: 'يوليو', amount: 500000, count: 62 },
    { month: 'أغسطس', amount: 520000, count: 65 },
    { month: 'سبتمبر', amount: 490000, count: 61 },
    { month: 'أكتوبر', amount: 510000, count: 63 },
    { month: 'نوفمبر', amount: 530000, count: 66 },
    { month: 'ديسمبر', amount: 550000, count: 68 }
  ],

  statusDistribution: [
    { status: 'paid', count: 45, amount: 350000, percentage: 70, color: '#10B981' },
    { status: 'pending', count: 10, amount: 75000, percentage: 15, color: '#F59E0B' },
    { status: 'overdue', count: 5, amount: 50000, percentage: 10, color: '#EF4444' },
    { status: 'cancelled', count: 3, amount: 25000, percentage: 5, color: '#6B7280' }
  ],

  methodDistribution: [
    { method: 'bank_transfer', count: 30, amount: 250000, percentage: 50 },
    { method: 'cash', count: 20, amount: 150000, percentage: 30 },
    { method: 'credit_card', count: 8, amount: 75000, percentage: 15 },
    { method: 'check', count: 5, amount: 25000, percentage: 5 }
  ],

  monthlyTypeData: [
    { month: 'يناير', rent: 200000, sale: 80000, commission: 40000, deposit: 20000, maintenance: 10000 },
    { month: 'فبراير', rent: 220000, sale: 85000, commission: 45000, deposit: 20000, maintenance: 10000 },
    { month: 'مارس', rent: 240000, sale: 90000, commission: 40000, deposit: 20000, maintenance: 10000 },
    { month: 'أبريل', rent: 250000, sale: 95000, commission: 45000, deposit: 20000, maintenance: 10000 },
    { month: 'مايو', rent: 270000, sale: 100000, commission: 50000, deposit: 20000, maintenance: 10000 },
    { month: 'يونيو', rent: 280000, sale: 110000, commission: 55000, deposit: 25000, maintenance: 10000 }
  ],

  overduePayments: [
    {
      id: '3',
      paymentNumber: 'PMT-2025-0003',
      propertyId: 'prop-3',
      propertyName: 'محل تجاري',
      customerId: 'cust-3',
      customerName: 'خالد سعد',
      amount: 15000,
      type: 'rent',
      status: 'overdue',
      dueDate: '2024-12-25',
      createdAt: '2024-12-01',
      daysOverdue: 12
    }
  ]
}
