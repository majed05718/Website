'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle, Upload } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ImportProgressProps {
  currentCount: number
  totalCount: number
  isComplete: boolean
  successCount?: number
  failedCount?: number
}

/**
 * مكون ImportProgress
 * يعرض progress bar مع تفاصيل التقدم وتقدير الوقت المتبقي
 */
export function ImportProgress({ 
  currentCount, 
  totalCount,
  isComplete,
  successCount = 0,
  failedCount = 0
}: ImportProgressProps) {
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(null)

  // حساب النسبة المئوية
  const percentage = totalCount > 0 ? Math.round((currentCount / totalCount) * 100) : 0

  // تحديث الوقت المنقضي والمتبقي
  useEffect(() => {
    if (isComplete) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setElapsedTime(elapsed)

      // حساب الوقت المتبقي بناءً على معدل الاستيراد
      if (currentCount > 0) {
        const avgTimePerItem = elapsed / currentCount
        const remainingItems = totalCount - currentCount
        const estimated = avgTimePerItem * remainingItems
        setEstimatedTimeLeft(estimated)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [currentCount, totalCount, startTime, isComplete])

  // تنسيق الوقت (ثواني أو دقائق)
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    if (seconds < 60) {
      return `${seconds} ثانية`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes} دقيقة ${remainingSeconds > 0 ? `و ${remainingSeconds} ثانية` : ''}`
  }

  // حساب سرعة الاستيراد (عقار/ثانية)
  const importSpeed = elapsedTime > 0 
    ? (currentCount / (elapsedTime / 1000)).toFixed(1) 
    : '0'

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* العنوان والحالة */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {isComplete ? 'اكتمل الاستيراد!' : 'جاري استيراد العقارات...'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isComplete 
                  ? `تم استيراد ${successCount} عقار بنجاح` 
                  : `جاري المعالجة...`
                }
              </p>
            </div>
          </div>
          
          {/* النسبة المئوية */}
          <div className="text-left">
            <div className="text-3xl font-bold text-[#0066CC]">
              {percentage}%
            </div>
            <div className="text-xs text-muted-foreground">
              {currentCount} / {totalCount}
            </div>
          </div>
        </div>

        {/* شريط التقدم */}
        <div className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {isComplete ? 'مكتمل' : `${totalCount - currentCount} متبقي`}
            </span>
            {!isComplete && estimatedTimeLeft && (
              <span className="flex items-center gap-1">
                <span>الوقت المتبقي: {formatTime(estimatedTimeLeft)}</span>
              </span>
            )}
          </div>
        </div>

        {/* معلومات التقدم التفصيلية */}
        {!isComplete && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentCount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                تم المعالجة
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalCount - currentCount}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                قيد الانتظار
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0066CC]">
                {importSpeed}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                عقار/ثانية
              </div>
            </div>
          </div>
        )}

        {/* ملخص الإكمال */}
        {isComplete && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <div className="text-xl font-bold text-green-700">
                  {successCount}
                </div>
                <div className="text-sm text-green-600">
                  تم بنجاح
                </div>
              </div>
            </div>
            
            {failedCount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Upload className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <div className="text-xl font-bold text-red-700">
                    {failedCount}
                  </div>
                  <div className="text-sm text-red-600">
                    فشل
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* معلومات إضافية */}
        {!isComplete && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Upload className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              يُرجى عدم إغلاق هذه النافذة حتى يكتمل الاستيراد
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
