'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Overdue Alerts - تنبيهات المدفوعات المتأخرة
 * ═══════════════════════════════════════════════════════════════
 */

import { Button } from '@/components/ui/button'
import { AlertTriangle, Eye, Send, X } from 'lucide-react'

interface OverdueAlertsProps {
  count: number
  totalAmount: number
  onView: () => void
  onSendReminders: () => void
  onDismiss: () => void
}

export function OverdueAlerts({
  count,
  totalAmount,
  onView,
  onSendReminders,
  onDismiss
}: OverdueAlertsProps) {
  if (count === 0) return null

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              لديك {count} دفعات متأخرة
            </p>
            <p className="text-xs text-red-700">
              بإجمالي {totalAmount.toLocaleString()} ريال
            </p>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={onView}>
            <Eye className="w-4 h-4 ml-2" />
            عرض المتأخرات
          </Button>

          <Button size="sm" variant="outline" onClick={onSendReminders}>
            <Send className="w-4 h-4 ml-2" />
            إرسال تذكيرات
          </Button>

          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
