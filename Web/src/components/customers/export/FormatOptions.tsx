'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Format Options - خيارات التنسيق
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لاختيار تنسيق الملف وخيارات التنسيق
 */

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { FileSpreadsheet, FileText, FileType, Settings } from 'lucide-react'
import type { ExportFormat, ExportStyling } from '@/types/export'

interface FormatOptionsProps {
  format: ExportFormat
  styling: ExportStyling
  onFormatChange: (format: ExportFormat) => void
  onStylingChange: (styling: Partial<ExportStyling>) => void
}

export function FormatOptions({
  format,
  styling,
  onFormatChange,
  onStylingChange
}: FormatOptionsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-[#0066CC]" />
        خيارات التنسيق
      </h3>
      
      <div className="space-y-6">
        {/* نوع الملف */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            نوع الملف
          </Label>
          <RadioGroup
            value={format}
            onValueChange={(value) => onFormatChange(value as ExportFormat)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="xlsx" id="format-xlsx" />
              <Label
                htmlFor="format-xlsx"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Excel (.xlsx)</div>
                  <div className="text-sm text-gray-600">
                    ملف Excel كامل مع التنسيق والألوان
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="csv" id="format-csv" />
              <Label
                htmlFor="format-csv"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">CSV (.csv)</div>
                  <div className="text-sm text-gray-600">
                    ملف نصي بسيط يمكن فتحه في أي برنامج
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="pdf" id="format-pdf" />
              <Label
                htmlFor="format-pdf"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <FileType className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium">PDF (.pdf)</div>
                  <div className="text-sm text-gray-600">
                    ملف PDF للطباعة أو المشاركة
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* خيارات التنسيق (للـ Excel و PDF فقط) */}
        {(format === 'xlsx' || format === 'pdf') && (
          <div>
            <Label className="text-base font-medium mb-3 block">
              خيارات التنسيق
            </Label>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 space-x-reverse">
                <Checkbox
                  id="includeHeader"
                  checked={styling.includeHeader}
                  onCheckedChange={(checked) => 
                    onStylingChange({ includeHeader: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="includeHeader" className="cursor-pointer font-medium">
                    تضمين header ملون
                  </Label>
                  <p className="text-sm text-gray-600">
                    إضافة صف عنوان ملون في أعلى الجدول
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <Checkbox
                  id="includeLogo"
                  checked={styling.includeLogo}
                  onCheckedChange={(checked) => 
                    onStylingChange({ includeLogo: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="includeLogo" className="cursor-pointer font-medium">
                    تضمين الشعار
                  </Label>
                  <p className="text-sm text-gray-600">
                    إضافة شعار المكتب في أعلى الصفحة
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <Checkbox
                  id="includeOfficeInfo"
                  checked={styling.includeOfficeInfo}
                  onCheckedChange={(checked) => 
                    onStylingChange({ includeOfficeInfo: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="includeOfficeInfo" className="cursor-pointer font-medium">
                    تضمين معلومات المكتب
                  </Label>
                  <p className="text-sm text-gray-600">
                    إضافة اسم المكتب والعنوان ورقم الهاتف
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <Checkbox
                  id="autoNumbering"
                  checked={styling.autoNumbering}
                  onCheckedChange={(checked) => 
                    onStylingChange({ autoNumbering: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="autoNumbering" className="cursor-pointer font-medium">
                    ترقيم تلقائي
                  </Label>
                  <p className="text-sm text-gray-600">
                    إضافة عمود ترقيم تلقائي (1، 2، 3...)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <Checkbox
                  id="includeStats"
                  checked={styling.includeStats}
                  onCheckedChange={(checked) => 
                    onStylingChange({ includeStats: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="includeStats" className="cursor-pointer font-medium">
                    عرض الإحصائيات
                  </Label>
                  <p className="text-sm text-gray-600">
                    إضافة ملخص إحصائي في آخر الملف
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ملاحظة للـ CSV */}
        {format === 'csv' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-sm text-amber-800">
              ملف CSV سيتم تصديره بدون تنسيق أو ألوان (بيانات خام فقط)
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
