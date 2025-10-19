'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { useAppointmentsStore } from '@/store/appointments-store';
import { getAppointment } from '@/lib/api/appointments';

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { selectedAppointment, setSelectedAppointment, setLoading } = useAppointmentsStore();

  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const data = await getAppointment(params.id);
        setSelectedAppointment(data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('حدث خطأ في تحميل بيانات الموعد');
        router.push('/dashboard/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [params.id]);

  return <AppointmentForm appointment={selectedAppointment} />;
}
