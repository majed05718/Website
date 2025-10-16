'use client';

import { Property } from '@/types/property';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Ruler, Eye, Edit, Trash2, Home, Bed, Bath } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
  onDelete?: (id: string) => void;
}

export function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    sold: 'bg-red-100 text-red-800 border-red-200',
    rented: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const statusLabels = {
    available: 'متاح',
    sold: 'مباع',
    rented: 'مؤجر',
    pending: 'قيد الانتظار',
  };

  const typeLabels = {
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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* الصورة */}
      <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Badge الحالة */}
        <div className="absolute top-3 right-3">
          <Badge className={`${statusColors[property.status]} border`}>
            {statusLabels[property.status]}
          </Badge>
        </div>

        {/* Badge النوع */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {typeLabels[property.type]}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* العنوان */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">
            {property.title}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 ml-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.city} - {property.district}</span>
          </div>
        </div>

        {/* السعر */}
        <div className="py-2 border-t border-b border-gray-100">
          <p className="text-2xl font-bold text-[#0066CC]">
            {formatPrice(property.price)}
          </p>
        </div>

        {/* التفاصيل */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Ruler className="w-4 h-4" />
            <span>{property.area} م²</span>
          </div>
          
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/dashboard/properties/${property.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <Eye className="w-4 h-4 ml-2" />
            عرض التفاصيل
          </Button>
        </Link>
        
        <Link href={`/dashboard/properties/${property.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        
        {onDelete && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(property.id)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}