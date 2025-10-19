'use client';

import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  User,
  Tag,
  Star,
  Building2,
  FileText,
  Home,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Customer } from '@/types/customer';
import {
  getCustomerTypeLabel,
  getCustomerTypeColor,
  getCustomerStatusLabel,
  getCustomerStatusColor,
  formatPhoneNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
  getCustomerValueTier,
} from '@/lib/customers-utils';

interface CustomerInfoCardProps {
  customer: Customer;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  const valueTier = getCustomerValueTier(customer);
  const avatarColor = getAvatarColor(customer.id);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}>
            {getInitials(customer.name)}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {customer.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getCustomerTypeColor(customer.type)}>
                    {getCustomerTypeLabel(customer.type)}
                  </Badge>
                  <Badge className={getCustomerStatusColor(customer.status)}>
                    {getCustomerStatusLabel(customer.status)}
                  </Badge>
                  {valueTier.tier === 'VIP' && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Star className="h-3 w-3 ml-1 fill-current" />
                      {valueTier.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {customer.rating ? (
                    <div className="flex items-center text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= customer.rating! ? 'fill-current' : ''
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 mr-2">
                        ({customer.rating})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">لا يوجد تقييم</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              معلومات الاتصال
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {formatPhoneNumber(customer.phone)}
                </span>
              </div>
              
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{customer.email}</span>
                </div>
              )}
              
              {customer.city && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{customer.city}</span>
                </div>
              )}
              
              {customer.address && (
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">{customer.address}</span>
                </div>
              )}
              
              {customer.nationalId && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    الهوية: {customer.nationalId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              الإحصائيات
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">العقارات</span>
                </div>
                <span className="font-bold text-blue-600">
                  {customer.propertiesCount || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">العقود</span>
                </div>
                <span className="font-bold text-green-600">
                  {customer.contractsCount || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-700">العقود النشطة</span>
                </div>
                <span className="font-bold text-purple-600">
                  {customer.activeContractsCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Financial & Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              المعلومات المالية
            </h3>
            
            <div className="space-y-3">
              {customer.totalSpent !== undefined && customer.totalSpent > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">إجمالي المدفوع</div>
                  <div className="font-bold text-green-600 text-lg">
                    {formatCurrency(customer.totalSpent)}
                  </div>
                </div>
              )}
              
              {customer.totalEarned !== undefined && customer.totalEarned > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">إجمالي المكتسب</div>
                  <div className="font-bold text-blue-600 text-lg">
                    {formatCurrency(customer.totalEarned)}
                  </div>
                </div>
              )}
              
              {customer.outstandingBalance !== undefined && customer.outstandingBalance > 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">الرصيد المستحق</div>
                  <div className="font-bold text-red-600 text-lg">
                    {formatCurrency(customer.outstandingBalance)}
                  </div>
                </div>
              )}
              
              <div className="pt-3 border-t space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>تاريخ الإضافة:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
                
                {customer.lastContactDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>آخر تواصل:</span>
                    <span className="font-medium text-gray-900">
                      {formatRelativeTime(customer.lastContactDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {customer.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-900 mb-2">ملاحظات:</h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {customer.notes}
            </p>
          </div>
        )}

        {/* Source & Assigned Staff */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
          {customer.source && (
            <div>
              <span className="text-gray-600">المصدر:</span>
              <span className="font-medium text-gray-900 mr-2">
                {customer.source}
              </span>
            </div>
          )}
          {customer.assignedStaffName && (
            <div>
              <span className="text-gray-600">الموظف المسؤول:</span>
              <span className="font-medium text-gray-900 mr-2">
                {customer.assignedStaffName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
