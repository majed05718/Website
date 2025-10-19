'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Check, AlertCircle, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { autoMapColumns, AVAILABLE_FIELDS } from '@/lib/excel/mapper'
import { ExcelColumn } from '@/types/excel'

interface ColumnMapperProps {
  columns: string[]
  onMappingComplete: (mappings: ExcelColumn[]) => void
}

export function ColumnMapper({ columns, onMappingComplete }: ColumnMapperProps) {
  const [mappings, setMappings] = useState<ExcelColumn[]>([])
  const [autoMapped, setAutoMapped] = useState(false)

  useEffect(() => {
    if (!autoMapped && columns.length > 0) {
      const autoMappings = autoMapColumns(columns)
      setMappings(autoMappings)
      setAutoMapped(true)
    }
  }, [columns, autoMapped])

  const updateMapping = (index: number, targetField: string) => {
    const updated = [...mappings]
    const field = AVAILABLE_FIELDS.find(f => f.value === targetField)
    
    updated[index] = {
      ...updated[index],
      targetField,
      confidence: targetField ? 100 : 0,
      required: field?.required || false
    }
    setMappings(updated)
  }

  const handleComplete = () => {
    onMappingComplete(mappings)
  }

  const requiredFields = AVAILABLE_FIELDS.filter(f => f.required)
  const mappedRequiredFields = requiredFields.filter(f => 
    mappings.some(m => m.targetField === f.value)
  )
  const allRequiredMapped = mappedRequiredFields.length === requiredFields.length

  const autoMappedCount = mappings.filter(m => m.confidence === 100 && m.targetField).length

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">ربط الأعمدة</h3>
            <p className="text-sm text-muted-foreground">
              قم بربط أعمدة Excel مع حقول النظام
            </p>
          </div>
          {autoMapped && autoMappedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                تم ربط {autoMappedCount} عمود تلقائياً
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mappings.map((mapping, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              {/* Source Column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{mapping.sourceColumn}</span>
                  {mapping.confidence > 0 && mapping.confidence < 100 && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full whitespace-nowrap">
                      {mapping.confidence}% تطابق
                    </span>
                  )}
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

              {/* Target Field */}
              <div className="flex-1">
                <Select
                  value={mapping.targetField}
                  onValueChange={(value) => updateMapping(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حقل..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">تجاهل هذا العمود</SelectItem>
                    {AVAILABLE_FIELDS.map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        <div className="flex items-center gap-2">
                          <span>{field.label}</span>
                          {field.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Indicator */}
              {mapping.confidence === 100 && mapping.targetField && (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {!allRequiredMapped && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm flex-1">
              <p className="font-medium text-red-800 mb-1">حقول مطلوبة غير مربوطة</p>
              <p className="text-red-700">
                يجب ربط الحقول التالية: {requiredFields
                  .filter(f => !mappings.some(m => m.targetField === f.value))
                  .map(f => f.label)
                  .join('، ')}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {mappedRequiredFields.length} من {requiredFields.length} حقل مطلوب
          </p>
          <Button
            onClick={handleComplete}
            disabled={!allRequiredMapped}
            className="min-w-32"
          >
            متابعة للمعاينة
          </Button>
        </div>
      </div>
    </Card>
  )
}
