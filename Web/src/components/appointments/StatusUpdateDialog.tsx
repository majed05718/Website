'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateAppointmentStatus } from '@/lib/api/appointments';
import type { AppointmentStatus } from '@/types/appointment';

interface StatusUpdateDialogProps {
  appointmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StatusUpdateDialog({ appointmentId, open, onOpenChange, onSuccess }: StatusUpdateDialogProps) {
  const [status, setStatus] = useState<AppointmentStatus>('confirmed');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: { value: AppointmentStatus; label: string }[] = [
    { value: 'scheduled', label: 'مجدول' },
    { value: 'confirmed', label: 'مؤكد' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'no_show', label: 'لم يحضر' },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateAppointmentStatus(appointmentId, status, notes || undefined);
      toast.success('تم تحديث حالة الموعد بنجاح');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تحديث حالة الموعد</DialogTitle>
          <DialogDescription>اختر الحالة الجديدة للموعد</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة الجديدة</label>
            <Select value={status} onValueChange={(value) => setStatus(value as AppointmentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات (اختياري)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أضف ملاحظات..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'جاري التحديث...' : 'تحديث الحالة'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
