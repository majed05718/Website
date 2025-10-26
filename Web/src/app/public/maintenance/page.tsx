'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Public Maintenance Portal - بوابة الصيانة العامة
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wrench,
  CheckCircle,
  Copy,
  Search,
  Upload,
  Zap,
  Droplet,
  Wind,
  Hammer,
  Paintbrush,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import type { IssueType } from '@/types/maintenance'
import { ISSUE_TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/types/maintenance'

export default function PublicMaintenancePage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [generatedTrackingCode, setGeneratedTrackingCode] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    propertyCode: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    issueType: '' as IssueType,
    description: ''
  })

  /**
   * إرسال الطلب
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // TODO: Submit to API
    const code = 'TRACK-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    setGeneratedTrackingCode(code)
    setShowSuccess(true)
    
    toast.success('تم إرسال طلبك بنجاح!')
  }

  /**
   * تتبع الطلب
   */
  const handleTrack = () => {
    setIsTracking(true)
    
    // TODO: Call API
    setTimeout(() => {
      setTrackingInfo({
        requestNumber: 'REQ-2025-0001',
        trackingCode: trackingCode,
        status: 'in_progress',
        assignedToName: 'خالد السعيد',
        expectedDate: '2025-10-27',
        timeline: [
          { label: 'تم استلام الطلب', date: '2025-10-26 10:00', completed: true },
          { label: 'تم تعيين فني', date: '2025-10-26 11:30', completed: true },
          { label: 'قيد التنفيذ', date: '2025-10-26 14:00', completed: true },
          { label: 'الإنجاز المتوقع', date: '2025-10-27 10:00', completed: false }
        ]
      })
      setIsTracking(false)
    }, 1000)
  }

  /**
   * نسخ رمز التتبع
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTrackingCode)
    toast.success('تم نسخ رقم المتابعة')
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تم استلام طلبك بنجاح!
          </h1>
          <p className="text-gray-600 mb-6">
            سنتواصل معك قريباً
          </p>

          {/* Tracking Code */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">رقم المتابعة</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-blue-600">
                {generatedTrackingCode}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              احفظ هذا الرقم لتتبع طلبك
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={() => {
              setShowSuccess(false)
              setFormData({
                propertyCode: '',
                tenantName: '',
                tenantPhone: '',
                tenantEmail: '',
                issueType: '' as IssueType,
                description: ''
              })
            }}>
              إرسال طلب آخر
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowSuccess(false)
                setTrackingCode(generatedTrackingCode)
              }}
            >
              تتبع طلبك
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            طلب صيانة
          </h1>
          <p className="text-gray-600">
            نحن هنا لخدمتك على مدار الساعة
          </p>
        </div>

        {/* Form */}
        <Card className="max-w-2xl mx-auto p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* رقم العقار */}
            <div>
              <Label htmlFor="propertyCode">رقم العقار/الوحدة *</Label>
              <Input
                id="propertyCode"
                placeholder="PROP-XXXX"
                value={formData.propertyCode}
                onChange={(e) => setFormData({ ...formData, propertyCode: e.target.value })}
                required
              />
            </div>

            {/* اسم المستأجر */}
            <div>
              <Label htmlFor="tenantName">اسم المستأجر *</Label>
              <Input
                id="tenantName"
                placeholder="الاسم الكامل"
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                required
              />
            </div>

            {/* رقم الهاتف */}
            <div>
              <Label htmlFor="tenantPhone">رقم الهاتف *</Label>
              <Input
                id="tenantPhone"
                type="tel"
                placeholder="05XXXXXXXX"
                value={formData.tenantPhone}
                onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                required
              />
            </div>

            {/* الإيميل */}
            <div>
              <Label htmlFor="tenantEmail">البريد الإلكتروني</Label>
              <Input
                id="tenantEmail"
                type="email"
                placeholder="example@domain.com"
                value={formData.tenantEmail}
                onChange={(e) => setFormData({ ...formData, tenantEmail: e.target.value })}
              />
            </div>

            {/* نوع المشكلة */}
            <div>
              <Label>نوع المشكلة *</Label>
              <Select
                value={formData.issueType}
                onValueChange={(value) => setFormData({ ...formData, issueType: value as IssueType })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المشكلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electrical">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>كهرباء</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="plumbing">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4" />
                      <span>سباكة</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ac">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      <span>تكييف</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="carpentry">
                    <div className="flex items-center gap-2">
                      <Hammer className="w-4 h-4" />
                      <span>نجارة</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="painting">
                    <div className="flex items-center gap-2">
                      <Paintbrush className="w-4 h-4" />
                      <span>دهان</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>عام</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal className="w-4 h-4" />
                      <span>أخرى</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* وصف المشكلة */}
            <div>
              <Label htmlFor="description">وصف المشكلة *</Label>
              <Textarea
                id="description"
                placeholder="اشرح المشكلة بالتفصيل..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                minLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                الحد الأدنى: 20 حرف
              </p>
            </div>

            {/* الصور */}
            <div>
              <Label>الصور (اختياري)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  اضغط لرفع الصور أو اسحبها هنا
                </p>
                <p className="text-xs text-gray-500">
                  حد أقصى 5 صور، كل صورة 5MB
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg">
              إرسال الطلب
            </Button>
          </form>
        </Card>

        {/* Track Request Section */}
        <Card className="max-w-2xl mx-auto p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            تتبع طلب صيانة
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="رقم المتابعة (TRACK-XXXXX)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
            <Button onClick={handleTrack} disabled={isTracking}>
              <Search className="w-4 h-4 ml-2" />
              تتبع
            </Button>
          </div>

          {/* Tracking Info */}
          {trackingInfo && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">رقم الطلب</p>
                  <p className="font-bold">{trackingInfo.requestNumber}</p>
                </div>
                <Badge className={STATUS_COLORS[trackingInfo.status]}>
                  {STATUS_LABELS[trackingInfo.status]}
                </Badge>
              </div>

              {/* Timeline */}
              <div className="border-r-2 border-gray-200 pr-4 space-y-4">
                {trackingInfo.timeline.map((item: any, index: number) => (
                  <div key={index} className="relative">
                    <div className={`absolute -right-[21px] w-4 h-4 rounded-full ${
                      item.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              {trackingInfo.assignedToName && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">المسؤول</p>
                  <p className="font-medium">{trackingInfo.assignedToName}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
