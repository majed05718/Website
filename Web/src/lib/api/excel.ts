import axios from 'axios'
import { ExcelColumn } from '@/types/excel'

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Import properties from Excel
 */
export async function importProperties(properties: any[]) {
  try {
    const response = await axios.post(`${API_URL}/api/properties/import/confirm`, {
      properties
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل استيراد العقارات')
  }
}

/**
 * Export properties to Excel
 */
export async function exportProperties(filters?: any) {
  try {
    const response = await axios.get(`${API_URL}/api/properties/export`, {
      params: filters,
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `properties_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'فشل تصدير العقارات')
  }
}

/**
 * Download template
 */
export async function downloadTemplate() {
  try {
    const response = await axios.get(`${API_URL}/api/properties/template`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_properties.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error: any) {
    throw new Error('فشل تنزيل القالب')
  }
}
