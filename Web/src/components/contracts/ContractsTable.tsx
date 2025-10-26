'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Contracts Table - جدول العقود
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface ContractsTableProps {
  contracts: Contract[]
  isLoading?: boolean
  onView?: (contract: Contract) => void
  onEdit?: (contract: Contract) => void
  onPrint?: (contract: Contract) => void
  onTerminate?: (contract: Contract) => void
}

export function ContractsTable({
  contracts,
  isLoading,
  onView,
  onEdit,
  onPrint,
  onTerminate
}: ContractsTableProps) {
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
   * عرض الأيام المتبقية
   */
  const renderDaysRemaining = (contract: Contract) => {
    if (contract.status !== 'active') return '-'
    
    const days = getDaysRemaining(contract.endDate)
    
    if (days < 0) {
      return <span className="text-red-600 font-medium">منتهي</span>
    } else if (days === 0) {
      return <span className="text-amber-600 font-medium">اليوم</span>
    } else if (days <= 30) {
      return <span className="text-amber-600 font-medium">{days} يوم</span>
    } else {
      return <span className="text-gray-600">{days} يوم</span>
    }
  }

  /**
   * حساب نسبة الدفع
   */
  const getPaymentProgress = (contract: Contract): number => {
    if (contract.totalAmount === 0) return 0
    return Math.round((contract.paidAmount / contract.totalAmount) * 100)
  }

  /**
   * تحديد الحالة المالية
   */
  const getPaymentStatus = (contract: Contract) => {
    const progress = getPaymentProgress(contract)
    if (progress === 100) return 'paid'
    if (progress > 0) return 'partial'
    return 'due'
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="animate-pulse space-y-4 p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-gray-500">لا توجد عقود</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم العقد</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">العقار</TableHead>
            <TableHead className="text-right">العميل</TableHead>
            <TableHead className="text-right">القيمة</TableHead>
            <TableHead className="text-right">البداية</TableHead>
            <TableHead className="text-right">الانتهاء</TableHead>
            <TableHead className="text-right">متبقي</TableHead>
            <TableHead className="text-right">الحالة المالية</TableHead>
            <TableHead className="text-right">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => {
            const paymentProgress = getPaymentProgress(contract)
            const paymentStatus = getPaymentStatus(contract)

            return (
              <TableRow key={contract.id}>
                {/* رقم العقد */}
                <TableCell className="font-mono text-sm">
                  {contract.contractNumber}
                </TableCell>

                {/* النوع */}
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={CONTRACT_TYPE_COLORS[contract.type]}
                  >
                    {CONTRACT_TYPE_LABELS[contract.type]}
                  </Badge>
                </TableCell>

                {/* الحالة */}
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={CONTRACT_STATUS_COLORS[contract.status]}
                  >
                    {CONTRACT_STATUS_LABELS[contract.status]}
                  </Badge>
                </TableCell>

                {/* العقار */}
                <TableCell>
                  <Link 
                    href={`/dashboard/properties/${contract.propertyId}`}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {contract.propertyName || 'عقار'}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </TableCell>

                {/* العميل */}
                <TableCell>
                  <Link 
                    href={`/dashboard/customers/${contract.clientId}`}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {contract.clientName || 'عميل'}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </TableCell>

                {/* القيمة */}
                <TableCell className="font-semibold">
                  {contract.totalAmount.toLocaleString()} ريال
                </TableCell>

                {/* تاريخ البداية */}
                <TableCell className="text-sm text-gray-600">
                  {formatDate(contract.startDate)}
                </TableCell>

                {/* تاريخ الانتهاء */}
                <TableCell className="text-sm text-gray-600">
                  {formatDate(contract.endDate)}
                </TableCell>

                {/* الأيام المتبقية */}
                <TableCell>
                  {renderDaysRemaining(contract)}
                </TableCell>

                {/* الحالة المالية */}
                <TableCell>
                  <div className="space-y-1">
                    <Badge 
                      variant="secondary" 
                      className={PAYMENT_STATUS_COLORS[paymentStatus]}
                    >
                      {PAYMENT_STATUS_LABELS[paymentStatus]}
                    </Badge>
                    <Progress 
                      value={paymentProgress} 
                      className="h-1.5"
                    />
                    <div className="text-xs text-gray-500">
                      {contract.paidAmount.toLocaleString()} / {contract.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </TableCell>

                {/* الإجراءات */}
                <TableCell>
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
