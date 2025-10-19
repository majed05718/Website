'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cancelAppointment } from '@/lib/api/appointments';

interface CancelDialogProps {
  appointmentId: string;
  appointmentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelDialog({ appointmentId, appointmentTitle, open, onOpenChange, onSuccess }: CancelDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('يجب إدخال سبب الإلغاء');
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelAppointment(appointmentId, reason);
      toast.success('تم إلغاء الموعد بنجاح');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('حدث خطأ في إلغاء الموعد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إلغاء الموعد</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من إلغاء الموعد: <strong>{appointmentTitle}</strong>؟
          </DialogDescription>
        </DialogHeader>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            سبب الإلغاء <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب سبب إلغاء الموعد..."
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            رجوع
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
