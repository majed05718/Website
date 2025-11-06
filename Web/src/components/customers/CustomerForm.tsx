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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Customer, CustomerType, CustomerStatus, ContactMethod } from '@/types/customer';
import { createCustomer, updateCustomer } from '@/lib/api/customers';
import { isValidSaudiPhone, isValidNationalId } from '@/lib/customers-utils';

const customerSchema = z.object({
  name: z.string().min(2, 'يجب أن يكون الاسم حرفين على الأقل'),
  phone: z.string().refine(isValidSaudiPhone, 'رقم الجوال غير صحيح'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  nationalId: z.string().refine((val) => !val || isValidNationalId(val), 'رقم الهوية غير صحيح').optional(),
  type: z.string().min(1, 'يجب اختيار نوع العميل'),
  status: z.string().min(1, 'يجب اختيار الحالة'),
  city: z.string().optional(),
  address: z.string().optional(),
  preferredContactMethod: z.string().min(1, 'يجب اختيار طريقة الاتصال المفضلة'),
  notes: z.string().optional(),
  source: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer | null;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      nationalId: customer.nationalId || '',
      type: customer.type,
      status: customer.status,
      city: customer.city || '',
      address: customer.address || '',
      preferredContactMethod: customer.preferredContactMethod,
      notes: customer.notes || '',
      source: customer.source || '',
    } : {
      type: 'buyer',
      status: 'potential',
      preferredContactMethod: 'phone',
    },
  });

  const customerTypes: { value: CustomerType; label: string }[] = [
    { value: 'buyer', label: 'مشتري' },
    { value: 'seller', label: 'بائع' },
    { value: 'tenant', label: 'مستأجر' },
    { value: 'landlord', label: 'مؤجر' },
    { value: 'both', label: 'بائع ومشتري' },
  ];

  const customerStatuses: { value: CustomerStatus; label: string }[] = [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' },
    { value: 'potential', label: 'محتمل' },
    { value: 'archived', label: 'مؤرشف' },
  ];

  const contactMethods: { value: ContactMethod; label: string }[] = [
    { value: 'phone', label: 'هاتف' },
    { value: 'whatsapp', label: 'واتساب' },
    { value: 'email', label: 'بريد إلكتروني' },
    { value: 'in_person', label: 'شخصياً' },
  ];

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        status: data.status as CustomerStatus,
        type: data.type as CustomerType,
        preferredContactMethod: data.preferredContactMethod as ContactMethod, // <--- آخر تعديل هنا
        email: data.email || undefined,
        nationalId: data.nationalId || undefined,
        city: data.city || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        source: data.source || undefined,
      };

      if (isEditing && customer) {
        await updateCustomer(customer.id, payload);
        toast.success('تم تحديث العميل بنجاح');
        router.push(`/dashboard/customers/${customer.id}`);
      } else {
        const newCustomer = await createCustomer(payload);
        toast.success('تم إضافة العميل بنجاح');
        router.push(`/dashboard/customers/${newCustomer.id}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(isEditing ? 'حدث خطأ في تحديث العميل' : 'حدث خطأ في إضافة العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'تعديل عميل' : 'عميل جديد'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'قم بتحديث بيانات العميل' : 'أضف عميل جديد للنظام'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name')}
                  placeholder="أدخل اسم العميل"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('phone')}
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="example@domain.com"
                  dir="ltr"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهوية الوطنية
                </label>
                <Input
                  {...register('nationalId')}
                  placeholder="1XXXXXXXXX"
                  dir="ltr"
                  className={errors.nationalId ? 'border-red-500' : ''}
                />
                {errors.nationalId && (
                  <p className="text-sm text-red-500 mt-1">{errors.nationalId.message}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العميل <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch('type')}
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="اختر نوع العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map((type) => (
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

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value)}
                >
                  <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
              معلومات الموقع
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <Input
                  {...register('city')}
                  placeholder="الرياض، جدة، الدمام..."
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <Input
                  {...register('address')}
                  placeholder="الحي، الشارع..."
                />
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
              تفضيلات الاتصال
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الاتصال المفضلة <span className="text-red-500">*</span>
                </label>
                <Select
                  value={watch('preferredContactMethod')}
                  onValueChange={(value) => setValue('preferredContactMethod', value)}
                >
                  <SelectTrigger className={errors.preferredContactMethod ? 'border-red-500' : ''}>
                    <SelectValue placeholder="اختر طريقة الاتصال" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.preferredContactMethod && (
                  <p className="text-sm text-red-500 mt-1">{errors.preferredContactMethod.message}</p>
                )}
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مصدر العميل
                </label>
                <Input
                  {...register('source')}
                  placeholder="موقع، إعلان، إحالة..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  من أين جاء هذا العميل؟
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">
              ملاحظات
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات عامة
              </label>
              <Textarea
                {...register('notes')}
                placeholder="أضف أي ملاحظات مهمة حول هذا العميل..."
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="ml-2 h-4 w-4" />
            {isSubmitting
              ? (isEditing ? 'جاري التحديث...' : 'جاري الحفظ...')
              : (isEditing ? 'تحديث العميل' : 'حفظ العميل')
            }
          </Button>
        </div>
      </form>
    </div>
  );
}
