'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/types/appointment';
import { getCalendarDays, groupAppointmentsByDate, sortAppointmentsByTime, formatTime, isToday } from '@/lib/appointments-utils';
import { AppointmentCard } from './AppointmentCard';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onAddClick?: (date: string) => void;
  onStatusUpdate?: (id: string, status: string) => void;
  onRefresh?: () => void;
}

export function AppointmentCalendar({ 
  appointments, 
  selectedDate: propSelectedDate,
  onDateSelect, 
  onAddClick,
  onStatusUpdate,
  onRefresh 
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(propSelectedDate || null);

  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
      setCurrentMonth(propSelectedDate);
    }
  }, [propSelectedDate]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const calendarDays = getCalendarDays(year, month);
  const appointmentsByDate = groupAppointmentsByDate(appointments);

  const weekDays = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    onDateSelect?.(today);
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    onDateSelect?.(day);
  };

  const getDayAppointments = (day: Date): Appointment[] => {
    const dateString = day.toISOString().split('T')[0];
    return appointmentsByDate[dateString] || [];
  };

  const selectedDayAppointments = selectedDate 
    ? sortAppointmentsByTime(getDayAppointments(selectedDate))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday}>
              اليوم
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayAppointments = getDayAppointments(day);
            const isCurrentMonth = day.getMonth() === month;
            const isDayToday = isToday(day.toISOString().split('T')[0]);
            const isSelected = selectedDate?.toDateString() === day.toDateString();

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  relative min-h-[80px] p-2 rounded-lg border transition-all
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${isDayToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                  ${isSelected ? 'ring-2 ring-primary' : ''}
                  ${isCurrentMonth ? 'hover:bg-gray-50' : 'opacity-50'}
                  ${dayAppointments.length > 0 ? 'cursor-pointer' : ''}
                `}
              >
                <div className="text-right">
                  <span className={`
                    text-sm font-medium
                    ${isDayToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center' : ''}
                    ${!isDayToday && isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {day.getDate()}
                  </span>
                </div>

                {dayAppointments.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs truncate px-1 py-0.5 bg-blue-100 text-blue-700 rounded"
                      >
                        {formatTime(apt.startTime)}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayAppointments.length - 2} أخرى
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {selectedDate ? (
              <>
                {weekDays[selectedDate.getDay()]}،{' '}
                {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
              </>
            ) : (
              'اختر يوماً'
            )}
          </h3>
          {selectedDate && (
            <Badge variant="outline">
              {selectedDayAppointments.length} موعد
            </Badge>
          )}
        </div>

        {selectedDate && onAddClick && (
          <Button 
            className="w-full mb-4" 
            onClick={() => onAddClick(selectedDate.toISOString().split('T')[0])}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            إضافة موعد
          </Button>
        )}

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {selectedDate ? (
            selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onStatusUpdate={onStatusUpdate}
                  onRefresh={onRefresh}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm">لا توجد مواعيد في هذا اليوم</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm">اختر يوماً لعرض المواعيد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
