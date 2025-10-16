'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { propertiesApi } from '@/lib/api/properties';
import { usePropertiesStore } from '@/store/properties-store';
import { CreatePropertyDto, PropertyType, PropertyStatus } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  Save, 
  Upload, 
  X, 
  Loader2,
  Building2,
  ImagePlus
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

// Schema للـ Validation
const propertySchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرف على الأقل'),
  type: z.enum(['apartment', 'villa', 'land', 'commercial', 'building']),
  status: z.enum(['available', 'sold', 'rented', 'pending']),
  price: z.number().min(1, 'السعر يجب أن يكون أكبر من صفر'),
  area: z.number().min(1, 'المساحة يجب أن تكون أكبر من صفر'),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  city: z.string().min(2, 'المدينة مطلوبة'),
  district: z.string().min(2, 'الحي مطلوب'),
  address: z.string().min(5, 'العنوان التفصيلي مطلوب'),
  features: z.array(z.string()).default([]),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const { addProperty } = usePropertiesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'apartment',
      status: 'available',
      bedrooms: 0,
      bathrooms: 0,
      features: [],
    },
  });

  const watchType = watch('type');
  const watchStatus = watch('status');

  // رفع صورة
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(file =>
        propertiesApi.uploadImage(file)
      );

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      toast.success(`تم رفع ${urls.length} صورة بنجاح`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل رفع الصور');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // حذف صورة
  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // إضافة ميزة
  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      const newFeatures = [...features, featureInput.trim()];
      setFeatures(newFeatures);
      setValue('features', newFeatures);
      setFeatureInput('');
    }
  };

  // حذف ميزة
  const handleRemoveFeature = (feature: string) => {
    const newFeatures = features.filter(f => f !== feature);
    setFeatures(newFeatures);
    setValue('features', newFeatures);
  };

  // إرسال النموذج
  const onSubmit = async (data: PropertyFormData) => {
    if (uploadedImages.length === 0) {
      toast.error('يجب رفع صورة واحدة على الأقل');
      return;
    }

    setIsSubmitting(true);

    try {
      // افترض أن المستخدم لديه office_id في localStorage أو من context
      const officeId = localStorage.getItem('office_id') || '1';

      const propertyData: CreatePropertyDto = {
        ...data,
        images: uploadedImages,
        features: features,
        office_id: officeId,
      };

      const newProperty = await propertiesApi.createProperty(propertyData);
      addProperty(newProperty);
      
      toast.success('تم إضافة العقار بنجاح');
      router.push('/dashboard/properties');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل إضافة العقار');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeLabels: Record<PropertyType, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    land: 'أرض',
    commercial: 'تجاري',
    building: 'عمارة',
  };

  const statusLabels: Record<PropertyStatus, string> = {
    available: 'متاح',
    sold: 'مباع',
    rented: 'مؤجر',
    pending: 'قيد الانتظار',
  };

  const cities = [
    'الرياض',
    'جدة',
    'مكة المكرمة',
    'المدينة المنورة',
    'الدمام',
    'الخبر',
    'الظهران',
    'تبوك',
    'أبها',
    'الطائف',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#0066CC]" />
            إضافة عقار جديد
          </h1>
          <p className="text-gray-600 mt-1">
            أدخل تفاصيل العقار الجديد
          </p>
        </div>

        <Link href="/dashboard/properties">
          <Button variant="outline" className="gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للقائمة
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* المعلومات الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* العنوان */}
            <div className="space-y-2">
              <Label htmlFor="title">عنوان العقار *</Label>
              <Input
                id="title"
                placeholder="مثال: فيلا فاخرة في حي الملقا"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* الوصف */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف *</Label>
              <Textarea
                id="description"
                placeholder="اكتب وصفاً تفصيلياً للعقار..."
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Row: النوع والحالة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* النوع */}
              <div className="space-y-2">
                <Label htmlFor="type">نوع العقار *</Label>
                <Select
                  value={watchType}
                  onValueChange={(value) => setValue('type', value as PropertyType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* الحالة */}
              <div className="space-y-2">
                <Label htmlFor="status">حالة العقار *</Label>
                <Select
                  value={watchStatus}
                  onValueChange={(value) => setValue('status', value as PropertyStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* التفاصيل والأسعار */}
        <Card>
          <CardHeader>
            <CardTitle>التفاصيل والأسعار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row: السعر والمساحة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* السعر */}
              <div className="space-y-2">
                <Label htmlFor="price">السعر (ريال) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="1200000"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* المساحة */}
              <div className="space-y-2">
                <Label htmlFor="area">المساحة (م²) *</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="500"
                  {...register('area', { valueAsNumber: true })}
                />
                {errors.area && (
                  <p className="text-sm text-red-600">{errors.area.message}</p>
                )}
              </div>
            </div>

            {/* Row: غرف النوم والحمامات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* غرف النوم */}
              <div className="space-y-2">
                <Label htmlFor="bedrooms">عدد غرف النوم</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="4"
                  {...register('bedrooms', { valueAsNumber: true })}
                />
                {errors.bedrooms && (
                  <p className="text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>

              {/* الحمامات */}
              <div className="space-y-2">
                <Label htmlFor="bathrooms">عدد الحمامات</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="3"
                  {...register('bathrooms', { valueAsNumber: true })}
                />
                {errors.bathrooms && (
                  <p className="text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الموقع */}
        <Card>
          <CardHeader>
            <CardTitle>الموقع</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row: المدينة والحي */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* المدينة */}
              <div className="space-y-2">
                <Label htmlFor="city">المدينة *</Label>
                <Select
                  onValueChange={(value) => setValue('city', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              {/* الحي */}
              <div className="space-y-2">
                <Label htmlFor="district">الحي *</Label>
                <Input
                  id="district"
                  placeholder="مثال: الملقا"
                  {...register('district')}
                />
                {errors.district && (
                  <p className="text-sm text-red-600">{errors.district.message}</p>
                )}
              </div>
            </div>

            {/* العنوان التفصيلي */}
            <div className="space-y-2">
              <Label htmlFor="address">العنوان التفصيلي *</Label>
              <Input
                id="address"
                placeholder="مثال: شارع الأمير محمد بن عبدالعزيز"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* الصور */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              صور العقار *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* منطقة رفع الصور */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0066CC] transition-colors">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
              <label htmlFor="images" className="cursor-pointer">
                {isUploadingImage ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-[#0066CC] animate-spin mb-3" />
                    <p className="text-gray-600">جاري رفع الصور...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      اضغط لرفع الصور
                    </p>
                    <p className="text-sm text-gray-500">
                      يمكنك رفع عدة صور (PNG, JPG, JPEG)
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* معاينة الصور المرفوعة */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={url}
                        alt={`صورة ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -left-2 w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {uploadedImages.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
                ⚠️ يجب رفع صورة واحدة على الأقل
              </p>
            )}
          </CardContent>
        </Card>

        {/* المميزات */}
        <Card>
          <CardHeader>
            <CardTitle>مميزات العقار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* إضافة ميزة */}
            <div className="flex gap-2">
              <Input
                placeholder="مثال: مسبح خاص"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddFeature}
                variant="outline"
              >
                إضافة
              </Button>
            </div>

            {/* قائمة المميزات */}
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* أزرار الحفظ */}
        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/properties">
            <Button type="button" variant="outline">
              إلغاء
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0066CC] hover:bg-[#0052A3] gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ العقار
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}