'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * Column Selector - اختيار الأعمدة
 * ═══════════════════════════════════════════════════════════════
 * 
 * مكون لاختيار الأعمدة المطلوبة للتصدير مع تجميع حسب الفئة
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Columns, CheckSquare, Square } from 'lucide-react'
import { COLUMN_CATEGORIES, type CustomerExportColumn } from '@/types/export'

interface ColumnSelectorProps {
  selectedColumns: CustomerExportColumn[]
  onColumnsChange: (columns: CustomerExportColumn[]) => void
}

export function ColumnSelector({ selectedColumns, onColumnsChange }: ColumnSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic', 'contact'])
  
  /**
   * تحديد/إلغاء تحديد عمود
   */
  const toggleColumn = (column: CustomerExportColumn) => {
    if (selectedColumns.includes(column)) {
      onColumnsChange(selectedColumns.filter(c => c !== column))
    } else {
      onColumnsChange([...selectedColumns, column])
    }
  }
  
  /**
   * تحديد الكل
   */
  const selectAll = () => {
    const allColumns = Object.values(COLUMN_CATEGORIES)
      .flatMap(category => category.columns)
      .map(col => col.key)
    onColumnsChange(allColumns)
  }
  
  /**
   * إلغاء الكل
   */
  const deselectAll = () => {
    onColumnsChange([])
  }
  
  /**
   * تبديل الفئة (expand/collapse)
   */
  const toggleCategory = (categoryKey: string) => {
    if (expandedCategories.includes(categoryKey)) {
      setExpandedCategories(expandedCategories.filter(k => k !== categoryKey))
    } else {
      setExpandedCategories([...expandedCategories, categoryKey])
    }
  }
  
  /**
   * تحديد جميع أعمدة فئة معينة
   */
  const selectCategoryColumns = (categoryKey: string) => {
    const category = COLUMN_CATEGORIES[categoryKey as keyof typeof COLUMN_CATEGORIES]
    const categoryColumns = category.columns.map(col => col.key)
    const newColumns = [...new Set([...selectedColumns, ...categoryColumns])]
    onColumnsChange(newColumns)
  }
  
  /**
   * إلغاء تحديد جميع أعمدة فئة معينة
   */
  const deselectCategoryColumns = (categoryKey: string) => {
    const category = COLUMN_CATEGORIES[categoryKey as keyof typeof COLUMN_CATEGORIES]
    const categoryColumns = category.columns.map(col => col.key)
    onColumnsChange(selectedColumns.filter(col => !categoryColumns.includes(col)))
  }
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Columns className="w-5 h-5 text-[#0066CC]" />
          اختيار الأعمدة
        </h3>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
          >
            <CheckSquare className="w-4 h-4 ml-1" />
            تحديد الكل
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deselectAll}
          >
            <Square className="w-4 h-4 ml-1" />
            إلغاء الكل
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* عرض عدد الأعمدة المحددة */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            تم تحديد <span className="font-bold">{selectedColumns.length}</span> عمود من أصل{' '}
            <span className="font-bold">
              {Object.values(COLUMN_CATEGORIES).reduce((acc, cat) => acc + cat.columns.length, 0)}
            </span>
          </p>
        </div>
        
        {/* الأعمدة مجمعة حسب الفئة */}
        <div className="space-y-3">
          {Object.entries(COLUMN_CATEGORIES).map(([key, category]) => {
            const isExpanded = expandedCategories.includes(key)
            const categoryColumnsKeys = category.columns.map(col => col.key)
            const selectedInCategory = categoryColumnsKeys.filter(col => 
              selectedColumns.includes(col)
            ).length
            const allSelected = selectedInCategory === categoryColumnsKeys.length
            
            return (
              <div key={key} className="border rounded-lg">
                {/* رأس الفئة */}
                <div className="p-3 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => toggleCategory(key)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    <span className="font-medium">{category.label}</span>
                    <span className="text-sm text-gray-600">
                      ({selectedInCategory}/{categoryColumnsKeys.length})
                    </span>
                  </button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => allSelected 
                        ? deselectCategoryColumns(key) 
                        : selectCategoryColumns(key)
                      }
                      className="text-xs"
                    >
                      {allSelected ? 'إلغاء الكل' : 'تحديد الكل'}
                    </Button>
                  </div>
                </div>
                
                {/* الأعمدة */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {category.columns.map((column) => {
                      const isSelected = selectedColumns.includes(column.key)
                      const isRequired = column.required
                      
                      return (
                        <div
                          key={column.key}
                          className="flex items-start space-x-3 space-x-reverse"
                        >
                          <Checkbox
                            id={column.key}
                            checked={isSelected}
                            onCheckedChange={() => !isRequired && toggleColumn(column.key)}
                            disabled={isRequired}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={column.key}
                              className={`cursor-pointer ${isRequired ? 'text-gray-400' : ''}`}
                            >
                              {column.label}
                              {isRequired && (
                                <span className="text-red-500 mr-1">*</span>
                              )}
                            </Label>
                            {column.description && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {column.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
