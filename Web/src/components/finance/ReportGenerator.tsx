'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Report Generator - مولد التقارير
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Download, 
  X,
  Loader2 
} from 'lucide-react'
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear,
  subMonths,
  subYears 
} from 'date-fns'
import type { 
  ReportType, 
  ReportFormat, 
  DateRange,
  ReportConfig 
} from '@/types/finance'
import { REPORT_TYPE_LABELS } from '@/types/finance'

interface ReportGeneratorProps {
  onGenerate: (config: ReportConfig) => Promise<void>
}

export function ReportGenerator({ onGenerate }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [reportType, setReportType] = useState<ReportType>('comprehensive')
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()).toISOString().split('T')[0],
    to: endOfMonth(new Date()).toISOString().split('T')[0]
  })

  /**
   * تطبيق نطاق سريع
   */
  const applyQuickDate = (type: string) => {
    const now = new Date()
    let from: Date, to: Date

    switch (type) {
      case 'this-month':
        from = startOfMonth(now)
        to = endOfMonth(now)
        break
      case 'last-month':
        const lastMonth = subMonths(now, 1)
        from = startOfMonth(lastMonth)
        to = endOfMonth(lastMonth)
        break
      case 'this-year':
        from = startOfYear(now)
        to = now
        break
      case 'last-year':
        const lastYear = subYears(now, 1)
        from = startOfYear(lastYear)
        to = endOfMonth(subMonths(startOfYear(now), 1))
        break
      default:
        return
    }

    setDateRange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    })
  }

  /**
   * توليد التقرير
   */
  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await onGenerate({
        type: reportType,
        format,
        dateRange,
        includeCharts: true,
        includeDetails: true
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {/* زر فتح المولد */}
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="w-full sm:w-auto"
      >
        <FileText className="w-5 h-5 ml-2" />
        إنشاء تقرير
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">إنشاء تقرير مالي</h2>
                    <p className="text-sm text-gray-600">
                      اختر نوع التقرير والفترة الزمنية
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* نوع التقرير */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  نوع التقرير
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setReportType(key as ReportType)}
                      className={`p-4 rounded-lg border-2 text-right transition-all ${
                        reportType === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* الفترة الزمنية */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  الفترة الزمنية
                </Label>
                
                {/* Quick selects */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickDate('this-month')}
                  >
                    هذا الشهر
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickDate('last-month')}
                  >
                    الشهر السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickDate('this-year')}
                  >
                    هذه السنة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickDate('last-year')}
                  >
                    السنة السابقة
                  </Button>
                </div>

                {/* Custom date range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from" className="text-sm mb-1 block">من</Label>
                    <Input
                      id="from"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="to" className="text-sm mb-1 block">إلى</Label>
                    <Input
                      id="to"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* التنسيق */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  تنسيق الملف
                </Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormat('pdf')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      format === 'pdf'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">PDF</div>
                    <div className="text-xs text-gray-600">ملف PDF قابل للطباعة</div>
                  </button>
                  <button
                    onClick={() => setFormat('excel')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      format === 'excel'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Excel</div>
                    <div className="text-xs text-gray-600">جدول بيانات قابل للتعديل</div>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 ml-2" />
                      إنشاء التقرير
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
