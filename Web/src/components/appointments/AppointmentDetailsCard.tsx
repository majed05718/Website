'use client';

import { Clock, MapPin, User, Building2, Phone, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types/appointment';
import {
  getAppointmentTypeLabel,
  getAppointmentTypeColor,
  getAppointmentStatusLabel,
  getAppointmentStatusColor,
  formatTime,
  formatDateArabic,
} from '@/lib/appointments-utils';

interface AppointmentDetailsCardProps {
  appointment: Appointment;
}

export function AppointmentDetailsCard({ appointment }: AppointmentDetailsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{appointment.title}</h2>
        <div className="flex items-center gap-2">
          <Badge className={getAppointmentTypeColor(appointment.type)}>
            {getAppointmentTypeLabel(appointment.type)}
          </Badge>
          <Badge className={getAppointmentStatusColor(appointment.status)}>
            {getAppointmentStatusLabel(appointment.status)}
          </Badge>
        </div>
      </div>

      {/* Description */}
      {appointment.description && (
        <div className="border-t pt-4">
          <p className="text-gray-700">{appointment.description}</p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
        {/* Date & Time */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            التاريخ والوقت
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">التاريخ:</span>
              <span className="font-medium text-gray-900">{formatDateArabic(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </span>
              <span className="text-gray-400">({appointment.duration} دقيقة)</span>
            </div>
          </div>
        </div>

        {/* Location */}
        {(appointment.location || appointment.meetingLink) && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              الموقع
            </h3>
            <div className="space-y-2 text-sm">
              {appointment.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">{appointment.location}</span>
                </div>
              )}
              {appointment.meetingLink && (
                <div>
                  <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    رابط الاجتماع الافتراضي
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property */}
        {appointment.propertyTitle && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              العقار
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-900">{appointment.propertyTitle}</div>
              {appointment.propertyAddress && (
                <div className="text-gray-600">{appointment.propertyAddress}</div>
              )}
            </div>
          </div>
        )}

        {/* Customer */}
        {appointment.customerName && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              العميل
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-900">{appointment.customerName}</div>
              {appointment.customerPhone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{appointment.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            ملاحظات
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
        </div>
      )}

      {/* Completion Notes */}
      {appointment.completionNotes && (
        <div className="border-t pt-4 bg-green-50 -mx-6 -mb-6 p-6 rounded-b-lg">
          <h3 className="font-semibold text-gray-900 mb-2">ملاحظات الإنجاز</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.completionNotes}</p>
        </div>
      )}

      {/* Cancellation Info */}
      {appointment.status === 'cancelled' && appointment.cancellationReason && (
        <div className="border-t pt-4 bg-red-50 -mx-6 -mb-6 p-6 rounded-b-lg">
          <h3 className="font-semibold text-gray-900 mb-2">سبب الإلغاء</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.cancellationReason}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-4 text-xs text-gray-500 flex justify-between">
        <div>الموظف المسؤول: {appointment.assignedStaffName}</div>
        <div>تم الإنشاء: {new Date(appointment.createdAt).toLocaleString('ar-SA')}</div>
      </div>
    </div>
  );
}
