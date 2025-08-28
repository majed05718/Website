// web/src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          🏢 نظام إدارة العقارات
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          منصة شاملة لإدارة العقارات والمستأجرين والصيانة
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">إدارة العقارات</h3>
            <p className="text-gray-600">تتبع ومراقبة جميع عقاراتك</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">إدارة المستأجرين</h3>
            <p className="text-gray-600">متابعة العقود والمدفوعات</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">طلبات الصيانة</h3>
            <p className="text-gray-600">تتبع وحل مشاكل الصيانة</p>
          </div>
        </div>
        <div className="mt-8 space-x-4">
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link 
            href="/register"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            إنشاء حساب
          </Link>
        </div>
      </div>
    </div>
  );
}
