'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * صفحة قوالب Excel - Templates Page
 * ═══════════════════════════════════════════════════════════════
 * 
 * صفحة لعرض وإدارة قوالب Excel الجاهزة والمخصصة للعملاء
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TemplatesGallery } from '@/components/customers/templates/TemplatesGallery'
import { CustomTemplateCreator } from '@/components/customers/templates/CustomTemplateCreator'
import { MyTemplates } from '@/components/customers/templates/MyTemplates'
import { PREDEFINED_TEMPLATES } from '@/types/template'
import type { Template } from '@/types/template'
import { toast } from 'sonner'

export default function CustomersTemplatesPage() {
  const router = useRouter()
  
  // حالة القوالب المخصصة
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  
  // حالة نافذة إنشاء قالب مخصص
  const [showCustomCreator, setShowCustomCreator] = useState(false)
  
  // حالة القالب المراد تعديله
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  
  /**
   * حفظ قالب مخصص جديد
   */
  const handleSaveCustomTemplate = (template: Omit<Template, 'id' | 'createdAt'>) => {
    const newTemplate: Template = {
      ...template,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    setCustomTemplates(prev => [...prev, newTemplate])
    setShowCustomCreator(false)
    toast.success('تم حفظ القالب بنجاح')
  }
  
  /**
   * تحديث قالب مخصص
   */
  const handleUpdateCustomTemplate = (template: Template) => {
    setCustomTemplates(prev => 
      prev.map(t => t.id === template.id ? { ...template, updatedAt: new Date().toISOString() } : t)
    )
    setEditingTemplate(null)
    setShowCustomCreator(false)
    toast.success('تم تحديث القالب بنجاح')
  }
  
  /**
   * حذف قالب مخصص
   */
  const handleDeleteCustomTemplate = (templateId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId))
      toast.success('تم حذف القالب بنجاح')
    }
  }
  
  /**
   * تعديل قالب مخصص
   */
  const handleEditCustomTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowCustomCreator(true)
  }
  
  // القوالب الجاهزة مع IDs
  const predefinedTemplates: Template[] = PREDEFINED_TEMPLATES.map((t, i) => ({
    ...t,
    id: `predefined-${i}`,
    createdAt: new Date().toISOString()
  }))
  
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
              قوالب Excel للعملاء
            </h1>
            <p className="text-gray-600 mt-1">
              قوالب جاهزة ومخصصة لاستيراد بيانات العملاء
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => {
            setEditingTemplate(null)
            setShowCustomCreator(true)
          }}
          className="bg-[#0066CC] hover:bg-[#0052A3]"
        >
          <Plus className="w-5 h-5 ml-2" />
          إنشاء قالب مخصص
        </Button>
      </div>
      
      {/* معلومات توجيهية */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">إرشادات القوالب:</p>
            <ul className="space-y-1">
              <li>• اختر قالباً جاهزاً حسب نوع العملاء أو أنشئ قالباً مخصصاً</li>
              <li>• القوالب تحتوي على data validation وأمثلة توضيحية</li>
              <li>• يمكنك تحميل القوالب بتنسيق Excel أو CSV</li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* القوالب الجاهزة */}
      <div>
        <h2 className="text-xl font-semibold mb-4">القوالب الجاهزة</h2>
        <TemplatesGallery templates={predefinedTemplates} />
      </div>
      
      {/* القوالب المخصصة */}
      {customTemplates.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">قوالبي المخصصة</h2>
          <MyTemplates
            templates={customTemplates}
            onEdit={handleEditCustomTemplate}
            onDelete={handleDeleteCustomTemplate}
          />
        </div>
      )}
      
      {/* نافذة إنشاء/تعديل قالب مخصص */}
      {showCustomCreator && (
        <CustomTemplateCreator
          template={editingTemplate}
          onSave={editingTemplate ? handleUpdateCustomTemplate : handleSaveCustomTemplate}
          onCancel={() => {
            setShowCustomCreator(false)
            setEditingTemplate(null)
          }}
        />
      )}
    </div>
  )
}
