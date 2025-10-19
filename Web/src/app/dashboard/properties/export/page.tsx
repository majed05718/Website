'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { exportProperties } from '@/lib/api/excel'
import { toast } from 'sonner'

const EXPORTABLE_FIELDS = [
  { id: 'title', label: 'العنوان', required: true },
  { id: 'description', label: 'الوصف', required: false },
  { id: 'property_type', label: 'نوع العقار', required: true },
  { id: 'listing_type', label: 'نوع العرض', required: true },
  { id: 'price', label: 'السعر', required: true },
  { id: 'area', label: 'المساحة', required: false },
  { id: 'bedrooms', label: 'غرف النوم', required: false },
  { id: 'bathrooms', label: 'دورات المياه', required: false },
  { id: 'city', label: 'المدينة', required: false },
  { id: 'district', label: 'الحي', required: false },
  { id: 'location', label: 'الموقع', required: false },
  { id: 'status', label: 'الحالة', required: false },
  { id: 'created_at', label: 'تاريخ الإضافة', required: false },
]

export default function ExportPropertiesPage() {
  const router = useRouter()
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORTABLE_FIELDS.filter(f => f.required).map(f => f.id)
  )
  const [isExporting, setIsExporting] = useState(false)

  const toggleField = (fieldId: string) => {
    const field = EXPORTABLE_FIELDS.find(f => f.id === fieldId)
    if (field?.required) return // Can't uncheck required fields
    
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const selectAll = () => {
    setSelectedFields(EXPORTABLE_FIELDS.map(f => f.id))
  }

  const selectRequired = () => {
    setSelectedFields(EXPORTABLE_FIELDS.filter(f => f.required).map(f => f.id))
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      await exportProperties({ fields: selectedFields })
      toast.success('تم تصدير العقارات بنجاح')
    } catch (error: any) {
      toast.error(error.message || 'فشل تصدير العقارات')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span 
            className="hover:text-primary cursor-pointer"
            onClick={() => router.push('/dashboard/properties')}
          >
            العقارات
          </span>
          <span>/</span>
          <span>تصدير إلى Excel</span>
        </div>
        <h1 className="text-3xl font-bold">تصدير العقارات إلى Excel</h1>
        <p className="text-muted-foreground mt-1">
          اختر الحقول التي تريد تصديرها
        </p>
      </div>

      <div className="space-y-6">
        {/* Field Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">اختيار الحقول</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectRequired}>
                  الحقول المطلوبة فقط
                </Button>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  تحديد الكل
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {EXPORTABLE_FIELDS.map(field => (
                <div key={field.id} className="flex items-center gap-3">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                    disabled={field.required}
                  />
                  <Label
                    htmlFor={field.id}
                    className={`cursor-pointer ${field.required ? 'font-medium' : ''}`}
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-xs text-red-500 mr-1">*</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              تم تحديد {selectedFields.length} من {EXPORTABLE_FIELDS.length} حقل
            </p>
          </div>
        </Card>

        {/* Export Options */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">خيارات التصدير</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">تنسيق الملف</p>
                  <p className="text-sm text-muted-foreground">Excel (.xlsx)</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">عدد العقارات</p>
                  <p className="text-sm text-muted-foreground">جميع العقارات المتاحة</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/properties')}
            disabled={isExporting}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="flex-1"
          >
            {isExporting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 ml-2" />
                تصدير إلى Excel
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
