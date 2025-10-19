'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment } from '@/types/appointment';
import { groupAppointmentsByDate, sortAppointmentsByTime, formatDateArabic, getRelativeDateLabel } from '@/lib/appointments-utils';

interface AppointmentsListProps {
  appointments: Appointment[];
  onStatusUpdate?: (id: string, status: string) => void;
  onRefresh?: () => void;
}

export function AppointmentsList({ appointments, onStatusUpdate, onRefresh }: AppointmentsListProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          لا توجد مواعيد
        </h3>
        <p className="mt-2 text-gray-600">
          لم يتم العثور على مواعيد مطابقة للفلاتر
        </p>
      </div>
    );
  }

  const groupedAppointments = groupAppointmentsByDate(appointments);
  const sortedDates = Object.keys(groupedAppointments).sort();

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dayAppointments = sortAppointmentsByTime(groupedAppointments[date]);
        
        return (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 rounded-t-lg z-10">
              <h3 className="font-semibold text-gray-900">
                {formatDateArabic(date)}
                <span className="text-sm text-gray-500 mr-2">
                  ({getRelativeDateLabel(date)})
                </span>
                <span className="text-sm text-gray-400 mr-2">
                  - {dayAppointments.length} موعد
                </span>
              </h3>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusUpdate={onStatusUpdate}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
