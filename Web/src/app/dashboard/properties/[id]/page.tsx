'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { propertiesApi } from '@/lib/api/properties';
import { usePropertiesStore } from '@/store/properties-store';
import { Property, PropertyType, PropertyStatus } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Edit,
  Trash2,
  Loader2,
  MapPin,
  Ruler,
  Home,
  Bed,
  Bath,
  Calendar,
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Image from 'next/image';

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { setSelectedProperty, deleteProperty } = usePropertiesStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // جلب تفاصيل العقار
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const data = await propertiesApi.getPropertyById(id);
        setProperty(data);
        setSelectedProperty(data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'فشل جلب تفاصيل العقار');
        router.push('/dashboard/properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // حذف العقار
  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await propertiesApi.deleteProperty(id);
      deleteProperty(id);
      toast.success('تم حذف العقار بنجاح');
      router.push('/dashboard/properties');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل حذف العقار');
    } finally {
      setIsDeleting(false);
    }
  };

  // التنقل بين الصور
  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0066CC] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل تفاصيل العقار...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    sold: 'bg-red-100 text-red-800 border-red-200',
    rented: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const statusLabels: Record<PropertyStatus, string> = {
    available: 'متاح',
    sold: 'مباع',
    rented: 'مؤجر',
    pending: 'قيد الانتظار',
  };

  const typeLabels: Record<PropertyType, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    land: 'أرض',
    commercial: 'تجاري',
    building: 'عمارة',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/properties">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${statusColors[property.status]} border`}>
                {statusLabels[property.status]}
              </Badge>
              <Badge variant="secondary">{typeLabels[property.type]}</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/properties/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              تعديل
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيمن - معرض الصور */}
        <div className="lg:col-span-2 space-y-6">
          {/* معرض الصور الرئيسي */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-gray-200">
              {property.images && property.images.length > 0 ? (
                <>
                  <Image
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    quality={80}
                  />
                  
                  {/* أزرار التنقل */}
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      {/* مؤشر الصور */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* صور مصغرة */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4 bg-gray-50">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-[#0066CC] ring-2 ring-[#0066CC]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 25vw, 10vw"
                      loading="lazy"
                      quality={60}
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* الوصف */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">الوصف</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </CardContent>
          </Card>

          {/* المميزات */}
          {property.features && property.features.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0066CC]" />
                  المميزات
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-[#0066CC] rounded-full" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* العمود الأيسر - التفاصيل */}
        <div className="space-y-6">
          {/* السعر */}
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">السعر</p>
              <p className="text-4xl font-bold text-[#0066CC]">
                {formatPrice(property.price)}
              </p>
            </CardContent>
          </Card>

          {/* التفاصيل الأساسية */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-gray-900 mb-4">التفاصيل</h3>

              {/* المساحة */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Ruler className="w-5 h-5" />
                  <span>المساحة</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {property.area} م²
                </span>
              </div>

              {/* النوع */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-5 h-5" />
                  <span>نوع العقار</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {typeLabels[property.type]}
                </span>
              </div>

              {/* غرف النوم */}
              {property.bedrooms !== undefined && property.bedrooms > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bed className="w-5 h-5" />
                    <span>غرف النوم</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {property.bedrooms}
                  </span>
                </div>
              )}

              {/* الحمامات */}
              {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bath className="w-5 h-5" />
                    <span>الحمامات</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {property.bathrooms}
                  </span>
                </div>
              )}

              {/* تاريخ الإضافة */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>تاريخ الإضافة</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatDate(property.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* الموقع */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0066CC]" />
                الموقع
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المدينة</p>
                  <p className="font-semibold text-gray-900">{property.city}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">الحي</p>
                  <p className="font-semibold text-gray-900">{property.district}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">العنوان التفصيلي</p>
                  <p className="font-semibold text-gray-900">{property.address}</p>
                </div>
              </div>

              {/* زر عرض الخريطة (اختياري) */}
              <Button variant="outline" className="w-full mt-4 gap-2">
                <MapPin className="w-4 h-4" />
                عرض على الخريطة
              </Button>
            </CardContent>
          </Card>

          {/* أزرار الإجراءات السريعة */}
          <div className="space-y-3">
            <Button className="w-full bg-[#0066CC] hover:bg-[#0052A3]">
              التواصل مع البائع
            </Button>
            <Button variant="outline" className="w-full">
              حجز معاينة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}