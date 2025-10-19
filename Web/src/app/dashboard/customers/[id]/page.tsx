'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileText,
  Home,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CustomerInfoCard } from '@/components/customers/CustomerInfoCard';
import { CustomerPropertiesList } from '@/components/customers/CustomerPropertiesList';
import { CustomerContractsList } from '@/components/customers/CustomerContractsList';
import { CustomerInteractionsList } from '@/components/customers/CustomerInteractionsList';
import { CustomerNotesList } from '@/components/customers/CustomerNotesList';
import { AddNoteDialog } from '@/components/customers/AddNoteDialog';
import { AddInteractionDialog } from '@/components/customers/AddInteractionDialog';
import { useCustomersStore } from '@/store/customers-store';
import { getCustomer, deleteCustomer } from '@/lib/api/customers';

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  
  const { 
    selectedCustomer: customer, 
    isLoading,
    setSelectedCustomer,
    setLoading,
    setError,
    removeCustomer,
  } = useCustomersStore();

  const [details, setDetails] = useState<{
    properties: any[];
    contracts: any[];
    interactions: any[];
    notes: any[];
  } | null>(null);

  // Fetch customer details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCustomer(params.id);
        setSelectedCustomer(response.customer);
        setDetails({
          properties: response.properties,
          contracts: response.contracts,
          interactions: response.interactions,
          notes: response.notes,
        });
      } catch (error) {
        console.error('Error fetching customer:', error);
        setError('حدث خطأ في تحميل بيانات العميل');
        toast.error('حدث خطأ في تحميل بيانات العميل');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(params.id);
      removeCustomer(params.id);
      toast.success('تم حذف العميل بنجاح');
      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('حدث خطأ في حذف العميل');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const refreshData = async () => {
    try {
      const response = await getCustomer(params.id);
      setSelectedCustomer(response.customer);
      setDetails({
        properties: response.properties,
        contracts: response.contracts,
        interactions: response.interactions,
        notes: response.notes,
      });
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات العميل...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">لم يتم العثور على العميل</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard/customers')}>
          العودة للعملاء
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/customers')}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600 mt-1">تفاصيل العميل</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
          >
            <Edit className="ml-2 h-4 w-4" />
            تعديل
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <CustomerInfoCard customer={customer} />

      {/* Tabs */}
      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="properties" className="gap-2">
            <Home className="h-4 w-4" />
            العقارات ({details?.properties.length || 0})
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileText className="h-4 w-4" />
            العقود ({details?.contracts.length || 0})
          </TabsTrigger>
          <TabsTrigger value="interactions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            التعاملات ({details?.interactions.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            الملاحظات ({details?.notes.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <CustomerPropertiesList 
            properties={details?.properties || []}
            customerId={customer.id}
            onRefresh={refreshData}
          />
        </TabsContent>

        <TabsContent value="contracts">
          <CustomerContractsList 
            contracts={details?.contracts || []}
            customerId={customer.id}
          />
        </TabsContent>

        <TabsContent value="interactions">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddInteraction(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة تعامل جديد
              </Button>
            </div>
            <CustomerInteractionsList 
              interactions={details?.interactions || []}
              onRefresh={refreshData}
            />
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddNote(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة ملاحظة جديدة
              </Button>
            </div>
            <CustomerNotesList 
              notes={details?.notes || []}
              customerId={customer.id}
              onRefresh={refreshData}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف العميل <strong>{customer.name}</strong>؟
              <br />
              <span className="text-red-600 font-medium">
                تحذير: سيتم حذف جميع البيانات المرتبطة بهذا العميل بما في ذلك العقود والملاحظات.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف نهائي'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Note Dialog */}
      <AddNoteDialog
        open={showAddNote}
        onOpenChange={setShowAddNote}
        customerId={customer.id}
        onSuccess={refreshData}
      />

      {/* Add Interaction Dialog */}
      <AddInteractionDialog
        open={showAddInteraction}
        onOpenChange={setShowAddInteraction}
        customerId={customer.id}
        onSuccess={refreshData}
      />
    </div>
  );
}
