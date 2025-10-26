'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Date Range Filter - فلتر النطاق الزمني
 * ═══════════════════════════════════════════════════════════════
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  subMonths,
  subYears
} from 'date-fns'
import type { DateRange, QuickDateSelect } from '@/types/finance'
import { QUICK_DATE_LABELS } from '@/types/finance'

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  /**
   * تطبيق نطاق سريع
   */
  const applyQuickSelect = (select: QuickDateSelect) => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (select) {
      case 'this-month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      
      case 'last-3-months':
        from = subMonths(now, 3);
        to = now;
        break;
      
      case 'this-year':
        from = startOfYear(now);
        to = endOfYear(now);
        break;
      
      case 'last-year':
        const lastYear = subYears(now, 1);
        from = startOfYear(lastYear);
        to = endOfYear(lastYear);
        break;
      
      default:
        from = startOfMonth(now);
        to = endOfMonth(now);
    }

    onChange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    });
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* أيقونة */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <Label className="text-sm font-medium">الفترة الزمنية</Label>
        </div>

        {/* النطاق المخصص */}
        <div className="flex gap-3 flex-1">
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="date-from" className="text-xs text-gray-500 mb-1 block">
              من
            </Label>
            <Input
              id="date-from"
              type="date"
              value={value.from}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Label htmlFor="date-to" className="text-xs text-gray-500 mb-1 block">
              إلى
            </Label>
            <Input
              id="date-to"
              type="date"
              value={value.to}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
          </div>
        </div>

        {/* Quick Selects */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(QUICK_DATE_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => applyQuickSelect(key as QuickDateSelect)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
