'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Export History - سجل التصديرات
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لعرض آخر 5 عمليات تصدير مع إمكانية إعادة التحميل
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History, Download, FileSpreadsheet, FileText, FileType } from 'lucide-react'
import type { ExportHistoryItem } from '@/types/export'

// بيانات تجريبية لسجل التصديرات
const SAMPLE_HISTORY: ExportHistoryItem[] = [
  {
    id: '1',
    filename: 'customers-2024-10-26.xlsx',
    format: 'xlsx',
    date: '2024-10-26 14:30',
    rowCount: 150,
    fileSize: '245 KB'
  },
  {
    id: '2',
    filename: 'customers-active-2024-10-25.csv',
    format: 'csv',
    date: '2024-10-25 10:15',
    rowCount: 89,
    fileSize: '15 KB'
  },
  {
    id: '3',
    filename: 'customers-buyers-2024-10-24.xlsx',
    format: 'xlsx',
    date: '2024-10-24 16:45',
    rowCount: 52,
    fileSize: '128 KB'
  },
  {
    id: '4',
    filename: 'customers-report-2024-10-23.pdf',
    format: 'pdf',
    date: '2024-10-23 09:20',
    rowCount: 200,
    fileSize: '1.2 MB'
  },
  {
    id: '5',
    filename: 'customers-september-2024-09-30.xlsx',
    format: 'xlsx',
    date: '2024-09-30 18:00',
    rowCount: 180,
    fileSize: '312 KB'
  }
]

export function ExportHistory() {
  /**
   * الحصول على أيقونة حسب نوع الملف
   */
  const getFileIcon = (format: string) => {
    switch (format) {
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      case 'csv':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'pdf':
        return <FileType className="w-4 h-4 text-red-600" />
      default:
        return <FileSpreadsheet className="w-4 h-4" />
    }
  }
  
  /**
   * إعادة تحميل ملف سابق
   */
  const handleRedownload = (item: ExportHistoryItem) => {
    // في البيئة الحقيقية، سيتم تحميل الملف من الخادم
    console.log('Redownloading:', item.filename)
    // toast.success(`جاري تحميل ${item.filename}`)
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-[#0066CC]" />
        سجل التصديرات
      </h3>
      
      {SAMPLE_HISTORY.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">لا توجد عمليات تصدير سابقة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {SAMPLE_HISTORY.map((item) => (
            <div
              key={item.id}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getFileIcon(item.format)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {item.filename}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.rowCount} صف</span>
                      <span>•</span>
                      <span>{item.fileSize}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRedownload(item)}
                  className="flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {SAMPLE_HISTORY.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            يتم حفظ آخر 5 عمليات تصدير فقط
          </p>
        </div>
      )}
    </Card>
  )
}
