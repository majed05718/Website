'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Requests Table - جدول طلبات الصيانة
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  CheckCircle,
  Trash2,
  Zap,
  Droplet,
  Wind,
  Hammer,
  Paintbrush,
  Wrench,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { MaintenanceRequest, IssueType } from '@/types/maintenance'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS
} from '@/types/maintenance'

interface RequestsTableProps {
  requests: MaintenanceRequest[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onAssign?: (id: string) => void
  onComplete?: (id: string) => void
  onDelete?: (id: string) => void
}

export function RequestsTable({
  requests,
  isLoading,
  onView,
  onEdit,
  onAssign,
  onComplete,
  onDelete
}: RequestsTableProps) {
  /**
   * أيقونة نوع المشكلة
   */
  const getIssueIcon = (type: IssueType) => {
    const icons = {
      electrical: Zap,
      plumbing: Droplet,
      ac: Wind,
      carpentry: Hammer,
      painting: Paintbrush,
      general: Wrench,
      other: MoreHorizontal
    }
    return icons[type]
  }

  /**
   * لون أيقونة المشكلة
   */
  const getIssueColor = (type: IssueType) => {
    const colors = {
      electrical: 'text-yellow-600',
      plumbing: 'text-blue-600',
      ac: 'text-cyan-600',
      carpentry: 'text-amber-600',
      painting: 'text-purple-600',
      general: 'text-gray-600',
      other: 'text-slate-600'
    }
    return colors[type]
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            لا توجد طلبات صيانة
          </h3>
          <p className="text-gray-600">
            لم يتم العثور على طلبات صيانة بالفلاتر المحددة
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                رقم الطلب
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الأولوية
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الحالة
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                العقار
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                النوع
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الوصف
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                المسؤول
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الوقت المنقضي
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((request) => {
              const IssueIcon = getIssueIcon(request.issueType)
              const issueColor = getIssueColor(request.issueType)
              
              return (
                <tr
                  key={request.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* رقم الطلب */}
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.requestNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.trackingCode}
                      </p>
                    </div>
                  </td>

                  {/* الأولوية */}
                  <td className="py-4 px-4">
                    <Badge className={PRIORITY_COLORS[request.priority]}>
                      {PRIORITY_LABELS[request.priority]}
                    </Badge>
                  </td>

                  {/* الحالة */}
                  <td className="py-4 px-4">
                    <Badge className={STATUS_COLORS[request.status]}>
                      {STATUS_LABELS[request.status]}
                    </Badge>
                  </td>

                  {/* العقار */}
                  <td className="py-4 px-4">
                    <Link
                      href={`/dashboard/properties/${request.propertyId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {request.propertyName || request.propertyId}
                    </Link>
                  </td>

                  {/* النوع */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <IssueIcon className={`w-4 h-4 ${issueColor}`} />
                      <span className="text-sm text-gray-900">
                        {request.issueType}
                      </span>
                    </div>
                  </td>

                  {/* الوصف */}
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600 line-clamp-1 max-w-xs">
                      {request.description}
                    </p>
                  </td>

                  {/* المسؤول */}
                  <td className="py-4 px-4">
                    {request.assignedToName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {request.assignedToName.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900">
                          {request.assignedToName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">غير مسند</span>
                    )}
                  </td>

                  {/* الوقت المنقضي */}
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                        locale: ar
                      })}
                    </span>
                  </td>

                  {/* الإجراءات */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView?.(request.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(request.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {request.status !== 'completed' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssign?.(request.id)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onComplete?.(request.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(request.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
