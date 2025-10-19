export interface ExcelColumn {
  sourceColumn: string        // Column from uploaded file
  targetField: string         // Database field to map to
  confidence: number          // Auto-match confidence (0-100)
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'array'
}

export interface ExcelImportData {
  fileName: string
  rowCount: number
  columns: string[]
  mappings: ExcelColumn[]
  previewData: any[]          // First 10 rows for preview
  errors: ExcelError[]
  warnings: ExcelWarning[]
}

export interface ExcelError {
  row: number
  column: string
  message: string
  value: any
}

export interface ExcelWarning {
  row: number
  column: string
  message: string
  value: any
}

export interface ExcelExportOptions {
  fields: string[]            // Which fields to include
  format: 'xlsx' | 'csv'
  includeImages: boolean
  filters?: any               // Export filtered data only
}

export interface ParsedExcelData {
  fileName: string
  headers: string[]
  data: any[][]
  rowCount: number
}
