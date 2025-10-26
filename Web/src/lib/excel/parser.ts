import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { ParsedExcelData } from '@/types/excel'

/**
 * Parse Excel file to structured data
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Convert to JSON (array of arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null,
          blankrows: false
        }) as any[][]
        
        // Extract headers and data
        const headers = jsonData[0]?.map(h => String(h || '').trim()) || []
        const data = jsonData.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''))
        
        resolve({
          fileName: file.name,
          headers,
          data,
          rowCount: data.length
        })
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse CSV file to structured data
 * دالة لتحليل ملفات CSV
 */
export async function parseCSVFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          const data = results.data as any[][]
          
          // Extract headers and filter empty rows
          const headers = data[0]?.map(h => String(h || '').trim()) || []
          const dataRows = data
            .slice(1)
            .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          
          resolve({
            fileName: file.name,
            headers,
            data: dataRows,
            rowCount: dataRows.length
          })
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(new Error('فشل في قراءة ملف CSV: ' + error.message))
      },
      skipEmptyLines: true,
      encoding: 'UTF-8'
    })
  })
}

/**
 * Generate Excel template for download
 */
export function generateTemplate(): void {
  const headers = [
    'العنوان',
    'الوصف',
    'نوع العقار',
    'نوع العرض',
    'السعر',
    'المساحة',
    'غرف النوم',
    'دورات المياه',
    'المدينة',
    'الحي',
    'الموقع'
  ]
  
  const sampleData = [
    [
      'شقة فاخرة في الرياض',
      'شقة واسعة ومجهزة بالكامل',
      'شقة',
      'بيع',
      500000,
      200,
      3,
      2,
      'الرياض',
      'العليا',
      'شارع التحلية'
    ],
    [
      'فيلا عصرية في جدة',
      'فيلا راقية مع حديقة خاصة',
      'فيلا',
      'إيجار',
      8000,
      400,
      5,
      4,
      'جدة',
      'الروضة',
      'حي الروضة'
    ]
  ]
  
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'العقارات')
  
  XLSX.writeFile(wb, 'template_properties.xlsx')
}
