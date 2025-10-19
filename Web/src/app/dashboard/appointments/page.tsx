'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { AppointmentsFilters } from '@/components/appointments/AppointmentsFilters';
import { AppointmentStats } from '@/components/appointments/AppointmentStats';
import { QuickAddDialog } from '@/components/appointments/QuickAddDialog';
import { StatusUpdateDialog } from '@/components/appointments/StatusUpdateDialog';
import { useAppointmentsStore } from '@/store/appointments-store';
import { 
  getAppointments, 
  getAppointmentStats, 
  getAppointmentsByDateRange,
  updateAppointmentStatus 
} from '@/lib/api/appointments';

export default function AppointmentsPage() {
  const router = useRouter();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<string | undefined>();
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);

  const {
    appointments,
    calendarAppointments,
    stats,
    filters,
    currentPage,
    isLoading,
    viewMode,
    selectedDate,
    setAppointments,
    setCalendarAppointments,
    setStats,
    setLoading,
    setError,
    updateAppointment,
  } = useAppointmentsStore();

  // Fetch appointments for list view
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAppointments(filters, currentPage, 50);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('حدث خطأ في تحميل المواعيد');
      toast.error('حدث خطأ في تحميل المواعيد');
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments for calendar view (monthly)
  const fetchCalendarAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const data = await getAppointmentsByDateRange(startDate, endDate);
      setCalendarAppointments(data);
    } catch (error) {
      console.error('Error fetching calendar appointments:', error);
      setError('حدث خطأ في تحميل المواعيد');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const statsData = await getAppointmentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Reload based on view mode
  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchCalendarAppointments();
    } else {
      fetchAppointments();
    }
  }, [viewMode, filters, currentPage, selectedDate]);

  // Handle quick add with specific date
  const handleQuickAdd = (date?: string) => {
    setQuickAddDate(date);
    setShowQuickAdd(true);
  };

  // Handle status update
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const updated = await updateAppointmentStatus(id, status);
      updateAppointment(id, updated);
      toast.success('تم تحديث حالة الموعد بنجاح');
      if (viewMode === 'calendar') {
        fetchCalendarAppointments();
      } else {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  const displayAppointments = viewMode === 'calendar' ? calendarAppointments : appointments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المواعيد</h1>
          <p className="text-gray-600 mt-1">
            إدارة وجدولة جميع المواعيد
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/appointments/new')}>
          <Plus className="ml-2 h-4 w-4" />
          موعد جديد
        </Button>
      </div>

      {/* Stats */}
      {stats && <AppointmentStats stats={stats} />}

      {/* Filters */}
      <AppointmentsFilters />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المواعيد...</p>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {!isLoading && (
        <>
          {viewMode === 'calendar' ? (
            <AppointmentCalendar
              appointments={calendarAppointments}
              selectedDate={selectedDate}
              onAddClick={handleQuickAdd}
              onStatusUpdate={handleStatusUpdate}
              onRefresh={fetchCalendarAppointments}
            />
          ) : (
            <AppointmentsList
              appointments={appointments}
              onStatusUpdate={handleStatusUpdate}
              onRefresh={fetchAppointments}
            />
          )}
        </>
      )}

      {/* Quick Add Dialog */}
      <QuickAddDialog
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        initialDate={quickAddDate}
        onSuccess={() => {
          setShowQuickAdd(false);
          if (viewMode === 'calendar') {
            fetchCalendarAppointments();
          } else {
            fetchAppointments();
          }
          fetchStats();
        }}
      />

      {/* Status Update Dialog */}
      {statusUpdateId && (
        <StatusUpdateDialog
          appointmentId={statusUpdateId}
          open={!!statusUpdateId}
          onOpenChange={() => setStatusUpdateId(null)}
          onSuccess={() => {
            setStatusUpdateId(null);
            if (viewMode === 'calendar') {
              fetchCalendarAppointments();
            } else {
              fetchAppointments();
            }
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
