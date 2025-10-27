'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Quick Actions - الإجراءات السريعة
 * ═══════════════════════════════════════════════════════════════
 */

import { Button } from '@/components/ui/button'
import { Plus, Send, FileText, Download } from 'lucide-react'

interface QuickActionsProps {
  onAddPayment: () => void
  onSendReminders: () => void
  onOverdueReport: () => void
  onExportAll: () => void
}

export function QuickActions({
  onAddPayment,
  onSendReminders,
  onOverdueReport,
  onExportAll
}: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onAddPayment} size="lg">
        <Plus className="w-5 h-5 ml-2" />
        دفعة جديدة
      </Button>

      <Button variant="outline" onClick={onSendReminders}>
        <Send className="w-4 h-4 ml-2" />
        إرسال تذكير
      </Button>

      <Button variant="outline" onClick={onOverdueReport}>
        <FileText className="w-4 h-4 ml-2" />
        تقرير المتأخرات
      </Button>

      <Button variant="outline" onClick={onExportAll}>
        <Download className="w-4 h-4 ml-2" />
        تصدير الكل
      </Button>
    </div>
  )
}
