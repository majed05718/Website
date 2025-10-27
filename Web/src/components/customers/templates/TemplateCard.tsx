'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Template Card - بطاقة القالب
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لعرض معلومات قالب واحد مع أزرار التحميل
 */

import { useState } from 'react'
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
  FileSpreadsheet, 
  Home, 
  Key, 
  ShoppingCart, 
  Zap,
  ChevronDown,
  CheckCircle
} from 'lucide-react'
import { downloadTemplate } from '@/lib/export/template-generator'
import type { Template, TemplateDownloadOptions } from '@/types/template'
import { toast } from 'sonner'

interface TemplateCardProps {
  template: Template
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  
  /**
   * الحصول على أيقونة القالب
   */
  const getIcon = () => {
    switch (template.icon) {
      case 'Home':
        return <Home className="w-8 h-8" />
      case 'ShoppingCart':
        return <ShoppingCart className="w-8 h-8" />
      case 'Key':
        return <Key className="w-8 h-8" />
      case 'Zap':
        return <Zap className="w-8 h-8" />
      default:
        return <FileSpreadsheet className="w-8 h-8" />
    }
  }
  
  /**
   * الحصول على لون القالب
   */
  const getColor = () => {
    switch (template.type) {
      case 'buyers':
        return 'text-green-600 bg-green-50'
      case 'sellers':
        return 'text-blue-600 bg-blue-50'
      case 'tenants':
        return 'text-purple-600 bg-purple-50'
      case 'quick':
        return 'text-amber-600 bg-amber-50'
      default:
        return 'text-[#0066CC] bg-blue-50'
    }
  }
  
  /**
   * تحميل القالب
   */
  const handleDownload = async (options: TemplateDownloadOptions) => {
    setIsDownloading(true)
    
    try {
      await downloadTemplate(template, options)
      toast.success(`تم تحميل ${template.name} بنجاح`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('حدث خطأ أثناء التحميل')
    } finally {
      setIsDownloading(false)
    }
  }
  
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* أيقونة القالب */}
        <div className={`p-4 rounded-lg ${getColor()}`}>
          {getIcon()}
        </div>
        
        {/* معلومات القالب */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
          
          {/* الإحصائيات */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{template.columnsCount} عمود</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{template.fields.filter(f => f.required).length} مطلوب</span>
            </div>
          </div>
          
          {/* أزرار التحميل */}
          <div className="flex gap-2">
            {/* تحميل سريع (Excel مع أمثلة) */}
            <Button
              onClick={() => handleDownload({
                format: 'xlsx',
                includeExamples: true,
                includeInstructions: true,
                includeValidation: true
              })}
              disabled={isDownloading}
              className="bg-[#0066CC] hover:bg-[#0052A3]"
            >
              <Download className="w-4 h-4 ml-2" />
              {isDownloading ? 'جاري التحميل...' : 'تحميل'}
            </Button>
            
            {/* خيارات تحميل إضافية */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isDownloading}>
                  خيارات
                  <ChevronDown className="w-4 h-4 mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleDownload({
                    format: 'xlsx',
                    includeExamples: false,
                    includeInstructions: false,
                    includeValidation: true
                  })}
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  Excel (فارغ)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload({
                    format: 'csv',
                    includeExamples: true,
                    includeInstructions: false,
                    includeValidation: false
                  })}
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  CSV (مع أمثلة)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDownload({
                    format: 'csv',
                    includeExamples: false,
                    includeInstructions: false,
                    includeValidation: false
                  })}
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  CSV (فارغ)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* قائمة الحقول (مخفية افتراضياً) */}
      <details className="mt-4 pt-4 border-t">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-[#0066CC]">
          عرض الحقول ({template.fields.length})
        </summary>
        <div className="mt-3 space-y-1">
          {template.fields.map((field, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{index + 1}.</span>
              <span>{field.label}</span>
              {field.required && (
                <span className="text-red-500 text-xs">*</span>
              )}
              {field.type === 'dropdown' && (
                <span className="text-xs text-gray-500">
                  ({field.options?.join(', ')})
                </span>
              )}
            </div>
          ))}
        </div>
      </details>
    </Card>
  )
}
