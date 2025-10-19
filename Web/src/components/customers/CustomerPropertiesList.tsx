'use client';

import { useRouter } from 'next/navigation';
import { Home, Eye, MapPin, DollarSign, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CustomerProperty } from '@/types/customer';
import { formatCurrency, formatDate } from '@/lib/customers-utils';
import { unlinkCustomerFromProperty } from '@/lib/api/customers';

interface CustomerPropertiesListProps {
  properties: CustomerProperty[];
  customerId: string;
  onRefresh?: () => void;
}

export function CustomerPropertiesList({ 
  properties, 
  customerId,
  onRefresh 
}: CustomerPropertiesListProps) {
  const router = useRouter();

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      owner: 'مالك',
      tenant: 'مستأجر',
      interested: 'مهتم',
      viewed: 'شاهد العقار',
    };
    return labels[relationship] || relationship;
  };

  const getRelationshipColor = (relationship: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-blue-100 text-blue-800',
      tenant: 'bg-green-100 text-green-800',
      interested: 'bg-yellow-100 text-yellow-800',
      viewed: 'bg-gray-100 text-gray-800',
    };
    return colors[relationship] || 'bg-gray-100 text-gray-800';
  };

  const handleUnlink = async (propertyId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء ربط هذا العقار؟')) return;

    try {
      await unlinkCustomerFromProperty(customerId, propertyId);
      toast.success('تم إلغاء ربط العقار بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Unlink error:', error);
      toast.error('حدث خطأ في إلغاء ربط العقار');
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <Home className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          لا توجد عقارات مرتبطة
        </h3>
        <p className="mt-2 text-gray-600">
          لم يتم ربط أي عقارات بهذا العميل بعد
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* Property Image */}
            {property.propertyImage ? (
              <img
                src={property.propertyImage}
                alt={property.propertyTitle}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="h-8 w-8 text-gray-400" />
              </div>
            )}

            {/* Property Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 
                    className="font-semibold text-gray-900 hover:text-primary cursor-pointer"
                    onClick={() => router.push(`/dashboard/properties/${property.propertyId}`)}
                  >
                    {property.propertyTitle}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {property.propertyType}
                  </p>
                </div>
                <Badge className={getRelationshipColor(property.relationship)}>
                  {getRelationshipLabel(property.relationship)}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{property.propertyStatus}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-gray-900">
                    {formatCurrency(property.propertyPrice)}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-6 text-xs text-gray-500">
                {property.startDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>من: {formatDate(property.startDate)}</span>
                  </div>
                )}
                {property.endDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>إلى: {formatDate(property.endDate)}</span>
                  </div>
                )}
                {property.viewedAt && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>شوهد: {formatDate(property.viewedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/properties/${property.propertyId}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnlink(property.propertyId)}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
