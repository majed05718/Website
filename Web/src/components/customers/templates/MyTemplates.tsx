'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * My Templates - قوالبي المخصصة
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لعرض وإدارة القوالب المخصصة للمستخدم
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Download, 
  Edit, 
  Trash2, 
  MoreVertical,
  FileSpreadsheet,
  Calendar
} from 'lucide-react'
import { downloadTemplate } from '@/lib/export/template-generator'
import type { Template } from '@/types/template'
import { toast } from 'sonner'

interface MyTemplatesProps {
  templates: Template[]
  onEdit: (template: Template) => void
  onDelete: (templateId: string) => void
}

export function MyTemplates({ templates, onEdit, onDelete }: MyTemplatesProps) {
  /**
   * تنسيق التاريخ
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  /**
   * تحميل قالب
   */
  const handleDownload = async (template: Template) => {
    try {
      await downloadTemplate(template, {
        format: 'xlsx',
        includeExamples: true,
        includeInstructions: true,
        includeValidation: true
      })
      toast.success(`تم تحميل ${template.name} بنجاح`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('حدث خطأ أثناء التحميل')
    }
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#0066CC]" />
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {template.description || 'قالب مخصص'}
              </p>
              
              {/* معلومات */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>{template.columnsCount} عمود</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(template.createdAt)}
                </span>
              </div>
              
              {/* أزرار */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDownload(template)}
                  className="bg-[#0066CC] hover:bg-[#0052A3]"
                >
                  <Download className="w-4 h-4 ml-1" />
                  تحميل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(template)}
                >
                  <Edit className="w-4 h-4 ml-1" />
                  تعديل
                </Button>
              </div>
            </div>
            
            {/* قائمة الإجراءات */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(template.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  )
}
