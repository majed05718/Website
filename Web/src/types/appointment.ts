export type AppointmentType = 'viewing' | 'meeting' | 'contract_signing' | 'handover' | 'inspection' | 'other';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type ReminderType = 'whatsapp' | 'sms' | 'email' | 'notification';

export interface Appointment {
  id: string;
  officeId: string;
  
  // معلومات أساسية
  title: string;
  description?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  
  // التوقيت
  date: string;              // YYYY-MM-DD
  startTime: string;         // HH:MM
  endTime: string;           // HH:MM
  duration: number;          // بالدقائق
  
  // الارتباطات
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  
  // الموظف المسؤول
  assignedStaffId: string;
  assignedStaffName: string;
  
  // الموقع
  location?: string;
  meetingLink?: string;      // للاجتماعات الافتراضية
  
  // التذكيرات
  reminders?: AppointmentReminder[];
  
  // ملاحظات
  notes?: string;
  completionNotes?: string;  // ملاحظات بعد الإنجاز
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  type: ReminderType;
  minutesBefore: number;     // 15, 30, 60, 1440 (يوم)
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface AppointmentFormData {
  title: string;
  description?: string;
  type: AppointmentType;
  date: string;
  startTime: string;
  endTime: string;
  propertyId?: string;
  customerId?: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  reminders?: number[];      // [15, 60, 1440]
}

export interface AppointmentFilters {
  search?: string;
  type?: AppointmentType | 'all';
  status?: AppointmentStatus | 'all';
  assignedStaffId?: string;
  propertyId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AppointmentsResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CalendarDay {
  date: string;
  appointments: Appointment[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  todayAppointments: number;
  upcomingThisWeek: number;
  completionRate: number;
}
