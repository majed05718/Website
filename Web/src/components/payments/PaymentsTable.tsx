'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Payments Table - جدول المدفوعات
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import Link from 'next/link'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Download, 
  Send, 
  CheckCircle,
  FileText,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type {
  Payment,
  PaymentStatus,
  PaymentType,
  PaymentMethod
} from '@/types/payment'
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPE_COLORS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS
} from '@/types/payment'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PaymentsTableProps {
  payments: Payment[]
  isLoading?: boolean
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onViewDetails: (payment: Payment) => void
  onEdit: (payment: Payment) => void
  onMarkAsPaid: (payment: Payment) => void
  onSendReminder: (payment: Payment) => void
}

export function PaymentsTable({
  payments,
  isLoading,
  selectedIds,
  onSelectionChange,
  onViewDetails,
  onEdit,
  onMarkAsPaid,
  onSendReminder
}: PaymentsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  /**
   * Toggle selection
   */
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  /**
   * Toggle select all
   */
  const toggleSelectAll = () => {
    if (selectedIds.length === payments.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(payments.map(p => p.id))
    }
  }

  /**
   * تنسيق التاريخ
   */
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ar })
  }

  /**
   * تنسيق المبلغ
   */
  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString('ar-SA')} ريال`
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="animate-pulse space-y-4 p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-4">
          <FileText className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          لا توجد مدفوعات
        </h3>
        <p className="text-gray-600">
          لم يتم العثور على أي مدفوعات مطابقة للفلاتر المحددة
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {/* Checkbox */}
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={selectedIds.length === payments.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>

              {/* رقم الدفعة */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                رقم الدفعة
              </th>

              {/* التاريخ */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                التاريخ
              </th>

              {/* العقار */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                العقار
              </th>

              {/* العميل */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                العميل
              </th>

              {/* المبلغ */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                المبلغ
              </th>

              {/* النوع */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                النوع
              </th>

              {/* الحالة */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                الحالة
              </th>

              {/* طريقة الدفع */}
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                الطريقة
              </th>

              {/* Actions */}
              <th className="w-16 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className={`hover:bg-gray-50 transition-colors ${
                  payment.status === 'overdue' ? 'bg-red-50/30' : ''
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedIds.includes(payment.id)}
                    onCheckedChange={() => toggleSelection(payment.id)}
                  />
                </td>

                {/* رقم الدفعة */}
                <td className="px-4 py-4">
                  <button
                    onClick={() => onViewDetails(payment)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {payment.paymentNumber}
                  </button>
                </td>

                {/* التاريخ */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(payment.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500">
                    مستحق: {formatDate(payment.dueDate)}
                  </div>
                </td>

                {/* العقار */}
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/properties/${payment.propertyId}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {payment.propertyName || 'عقار'}
                  </Link>
                </td>

                {/* العميل */}
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/customers/${payment.customerId}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {payment.customerName || 'عميل'}
                  </Link>
                </td>

                {/* المبلغ */}
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAmount(payment.amount)}
                  </div>
                </td>

                {/* النوع */}
                <td className="px-4 py-4">
                  <Badge className={PAYMENT_TYPE_COLORS[payment.type]}>
                    {PAYMENT_TYPE_LABELS[payment.type]}
                  </Badge>
                </td>

                {/* الحالة */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <Badge className={PAYMENT_STATUS_COLORS[payment.status]}>
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </Badge>
                    {payment.daysOverdue && payment.daysOverdue > 0 && (
                      <span className="text-xs text-red-600">
                        متأخر {payment.daysOverdue} يوم
                      </span>
                    )}
                  </div>
                </td>

                {/* طريقة الدفع */}
                <td className="px-4 py-4">
                  {payment.method && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span>{PAYMENT_METHOD_ICONS[payment.method]}</span>
                      <span>{PAYMENT_METHOD_LABELS[payment.method]}</span>
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(payment)}>
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      
                      {payment.status !== 'paid' && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(payment)}>
                          <CheckCircle className="w-4 h-4 ml-2" />
                          وضع علامة كمدفوع
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={() => onEdit(payment)}>
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      
                      {payment.invoiceUrl && (
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 ml-2" />
                          تحميل الفاتورة
                        </DropdownMenuItem>
                      )}
                      
                      {payment.receiptUrl && (
                        <DropdownMenuItem>
                          <Receipt className="w-4 h-4 ml-2" />
                          تحميل الإيصال
                        </DropdownMenuItem>
                      )}
                      
                      {payment.status !== 'paid' && (
                        <DropdownMenuItem onClick={() => onSendReminder(payment)}>
                          <Send className="w-4 h-4 ml-2" />
                          إرسال تذكير
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          عرض {payments.length} من إجمالي {payments.length} دفعة
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            السابق
          </Button>
          <Button variant="outline" size="sm" disabled>
            التالي
          </Button>
        </div>
      </div>
    </div>
  )
}
