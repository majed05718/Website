'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Export Progress - شريط تقدم التصدير
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لعرض شريط التقدم أثناء عملية التصدير
 */

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Download } from 'lucide-react'

interface ExportProgressProps {
  progress: number
  total: number
  isComplete: boolean
}

export function ExportProgress({ progress, total, isComplete }: ExportProgressProps) {
  const percentage = Math.round((progress / total) * 100)
  
  return (
    <Card className="p-6 fixed bottom-6 left-6 right-6 shadow-lg z-50 max-w-md mx-auto">
      <div className="space-y-4">
        {/* العنوان */}
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Download className="w-6 h-6 text-[#0066CC] animate-bounce" />
          )}
          <div className="flex-1">
            <div className="font-semibold">
              {isComplete ? 'اكتمل التصدير!' : 'جاري تصدير العملاء...'}
            </div>
            <div className="text-sm text-gray-600">
              {isComplete 
                ? 'تم تنزيل الملف بنجاح' 
                : 'يرجى الانتظار...'
              }
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0066CC]">
            {percentage}%
          </div>
        </div>
        
        {/* شريط التقدم */}
        <Progress value={percentage} className="h-2" />
        
        {/* التفاصيل */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>{progress} / {total}</span>
          <span>{isComplete ? 'مكتمل' : `${total - progress} متبقي`}</span>
        </div>
        
        {/* رسالة */}
        {!isComplete && (
          <div className="text-xs text-gray-500 text-center">
            يرجى عدم إغلاق النافذة حتى يكتمل التصدير
          </div>
        )}
      </div>
    </Card>
  )
}
