'use client';

import { Phone, Users, Eye, FileText, DollarSign, AlertCircle, MessageSquare, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CustomerInteraction, InteractionType } from '@/types/customer';
import { formatDate, formatRelativeTime } from '@/lib/customers-utils';

interface CustomerInteractionsListProps {
  interactions: CustomerInteraction[];
  onRefresh?: () => void;
}

export function CustomerInteractionsList({ interactions }: CustomerInteractionsListProps) {
  const getInteractionIcon = (type: InteractionType) => {
    const icons: Record<InteractionType, any> = {
      call: Phone,
      meeting: Users,
      property_viewing: Eye,
      contract_signing: FileText,
      payment: DollarSign,
      complaint: AlertCircle,
      inquiry: MessageSquare,
      follow_up: Calendar,
    };
    return icons[type] || MessageSquare;
  };

  const getInteractionLabel = (type: InteractionType) => {
    const labels: Record<InteractionType, string> = {
      call: 'اتصال هاتفي',
      meeting: 'اجتماع',
      property_viewing: 'معاينة عقار',
      contract_signing: 'توقيع عقد',
      payment: 'دفعة',
      complaint: 'شكوى',
      inquiry: 'استفسار',
      follow_up: 'متابعة',
    };
    return labels[type] || type;
  };

  const getInteractionColor = (type: InteractionType) => {
    const colors: Record<InteractionType, string> = {
      call: 'bg-blue-100 text-blue-800',
      meeting: 'bg-purple-100 text-purple-800',
      property_viewing: 'bg-green-100 text-green-800',
      contract_signing: 'bg-indigo-100 text-indigo-800',
      payment: 'bg-emerald-100 text-emerald-800',
      complaint: 'bg-red-100 text-red-800',
      inquiry: 'bg-yellow-100 text-yellow-800',
      follow_up: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (interactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          لا توجد تعاملات
        </h3>
        <p className="mt-2 text-gray-600">
          لم يتم تسجيل أي تعاملات مع هذا العميل بعد
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Interactions */}
        <div className="space-y-6">
          {interactions.map((interaction, index) => {
            const Icon = getInteractionIcon(interaction.type);
            
            return (
              <div key={interaction.id} className="relative pr-14">
                {/* Icon Circle */}
                <div className={`absolute right-0 w-12 h-12 rounded-full ${getInteractionColor(interaction.type).replace('text-', 'bg-').replace('-800', '-100')} flex items-center justify-center z-10`}>
                  <Icon className={`h-5 w-5 ${getInteractionColor(interaction.type).split(' ')[1]}`} />
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getInteractionColor(interaction.type)}>
                        {getInteractionLabel(interaction.type)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatRelativeTime(interaction.date)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(interaction.date)}
                    </span>
                  </div>

                  <p className="text-gray-900 mb-2">{interaction.description}</p>

                  {/* Property or Contract Link */}
                  {(interaction.propertyTitle || interaction.contractId) && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      {interaction.propertyTitle && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{interaction.propertyTitle}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outcome */}
                  {interaction.outcome && (
                    <div className="p-2 bg-gray-50 rounded text-sm text-gray-700 mb-2">
                      <span className="font-medium">النتيجة:</span> {interaction.outcome}
                    </div>
                  )}

                  {/* Next Follow Up */}
                  {interaction.nextFollowUp && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-gray-700">
                        متابعة في: <span className="font-medium">{formatDate(interaction.nextFollowUp)}</span>
                      </span>
                    </div>
                  )}

                  {/* Staff Name */}
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                    <span>بواسطة: {interaction.staffName}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
