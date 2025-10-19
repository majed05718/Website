'use client'

import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { parseExcelFile, generateTemplate } from '@/lib/excel/parser'
import { ParsedExcelData } from '@/types/excel'
import { toast } from 'sonner'

interface ExcelUploaderProps {
  onFileProcessed: (data: ParsedExcelData) => void
}

export function ExcelUploader({ onFileProcessed }: ExcelUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(async (selectedFile: File) => {
    setIsProcessing(true)
    
    try {
      const parsedData = await parseExcelFile(selectedFile)
      onFileProcessed(parsedData)
      toast.success('تم تحميل الملف بنجاح')
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('فشل في معالجة الملف')
      setFile(null)
    } finally {
      setIsProcessing(false)
    }
  }, [onFileProcessed])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      processFile(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile)
      processFile(droppedFile)
    } else {
      toast.error('يرجى رفع ملف Excel فقط (.xlsx أو .xls)')
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const downloadTemplate = () => {
    generateTemplate()
    toast.success('تم تنزيل القالب بنجاح')
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">رفع ملف Excel</h3>
            <p className="text-sm text-muted-foreground">
              قم برفع ملف Excel (.xlsx أو .xls) يحتوي على بيانات العقارات
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 ml-2" />
            تنزيل القالب
          </Button>
        </div>

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                اسحب الملف هنا أو اضغط للاختيار
              </p>
              <p className="text-sm text-muted-foreground">
                يدعم ملفات .xlsx و .xls فقط
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById('excel-upload')?.click()}
            >
              اختر ملف
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">جاري معالجة الملف...</p>
          </div>
        )}
      </div>
    </Card>
  )
}
