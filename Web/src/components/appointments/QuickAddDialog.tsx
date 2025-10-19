'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAppointment } from '@/lib/api/appointments';
import type { AppointmentType } from '@/types/appointment';

const quickSchema = z.object({
  title: z.string().min(1, 'يجب إدخال العنوان'),
  type: z.string().min(1, 'يجب اختيار النوع'),
  date: z.string().min(1, 'يجب اختيار التاريخ'),
  startTime: z.string().min(1, 'يجب اختيار الوقت'),
  endTime: z.string().min(1, 'يجب اختيار وقت النهاية'),
});

type QuickFormData = z.infer<typeof quickSchema>;

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  onSuccess?: () => void;
}

export function QuickAddDialog({ open, onOpenChange, initialDate, onSuccess }: QuickAddDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<QuickFormData>({
    resolver: zodResolver(quickSchema),
    defaultValues: {
      date: initialDate || new Date().toISOString().split('T')[0],
      type: 'viewing',
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const types: { value: AppointmentType; label: string }[] = [
    { value: 'viewing', label: 'معاينة عقار' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'contract_signing', label: 'توقيع عقد' },
    { value: 'handover', label: 'تسليم' },
    { value: 'inspection', label: 'فحص' },
    { value: 'other', label: 'أخرى' },
  ];

  const onSubmit = async (data: QuickFormData) => {
    setIsSubmitting(true);
    try {
      await createAppointment(data);
      toast.success('تم إضافة الموعد بنجاح');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Quick add error:', error);
      toast.error('حدث خطأ في إضافة الموعد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة موعد سريع</DialogTitle>
          <DialogDescription>أضف موعد جديد بسرعة</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
            <Input {...register('title')} placeholder="عنوان الموعد" className={errors.title ? 'border-red-500' : ''} />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">النوع *</label>
            <Select value={watch('type')} onValueChange={(value) => setValue('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ *</label>
              <Input type="date" {...register('date')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من *</label>
              <Input type="time" {...register('startTime')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى *</label>
              <Input type="time" {...register('endTime')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
