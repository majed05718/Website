'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Payment Filters - فلاتر المدفوعات المتقدمة
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { PaymentFilters } from '@/types/payment'
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS
} from '@/types/payment'
import { startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns'

interface PaymentFiltersProps {
  filters: PaymentFilters
  onChange: (filters: PaymentFilters) => void
  onReset: () => void
}

export function PaymentFiltersComponent({ filters, onChange, onReset }: PaymentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  /**
   * تطبيق نطاق سريع
   */
  const applyQuickDate = (type: string) => {
    const now = new Date()
    let from: Date, to: Date

    switch (type) {
      case 'today':
        from = to = now
        break
      case 'this-week':
        from = new Date(now.setDate(now.getDate() - now.getDay()))
        to = new Date()
        break
      case 'this-month':
        from = startOfMonth(now)
        to = endOfMonth(now)
        break
      case 'last-3-months':
        from = subMonths(now, 3)
        to = now
        break
      case 'this-year':
        from = startOfYear(now)
        to = now
        break
      default:
        return
    }

    onChange({
      ...filters,
      dateFrom: from.toISOString().split('T')[0],
      dateTo: to.toISOString().split('T')[0]
    })
  }

  /**
   * Toggle multi-select
   */
  const toggleStatus = (status: string) => {
    const current = filters.status || []
    const newStatus = current.includes(status as any)
      ? current.filter(s => s !== status)
      : [...current, status as any]
    onChange({ ...filters, status: newStatus.length ? newStatus : undefined })
  }

  const toggleType = (type: string) => {
    const current = filters.type || []
    const newType = current.includes(type as any)
      ? current.filter(t => t !== type)
      : [...current, type as any]
    onChange({ ...filters, type: newType.length ? newType : undefined })
  }

  const toggleMethod = (method: string) => {
    const current = filters.method || []
    const newMethod = current.includes(method as any)
      ? current.filter(m => m !== method)
      : [...current, method as any]
    onChange({ ...filters, method: newMethod.length ? newMethod : undefined })
  }

  /**
   * عدد الفلاتر النشطة
   */
  const activeFiltersCount = [
    filters.status?.length,
    filters.type?.length,
    filters.method?.length,
    filters.dateFrom,
    filters.dateTo,
    filters.amountMin,
    filters.amountMax,
    filters.search
  ].filter(Boolean).length

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">الفلاتر</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} فلتر نشط
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="w-4 h-4 ml-2" />
              إعادة تعيين
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* البحث */}
          <div>
            <Label className="mb-2 block">البحث</Label>
            <Input
              placeholder="رقم الدفعة، العميل، أو العقار..."
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            />
          </div>

          {/* النطاق الزمني */}
          <div>
            <Label className="mb-2 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              النطاق الزمني
            </Label>
            
            {/* Quick selects */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={() => applyQuickDate('today')}>
                اليوم
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyQuickDate('this-week')}>
                هذا الأسبوع
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyQuickDate('this-month')}>
                هذا الشهر
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyQuickDate('last-3-months')}>
                آخر 3 أشهر
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyQuickDate('this-year')}>
                هذه السنة
              </Button>
            </div>

            {/* Custom range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">من</Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">إلى</Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
                />
              </div>
            </div>
          </div>

          {/* الحالة */}
          <div>
            <Label className="mb-2 block">الحالة</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PAYMENT_STATUS_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={filters.status?.includes(key as any) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleStatus(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* النوع */}
          <div>
            <Label className="mb-2 block">نوع الدفعة</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PAYMENT_TYPE_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={filters.type?.includes(key as any) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleType(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* طريقة الدفع */}
          <div>
            <Label className="mb-2 block">طريقة الدفع</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                <Button
                  key={key}
                  variant={filters.method?.includes(key as any) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleMethod(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* نطاق المبلغ */}
          <div>
            <Label className="mb-2 block">نطاق المبلغ</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">من (ريال)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.amountMin || ''}
                  onChange={(e) => onChange({ 
                    ...filters, 
                    amountMin: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">إلى (ريال)</Label>
                <Input
                  type="number"
                  placeholder="غير محدد"
                  value={filters.amountMax || ''}
                  onChange={(e) => onChange({ 
                    ...filters, 
                    amountMax: e.target.value ? Number(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
          </div>

          {/* متأخر أكثر من */}
          <div>
            <Label className="mb-2 block">متأخر أكثر من (أيام)</Label>
            <Input
              type="number"
              placeholder="مثال: 7"
              value={filters.lateDays || ''}
              onChange={(e) => onChange({ 
                ...filters, 
                lateDays: e.target.value ? Number(e.target.value) : undefined 
              })}
            />
          </div>

          {/* مستحق خلال */}
          <div>
            <Label className="mb-2 block">مستحق خلال (أيام)</Label>
            <Input
              type="number"
              placeholder="مثال: 30"
              value={filters.dueInDays || ''}
              onChange={(e) => onChange({ 
                ...filters, 
                dueInDays: e.target.value ? Number(e.target.value) : undefined 
              })}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
