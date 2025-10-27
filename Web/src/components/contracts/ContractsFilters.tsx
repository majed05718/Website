'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Contracts Filters - فلاتر العقود
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, X } from 'lucide-react'
import type { ContractFilters, ContractType, ContractStatus, PaymentStatus } from '@/types/contract'
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS
} from '@/types/contract'

interface ContractsFiltersProps {
  filters: ContractFilters
  onFiltersChange: (filters: ContractFilters) => void
  onReset: () => void
}

export function ContractsFilters({
  filters,
  onFiltersChange,
  onReset
}: ContractsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  /**
   * تحديث نوع العقد
   */
  const handleTypeChange = (type: ContractType, checked: boolean) => {
    const currentTypes = filters.type || []
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type)
    
    onFiltersChange({ ...filters, type: newTypes.length > 0 ? newTypes : undefined })
  }

  /**
   * تحديث حالة العقد
   */
  const handleStatusChange = (status: ContractStatus, checked: boolean) => {
    const currentStatuses = filters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    onFiltersChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined })
  }

  /**
   * تحديث الحالة المالية
   */
  const handlePaymentStatusChange = (status: PaymentStatus, checked: boolean) => {
    const currentStatuses = filters.paymentStatus || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    onFiltersChange({ 
      ...filters, 
      paymentStatus: newStatuses.length > 0 ? newStatuses : undefined 
    })
  }

  return (
    <Card className="p-4">
      {/* البحث السريع */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="البحث برقم العقد أو اسم العميل..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pr-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            فلاتر متقدمة
          </Button>
          
          {Object.keys(filters).length > 0 && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              إعادة تعيين
            </Button>
          )}
        </div>

        {/* الفلاتر المتقدمة */}
        {showAdvanced && (
          <div className="pt-4 border-t space-y-6">
            {/* نوع العقد */}
            <div>
              <Label className="text-sm font-medium mb-3 block">نوع العقد</Label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(CONTRACT_TYPE_LABELS).map(([type, label]) => (
                  <div key={type} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.type?.includes(type as ContractType)}
                      onCheckedChange={(checked) => 
                        handleTypeChange(type as ContractType, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* حالة العقد */}
            <div>
              <Label className="text-sm font-medium mb-3 block">حالة العقد</Label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(CONTRACT_STATUS_LABELS).map(([status, label]) => (
                  <div key={status} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status?.includes(status as ContractStatus)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status as ContractStatus, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* الحالة المالية */}
            <div>
              <Label className="text-sm font-medium mb-3 block">الحالة المالية</Label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(PAYMENT_STATUS_LABELS).map(([status, label]) => (
                  <div key={status} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`payment-${status}`}
                      checked={filters.paymentStatus?.includes(status as PaymentStatus)}
                      onCheckedChange={(checked) => 
                        handlePaymentStatusChange(status as PaymentStatus, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`payment-${status}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* فلتر التواريخ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* تاريخ البداية */}
              <div>
                <Label className="text-sm font-medium mb-2 block">تاريخ البداية</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start-from" className="text-xs text-gray-500">من</Label>
                    <Input
                      id="start-from"
                      type="date"
                      value={filters.startDateFrom || ''}
                      onChange={(e) => 
                        onFiltersChange({ ...filters, startDateFrom: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-to" className="text-xs text-gray-500">إلى</Label>
                    <Input
                      id="start-to"
                      type="date"
                      value={filters.startDateTo || ''}
                      onChange={(e) => 
                        onFiltersChange({ ...filters, startDateTo: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* تاريخ الانتهاء */}
              <div>
                <Label className="text-sm font-medium mb-2 block">تاريخ الانتهاء</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="end-from" className="text-xs text-gray-500">من</Label>
                    <Input
                      id="end-from"
                      type="date"
                      value={filters.endDateFrom || ''}
                      onChange={(e) => 
                        onFiltersChange({ ...filters, endDateFrom: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-to" className="text-xs text-gray-500">إلى</Label>
                    <Input
                      id="end-to"
                      type="date"
                      value={filters.endDateTo || ''}
                      onChange={(e) => 
                        onFiltersChange({ ...filters, endDateTo: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
