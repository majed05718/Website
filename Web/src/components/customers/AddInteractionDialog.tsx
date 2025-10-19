'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InteractionType } from '@/types/customer';
import { addCustomerInteraction } from '@/lib/api/customers';

const interactionSchema = z.object({
  type: z.string().min(1, 'يجب اختيار نوع التعامل'),
  description: z.string().min(1, 'يجب إدخال وصف التعامل'),
  date: z.string().min(1, 'يجب اختيار التاريخ'),
  outcome: z.string().optional(),
  nextFollowUp: z.string().optional(),
});

type InteractionForm = z.infer<typeof interactionSchema>;

interface AddInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onSuccess?: () => void;
}

export function AddInteractionDialog({ 
  open, 
  onOpenChange, 
  customerId,
  onSuccess 
}: AddInteractionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InteractionForm>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      outcome: '',
      nextFollowUp: '',
    },
  });

  const interactionTypes: { value: InteractionType; label: string }[] = [
    { value: 'call', label: 'اتصال هاتفي' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'property_viewing', label: 'معاينة عقار' },
    { value: 'contract_signing', label: 'توقيع عقد' },
    { value: 'payment', label: 'دفعة' },
    { value: 'complaint', label: 'شكوى' },
    { value: 'inquiry', label: 'استفسار' },
    { value: 'follow_up', label: 'متابعة' },
  ];

  const onSubmit = async (data: InteractionForm) => {
    setIsSubmitting(true);
    try {
      await addCustomerInteraction(customerId, {
        type: data.type,
        description: data.description,
        date: data.date,
        outcome: data.outcome || undefined,
        nextFollowUp: data.nextFollowUp || undefined,
      });
      
      toast.success('تم إضافة التعامل بنجاح');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Add interaction error:', error);
      toast.error('حدث خطأ في إضافة التعامل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة تعامل جديد</DialogTitle>
          <DialogDescription>
            سجل تعامل جديد مع هذا العميل
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع التعامل <span className="text-red-500">*</span>
            </label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value)}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="اختر نوع التعامل" />
              </SelectTrigger>
              <SelectContent>
                {interactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('description')}
              placeholder="اكتب تفاصيل التعامل..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              النتيجة (اختياري)
            </label>
            <Textarea
              {...register('outcome')}
              placeholder="ما هي نتيجة هذا التعامل؟"
              rows={2}
            />
          </div>

          {/* Next Follow Up */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              موعد المتابعة القادم (اختياري)
            </label>
            <Input
              type="date"
              {...register('nextFollowUp')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعامل'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
