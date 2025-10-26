'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Contract Card - بطاقة العقد (Grid View)
 * ═══════════════════════════════════════════════════════════════
 */

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Eye, 
  Edit, 
  Printer, 
  XCircle, 
  MoreVertical,
  Calendar,
  DollarSign,
  Clock,
  ExternalLink
} from 'lucide-react'
import type { Contract } from '@/types/contract'
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS
} from '@/types/contract'

interface ContractCardProps {
  contract: Contract
  onView?: (contract: Contract) => void
  onEdit?: (contract: Contract) => void
  onPrint?: (contract: Contract) => void
  onTerminate?: (contract: Contract) => void
}

export function ContractCard({
  contract,
  onView,
  onEdit,
  onPrint,
  onTerminate
}: ContractCardProps) {
  /**
   * تنسيق التاريخ
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * حساب الأيام المتبقية
   */
  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * حساب نسبة الدفع
   */
  const getPaymentProgress = (): number => {
    if (contract.totalAmount === 0) return 0
    return Math.round((contract.paidAmount / contract.totalAmount) * 100)
  }

  /**
   * تحديد الحالة المالية
   */
  const getPaymentStatus = () => {
    const progress = getPaymentProgress()
    if (progress === 100) return 'paid'
    if (progress > 0) return 'partial'
    return 'due'
  }

  const paymentProgress = getPaymentProgress()
  const paymentStatus = getPaymentStatus()
  const daysRemaining = contract.status === 'active' ? getDaysRemaining(contract.endDate) : null

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm font-medium">
              {contract.contractNumber}
            </span>
            <Badge 
              variant="secondary" 
              className={CONTRACT_TYPE_COLORS[contract.type]}
            >
              {CONTRACT_TYPE_LABELS[contract.type]}
            </Badge>
          </div>
          <Badge 
            variant="secondary" 
            className={CONTRACT_STATUS_COLORS[contract.status]}
          >
            {CONTRACT_STATUS_LABELS[contract.status]}
          </Badge>
        </div>

        {/* القائمة المنسدلة */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(contract)}>
              <Eye className="w-4 h-4 ml-2" />
              عرض
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(contract)}>
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPrint?.(contract)}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </DropdownMenuItem>
            {contract.status === 'active' && (
              <DropdownMenuItem 
                onClick={() => onTerminate?.(contract)}
                className="text-red-600"
              >
                <XCircle className="w-4 h-4 ml-2" />
                إنهاء العقد
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* الأطراف */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">العقار:</span>
          <Link 
            href={`/dashboard/properties/${contract.propertyId}`}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            {contract.propertyName || 'عقار'}
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">العميل:</span>
          <Link 
            href={`/dashboard/customers/${contract.clientId}`}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            {contract.clientName || 'عميل'}
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* القيمة */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
        <DollarSign className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <div className="text-sm text-gray-600">القيمة الإجمالية</div>
          <div className="text-xl font-bold text-blue-600">
            {contract.totalAmount.toLocaleString()} ريال
          </div>
        </div>
      </div>

      {/* التواريخ */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-gray-400 mt-1" />
          <div>
            <div className="text-xs text-gray-600">تاريخ البداية</div>
            <div className="text-sm font-medium">
              {formatDate(contract.startDate)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-gray-400 mt-1" />
          <div>
            <div className="text-xs text-gray-600">تاريخ الانتهاء</div>
            <div className="text-sm font-medium">
              {formatDate(contract.endDate)}
            </div>
          </div>
        </div>
      </div>

      {/* الأيام المتبقية */}
      {daysRemaining !== null && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-50 rounded">
          <Clock className="w-4 h-4 text-amber-600" />
          <div className="text-sm">
            {daysRemaining > 0 ? (
              <>
                <span className="font-medium text-amber-900">
                  {daysRemaining} يوم متبقي
                </span>
              </>
            ) : daysRemaining === 0 ? (
              <span className="font-medium text-red-900">
                ينتهي اليوم
              </span>
            ) : (
              <span className="font-medium text-red-900">
                منتهي
              </span>
            )}
          </div>
        </div>
      )}

      {/* الحالة المالية */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">الحالة المالية</span>
          <Badge 
            variant="secondary" 
            className={PAYMENT_STATUS_COLORS[paymentStatus]}
          >
            {PAYMENT_STATUS_LABELS[paymentStatus]}
          </Badge>
        </div>
        <Progress value={paymentProgress} className="h-2 mb-2" />
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>مدفوع: {contract.paidAmount.toLocaleString()} ريال</span>
          <span>{paymentProgress}%</span>
        </div>
      </div>
    </Card>
  )
}
