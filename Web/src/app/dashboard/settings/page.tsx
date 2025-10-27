'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Settings Page - صفحة الإعدادات
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building,
  Palette,
  Bell,
  Users,
  Plug,
  Shield,
  Database,
  Settings as SettingsIcon
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('office')
  const [isSaving, setIsSaving] = useState(false)

  // Office Info State
  const [officeInfo, setOfficeInfo] = useState({
    name: 'مكتب العقارات المميز',
    phone: '+966501234567',
    email: 'info@realestate.com',
    address: 'الرياض، حي الملقا، شارع الأمير تركي',
    description: 'نحن نقدم أفضل الخدمات العقارية...'
  })

  /**
   * حفظ الإعدادات
   */
  const handleSave = () => {
    setIsSaving(true)
    // TODO: Save to API
    setTimeout(() => {
      toast.success('تم حفظ الإعدادات بنجاح')
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-600 mt-1">إدارة جميع إعدادات النظام</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="office">
            <Building className="w-4 h-4 ml-2" />
            معلومات المكتب
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 ml-2" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 ml-2" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="w-4 h-4 ml-2" />
            الموظفون
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="w-4 h-4 ml-2" />
            التكاملات
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 ml-2" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="w-4 h-4 ml-2" />
            النسخ الاحتياطي
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <SettingsIcon className="w-4 h-4 ml-2" />
            متقدم
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: معلومات المكتب */}
        <TabsContent value="office">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">معلومات المكتب</h2>
            <div className="space-y-6 max-w-2xl">
              {/* اسم المكتب */}
              <div>
                <Label htmlFor="office-name">اسم المكتب *</Label>
                <Input
                  id="office-name"
                  value={officeInfo.name}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, name: e.target.value })}
                />
              </div>

              {/* الشعار */}
              <div>
                <Label>الشعار</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building className="w-12 h-12 text-gray-400" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">رفع شعار</Button>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG - Max 2MB</p>
                  </div>
                </div>
              </div>

              {/* الهاتف */}
              <div>
                <Label htmlFor="phone">الهاتف *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={officeInfo.phone}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, phone: e.target.value })}
                />
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={officeInfo.email}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, email: e.target.value })}
                />
              </div>

              {/* العنوان */}
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  rows={3}
                  value={officeInfo.address}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, address: e.target.value })}
                />
              </div>

              {/* الوصف */}
              <div>
                <Label htmlFor="description">وصف المكتب</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={officeInfo.description}
                  onChange={(e) => setOfficeInfo({ ...officeInfo, description: e.target.value })}
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: المظهر */}
        <TabsContent value="appearance">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">إعدادات المظهر</h2>
            <div className="space-y-6 max-w-2xl">
              <p className="text-gray-600">قريباً...</p>
              <p className="text-sm text-gray-500">
                ستتمكن من تخصيص الألوان، الخطوط، والثيم (فاتح/داكن)
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: الإشعارات */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">إعدادات الإشعارات</h2>
            <div className="space-y-6 max-w-2xl">
              <p className="text-gray-600">قريباً...</p>
              <p className="text-sm text-gray-500">
                ستتمكن من تخصيص الإشعارات (في التطبيق، بريد، SMS)
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: الموظفون */}
        <TabsContent value="staff">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">إدارة الموظفين</h2>
            <div className="space-y-6">
              <p className="text-gray-600">قريباً...</p>
              <p className="text-sm text-gray-500">
                ستتمكن من إضافة وإدارة الموظفين والصلاحيات
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 5: التكاملات */}
        <TabsContent value="integrations">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">التكاملات</h2>
            <div className="space-y-6">
              <p className="text-gray-600">قريباً...</p>
              <p className="text-sm text-gray-500">
                ستتمكن من ربط WhatsApp، Google Maps، SMTP، SMS
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 6: الأمان */}
        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">الأمان</h2>
            <div className="space-y-6">
              <p className="text-gray-600">قريباً...</p>
              <p className="text-sm text-gray-500">
                ستتمكن من تغيير كلمة المرور، 2FA، مراجعة الجلسات
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 7: النسخ الاحتياطي */}
        <TabsContent value="backup">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">النسخ الاحتياطي</h2>
            <div className="space-y-6">
              <p className="text-gray-600">قريباً...</p>
              <p className="text-sm text-gray-500">
                ستتمكن من إنشاء نسخ احتياطية يدوية وتلقائية
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 8: متقدم */}
        <TabsContent value="advanced">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">إعدادات متقدمة</h2>
            <div className="space-y-6">
              <p className="text-gray-600">قريباً...</p>
              <p className="text-sm text-gray-500">
                Database، API، Webhooks، Debug Mode
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
