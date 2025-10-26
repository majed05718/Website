'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Custom Template Creator - منشئ القوالب المخصصة
 * ═══════════════════════════════════════════════════════════════
 * 
 * نافذة لإنشاء وتعديل القوالب المخصصة
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { 
  Save, 
  X, 
  Eye,
  GripVertical,
  CheckSquare,
  Square,
  FileSpreadsheet
} from 'lucide-react'
import { AVAILABLE_TEMPLATE_FIELDS } from '@/types/template'
import type { Template, TemplateField } from '@/types/template'
import { toast } from 'sonner'

interface CustomTemplateCreatorProps {
  template: Template | null
  onSave: (template: any) => void
  onCancel: () => void
}

export function CustomTemplateCreator({ 
  template, 
  onSave, 
  onCancel 
}: CustomTemplateCreatorProps) {
  const isEditing = !!template
  
  // حالة النموذج
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [selectedFields, setSelectedFields] = useState<TemplateField[]>(
    template?.fields || []
  )
  const [showPreview, setShowPreview] = useState(false)
  
  /**
   * تحديد/إلغاء تحديد حقل
   */
  const toggleField = (field: TemplateField) => {
    if (selectedFields.some(f => f.key === field.key)) {
      // إلغاء التحديد (إلا إذا كان مطلوباً)
      if (field.required) {
        toast.error('لا يمكن إلغاء الحقول المطلوبة')
        return
      }
      setSelectedFields(selectedFields.filter(f => f.key !== field.key))
    } else {
      // إضافة
      setSelectedFields([...selectedFields, field])
    }
  }
  
  /**
   * تحديد الكل
   */
  const selectAll = () => {
    setSelectedFields([...AVAILABLE_TEMPLATE_FIELDS])
  }
  
  /**
   * إلغاء الكل (إلا المطلوب)
   */
  const deselectAll = () => {
    setSelectedFields(AVAILABLE_TEMPLATE_FIELDS.filter(f => f.required))
  }
  
  /**
   * نقل حقل لأعلى في الترتيب
   */
  const moveFieldUp = (index: number) => {
    if (index === 0) return
    const newFields = [...selectedFields]
    const temp = newFields[index]
    newFields[index] = newFields[index - 1]
    newFields[index - 1] = temp
    setSelectedFields(newFields)
  }
  
  /**
   * نقل حقل لأسفل في الترتيب
   */
  const moveFieldDown = (index: number) => {
    if (index === selectedFields.length - 1) return
    const newFields = [...selectedFields]
    const temp = newFields[index]
    newFields[index] = newFields[index + 1]
    newFields[index + 1] = temp
    setSelectedFields(newFields)
  }
  
  /**
   * حفظ القالب
   */
  const handleSave = () => {
    // التحقق من الحقول
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم القالب')
      return
    }
    
    if (selectedFields.length === 0) {
      toast.error('يرجى اختيار حقل واحد على الأقل')
      return
    }
    
    // إنشاء القالب
    const templateData = {
      ...(isEditing ? { id: template.id, userId: template.userId } : {}),
      name: name.trim(),
      nameEn: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || 'قالب مخصص',
      type: 'custom' as const,
      icon: 'FileSpreadsheet',
      fields: selectedFields,
      columnsCount: selectedFields.length,
      isCustom: true
    }
    
    onSave(templateData)
  }
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'تعديل القالب المخصص' : 'إنشاء قالب مخصص'}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            قم بإنشاء قالب Excel مخصص حسب احتياجاتك
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* معلومات القالب */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">اسم القالب *</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: قالب عملاء VIP"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="template-description">الوصف</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للقالب..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            {/* اختيار الحقول */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>اختيار الحقول ({selectedFields.length})</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    <CheckSquare className="w-4 h-4 ml-1" />
                    الكل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                  >
                    <Square className="w-4 h-4 ml-1" />
                    إلغاء
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-3">
                  {AVAILABLE_TEMPLATE_FIELDS.map((field) => {
                    const isSelected = selectedFields.some(f => f.key === field.key)
                    
                    return (
                      <div
                        key={field.key}
                        className="flex items-start space-x-3 space-x-reverse"
                      >
                        <Checkbox
                          id={`field-${field.key}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleField(field)}
                          disabled={field.required}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`field-${field.key}`}
                            className="cursor-pointer"
                          >
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 mr-1">*</span>
                            )}
                          </Label>
                          {field.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {field.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          {/* ترتيب الحقول ومعاينة */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>ترتيب الأعمدة</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 ml-1" />
                  {showPreview ? 'إخفاء' : 'معاينة'}
                </Button>
              </div>
              
              <ScrollArea className="h-[400px] border rounded-lg p-3">
                {selectedFields.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">لم يتم اختيار أي حقول بعد</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedFields.map((field, index) => (
                      <div
                        key={field.key}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100"
                      >
                        {/* Handle للـ drag */}
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveFieldUp(index)}
                            disabled={index === 0}
                          >
                            ▲
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => moveFieldDown(index)}
                            disabled={index === selectedFields.length - 1}
                          >
                            ▼
                          </Button>
                        </div>
                        
                        {/* معلومات الحقل */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-400">
                              {index + 1}.
                            </span>
                            <span className="font-medium">{field.label}</span>
                            {field.required && (
                              <span className="text-red-500 text-xs">*</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {field.type === 'dropdown' && field.options && (
                              <span>خيارات: {field.options.join(', ')}</span>
                            )}
                            {field.type !== 'dropdown' && (
                              <span>نوع: {field.type}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* معاينة */}
            {showPreview && selectedFields.length > 0 && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-sm mb-2 text-blue-900">
                  معاينة ترتيب الأعمدة:
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  {selectedFields.map((field, index) => (
                    <div key={field.key}>
                      {index + 1}. {field.label}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 ml-2" />
            إلغاء
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#0066CC] hover:bg-[#0052A3]"
            disabled={!name.trim() || selectedFields.length === 0}
          >
            <Save className="w-4 h-4 ml-2" />
            {isEditing ? 'تحديث' : 'حفظ'} القالب
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
