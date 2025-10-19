'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Home,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Star,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { deleteCustomer } from '@/lib/api/customers';
import { useCustomersStore } from '@/store/customers-store';

interface CustomerCardProps {
  customer: Customer;
  viewMode: 'grid' | 'list';
  onRefresh?: () => void;
}

export function CustomerCard({ customer, viewMode, onRefresh }: CustomerCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeCustomer } = useCustomersStore();

  const valueTier = getCustomerValueTier(customer);
  const avatarColor = getAvatarColor(customer.id);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(customer.id);
      removeCustomer(customer.id);
      toast.success('تم حذف العميل بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('حدث خطأ في حذف العميل');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between gap-4">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {getInitials(customer.name)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {customer.name}
                  </h3>
                  {customer.rating && (
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm mr-1">{customer.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {formatPhoneNumber(customer.phone)}
                  {customer.email && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={getCustomerTypeColor(customer.type)}>
                {getCustomerTypeLabel(customer.type)}
              </Badge>
              <Badge className={getCustomerStatusColor(customer.status)}>
                {getCustomerStatusLabel(customer.status)}
              </Badge>
              {valueTier.tier === 'VIP' && (
                <Badge className="bg-purple-100 text-purple-800">
                  {valueTier.label}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm flex-shrink-0">
              <div className="text-center">
                <div className="font-bold text-gray-900">{customer.propertiesCount || 0}</div>
                <div className="text-gray-600">عقار</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{customer.contractsCount || 0}</div>
                <div className="text-gray-600">عقد</div>
              </div>
              {customer.totalSpent && (
                <div className="text-center">
                  <div className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</div>
                  <div className="text-gray-600">إجمالي</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                  <Eye className="ml-2 h-4 w-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف العميل <strong>{customer.name}</strong>؟
                <br />
                سيتم حذف جميع البيانات المرتبطة بهذا العميل.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Grid View
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold`}>
                {getInitials(customer.name)}
              </div>
              <div>
                <h3 
                  className="font-semibold text-gray-900 hover:text-primary cursor-pointer"
                  onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                >
                  {customer.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  {customer.rating && (
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="mr-1">{customer.rating}</span>
                    </div>
                  )}
                  <span className={`text-xs ${valueTier.color}`}>
                    {valueTier.label}
                  </span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                  <Eye className="ml-2 h-4 w-4" />
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getCustomerTypeColor(customer.type)}>
              {getCustomerTypeLabel(customer.type)}
            </Badge>
            <Badge className={getCustomerStatusColor(customer.status)}>
              {getCustomerStatusLabel(customer.status)}
            </Badge>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 ml-2" />
              {formatPhoneNumber(customer.phone)}
            </div>
            {customer.email && (
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 ml-2" />
                {customer.email}
              </div>
            )}
            {customer.city && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 ml-2" />
                {customer.city}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center text-primary mb-1">
                <Home className="h-4 w-4" />
              </div>
              <div className="font-bold text-gray-900">{customer.propertiesCount || 0}</div>
              <div className="text-xs text-gray-600">عقار</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-primary mb-1">
                <FileText className="h-4 w-4" />
              </div>
              <div className="font-bold text-gray-900">{customer.contractsCount || 0}</div>
              <div className="text-xs text-gray-600">عقد</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-primary mb-1">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="font-bold text-gray-900">{customer.activeContractsCount || 0}</div>
              <div className="text-xs text-gray-600">نشط</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 ml-1" />
              {customer.lastContactDate 
                ? formatRelativeTime(customer.lastContactDate)
                : 'لم يتم التواصل'}
            </div>
            {customer.totalSpent && (
              <div className="font-medium text-green-600">
                {formatCurrency(customer.totalSpent)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف العميل <strong>{customer.name}</strong>؟
              <br />
              سيتم حذف جميع البيانات المرتبطة بهذا العميل.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
