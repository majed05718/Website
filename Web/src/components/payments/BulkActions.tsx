'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Bulk Actions - الإجراءات الجماعية
 * ═══════════════════════════════════════════════════════════════
 */

import { Button } from '@/components/ui/button'
import { CheckCircle, Send, FileDown, Trash2, X } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onMarkAsPaid: () => void
  onSendReminders: () => void
  onExport: () => void
  onDelete: () => void
  onDeselectAll: () => void
}

export function BulkActions({
  selectedCount,
  onMarkAsPaid,
  onSendReminders,
  onExport,
  onDelete,
  onDeselectAll
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-gray-900">
            تم تحديد {selectedCount} دفعة
          </span>
        </div>

        <div className="flex-1"></div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onMarkAsPaid}>
            <CheckCircle className="w-4 h-4 ml-2" />
            وضع علامة كمدفوع
          </Button>

          <Button size="sm" variant="outline" onClick={onSendReminders}>
            <Send className="w-4 h-4 ml-2" />
            إرسال تذكيرات
          </Button>

          <Button size="sm" variant="outline" onClick={onExport}>
            <FileDown className="w-4 h-4 ml-2" />
            تصدير
          </Button>

          <Button size="sm" variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 ml-2" />
            حذف
          </Button>

          <Button size="sm" variant="ghost" onClick={onDeselectAll}>
            <X className="w-4 h-4 ml-2" />
            إلغاء التحديد
          </Button>
        </div>
      </div>
    </div>
  )
}
