'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { ExcelColumn, ExcelError, ExcelWarning } from '@/types/excel'
import { useState } from 'react'

interface DataPreviewProps {
  data: any[][]
  mappings: ExcelColumn[]
  errors: ExcelError[]
  warnings: ExcelWarning[]
  onConfirm: () => void
  onCancel: () => void
  isImporting: boolean
}

const AVAILABLE_FIELDS = [
  { value: 'title', label: 'العنوان' },
  { value: 'description', label: 'الوصف' },
  { value: 'property_type', label: 'نوع العقار' },
  { value: 'listing_type', label: 'نوع العرض' },
  { value: 'price', label: 'السعر' },
  { value: 'area', label: 'المساحة' },
  { value: 'bedrooms', label: 'غرف النوم' },
  { value: 'bathrooms', label: 'دورات المياه' },
  { value: 'city', label: 'المدينة' },
  { value: 'district', label: 'الحي' },
  { value: 'location', label: 'الموقع' },
  { value: 'status', label: 'الحالة' },
]

export function DataPreview({
  data,
  mappings,
  errors,
  warnings,
  onConfirm,
  onCancel,
  isImporting
}: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const rowsPerPage = 10
  const totalPages = Math.ceil(data.length / rowsPerPage)
  
  const paginatedData = data.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  )

  const mappedColumns = mappings.filter(m => m.targetField)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">معاينة البيانات</h3>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-muted-foreground">
                {data.length} صف
              </span>
              {errors.length > 0 && (
                <span className="text-sm text-red-600 font-medium">
                  {errors.length} خطأ
                </span>
              )}
              {warnings.length > 0 && (
                <span className="text-sm text-yellow-600 font-medium">
                  {warnings.length} تحذير
                </span>
              )}
              {errors.length === 0 && warnings.length === 0 && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  جاهز للاستيراد
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isImporting}>
              إلغاء
            </Button>
            <Button
              onClick={onConfirm}
              disabled={errors.length > 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 ml-2" />
                  تأكيد الاستيراد ({data.length} عقار)
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-red-900 mb-2">
                تم العثور على {errors.length} خطأ - يجب إصلاحها قبل الاستيراد
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {errors.slice(0, 10).map((error, i) => (
                  <p key={i} className="text-sm text-red-700">
                    <span className="font-medium">الصف {error.row}:</span> {error.message}
                    {error.column && ` (${error.column})`}
                  </p>
                ))}
                {errors.length > 10 && (
                  <p className="text-sm text-red-600 font-medium pt-2">
                    و {errors.length - 10} خطأ آخر...
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-yellow-900 mb-2">
                {warnings.length} تحذير - سيتم الاستيراد مع تعديلات
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {warnings.slice(0, 5).map((warning, i) => (
                  <p key={i} className="text-sm text-yellow-700">
                    <span className="font-medium">الصف {warning.row}:</span> {warning.message}
                  </p>
                ))}
                {warnings.length > 5 && (
                  <p className="text-sm text-yellow-600 font-medium pt-2">
                    و {warnings.length - 5} تحذير آخر...
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Table */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">معاينة البيانات</h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                صفحة {currentPage + 1} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                    #
                  </th>
                  {mappedColumns.map((m, i) => (
                    <th key={i} className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span>{m.sourceColumn}</span>
                        <span className="text-xs font-normal text-gray-500">
                          ← {AVAILABLE_FIELDS.find(f => f.value === m.targetField)?.label}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.map((row, rowIndex) => {
                  const actualRowNumber = currentPage * rowsPerPage + rowIndex + 2
                  const rowErrors = errors.filter(e => e.row === actualRowNumber)
                  const rowWarnings = warnings.filter(w => w.row === actualRowNumber)
                  const hasError = rowErrors.length > 0
                  const hasWarning = rowWarnings.length > 0 && !hasError
                  const isValid = !hasError && !hasWarning
                  
                  // تحديد لون الصف حسب الحالة
                  const rowClassName = hasError 
                    ? 'bg-red-50 hover:bg-red-100' 
                    : hasWarning 
                    ? 'bg-yellow-50 hover:bg-yellow-100' 
                    : 'bg-green-50/30 hover:bg-green-100/50'
                  
                  return (
                    <tr key={rowIndex} className={rowClassName}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* أيقونة حالة الصف */}
                          {isValid && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {hasWarning && (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                          {hasError && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={
                            hasError ? 'text-red-700' : 
                            hasWarning ? 'text-yellow-700' : 
                            'text-green-700'
                          }>
                            {actualRowNumber}
                          </span>
                        </div>
                      </td>
                      {mappedColumns.map((m, colIndex) => {
                        const originalIndex = mappings.indexOf(m)
                        const value = row[originalIndex]
                        const cellError = rowErrors.find(e => e.column === m.sourceColumn)
                        const cellWarning = rowWarnings.find(w => w.column === m.sourceColumn)
                        
                        // تحديد لون الخلية
                        const cellClassName = cellError 
                          ? 'text-red-700 font-medium' 
                          : cellWarning 
                          ? 'text-yellow-700 font-medium' 
                          : 'text-gray-900'
                        
                        return (
                          <td 
                            key={colIndex} 
                            className={`px-4 py-3 ${cellClassName}`}
                          >
                            <div className="max-w-xs truncate" title={String(value || '')}>
                              {value !== null && value !== undefined && value !== '' 
                                ? String(value)
                                : <span className="text-gray-400">-</span>
                              }
                            </div>
                            {cellError && (
                              <p className="text-xs text-red-600 mt-1 flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {cellError.message}
                              </p>
                            )}
                            {cellWarning && !cellError && (
                              <p className="text-xs text-yellow-600 mt-1 flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {cellWarning.message}
                              </p>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
