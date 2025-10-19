'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Appointment, AppointmentType } from '@/types/appointment';
import { createAppointment, updateAppointment } from '@/lib/api/appointments';
import { calculateDuration } from '@/lib/appointments-utils';

const appointmentSchema = z.object({
  title: z.string().min(1, 'يجب إدخال العنوان'),
  description: z.string().optional(),
  type: z.string().min(1, 'يجب اختيار نوع الموعد'),
  date: z.string().min(1, 'يجب اختيار التاريخ'),
  startTime: z.string().min(1, 'يجب اختيار وقت البداية'),
  endTime: z.string().min(1, 'يجب اختيار وقت النهاية'),
  location: z.string().optional(),
  meetingLink: z.string().url('رابط غير صحيح').optional().or(z.literal('')),
  notes: z.string().optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'وقت النهاية يجب أن يكون بعد وقت البداية',
  path: ['endTime'],
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  appointment?: Appointment | null;
  initialDate?: string;
}

export function AppointmentForm({ appointment, initialDate }: AppointmentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!appointment;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      title: appointment.title,
      description: appointment.description || '',
      type: appointment.type,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      location: appointment.location || '',
      meetingLink: appointment.meetingLink || '',
      notes: appointment.notes || '',
    } : {
      date: initialDate || new Date().toISOString().split('T')[0],
      type: 'viewing',
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const appointmentTypes: { value: AppointmentType; label: string }[] = [
    { value: 'viewing', label: 'معاينة عقار' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'contract_signing', label: 'توقيع عقد' },
    { value: 'handover', label: 'تسليم عقار' },
    { value: 'inspection', label: 'فحص عقار' },
    { value: 'other', label: 'أخرى' },
  ];

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        description: data.description || undefined,
        location: data.location || undefined,
        meetingLink: data.meetingLink || undefined,
        notes: data.notes || undefined,
      };

      if (isEditing && appointment) {
        await updateAppointment(appointment.id, payload);
        toast.success('تم تحديث الموعد بنجاح');
        router.push(`/dashboard/appointments/${appointment.id}`);
      } else {
        const newAppointment = await createAppointment(payload);
        toast.success('تم إضافة الموعد بنجاح');
        router.push(`/dashboard/appointments/${newAppointment.id}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(isEditing ? 'حدث خطأ في تحديث الموعد' : 'حدث خطأ في إضافة الموعد');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'تعديل موعد' : 'موعد جديد'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان <span className="text-red-500">*</span>
              </label>
              <Input {...register('title')} placeholder="مثال: معاينة فيلا في الرياض" className={errors.title ? 'border-red-500' : ''} />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النوع <span className="text-red-500">*</span>
              </label>
              <Select value={watch('type')} onValueChange={(value) => setValue('type', value)}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="اختر نوع الموعد" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ <span className="text-red-500">*</span>
              </label>
              <Input type="date" {...register('date')} className={errors.date ? 'border-red-500' : ''} />
              {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وقت البداية <span className="text-red-500">*</span>
              </label>
              <Input type="time" {...register('startTime')} className={errors.startTime ? 'border-red-500' : ''} />
              {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وقت النهاية <span className="text-red-500">*</span>
              </label>
              <Input type="time" {...register('endTime')} className={errors.endTime ? 'border-red-500' : ''} />
              {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
              <Input {...register('location')} placeholder="العنوان أو اسم المكان" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <Textarea {...register('description')} placeholder="تفاصيل إضافية عن الموعد..." rows={3} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
              <Textarea {...register('notes')} placeholder="ملاحظات خاصة..." rows={2} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="ml-2 h-4 w-4" />
            {isSubmitting ? (isEditing ? 'جاري التحديث...' : 'جاري الحفظ...') : (isEditing ? 'تحديث الموعد' : 'حفظ الموعد')}
          </Button>
        </div>
      </form>
    </div>
  );
}
