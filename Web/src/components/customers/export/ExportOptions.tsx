'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Export Options - خيارات التصدير
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لاختيار نوع التصدير (الكل/المحدد/حسب الفلتر/نطاق زمني)
 */

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Filter, CheckSquare, Users } from 'lucide-react'
import type { ExportConfig } from '@/types/export'

interface ExportOptionsProps {
  config: ExportConfig
  onConfigChange: (updates: Partial<ExportConfig>) => void
}

export function ExportOptions({ config, onConfigChange }: ExportOptionsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#0066CC]" />
        خيارات التصدير
      </h3>
      
      <RadioGroup
        value={config.exportType}
        onValueChange={(value) => onConfigChange({ exportType: value as any })}
        className="space-y-4"
      >
        {/* تصدير الكل */}
        <div className="flex items-start space-x-3 space-x-reverse">
          <RadioGroupItem value="all" id="export-all" className="mt-1" />
          <div className="flex-1">
            <Label
              htmlFor="export-all"
              className="text-base font-medium cursor-pointer flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              تصدير جميع العملاء
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              سيتم تصدير جميع العملاء في النظام
            </p>
          </div>
        </div>
        
        {/* تصدير المحدد */}
        <div className="flex items-start space-x-3 space-x-reverse">
          <RadioGroupItem value="selected" id="export-selected" className="mt-1" />
          <div className="flex-1">
            <Label
              htmlFor="export-selected"
              className="text-base font-medium cursor-pointer flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              تصدير العملاء المحددين
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              سيتم تصدير العملاء المحددين من قائمة العملاء
            </p>
            {config.exportType === 'selected' && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  {config.selectedIds.length > 0 
                    ? `تم تحديد ${config.selectedIds.length} عميل`
                    : 'لم يتم تحديد أي عملاء. ارجع لقائمة العملاء وحدد العملاء المطلوبين.'
                  }
                </p>
                {config.selectedIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onConfigChange({ selectedIds: [] })}
                    className="mt-2 text-xs"
                  >
                    مسح التحديد
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* تصدير حسب الفلتر */}
        <div className="flex items-start space-x-3 space-x-reverse">
          <RadioGroupItem value="filtered" id="export-filtered" className="mt-1" />
          <div className="flex-1">
            <Label
              htmlFor="export-filtered"
              className="text-base font-medium cursor-pointer flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              تصدير حسب الفلتر الحالي
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              سيتم تصدير العملاء حسب الفلاتر المطبقة في قائمة العملاء
            </p>
            {config.exportType === 'filtered' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-800">
                  تأكد من تطبيق الفلاتر المطلوبة قبل التصدير
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* تصدير حسب نطاق زمني */}
        <div className="flex items-start space-x-3 space-x-reverse">
          <RadioGroupItem value="date-range" id="export-date-range" className="mt-1" />
          <div className="flex-1">
            <Label
              htmlFor="export-date-range"
              className="text-base font-medium cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              تصدير حسب تاريخ معين
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              سيتم تصدير العملاء المسجلين في نطاق زمني محدد
            </p>
            
            {config.exportType === 'date-range' && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">من تاريخ</Label>
                    <Input
                      type="date"
                      value={config.dateRange.from}
                      onChange={(e) => onConfigChange({
                        dateRange: { ...config.dateRange, from: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">إلى تاريخ</Label>
                    <Input
                      type="date"
                      value={config.dateRange.to}
                      onChange={(e) => onConfigChange({
                        dateRange: { ...config.dateRange, to: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {config.dateRange.from && config.dateRange.to && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">
                      سيتم تصدير العملاء من {config.dateRange.from} إلى {config.dateRange.to}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </RadioGroup>
    </Card>
  )
}
