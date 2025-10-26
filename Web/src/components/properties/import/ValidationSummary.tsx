'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle, AlertCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react'
import { ExcelError, ExcelWarning } from '@/types/excel'

interface ValidationSummaryProps {
  totalRows: number
  errors: ExcelError[]
  warnings: ExcelWarning[]
}

/**
 * مكون ValidationSummary
 * يعرض ملخصاً شاملاً لنتائج التحقق من البيانات
 */
export function ValidationSummary({ 
  totalRows, 
  errors, 
  warnings 
}: ValidationSummaryProps) {
  // حساب الإحصائيات
  const errorRows = new Set(errors.map(e => e.row)).size
  const warningRows = new Set(warnings.map(w => w.row)).size
  const validRows = totalRows - errorRows - warningRows
  const validPercentage = totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0
  const warningPercentage = totalRows > 0 ? Math.round((warningRows / totalRows) * 100) : 0
  const errorPercentage = totalRows > 0 ? Math.round((errorRows / totalRows) * 100) : 0

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-[#0066CC]" />
          <div>
            <h3 className="text-lg font-semibold">ملخص التحقق من البيانات</h3>
            <p className="text-sm text-muted-foreground">
              تم فحص {totalRows} صف من بيانات Excel
            </p>
          </div>
        </div>

        {/* شريط التقدم الملون */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">حالة البيانات</span>
            <span className="font-medium">
              {validRows + warningRows}/{totalRows} جاهزة للاستيراد
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            {/* الجزء الصحيح - أخضر */}
            {validPercentage > 0 && (
              <div 
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${validPercentage}%` }}
                title={`${validRows} صف صحيح`}
              />
            )}
            {/* الجزء التحذيري - أصفر */}
            {warningPercentage > 0 && (
              <div 
                className="bg-yellow-500 h-full transition-all duration-500"
                style={{ width: `${warningPercentage}%` }}
                title={`${warningRows} صف بتحذيرات`}
              />
            )}
            {/* الجزء الخاطئ - أحمر */}
            {errorPercentage > 0 && (
              <div 
                className="bg-red-500 h-full transition-all duration-500"
                style={{ width: `${errorPercentage}%` }}
                title={`${errorRows} صف بأخطاء`}
              />
            )}
          </div>
        </div>

        {/* الإحصائيات التفصيلية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* البيانات الصحيحة */}
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-700">
                  {validRows}
                </span>
                <span className="text-sm text-green-600">({validPercentage}%)</span>
              </div>
              <p className="text-sm text-green-700 font-medium mt-1">
                صفوف صحيحة
              </p>
              <p className="text-xs text-green-600 mt-1">
                جاهزة للاستيراد مباشرة
              </p>
            </div>
          </div>

          {/* التحذيرات */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-yellow-700">
                  {warningRows}
                </span>
                <span className="text-sm text-yellow-600">({warningPercentage}%)</span>
              </div>
              <p className="text-sm text-yellow-700 font-medium mt-1">
                تحذيرات
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {warnings.length} تحذير في البيانات
              </p>
            </div>
          </div>

          {/* الأخطاء */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-700">
                  {errorRows}
                </span>
                <span className="text-sm text-red-600">({errorPercentage}%)</span>
              </div>
              <p className="text-sm text-red-700 font-medium mt-1">
                أخطاء
              </p>
              <p className="text-xs text-red-600 mt-1">
                {errors.length} خطأ يجب إصلاحه
              </p>
            </div>
          </div>
        </div>

        {/* قائمة الأخطاء المفصلة */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              قائمة الأخطاء ({errors.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-red-50 border border-red-200 rounded-lg p-4">
              {errors.slice(0, 20).map((error, i) => (
                <div key={i} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="font-medium min-w-[60px]">الصف {error.row}:</span>
                  <span className="flex-1">
                    {error.message}
                    {error.column && (
                      <span className="text-red-600 mr-1">({error.column})</span>
                    )}
                  </span>
                </div>
              ))}
              {errors.length > 20 && (
                <p className="text-sm text-red-600 font-medium pt-2 border-t border-red-200">
                  و {errors.length - 20} خطأ آخر...
                </p>
              )}
            </div>
          </div>
        )}

        {/* قائمة التحذيرات المفصلة */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-yellow-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              قائمة التحذيرات ({warnings.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              {warnings.slice(0, 10).map((warning, i) => (
                <div key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                  <span className="font-medium min-w-[60px]">الصف {warning.row}:</span>
                  <span className="flex-1">
                    {warning.message}
                  </span>
                </div>
              ))}
              {warnings.length > 10 && (
                <p className="text-sm text-yellow-600 font-medium pt-2 border-t border-yellow-200">
                  و {warnings.length - 10} تحذير آخر...
                </p>
              )}
            </div>
          </div>
        )}

        {/* رسالة النجاح */}
        {errors.length === 0 && warnings.length === 0 && totalRows > 0 && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                ممتاز! جميع البيانات صحيحة ✓
              </p>
              <p className="text-sm text-green-700 mt-1">
                يمكنك المتابعة لاستيراد {totalRows} عقار إلى النظام
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
