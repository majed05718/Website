'use client';

import { useRouter } from 'next/navigation';
import { FileText, Eye, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CustomerContract } from '@/types/customer';
import { formatCurrency, formatDate } from '@/lib/customers-utils';

interface CustomerContractsListProps {
  contracts: CustomerContract[];
  customerId: string;
}

export function CustomerContractsList({ contracts }: CustomerContractsListProps) {
  const router = useRouter();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'نشط',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      pending: 'قيد الانتظار',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      buyer: 'مشتري',
      seller: 'بائع',
      tenant: 'مستأجر',
      landlord: 'مؤجر',
    };
    return labels[role] || role;
  };

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          لا توجد عقود
        </h3>
        <p className="mt-2 text-gray-600">
          لم يتم إنشاء أي عقود لهذا العميل بعد
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <div
          key={contract.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">
                  عقد رقم {contract.contractNumber}
                </h4>
                <Badge className={getStatusColor(contract.status)}>
                  {getStatusLabel(contract.status)}
                </Badge>
                <Badge variant="outline">
                  {getRoleLabel(contract.role)}
                </Badge>
              </div>
              <p className="text-gray-600">{contract.propertyTitle}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/contracts/${contract.contractId}`)}
            >
              <Eye className="ml-2 h-4 w-4" />
              عرض
            </Button>
          </div>

          {/* Contract Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">نوع العقد</p>
              <p className="font-medium text-gray-900">{contract.contractType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">المبلغ الإجمالي</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(contract.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">المدفوع</p>
              <p className="font-medium text-green-600">
                {formatCurrency(contract.paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">المتبقي</p>
              <p className="font-medium text-red-600">
                {formatCurrency(contract.remainingAmount)}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>من: {formatDate(contract.startDate)}</span>
            </div>
            {contract.endDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>إلى: {formatDate(contract.endDate)}</span>
              </div>
            )}
          </div>

          {/* Next Payment */}
          {contract.nextPaymentDate && contract.nextPaymentAmount && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              <span className="text-gray-700">
                الدفعة القادمة:{' '}
                <span className="font-medium">
                  {formatCurrency(contract.nextPaymentAmount)}
                </span>
                {' '}في{' '}
                <span className="font-medium">
                  {formatDate(contract.nextPaymentDate)}
                </span>
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
