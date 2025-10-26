'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Export Preview - معاينة التصدير
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لمعاينة البيانات قبل التصدير (أول 5 صفوف)
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Download, X, Eye } from 'lucide-react'
import { AVAILABLE_COLUMNS, type ExportConfig } from '@/types/export'

interface ExportPreviewProps {
  config: ExportConfig
  onClose: () => void
  onExport: () => void
}

// بيانات تجريبية للمعاينة
const SAMPLE_DATA = [
  {
    name: 'أحمد محمد علي',
    phone: '0501234567',
    email: 'ahmed@example.com',
    type: 'مشتري',
    status: 'نشط',
    city: 'الرياض',
    source: 'موقع إلكتروني',
    createdAt: '2024-01-15'
  },
  {
    name: 'فاطمة عبدالله',
    phone: '0559876543',
    email: 'fatimah@example.com',
    type: 'بائع',
    status: 'نشط',
    city: 'جدة',
    source: 'إعلان',
    createdAt: '2024-02-20'
  },
  {
    name: 'خالد السالم',
    phone: '0561112222',
    email: null,
    type: 'مستأجر',
    status: 'محتمل',
    city: 'الدمام',
    source: 'إحالة',
    createdAt: '2024-03-10'
  },
  {
    name: 'نورة الغامدي',
    phone: '0503334444',
    email: 'noura@example.com',
    type: 'مالك',
    status: 'نشط',
    city: 'مكة',
    source: 'موقع إلكتروني',
    createdAt: '2024-03-25'
  },
  {
    name: 'محمد الشمري',
    phone: '0555556666',
    email: 'm.shammari@example.com',
    type: 'مشتري',
    status: 'غير نشط',
    city: 'الرياض',
    source: 'زيارة مباشرة',
    createdAt: '2024-04-05'
  }
]

export function ExportPreview({ config, onClose, onExport }: ExportPreviewProps) {
  // الحصول على معلومات الأعمدة المحددة
  const selectedColumnsInfo = config.columns.map(colKey => 
    AVAILABLE_COLUMNS.find(col => col.key === colKey)
  ).filter(Boolean)
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#0066CC]" />
            معاينة التصدير
          </DialogTitle>
          <p className="text-sm text-gray-600">
            معاينة أول 5 صفوف من البيانات المراد تصديرها
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* معلومات التصدير */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">نوع التصدير</div>
              <div className="font-medium">
                {config.exportType === 'all' && 'جميع العملاء'}
                {config.exportType === 'selected' && `${config.selectedIds.length} عميل محدد`}
                {config.exportType === 'filtered' && 'حسب الفلتر'}
                {config.exportType === 'date-range' && 'نطاق زمني'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">عدد الأعمدة</div>
              <div className="font-medium">{config.columns.length} عمود</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">تنسيق الملف</div>
              <div className="font-medium uppercase">{config.format}</div>
            </div>
          </div>
          
          {/* جدول المعاينة */}
          <ScrollArea className="h-[400px] border rounded-lg">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0066CC] text-white">
                <tr>
                  {config.styling.autoNumbering && (
                    <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                      #
                    </th>
                  )}
                  {selectedColumnsInfo.map((col, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-right font-semibold whitespace-nowrap"
                    >
                      {col?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {SAMPLE_DATA.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {config.styling.autoNumbering && (
                      <td className="px-4 py-3 text-gray-500 font-medium">
                        {rowIndex + 1}
                      </td>
                    )}
                    {config.columns.map((colKey, colIndex) => {
                      const value = row[colKey as keyof typeof row]
                      return (
                        <td key={colIndex} className="px-4 py-3">
                          {value || <span className="text-gray-400">-</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
          
          {/* ملاحظات */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>ملاحظة:</strong> هذه معاينة لأول 5 صفوف فقط. 
              الملف الكامل سيحتوي على جميع البيانات حسب الإعدادات المحددة.
            </p>
          </div>
          
          {/* خيارات التنسيق المفعلة */}
          {config.styling && (
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium mb-2">خيارات التنسيق المفعلة:</div>
              <div className="flex flex-wrap gap-2">
                {config.styling.includeHeader && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Header ملون
                  </span>
                )}
                {config.styling.includeLogo && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    الشعار
                  </span>
                )}
                {config.styling.includeOfficeInfo && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    معلومات المكتب
                  </span>
                )}
                {config.styling.autoNumbering && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    ترقيم تلقائي
                  </span>
                )}
                {config.styling.includeStats && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    إحصائيات
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 ml-2" />
            إغلاق
          </Button>
          <Button onClick={onExport} className="bg-[#0066CC] hover:bg-[#0052A3]">
            <Download className="w-4 h-4 ml-2" />
            تصدير الآن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
