'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { completeAppointment } from '@/lib/api/appointments';

interface CompleteDialogProps {
  appointmentId: string;
  appointmentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompleteDialog({ appointmentId, appointmentTitle, open, onOpenChange, onSuccess }: CompleteDialogProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeAppointment(appointmentId, notes || undefined);
      toast.success('تم تعليم الموعد كمكتمل');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Complete error:', error);
      toast.error('حدث خطأ في تحديث الموعد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إتمام الموعد</DialogTitle>
          <DialogDescription>
            تعليم الموعد: <strong>{appointmentTitle}</strong> كمكتمل
          </DialogDescription>
        </DialogHeader>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ملاحظات (اختياري)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظات حول نتيجة الموعد..."
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? 'جاري الحفظ...' : 'تأكيد الإتمام'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
