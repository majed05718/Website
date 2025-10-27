'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * صفحة تصدير العملاء - Customers Export Page
 * ═══════════════════════════════════════════════════════════════
 * 
 * صفحة متقدمة لتصدير بيانات العملاء إلى Excel/CSV/PDF
 * مع خيارات تخصيص شاملة ومعاينة قبل التصدير
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExportOptions } from '@/components/customers/export/ExportOptions'
import { ColumnSelector } from '@/components/customers/export/ColumnSelector'
import { FormatOptions } from '@/components/customers/export/FormatOptions'
import { ExportPreview } from '@/components/customers/export/ExportPreview'
import { ExportHistory } from '@/components/customers/export/ExportHistory'
import { ExportProgress } from '@/components/customers/export/ExportProgress'
import { exportCustomersToFile } from '@/lib/export/customer-exporter'
import { toast } from 'sonner'
import type { ExportConfig, ExportFormat } from '@/types/export'

export default function CustomersExportPage() {
  const router = useRouter()
  
  // حالة التصدير
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  
  // إعدادات التصدير
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    // خيارات التصدير
    exportType: 'all', // all | selected | filtered | date-range
    selectedIds: [],
    dateRange: {
      from: '',
      to: ''
    },
    
    // الأعمدة المحددة
    columns: [
      'name',
      'phone',
      'email',
      'type',
      'status',
      'city',
      'source',
      'createdAt'
    ],
    
    // تنسيق الملف
    format: 'xlsx' as ExportFormat,
    
    // خيارات التنسيق
    styling: {
      includeHeader: true,
      includeLogo: false,
      includeOfficeInfo: false,
      autoNumbering: true,
      includeStats: false
    }
  })
  
  /**
   * تحديث إعدادات التصدير
   */
  const updateConfig = (updates: Partial<ExportConfig>) => {
    setExportConfig(prev => ({ ...prev, ...updates }))
  }
  
  /**
   * معاينة قبل التصدير
   */
  const handlePreview = () => {
    // التحقق من اختيار أعمدة على الأقل
    if (exportConfig.columns.length === 0) {
      toast.error('يرجى اختيار عمود واحد على الأقل')
      return
    }
    
    setShowPreview(true)
    toast.success('جاري تحضير المعاينة...')
  }
  
  /**
   * تصدير البيانات
   */
  const handleExport = async () => {
    // التحقق من الإعدادات
    if (exportConfig.columns.length === 0) {
      toast.error('يرجى اختيار عمود واحد على الأقل')
      return
    }
    
    if (exportConfig.exportType === 'selected' && exportConfig.selectedIds.length === 0) {
      toast.error('يرجى اختيار عملاء للتصدير')
      return
    }
    
    if (exportConfig.exportType === 'date-range') {
      if (!exportConfig.dateRange.from || !exportConfig.dateRange.to) {
        toast.error('يرجى تحديد نطاق زمني')
        return
      }
    }
    
    setIsExporting(true)
    setExportProgress(0)
    
    try {
      // محاكاة التقدم
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)
      
      // تنفيذ التصدير
      await exportCustomersToFile(exportConfig, (progress) => {
        setExportProgress(progress)
      })
      
      clearInterval(progressInterval)
      setExportProgress(100)
      
      // إظهار رسالة نجاح
      toast.success(`تم تصدير العملاء بنجاح كملف ${exportConfig.format.toUpperCase()}`)
      
      // إعادة تعيين بعد ثانيتين
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
      }, 2000)
      
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'حدث خطأ أثناء التصدير')
      setIsExporting(false)
      setExportProgress(0)
    }
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/customers')}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-[#0066CC]" />
              تصدير العملاء
            </h1>
            <p className="text-gray-600 mt-1">
              صدّر بيانات العملاء إلى Excel أو CSV أو PDF
            </p>
          </div>
        </div>
      </div>
      
      {/* معلومات توجيهية */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">إرشادات التصدير:</p>
            <ul className="space-y-1">
              <li>• اختر نوع التصدير والأعمدة المطلوبة</li>
              <li>• يمكنك معاينة البيانات قبل التصدير</li>
              <li>• سيتم حفظ آخر 5 عمليات تصدير لإعادة التحميل</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الإعدادات - العمود الأيسر */}
        <div className="lg:col-span-2 space-y-6">
          {/* خيارات التصدير */}
          <ExportOptions
            config={exportConfig}
            onConfigChange={updateConfig}
          />
          
          {/* اختيار الأعمدة */}
          <ColumnSelector
            selectedColumns={exportConfig.columns}
            onColumnsChange={(columns) => updateConfig({ columns })}
          />
          
          {/* خيارات التنسيق */}
          <FormatOptions
            format={exportConfig.format}
            styling={exportConfig.styling}
            onFormatChange={(format) => updateConfig({ format })}
            onStylingChange={(styling) => updateConfig({ 
              styling: { ...exportConfig.styling, ...styling } 
            })}
          />
        </div>
        
        {/* معاينة والإجراءات - العمود الأيمن */}
        <div className="space-y-6">
          {/* أزرار الإجراءات */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">إجراءات التصدير</h3>
            <div className="space-y-3">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="w-full"
                disabled={isExporting || exportConfig.columns.length === 0}
              >
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                معاينة
              </Button>
              
              <Button
                onClick={handleExport}
                className="w-full bg-[#0066CC] hover:bg-[#0052A3]"
                disabled={isExporting || exportConfig.columns.length === 0}
              >
                <Download className="w-4 h-4 ml-2" />
                {isExporting ? 'جاري التصدير...' : 'تصدير'}
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard/customers')}
                variant="ghost"
                className="w-full"
                disabled={isExporting}
              >
                إلغاء
              </Button>
            </div>
            
            {/* ملخص الإعدادات */}
            <div className="mt-6 pt-6 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">نوع التصدير:</span>
                <span className="font-medium">
                  {exportConfig.exportType === 'all' && 'الكل'}
                  {exportConfig.exportType === 'selected' && 'المحدد'}
                  {exportConfig.exportType === 'filtered' && 'حسب الفلتر'}
                  {exportConfig.exportType === 'date-range' && 'نطاق زمني'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عدد الأعمدة:</span>
                <span className="font-medium">{exportConfig.columns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تنسيق الملف:</span>
                <span className="font-medium uppercase">{exportConfig.format}</span>
              </div>
            </div>
          </Card>
          
          {/* سجل التصديرات */}
          <ExportHistory />
        </div>
      </div>
      
      {/* شريط التقدم */}
      {isExporting && (
        <ExportProgress
          progress={exportProgress}
          total={100}
          isComplete={exportProgress === 100}
        />
      )}
      
      {/* المعاينة */}
      {showPreview && (
        <ExportPreview
          config={exportConfig}
          onClose={() => setShowPreview(false)}
          onExport={handleExport}
        />
      )}
    </div>
  )
}
