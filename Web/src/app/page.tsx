// web/src/app/page.tsx (محدث مع status check)
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [dbStatus, setDbStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  useEffect(() => {
    // Check API health
    const checkApiHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          const response = await fetch(`${apiUrl}/health`);
          setApiStatus(response.ok ? 'online' : 'offline');
        } else {
          setApiStatus('offline');
        }
      } catch (error) {
        setApiStatus('offline');
      }
    };

    // Check DB connection
    const checkDbHealth = async () => {
      try {
        const { error } = await supabase.from('offices').select('count', { count: 'exact', head: true });
        setDbStatus(error ? 'offline' : 'online');
      } catch (error) {
        setDbStatus('offline');
      }
    };

    checkApiHealth();
    checkDbHealth();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '✓ متاح';
      case 'offline': return '✗ غير متاح';
      default: return '⟳ جاري التحقق...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          🏢 نظام إدارة العقارات
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          منصة شاملة لإدارة العقارات والمستأجرين والصيانة
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🏠</div>
            <h3 className="font-semibold text-lg mb-2">إدارة العقارات</h3>
            <p className="text-gray-600">تتبع ومراقبة جميع عقاراتك</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="font-semibold text-lg mb-2">إدارة المستأجرين</h3>
            <p className="text-gray-600">متابعة العقود والمدفوعات</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🔧</div>
            <h3 className="font-semibold text-lg mb-2">طلبات الصيانة</h3>
            <p className="text-gray-600">تتبع وحل مشاكل الصيانة</p>
          </div>
        </div>

        <div className="space-x-4 space-x-reverse mb-8">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            البدء الآن
          </button>
          <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            تعرف أكثر
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-lg mb-4">حالة النظام</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>API الخدمة:</span>
              <span className={getStatusColor(apiStatus)}>
                {getStatusText(apiStatus)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>قاعدة البيانات:</span>
              <span className={getStatusColor(dbStatus)}>
                {getStatusText(dbStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>مدعوم بـ Next.js 14 و Supabase</p>
        </div>
      </div>
    </div>
  );
}
