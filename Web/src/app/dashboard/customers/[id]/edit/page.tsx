'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useCustomersStore } from '@/store/customers-store';
import { getCustomer } from '@/lib/api/customers';

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { selectedCustomer, setSelectedCustomer, setLoading } = useCustomersStore();

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const response = await getCustomer(params.id);
        setSelectedCustomer(response.customer);
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error('حدث خطأ في تحميل بيانات العميل');
        router.push('/dashboard/customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [params.id]);

  return <CustomerForm customer={selectedCustomer} />;
}
