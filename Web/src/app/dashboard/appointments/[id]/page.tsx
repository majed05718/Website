'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AppointmentDetailsCard } from '@/components/appointments/AppointmentDetailsCard';
import { CancelDialog } from '@/components/appointments/CancelDialog';
import { CompleteDialog } from '@/components/appointments/CompleteDialog';
import { useAppointmentsStore } from '@/store/appointments-store';
import { getAppointment, deleteAppointment } from '@/lib/api/appointments';
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

export default function AppointmentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { selectedAppointment, isLoading, setSelectedAppointment, setLoading, removeAppointment } = useAppointmentsStore();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getAppointment(params.id);
        setSelectedAppointment(data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('حدث خطأ في تحميل بيانات الموعد');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAppointment(params.id);
      removeAppointment(params.id);
      toast.success('تم حذف الموعد بنجاح');
      router.push('/dashboard/appointments');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('حدث خطأ في حذف الموعد');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الموعد...</p>
        </div>
      </div>
    );
  }

  if (!selectedAppointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">لم يتم العثور على الموعد</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/appointments')}>
          العودة للمواعيد
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/appointments')}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تفاصيل الموعد</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed' ? (
            <>
              <Button variant="outline" onClick={() => setShowCompleteDialog(true)} className="text-green-600">
                <CheckCircle className="ml-2 h-4 w-4" />
                إتمام
              </Button>
              <Button variant="outline" onClick={() => setShowCancelDialog(true)} className="text-red-600">
                <XCircle className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </>
          ) : null}
          <Button variant="outline" onClick={() => router.push(`/dashboard/appointments/${selectedAppointment.id}/edit`)}>
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      {/* Details Card */}
      <AppointmentDetailsCard appointment={selectedAppointment} />

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <CancelDialog
        appointmentId={selectedAppointment.id}
        appointmentTitle={selectedAppointment.title}
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onSuccess={() => router.push('/dashboard/appointments')}
      />

      {/* Complete Dialog */}
      <CompleteDialog
        appointmentId={selectedAppointment.id}
        appointmentTitle={selectedAppointment.title}
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onSuccess={() => router.push('/dashboard/appointments')}
      />
    </div>
  );
}
