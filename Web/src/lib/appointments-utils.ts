import type { AppointmentType, AppointmentStatus, Appointment } from '@/types/appointment';

export function getAppointmentTypeLabel(type: AppointmentType): string {
  const labels: Record<AppointmentType, string> = {
    viewing: 'معاينة عقار',
    meeting: 'اجتماع',
    contract_signing: 'توقيع عقد',
    handover: 'تسليم عقار',
    inspection: 'فحص عقار',
    other: 'أخرى',
  };
  return labels[type] || type;
}

export function getAppointmentTypeColor(type: AppointmentType): string {
  const colors: Record<AppointmentType, string> = {
    viewing: 'bg-blue-100 text-blue-800',
    meeting: 'bg-purple-100 text-purple-800',
    contract_signing: 'bg-green-100 text-green-800',
    handover: 'bg-orange-100 text-orange-800',
    inspection: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    scheduled: 'مجدول',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    no_show: 'لم يحضر',
  };
  return labels[status] || status;
}

export function getAppointmentStatusColor(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function formatTime(time: string): string {
  // Convert 24h to 12h format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'م' : 'ص';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatDateArabic(date: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('ar-SA', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function isToday(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
}

export function isTomorrow(date: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date === tomorrow.toISOString().split('T')[0];
}

export function isPast(date: string, time: string): boolean {
  const appointmentDate = new Date(`${date}T${time}`);
  return appointmentDate < new Date();
}

export function getRelativeDateLabel(date: string): string {
  if (isToday(date)) return 'اليوم';
  if (isTomorrow(date)) return 'غداً';
  
  const appointmentDate = new Date(date);
  const today = new Date();
  const diffTime = appointmentDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === -1) return 'أمس';
  if (diffDays > 0 && diffDays <= 7) return `بعد ${diffDays} أيام`;
  if (diffDays < 0 && diffDays >= -7) return `منذ ${Math.abs(diffDays)} أيام`;
  
  return formatDateShort(date);
}

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  // Add days from previous month
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek; i > 0; i--) {
    const day = new Date(year, month, 1 - i);
    days.push(day);
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length; // 6 rows × 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

export function groupAppointmentsByDate(appointments: Appointment[]): Record<string, Appointment[]> {
  return appointments.reduce((acc, appointment) => {
    const date = appointment.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);
}

export function sortAppointmentsByTime(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });
}

export function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
}

export function getTimeSlots(startHour: number = 8, endHour: number = 20, interval: number = 30): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
}
