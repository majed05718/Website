'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Maintenance Management - إدارة الصيانة
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'
import { TableLoadingSkeleton, ComponentLoadingSkeleton } from '@/components/ui/loading-skeleton'
import type { MaintenanceRequest, MaintenanceStats as Stats } from '@/types/maintenance'

// Dynamic imports for heavy components
const MaintenanceStats = dynamic(
  () => import('@/components/maintenance/MaintenanceStats').then(mod => ({ default: mod.MaintenanceStats })),
  { ssr: false, loading: () => <ComponentLoadingSkeleton /> }
)

const RequestsTable = dynamic(
  () => import('@/components/maintenance/RequestsTable').then(mod => ({ default: mod.RequestsTable })),
  { ssr: false, loading: () => <TableLoadingSkeleton /> }
)

export default function MaintenancePage() {
  const [isLoading, setIsLoading] = useState(false)

  // Handlers
  const handleView = (id: string) => {
    console.log('View request:', id)
    // TODO: Open details dialog
  }

  const handleEdit = (id: string) => {
    console.log('Edit request:', id)
    // TODO: Open edit dialog
  }

  const handleAssign = (id: string) => {
    console.log('Assign request:', id)
    // TODO: Open assign dialog
  }

  const handleComplete = (id: string) => {
    console.log('Complete request:', id)
    // TODO: Complete request
  }

  const handleDelete = (id: string) => {
    console.log('Delete request:', id)
    // TODO: Delete request
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            إدارة الصيانة
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة ومتابعة طلبات الصيانة
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 ml-2" />
            فلاتر
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            طلب جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <MaintenanceStats stats={MOCK_STATS} isLoading={isLoading} />

      {/* Requests Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">طلبات الصيانة</h2>
        <RequestsTable
          requests={MOCK_REQUESTS}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onAssign={handleAssign}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════

const MOCK_STATS: Stats = {
  openRequests: 12,
  inProgressRequests: 8,
  completedThisMonth: 45,
  averageClosingTime: 24
}

const MOCK_REQUESTS: MaintenanceRequest[] = [
  {
    id: '1',
    trackingCode: 'TRACK-12345',
    requestNumber: 'REQ-2025-0001',
    propertyId: 'prop-1',
    propertyName: 'شقة 101 - برج النخيل',
    tenantName: 'أحمد محمد',
    tenantPhone: '0501234567',
    tenantEmail: 'ahmed@example.com',
    issueType: 'electrical',
    description: 'انقطاع الكهرباء في غرفة النوم الرئيسية',
    images: [],
    priority: 'urgent',
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    trackingCode: 'TRACK-12346',
    requestNumber: 'REQ-2025-0002',
    propertyId: 'prop-2',
    propertyName: 'فيلا 5 - حي الربيع',
    tenantName: 'فاطمة علي',
    tenantPhone: '0507654321',
    issueType: 'plumbing',
    description: 'تسريب مياه في دورة المياه',
    images: [],
    priority: 'high',
    status: 'assigned',
    assignedTo: 'staff-1',
    assignedToName: 'خالد السعيد',
    expectedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    trackingCode: 'TRACK-12347',
    requestNumber: 'REQ-2025-0003',
    propertyId: 'prop-3',
    propertyName: 'شقة 205 - برج الياسمين',
    tenantName: 'عبدالله حسن',
    tenantPhone: '0551234567',
    issueType: 'ac',
    description: 'المكيف لا يعمل بشكل جيد',
    images: [],
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'staff-2',
    assignedToName: 'محمد القحطاني',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    trackingCode: 'TRACK-12348',
    requestNumber: 'REQ-2025-0004',
    propertyId: 'prop-4',
    propertyName: 'محل 12 - مركز التسوق',
    tenantName: 'نورة سعد',
    tenantPhone: '0509876543',
    issueType: 'general',
    description: 'الباب الرئيسي يحتاج إلى إصلاح',
    images: [],
    priority: 'low',
    status: 'completed',
    assignedTo: 'staff-1',
    assignedToName: 'خالد السعيد',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
]
