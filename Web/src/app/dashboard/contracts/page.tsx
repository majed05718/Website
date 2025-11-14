'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Contracts Page - صفحة العقود
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Plus,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react'
import { ContractsFilters } from '@/components/contracts'
import { TableLoadingSkeleton, ComponentLoadingSkeleton } from '@/components/ui/loading-skeleton'
import type { 
  Contract, 
  ContractFilters, 
  ContractStats,
  ViewMode 
} from '@/types/contract'
import { toast } from 'sonner'

// Dynamic imports for heavy components
const StatsCards = dynamic(
  () => import('@/components/contracts').then(mod => ({ default: mod.StatsCards })),
  { ssr: false, loading: () => <ComponentLoadingSkeleton /> }
)

const ContractsTable = dynamic(
  () => import('@/components/contracts').then(mod => ({ default: mod.ContractsTable })),
  { ssr: false, loading: () => <TableLoadingSkeleton /> }
)

const ContractCard = dynamic(
  () => import('@/components/contracts').then(mod => ({ default: mod.ContractCard })),
  { ssr: false, loading: () => <ComponentLoadingSkeleton /> }
)

// بيانات تجريبية
const MOCK_CONTRACTS: Contract[] = [
  {
    id: '1',
    contractNumber: 'CON-2025-0001',
    type: 'rental',
    status: 'active',
    propertyId: 'prop-1',
    propertyName: 'فيلا العليا',
    clientId: 'client-1',
    clientName: 'أحمد محمد السالم',
    totalAmount: 120000,
    paidAmount: 80000,
    remainingAmount: 40000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    signedDate: '2023-12-15',
    createdAt: '2023-12-15T10:00:00Z'
  },
  {
    id: '2',
    contractNumber: 'CON-2025-0002',
    type: 'sale',
    status: 'active',
    propertyId: 'prop-2',
    propertyName: 'شقة النخيل',
    clientId: 'client-2',
    clientName: 'فاطمة خالد',
    totalAmount: 850000,
    paidAmount: 850000,
    remainingAmount: 0,
    startDate: '2024-06-01',
    endDate: '2024-07-01',
    signedDate: '2024-05-20',
    createdAt: '2024-05-20T14:30:00Z'
  },
  {
    id: '3',
    contractNumber: 'CON-2024-0156',
    type: 'maintenance',
    status: 'expired',
    propertyId: 'prop-3',
    propertyName: 'عمارة الملك فهد',
    clientId: 'client-3',
    clientName: 'شركة الصيانة المتقدمة',
    totalAmount: 45000,
    paidAmount: 45000,
    remainingAmount: 0,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    signedDate: '2023-12-01',
    createdAt: '2023-12-01T09:00:00Z'
  },
  {
    id: '4',
    contractNumber: 'CON-2025-0003',
    type: 'rental',
    status: 'pending',
    propertyId: 'prop-4',
    propertyName: 'محل تجاري - الرياض',
    clientId: 'client-4',
    clientName: 'محمد عبدالله',
    totalAmount: 60000,
    paidAmount: 0,
    remainingAmount: 60000,
    startDate: '2025-02-01',
    endDate: '2026-01-31',
    signedDate: '2025-01-15',
    createdAt: '2025-01-15T11:00:00Z'
  }
]

const MOCK_STATS: ContractStats = {
  totalActive: 12,
  expiredThisMonth: 3,
  totalActiveValue: 2450000,
  expiringIn30Days: 2,
  needsRenewal: 5,
  overduePayments: 1
}

export default function ContractsPage() {
  const router = useRouter()
  
  // State
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [filters, setFilters] = useState<ContractFilters>({})
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [isLoading, setIsLoading] = useState(true)

  /**
   * جلب العقود والإحصائيات
   */
  useEffect(() => {
    fetchContractsAndStats()
  }, [])

  const fetchContractsAndStats = async () => {
    setIsLoading(true)
    
    try {
      // في التطبيق الحقيقي، استدعاء API
      // const [contractsRes, statsRes] = await Promise.all([
      //   fetch('/api/contracts'),
      //   fetch('/api/contracts/stats')
      // ])
      
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setContracts(MOCK_CONTRACTS)
      setStats(MOCK_STATS)
    } catch (error) {
      console.error('Error fetching contracts:', error)
      toast.error('فشل في جلب البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * تطبيق الفلاتر على العقود
   */
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      // فلتر النوع
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(contract.type)) return false
      }

      // فلتر الحالة
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(contract.status)) return false
      }

      // فلتر تاريخ البداية (من)
      if (filters.startDateFrom) {
        if (new Date(contract.startDate) < new Date(filters.startDateFrom)) {
          return false
        }
      }

      // فلتر تاريخ البداية (إلى)
      if (filters.startDateTo) {
        if (new Date(contract.startDate) > new Date(filters.startDateTo)) {
          return false
        }
      }

      // فلتر تاريخ الانتهاء (من)
      if (filters.endDateFrom) {
        if (new Date(contract.endDate) < new Date(filters.endDateFrom)) {
          return false
        }
      }

      // فلتر تاريخ الانتهاء (إلى)
      if (filters.endDateTo) {
        if (new Date(contract.endDate) > new Date(filters.endDateTo)) {
          return false
        }
      }

      // فلتر البحث
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesNumber = contract.contractNumber.toLowerCase().includes(searchLower)
        const matchesClient = contract.clientName?.toLowerCase().includes(searchLower)
        const matchesProperty = contract.propertyName?.toLowerCase().includes(searchLower)
        
        if (!matchesNumber && !matchesClient && !matchesProperty) {
          return false
        }
      }

      // فلتر الحالة المالية
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        const progress = contract.totalAmount > 0 
          ? (contract.paidAmount / contract.totalAmount) * 100 
          : 0
        
        let status: string
        if (progress === 100) status = 'paid'
        else if (progress > 0) status = 'partial'
        else status = 'due'
        
        if (!filters.paymentStatus.includes(status as any)) {
          return false
        }
      }

      return true
    })
  }, [contracts, filters])

  /**
   * إعادة تعيين الفلاتر
   */
  const handleResetFilters = () => {
    setFilters({})
  }

  /**
   * عرض العقد
   */
  const handleViewContract = (contract: Contract) => {
    router.push(`/dashboard/contracts/${contract.id}`)
  }

  /**
   * تعديل العقد
   */
  const handleEditContract = (contract: Contract) => {
    router.push(`/dashboard/contracts/${contract.id}/edit`)
  }

  /**
   * طباعة العقد
   */
  const handlePrintContract = (contract: Contract) => {
    window.print()
    toast.success('جاري طباعة العقد...')
  }

  /**
   * إنهاء العقد
   */
  const handleTerminateContract = (contract: Contract) => {
    if (confirm(`هل أنت متأكد من إنهاء العقد ${contract.contractNumber}؟`)) {
      // في التطبيق الحقيقي، استدعاء API
      toast.success('تم إنهاء العقد بنجاح')
      fetchContractsAndStats()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">العقود</h1>
          <p className="text-gray-600 mt-1">
            إدارة جميع العقود والاتفاقيات
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchContractsAndStats}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          
          <Button
            onClick={() => router.push('/dashboard/contracts/new')}
            className="bg-[#0066CC] hover:bg-[#0052A3]"
          >
            <Plus className="w-5 h-5 ml-2" />
            عقد جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats || MOCK_STATS} isLoading={isLoading} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">قاربت على الانتهاء</p>
              <p className="text-xl font-bold">{stats?.expiringIn30Days || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">بحاجة لتجديد</p>
              <p className="text-xl font-bold">{stats?.needsRenewal || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">مدفوعات متأخرة</p>
              <p className="text-xl font-bold">{stats?.overduePayments || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <ContractsFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* View Options */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          عرض {filteredContracts.length} من {contracts.length} عقد
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4 ml-2" />
            جدول
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4 ml-2" />
            شبكة
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            disabled
          >
            <CalendarIcon className="w-4 h-4 ml-2" />
            Timeline
          </Button>
        </div>
      </div>

      {/* Contracts List */}
      {viewMode === 'table' ? (
        <ContractsTable
          contracts={filteredContracts}
          isLoading={isLoading}
          onView={handleViewContract}
          onEdit={handleEditContract}
          onPrint={handlePrintContract}
          onTerminate={handleTerminateContract}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))
          ) : filteredContracts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              لا توجد عقود
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onView={handleViewContract}
                onEdit={handleEditContract}
                onPrint={handlePrintContract}
                onTerminate={handleTerminateContract}
              />
            ))
          )}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">عرض Timeline قيد التطوير</p>
        </Card>
      )}
    </div>
  )
}
