'use client';

import { useRouter } from 'next/navigation';
import { Clock, MapPin, User, Building2, Phone, MoreVertical, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Appointment } from '@/types/appointment';
import {
  getAppointmentTypeLabel,
  getAppointmentTypeColor,
  getAppointmentStatusLabel,
  getAppointmentStatusColor,
  formatTime,
  isPast,
} from '@/lib/appointments-utils';
import { deleteAppointment } from '@/lib/api/appointments';
import { useAppointmentsStore } from '@/store/appointments-store';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusUpdate?: (id: string, status: string) => void;
  onRefresh?: () => void;
}

export function AppointmentCard({ appointment, onStatusUpdate, onRefresh }: AppointmentCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeAppointment } = useAppointmentsStore();
  
  const isExpired = isPast(appointment.date, appointment.endTime);

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;

    setIsDeleting(true);
    try {
      await deleteAppointment(appointment.id);
      removeAppointment(appointment.id);
      toast.success('تم حذف الموعد بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('حدث خطأ في حذف الموعد');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 
              className="font-semibold text-gray-900 cursor-pointer hover:text-primary"
              onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
            >
              {appointment.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getAppointmentTypeColor(appointment.type)}>
              {getAppointmentTypeLabel(appointment.type)}
            </Badge>
            <Badge className={getAppointmentStatusColor(appointment.status)}>
              {getAppointmentStatusLabel(appointment.status)}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isDeleting}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}>
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/appointments/${appointment.id}/edit`)}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            {appointment.status === 'scheduled' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onStatusUpdate?.(appointment.id, 'confirmed')}>
                  <CheckCircle className="ml-2 h-4 w-4" />
                  تأكيد الموعد
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusUpdate?.(appointment.id, 'cancelled')}>
                  <XCircle className="ml-2 h-4 w-4" />
                  إلغاء الموعد
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 ml-2" />
          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
          <span className="mr-2 text-gray-400">({appointment.duration} دقيقة)</span>
        </div>

        {appointment.propertyTitle && (
          <div className="flex items-center text-gray-600">
            <Building2 className="h-4 w-4 ml-2" />
            <span className="truncate">{appointment.propertyTitle}</span>
          </div>
        )}

        {appointment.customerName && (
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 ml-2" />
            <span>{appointment.customerName}</span>
            {appointment.customerPhone && (
              <>
                <span className="mx-1">•</span>
                <Phone className="h-3 w-3 ml-1" />
                <span className="text-xs">{appointment.customerPhone}</span>
              </>
            )}
          </div>
        )}

        {appointment.location && (
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 ml-2" />
            <span className="truncate">{appointment.location}</span>
          </div>
        )}

        {appointment.assignedStaffName && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            الموظف: {appointment.assignedStaffName}
          </div>
        )}
      </div>
    </div>
  );
}
