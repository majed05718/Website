/**
 * ═══════════════════════════════════════════════════════════════
 * Analytics Types - أنواع بيانات التحليلات
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * ملخص البطاقة التنفيذية
 */
export interface ExecutiveSummaryCard {
  id: string
  title: string
  value: number | string
  change: number              // نسبة التغيير
  trend: 'up' | 'down' | 'stable'
  sparkline: number[]         // بيانات الرسم الصغير
  unit?: string               // ريال، %، عدد
  color: string               // gradient color
}

/**
 * بيانات تفصيل الإيرادات
 */
export interface RevenueBreakdownData {
  month: string
  rent: number                // إيجارات
  sales: number               // مبيعات
  commissions: number         // عمولات
  maintenance: number         // صيانة
  total: number
}

/**
 * أداء العقار (Scatter)
 */
export interface PropertyPerformance {
  id: string
  name: string
  occupancyRate: number       // 0-100
  revenue: number
  area: number                // للحجم
  type: 'apartment' | 'villa' | 'land' | 'shop'
  color: string
}

/**
 * مرحلة في Sales Funnel
 */
export interface FunnelStage {
  name: string
  count: number
  percentage: number          // من المرحلة السابقة
  color: string
}

/**
 * KPI
 */
export interface KPI {
  id: string
  title: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  target?: number
  unit?: string
  icon?: string
}

/**
 * أفضل موظف
 */
export interface TopPerformer {
  id: string
  rank: number
  name: string
  avatar?: string
  revenue: number
  deals: number
  conversionRate: number
  satisfaction: number        // 0-5
  performance: number         // 0-100
}

/**
 * رؤية السوق (Market Insight)
 */
export interface MarketInsight {
  id: string
  type: 'opportunity' | 'trend' | 'warning' | 'alert' | 'info'
  icon: string
  title: string
  description: string
  date: string
  actionUrl?: string
  color: string
}

/**
 * هدف
 */
export interface Goal {
  id: string
  title: string
  target: number
  current: number
  percentage: number          // current/target * 100
  unit: string
  daysRemaining?: number
  status: 'on-track' | 'at-risk' | 'off-track' | 'completed'
  color: string
  icon?: string
}

/**
 * إحصائيات العقارات
 */
export interface PropertyStats {
  total: number
  available: number
  occupied: number
  maintenance: number
  availablePercentage: number
  occupiedPercentage: number
  maintenancePercentage: number
}

/**
 * ROI Analysis (Bubble Chart)
 */
export interface ROIAnalysis {
  id: string
  name: string
  investment: number          // X-axis
  returns: number             // Y-axis
  timeToROI: number           // Bubble size (شهور)
  type: 'apartment' | 'villa' | 'land' | 'shop'
  roi: number                 // percentage
  color: string
}

/**
 * Occupancy Timeline
 */
export interface OccupancyData {
  month: string
  occupancy: number           // percentage
  average: number             // متوسط السنة
}

/**
 * متوسط الإيجار حسب المنطقة
 */
export interface RentByArea {
  area: string
  avgRent: number
  min: number
  max: number
  changeFromAvg: number       // percentage
  color: string
}

/**
 * توزيع العقارات
 */
export interface PropertyDistribution {
  type: string
  available: number
  occupied: number
  maintenance: number
  reserved: number
  total: number
}

/**
 * موقع على الخريطة
 */
export interface PropertyMapMarker {
  id: string
  name: string
  lat: number
  lng: number
  price: number
  status: 'available' | 'occupied' | 'maintenance'
  type: 'apartment' | 'villa' | 'land' | 'shop'
  thumbnail?: string
}

/**
 * خلية في Price Heat Map
 */
export interface PriceHeatCell {
  area: string
  avgPrice: number
  propertyCount: number
  trend: number               // percentage change
  color: string
}

/**
 * عقار للمقارنة
 */
export interface PropertyComparison {
  id: string
  code: string
  name: string
  thumbnail?: string
  type: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  revenueYTD: number
  expensesYTD: number
  netProfit: number
  roi: number
  occupancyRate: number
  status: string
}

/**
 * اتجاه التقييم
 */
export interface ValuationTrend {
  month: string
  apartments: number
  villas: number
  lands: number
  shops: number
  market: number              // متوسط السوق
}

/**
 * تكاليف الصيانة
 */
export interface MaintenanceCost {
  property: string
  planned: number
  emergency: number
  upgrades: number
  total: number
}

/**
 * ترتيب
 */
export interface Ranking {
  rank: number
  id: string
  name: string
  thumbnail?: string
  value: number
  metric: string
  badge?: string
}

/**
 * نوع التقرير
 */
export type ReportType = 
  | 'properties'
  | 'customers'
  | 'financial'
  | 'appointments'
  | 'contracts'
  | 'staff'
  | 'custom'

/**
 * تنسيق التقرير
 */
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'html' | 'json'

/**
 * تكرار التقرير
 */
export type ReportFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

/**
 * حالة التقرير
 */
export type ReportStatus = 'generated' | 'scheduled' | 'failed' | 'expired' | 'ready'

/**
 * إعدادات التقرير
 */
export interface ReportConfig {
  id?: string
  name: string
  description?: string
  type: ReportType
  selectedFields: string[]
  filters: Record<string, any>
  groupBy?: string
  sortBy?: string
  sortOrder: 'asc' | 'desc'
  includeCharts: boolean
  chartTypes?: string[]
  format: ReportFormat
  includeCharts?: boolean
  includeCover?: boolean
  includeTOC?: boolean
  includeSummary?: boolean
  template?: string
  schedule?: {
    frequency: ReportFrequency
    time: string
    recipients: string[]
    subject: string
    body: string
  }
}

/**
 * تقرير محفوظ
 */
export interface SavedReport {
  id: string
  name: string
  type: ReportType
  createdDate: string
  lastRun?: string
  fileSize?: number
  status: ReportStatus
  config: ReportConfig
}

/**
 * تقرير مجدول
 */
export interface ScheduledReport {
  id: string
  name: string
  type: ReportType
  frequency: ReportFrequency
  nextRun: string
  recipients: string[]
  status: 'active' | 'paused'
  config: ReportConfig
}

/**
 * سجل التقرير
 */
export interface ReportHistory {
  id: string
  reportName: string
  generatedDate: string
  generatedBy: string
  fileSize: number
  downloadCount: number
  status: ReportStatus
  fileUrl?: string
}

/**
 * قالب التقرير
 */
export interface ReportTemplate {
  id: string
  name: string
  description: string
  thumbnail?: string
  type: ReportType
  lastUpdated: string
  config: Partial<ReportConfig>
}

/**
 * تسميات أنواع التقارير
 */
export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  properties: 'تقرير العقارات',
  customers: 'تقرير العملاء',
  financial: 'التقرير المالي',
  appointments: 'تقرير المواعيد',
  contracts: 'تقرير العقود',
  staff: 'أداء الموظفين',
  custom: 'تقرير مخصص'
}

/**
 * ألوان الرسوم البيانية
 */
export const CHART_COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f97316',
  purple: '#8b5cf6',
  red: '#ef4444',
  yellow: '#eab308',
  pink: '#ec4899',
  cyan: '#06b6d4',
  gray: '#6b7280'
}

/**
 * ألوان أنواع العقارات
 */
export const PROPERTY_TYPE_COLORS = {
  apartment: '#3b82f6',
  villa: '#10b981',
  land: '#f97316',
  shop: '#8b5cf6'
}
