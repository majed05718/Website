'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExcelUploader } from '@/components/properties/import/ExcelUploader'
import { ColumnMapper } from '@/components/properties/import/ColumnMapper'
import { DataPreview } from '@/components/properties/import/DataPreview'
import { validateImportData, transformToApiFormat } from '@/lib/excel/validator'
import { importProperties } from '@/lib/api/excel'
import { ParsedExcelData, ExcelColumn, ExcelError, ExcelWarning } from '@/types/excel'
import { toast } from 'sonner'

type ImportStep = 'upload' | 'mapping' | 'preview' | 'complete'

export default function ImportPropertiesPage() {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null)
  const [mappings, setMappings] = useState<ExcelColumn[]>([])
  const [errors, setErrors] = useState<ExcelError[]>([])
  const [warnings, setWarnings] = useState<ExcelWarning[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const handleFileProcessed = (data: ParsedExcelData) => {
    setParsedData(data)
    setCurrentStep('mapping')
  }

  const handleMappingComplete = (columnMappings: ExcelColumn[]) => {
    setMappings(columnMappings)
    
    if (!parsedData) return
    
    // Validate data
    const validation = validateImportData(parsedData.data, columnMappings)
    setErrors(validation.errors)
    setWarnings(validation.warnings)
    
    setCurrentStep('preview')
  }

  const handleConfirmImport = async () => {
    if (!parsedData) return
    
    setIsImporting(true)
    
    try {
      // Transform data to API format
      const properties = transformToApiFormat(parsedData.data, mappings)
      
      // Import via API
      const result = await importProperties(properties)
      
      setImportedCount(result.count || properties.length)
      setCurrentStep('complete')
      
      toast.success(`تم استيراد ${result.count || properties.length} عقار بنجاح`)
    } catch (error: any) {
      toast.error(error.message || 'فشل استيراد العقارات')
    } finally {
      setIsImporting(false)
    }
  }

  const handleCancel = () => {
    if (currentStep === 'upload') {
      router.push('/dashboard/properties')
    } else {
      setCurrentStep('upload')
      setParsedData(null)
      setMappings([])
      setErrors([])
      setWarnings([])
    }
  }

  const handleComplete = () => {
    router.push('/dashboard/properties')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
          <span>استيراد من Excel</span>
        </div>
        <h1 className="text-3xl font-bold">استيراد العقارات من Excel</h1>
        <p className="text-muted-foreground mt-1">
          قم بتحميل ملف Excel وسنقوم بمطابقة الأعمدة تلقائياً
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          {[
            { key: 'upload', label: 'رفع الملف', num: 1 },
            { key: 'mapping', label: 'ربط الأعمدة', num: 2 },
            { key: 'preview', label: 'معاينة', num: 3 },
            { key: 'complete', label: 'اكتمل', num: 4 }
          ].map((step, index) => {
            const isActive = currentStep === step.key
            const isCompleted = ['upload', 'mapping', 'preview', 'complete'].indexOf(currentStep) > 
                               ['upload', 'mapping', 'preview', 'complete'].indexOf(step.key)
            
            return (
              <div key={step.key} className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${isCompleted ? 'bg-green-600 text-white' : 
                      isActive ? 'bg-primary text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : step.num}
                  </div>
                  <span className={`font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`h-1 flex-1 rounded ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content based on step */}
      <div className="space-y-6">
        {currentStep === 'upload' && (
          <>
            <ExcelUploader onFileProcessed={handleFileProcessed} />
            
            {/* Instructions */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-900">إرشادات الاستيراد</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>تأكد من أن الصف الأول يحتوي على عناوين الأعمدة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>الحقول المطلوبة: العنوان، نوع العقار، نوع العرض، السعر</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>استخدم "شقة"، "فيلا"، "أرض"، أو "تجاري" لنوع العقار</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>استخدم "بيع" أو "إيجار" لنوع العرض</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>الأرقام يجب أن تكون بصيغة رقمية (بدون فواصل أو رموز)</span>
                </li>
              </ul>
            </Card>
          </>
        )}

        {currentStep === 'mapping' && parsedData && (
          <ColumnMapper
            columns={parsedData.headers}
            onMappingComplete={handleMappingComplete}
          />
        )}

        {currentStep === 'preview' && parsedData && (
          <DataPreview
            data={parsedData.data}
            mappings={mappings}
            errors={errors}
            warnings={warnings}
            onConfirm={handleConfirmImport}
            onCancel={handleCancel}
            isImporting={isImporting}
          />
        )}

        {currentStep === 'complete' && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">تم الاستيراد بنجاح!</h2>
              <p className="text-muted-foreground">
                تم استيراد {importedCount} عقار إلى النظام
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                  استيراد المزيد
                </Button>
                <Button onClick={handleComplete}>
                  العودة للعقارات
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Footer Actions */}
      {currentStep !== 'complete' && currentStep !== 'preview' && (
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleCancel}>
            إلغاء
          </Button>
        </div>
      )}
    </div>
  )
}
