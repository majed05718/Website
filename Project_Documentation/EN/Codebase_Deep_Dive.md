# Codebase Deep Dive

- **Generated**: 2025-11-09 19:56 UTC
- **Purpose**: Serve as an exhaustive onboarding manual describing every major file.

## Analytics Module Deep Dive
- Summary: Aggregates Supabase analytics routines powering dashboards, KPIs, and executive summaries.

### Controllers
#### File: `/workspace/api/src/analytics/analytics.controller.ts`
- Purpose: Orchestrates 5 endpoint(s) for analytics workflows while enforcing guards and role checks.
- Injected services: `analytics: AnalyticsService`
- Decorators/guards: @Get('dashboard'), @Get('financials'), @Get('kpis'), @Get('properties'), @Get('staff-performance'), @Roles('manager'), @Roles('manager', 'accountant')
- Key Methods:
  - `dashboard` → Get `/analytics/dashboard`; roles: manager, accountant; DTOs: None; services: `AnalyticsService.dashboard`.
```ts
  async dashboard(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.dashboard(officeId);
  }
```
  - `properties` → Get `/analytics/properties`; roles: Public (requires JWT context); DTOs: None; services: `AnalyticsService.propertiesBreakdown`.
```ts
  async properties(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.propertiesBreakdown(officeId);
  }
```
  - `financials` → Get `/analytics/financials`; roles: manager, accountant; DTOs: None; services: `AnalyticsService.financials`.
```ts
  async financials(@Req() req: any, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.financials(officeId, reportPeriod);
  }
```
  - `kpis` → Get `/analytics/kpis`; roles: manager; DTOs: None; services: `AnalyticsService.kpis`.
```ts
  async kpis(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.kpis(officeId);
  }
```
  - `staffPerf` → Get `/analytics/staff-performance`; roles: manager; DTOs: None; services: `AnalyticsService.staffPerformance`.
```ts
  async staffPerf(@Req() req: any, @Query('staff_phone') staffPhone?: string, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.staffPerformance(officeId, staffPhone, reportPeriod);
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/analytics/analytics.service.ts`
- Purpose: Implements analytics business rules with 6 public method(s).
- Dependencies: `supabaseService: SupabaseService`
- Methods:
  - `setCache(key: string, data: any, ms: number)` lines 20-20 — caching.
```ts
  private setCache(key: string, data: any, ms: number) { this.cache.set(key, { data, expiresAt: Date.now() + ms }); }
```
  - `dashboard(officeId: string)` lines 22-49 — Supabase data access, caching.
```ts
  async dashboard(officeId: string) {
    const key = `dash:${officeId}`;
    const cached = this.getCache<any>(key);
    if (cached) return cached;

    const supabase = this.supabaseService.getClient();

    const [propsByStatusRes, activeContractsRes, monthlyRevenueRes, pendingPaymentsRes, mntByStatusRes, recentActivityRes] = await Promise.all([
      supabase.rpc('get_properties_by_status', { p_office_id: officeId }),
      supabase.rpc('get_active_contracts_count', { p_office_id: officeId }),
      supabase.rpc('get_monthly_revenue', { p_office_id: officeId }),
      supabase.from('rental_payments').select('*', { count: 'exact', head: true }).eq('office_id', officeId).eq('status', 'pending'),
      supabase.rpc('get_maintenance_by_status', { p_office_id: officeId }),
      supabase.from('maintenance_requests').select('*').eq('office_id', officeId).order('created_at', { ascending: false }).limit(10),
    ]);

    const data = {
      propertiesByStatus: propsByStatusRes.data || [],
      activeContracts: Number(activeContractsRes.data ?? 0),
      monthlyRevenue: Number(monthlyRevenueRes.data ?? 0),
      pendingPayments: Number(pendingPaymentsRes.count ?? 0),
      maintenanceByStatus: mntByStatusRes.data || [],
```
  - `propertiesBreakdown(officeId: string)` lines 51-70 — Supabase data access.
```ts
  async propertiesBreakdown(officeId: string) {
    const supabase = this.supabaseService.getClient();

    const [byTypeRes, byStatusRes, byCityRes, priceAggRes, countsRes] = await Promise.all([
      supabase.rpc('get_properties_by_type', { p_office_id: officeId }),
      supabase.rpc('get_properties_by_status', { p_office_id: officeId }),
      supabase.rpc('get_properties_by_city', { p_office_id: officeId }),
      supabase.rpc('get_properties_price_aggregate', { p_office_id: officeId }),
      supabase.rpc('get_properties_occupancy_counts', { p_office_id: officeId }),
    ]);

    const byType = byTypeRes.data || [];
    const byStatus = byStatusRes.data || [];
    const byCity = byCityRes.data || [];
    const priceAgg = priceAggRes.data?.[0] || { avgprice: 0, totalprice: 0 };
    const counts = countsRes.data?.[0] || { available: 0, total: 0 };
    const occupancy = counts.total ? (1 - Number(counts.available) / Number(counts.total)) : 0;

    return { byType, byStatus, byCity, avgPrice: Number(priceAgg.avgprice ?? 0), totalPrice: Number(priceAgg.totalprice ?? 0), occupancyRate: occupancy };
  }
```
  - `financials(officeId: string, reportPeriod?: string)` lines 72-89 — Supabase data access.
```ts
  async financials(officeId: string, reportPeriod?: string) {
    const supabase = this.supabaseService.getClient();
    let query = supabase.from('financial_analytics').select('*').eq('office_id', officeId);
    
    if (reportPeriod) {
      query = query.eq('report_period', reportPeriod);
    }
    
    const { data: rows } = await query.order('report_period', { ascending: true });
    
    const trends = {
      revenue: (rows || []).map(r => Number(r.revenue)),
      expenses: (rows || []).map(r => Number(r.expenses)),
      profit: (rows || []).map(r => Number(r.profit)),
      periods: (rows || []).map(r => r.report_period),
    };
    return { data: rows || [], trends };
  }
```
  - `kpis(officeId: string)` lines 91-99 — Supabase data access.
```ts
  async kpis(officeId: string) {
    const { data: rows } = await this.supabaseService.getClient()
      .from('kpi_tracking')
      .select('*')
      .eq('office_id', officeId);
    
    const data = (rows || []).map(r => ({ name: r.kpi_name, current: Number(r.current_value), target: Number(r.target_value), period: r.report_period }));
    return { data };
  }
```
  - `staffPerformance(officeId: string, staffPhone?: string, reportPeriod?: string)` lines 101-112 — Supabase data access.
```ts
  async staffPerformance(officeId: string, staffPhone?: string, reportPeriod?: string) {
    let query = this.supabaseService.getClient()
      .from('staff_performance')
      .select('*')
      .eq('office_id', officeId);
    
    if (staffPhone) query = query.eq('staff_phone', staffPhone);
    if (reportPeriod) query = query.eq('report_period', reportPeriod);
    
    const { data: rows } = await query.order('revenue_generated', { ascending: false });
    return { data: rows || [] };
  }
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.


## App Module Deep Dive
- Summary: The `App` module encapsulates domain responsibilities.

### Frontend Surfaces
- File `/workspace/Web/src/app/dashboard/analytics/executive/page.tsx`
  - Exports: `ExecutiveDashboardPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExecutiveDashboardPage` spans lines 31-91 and encapsulates UI state for app.
```tsx
export default function ExecutiveDashboardPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            لوحة التحكم التنفيذية
          </h1>
          <p className="text-gray-600 mt-1">
            نظرة شاملة على الأداء والإحصائيات الرئيسية
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
```
- File `/workspace/Web/src/app/dashboard/appointments/[id]/edit/page.tsx`
  - Exports: `EditAppointmentPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `EditAppointmentPage` spans lines 10-33 and encapsulates UI state for app.
```tsx
export default function EditAppointmentPage({
  const router = useRouter();
  const { selectedAppointment, setSelectedAppointment, setLoading } = useAppointmentsStore();

  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const data = await getAppointment(params.id);
        setSelectedAppointment(data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('حدث خطأ في تحميل بيانات الموعد');
        router.push('/dashboard/appointments');
      } finally {
        setLoading(false);
      }
    };
```
- File `/workspace/Web/src/app/dashboard/appointments/[id]/page.tsx`
  - Exports: `AppointmentDetailsPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentDetailsPage` spans lines 24-164 and encapsulates UI state for app.
```tsx
export default function AppointmentDetailsPage({
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { selectedAppointment, isLoading, setSelectedAppointment, setLoading, removeAppointment } = useAppointmentsStore();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getAppointment(params.id);
        setSelectedAppointment(data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('حدث خطأ في تحميل بيانات الموعد');
```
- File `/workspace/Web/src/app/dashboard/appointments/new/page.tsx`
  - Exports: `NewAppointmentPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `NewAppointmentPage` spans lines 5-7 and encapsulates UI state for app.
```tsx
export default function NewAppointmentPage() {
  return <AppointmentForm />;
}
```
- File `/workspace/Web/src/app/dashboard/appointments/page.tsx`
  - Exports: `AppointmentsPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentsPage` spans lines 22-220 and encapsulates UI state for app.
```tsx
export default function AppointmentsPage() {
  const router = useRouter();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<string | undefined>();
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);

  const {
    appointments,
    calendarAppointments,
    stats,
    filters,
    currentPage,
    isLoading,
    viewMode,
    selectedDate,
    setAppointments,
    setCalendarAppointments,
    setStats,
```
- File `/workspace/Web/src/app/dashboard/contracts/page.tsx`
  - Exports: `ContractsPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ContractsPage` spans lines 117-434 and encapsulates UI state for app.
```tsx
export default function ContractsPage() {
  const router = useRouter()
  
  // State
  const [contracts, setContracts] = useState<Contract[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [filters, setFilters] = useState<ContractFilters>({})
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [isLoading, setIsLoading] = useState(true)

  /**
   * جلب العقود والإحصائيات
   */
  useEffect(() => {
    fetchContractsAndStats()
  }, [])

  const fetchContractsAndStats = async () => {
```
- File `/workspace/Web/src/app/dashboard/customers/[id]/edit/page.tsx`
  - Exports: `EditCustomerPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `EditCustomerPage` spans lines 10-33 and encapsulates UI state for app.
```tsx
export default function EditCustomerPage({
  const router = useRouter();
  const { selectedCustomer, setSelectedCustomer, setLoading } = useCustomersStore();

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const response = await getCustomer(params.id);
        setSelectedCustomer(response.customer);
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error('حدث خطأ في تحميل بيانات العميل');
        router.push('/dashboard/customers');
      } finally {
        setLoading(false);
      }
    };
```
- File `/workspace/Web/src/app/dashboard/customers/[id]/page.tsx`
  - Exports: `CustomerDetailsPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerDetailsPage` spans lines 42-295 and encapsulates UI state for app.
```tsx
export default function CustomerDetailsPage({
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  
  const { 
    selectedCustomer: customer, 
    isLoading,
    setSelectedCustomer,
    setLoading,
    setError,
    removeCustomer,
  } = useCustomersStore();

  const [details, setDetails] = useState<{
    properties: any[];
```
- File `/workspace/Web/src/app/dashboard/customers/export/page.tsx`
  - Exports: `CustomersExportPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomersExportPage` spans lines 27-300 and encapsulates UI state for app.
```tsx
export default function CustomersExportPage() {
  const router = useRouter()
  
  // حالة التصدير
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  
  // إعدادات التصدير
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    // خيارات التصدير
    exportType: 'all', // all | selected | filtered | date-range
    selectedIds: [],
    dateRange: {
      from: '',
      to: ''
    },
```
- File `/workspace/Web/src/app/dashboard/customers/new/page.tsx`
  - Exports: `NewCustomerPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `NewCustomerPage` spans lines 5-7 and encapsulates UI state for app.
```tsx
export default function NewCustomerPage() {
  return <CustomerForm />;
}
```
- File `/workspace/Web/src/app/dashboard/customers/page.tsx`
  - Exports: `CustomersPage`, `handleExport`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomersPage` spans lines 15-195 and encapsulates UI state for app.
```tsx
export default function CustomersPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    customers,
    stats,
    filters,
    currentPage,
    totalPages,
    totalCount,
    isLoading,
    setCustomers,
    setStats,
    setLoading,
    setError,
    setPagination,
```
  - `handleExport` spans lines 73-195 and encapsulates UI state for app.
```tsx
export
  const handleExport = async () => {
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportCustomers(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تصدير العملاء بنجاح');
    } catch (error) {
```
- File `/workspace/Web/src/app/dashboard/customers/templates/page.tsx`
  - Exports: `CustomersTemplatesPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomersTemplatesPage` spans lines 23-169 and encapsulates UI state for app.
```tsx
export default function CustomersTemplatesPage() {
  const router = useRouter()
  
  // حالة القوالب المخصصة
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  
  // حالة نافذة إنشاء قالب مخصص
  const [showCustomCreator, setShowCustomCreator] = useState(false)
  
  // حالة القالب المراد تعديله
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  
  /**
   * حفظ قالب مخصص جديد
   */
  const handleSaveCustomTemplate = (template: Omit<Template, 'id' | 'createdAt'>) => {
    const newTemplate: Template = {
      ...template,
```
- File `/workspace/Web/src/app/dashboard/finance/page.tsx`
  - Exports: `FinancePage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `FinancePage` spans lines 31-154 and encapsulates UI state for app.
```tsx
export default function FinancePage() {
  // ═══════════════════════════════════════════════════════════
  // State Management
  // ═══════════════════════════════════════════════════════════
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()).toISOString().split('T')[0],
    to: endOfMonth(new Date()).toISOString().split('T')[0]
  })

  const [data, setData] = useState<FinanceDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ═══════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════

  /**
```
- File `/workspace/Web/src/app/dashboard/layout.tsx`
  - Exports: `DashboardLayout`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `DashboardLayout` spans lines 9-61 and encapsulates UI state for app.
```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Loading state
```
- File `/workspace/Web/src/app/dashboard/maintenance/page.tsx`
  - Exports: `MaintenancePage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `MaintenancePage` spans lines 16-92 and encapsulates UI state for app.
```tsx
export default function MaintenancePage() {
  const [isLoading, setIsLoading] = useState(false)

  // Handlers
  const handleView = (id: string) => {
    console.log('View request:', id)
    // TODO: Open details dialog
  }

  const handleEdit = (id: string) => {
    console.log('Edit request:', id)
    // TODO: Open edit dialog
  }

  const handleAssign = (id: string) => {
    console.log('Assign request:', id)
    // TODO: Open assign dialog
  }
```
- File `/workspace/Web/src/app/dashboard/page.tsx`
  - Exports: `DashboardPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `DashboardPage` spans lines 69-209 and encapsulates UI state for app.
```tsx
export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <>
          <div className="mb-8">
```
- File `/workspace/Web/src/app/dashboard/payments/page.tsx`
  - Exports: `PaymentsPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PaymentsPage` spans lines 27-224 and encapsulates UI state for app.
```tsx
export default function PaymentsPage() {
  // ═══════════════════════════════════════════════════════════
  // State Management
  // ═══════════════════════════════════════════════════════════
  
  const [data, setData] = useState<PaymentsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterType>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showOverdueAlert, setShowOverdueAlert] = useState(true)

  // ═══════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════

  const fetchData = useCallback(async () => {
    setIsLoading(true)
```
- File `/workspace/Web/src/app/dashboard/properties/[id]/page.tsx`
  - Exports: `PropertyDetailsPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PropertyDetailsPage` spans lines 31-424 and encapsulates UI state for app.
```tsx
export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { setSelectedProperty, deleteProperty } = usePropertiesStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // جلب تفاصيل العقار
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const data = await propertiesApi.getPropertyById(id);
        setProperty(data);
```
- File `/workspace/Web/src/app/dashboard/properties/export/page.tsx`
  - Exports: `ExportPropertiesPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExportPropertiesPage` spans lines 29-187 and encapsulates UI state for app.
```tsx
export default function ExportPropertiesPage() {
  const router = useRouter()
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORTABLE_FIELDS.filter(f => f.required).map(f => f.id)
  )
  const [isExporting, setIsExporting] = useState(false)

  const toggleField = (fieldId: string) => {
    const field = EXPORTABLE_FIELDS.find(f => f.id === fieldId)
    if (field?.required) return // Can't uncheck required fields
    
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }
```
- File `/workspace/Web/src/app/dashboard/properties/import/page.tsx`
  - Exports: `ImportPropertiesPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ImportPropertiesPage` spans lines 20-275 and encapsulates UI state for app.
```tsx
export default function ImportPropertiesPage() {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null)
  const [mappings, setMappings] = useState<ExcelColumn[]>([])
  const [errors, setErrors] = useState<ExcelError[]>([])
  const [warnings, setWarnings] = useState<ExcelWarning[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [importProgress, setImportProgress] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)

  const handleFileProcessed = (data: ParsedExcelData) => {
    setParsedData(data)
    setCurrentStep('mapping')
  }
```
- File `/workspace/Web/src/app/dashboard/properties/new/page.tsx`
  - Exports: `NewPropertyPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `NewPropertyPage` spans lines 54-577 and encapsulates UI state for app.
```tsx
export default function NewPropertyPage() {
  const router = useRouter();
  const { addProperty } = usePropertiesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
```
- File `/workspace/Web/src/app/dashboard/properties/page.tsx`
  - Exports: `PropertiesPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PropertiesPage` spans lines 15-195 and encapsulates UI state for app.
```tsx
export default function PropertiesPage() {
  const router = useRouter();
  const {
    properties = [],
    filters,
    currentPage,
    pageSize,
    totalCount,
    isLoading,
    error,
    setProperties,
    setFilters,
    setCurrentPage,
    setTotalCount,
    setLoading,
    setError,
    deleteProperty,
    clearFilters,
```
- File `/workspace/Web/src/app/dashboard/settings/page.tsx`
  - Exports: `SettingsPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `SettingsPage` spans lines 28-269 and encapsulates UI state for app.
```tsx
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('office')
  const [isSaving, setIsSaving] = useState(false)

  // Office Info State
  const [officeInfo, setOfficeInfo] = useState({
    name: 'مكتب العقارات المميز',
    phone: '+966501234567',
    email: 'info@realestate.com',
    address: 'الرياض، حي الملقا، شارع الأمير تركي',
    description: 'نحن نقدم أفضل الخدمات العقارية...'
  })

  /**
   * حفظ الإعدادات
   */
  const handleSave = () => {
    setIsSaving(true)
```
- File `/workspace/Web/src/app/layout.tsx`
  - Exports: `metadata`, `RootLayout`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `metadata` spans lines 11-14 and encapsulates UI state for app.
```tsx
export const metadata: Metadata = {
  title: 'نظام إدارة العقارات',
  description: 'نظام شامل لإدارة العقارات والمكاتب العقارية',
}
```
  - `RootLayout` spans lines 16-29 and encapsulates UI state for app.
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
```
- File `/workspace/Web/src/app/login/page.tsx`
  - Exports: `LoginPage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `LoginPage` spans lines 19-162 and encapsulates UI state for app.
```tsx
export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      // ⚠️ Development only - skip API validation
```
- File `/workspace/Web/src/app/page.tsx`
  - Exports: `Home`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `Home` spans lines 3-6 and encapsulates UI state for app.
```tsx
export default function Home() {
  // Skip login - go directly to dashboard
  redirect('/dashboard')
}
```
- File `/workspace/Web/src/app/public/maintenance/page.tsx`
  - Exports: `PublicMaintenancePage`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PublicMaintenancePage` spans lines 40-398 and encapsulates UI state for app.
```tsx
export default function PublicMaintenancePage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [generatedTrackingCode, setGeneratedTrackingCode] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    propertyCode: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    issueType: '' as IssueType,
    description: ''
  })
type MaintenanceStatus = keyof typeof STATUS_LABELS;
```


## Appointments Module Deep Dive
- Summary: Coordinates scheduling, availability verification, and completion workflows for staff appointments.

### Controllers
#### File: `/workspace/api/src/appointments/appointments.controller.ts`
- Purpose: Orchestrates 13 endpoint(s) for appointments workflows while enforcing guards and role checks.
- Injected services: `appointmentsService: AppointmentsService`
- Decorators/guards: @ApiOperation({ summary: 'إتمام موعد' }), @ApiOperation({ summary: 'إحصائيات المواعيد' }), @ApiOperation({ summary: 'إرسال تذكير للموعد' }), @ApiOperation({ summary: 'إضافة موعد جديد' }), @ApiOperation({ summary: 'إلغاء موعد' }), @ApiOperation({ summary: 'التحقق من توفر موعد' }), @ApiOperation({ summary: 'المواعيد القادمة' }), @ApiOperation({ summary: 'تحديث حالة الموعد' }), @ApiOperation({ summary: 'تعديل موعد' }), @ApiOperation({ summary: 'تفاصيل موعد' }), @ApiOperation({ summary: 'حذف موعد' }), @ApiOperation({ summary: 'قائمة المواعيد مع filters' }), @ApiOperation({ summary: 'مواعيد اليوم' }), @ApiQuery({ name: 'limit', required: false, example: 10 }), @Delete(':id'), @Get(':id'), @Get('stats'), @Get('today'), @Get('upcoming'), @Get(), @Patch(':id'), @Patch(':id/cancel'), @Patch(':id/complete'), @Patch(':id/status'), @Post(':id/remind'), @Post('check-availability'), @Post(), @Roles('manager'), @Roles('manager', 'staff')
- Key Methods:
  - `findAll` → Get `/appointments`; roles: Public (requires JWT context); DTOs: `FilterAppointmentsDto`; services: `AppointmentsService.findAll`.
```ts
  async findAll(@Req() req: any, @Query() filters: FilterAppointmentsDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findAll(officeId, filters);
  }
```
  - `getStats` → Get `/appointments/stats`; roles: Public (requires JWT context); DTOs: None; services: `AppointmentsService.getStats`.
```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getStats(officeId);
  }
```
  - `getToday` → Get `/appointments/today`; roles: Public (requires JWT context); DTOs: None; services: `AppointmentsService.getToday`.
```ts
  async getToday(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getToday(officeId);
  }
```
  - `getUpcoming` → Get `/appointments/upcoming`; roles: Public (requires JWT context); DTOs: None; services: `AppointmentsService.getUpcoming`.
```ts
  async getUpcoming(@Req() req: any, @Query('limit') limit?: number) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getUpcoming(officeId, limit);
  }
```
  - `findOne` → Get `/appointments/:id`; roles: Public (requires JWT context); DTOs: None; services: `AppointmentsService.findOne`.
```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findOne(officeId, id);
  }
```
  - `create` → Post `/appointments`; roles: manager, staff; DTOs: `CreateAppointmentDto`; services: `AppointmentsService.create`.
```ts
  async create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.create(officeId, userId, dto);
    return { success: true, appointment };
  }
```
  - `update` → Patch `/appointments/:id`; roles: manager, staff; DTOs: `UpdateAppointmentDto`; services: `AppointmentsService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.update(officeId, id, dto);
    return { success: true, appointment };
  }
```
  - `remove` → Delete `/appointments/:id`; roles: manager; DTOs: None; services: `AppointmentsService.remove`.
```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.remove(officeId, id);
  }
```
  - `updateStatus` → Patch `/appointments/:id/status`; roles: manager, staff; DTOs: `UpdateStatusDto`; services: `AppointmentsService.updateStatus`.
```ts
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.updateStatus(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```
  - `cancel` → Patch `/appointments/:id/cancel`; roles: manager, staff; DTOs: `CancelAppointmentDto`; services: `AppointmentsService.cancel`.
```ts
  async cancel(@Req() req: any, @Param('id') id: string, @Body() dto: CancelAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.cancel(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```
  - `complete` → Patch `/appointments/:id/complete`; roles: manager, staff; DTOs: `CompleteAppointmentDto`; services: `AppointmentsService.complete`.
```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.complete(officeId, id, dto);
    return { success: true, appointment };
  }
```
  - `sendReminder` → Post `/appointments/:id/remind`; roles: manager, staff; DTOs: None; services: `AppointmentsService.sendReminder`.
```ts
  async sendReminder(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.sendReminder(officeId, id);
  }
```
  - `checkAvailability` → Post `/appointments/check-availability`; roles: manager, staff; DTOs: `CheckAvailabilityDto`; services: `AppointmentsService.checkAvailability`.
```ts
  async checkAvailability(@Req() req: any, @Body() dto: CheckAvailabilityDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.checkAvailability(officeId, dto);
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/appointments/appointments.service.ts`
- Purpose: Implements appointments business rules with 14 public method(s).
- Dependencies: `supabase: SupabaseService`
- Methods:
  - `create(officeId: string, userId: string, dto: CreateAppointmentDto)` lines 33-57 — Supabase data access.
```ts
  async create(officeId: string, userId: string, dto: CreateAppointmentDto) {
    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .insert({
        office_id: officeId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: 'scheduled',
        date: dto.date,
        start_time: dto.startTime,
        end_time: dto.endTime,
        property_id: dto.propertyId,
        customer_id: dto.customerId,
        assigned_staff_id: dto.assignedStaffId,
        location: dto.location,
        meeting_link: dto.meetingLink,
        notes: dto.notes,
        created_by: userId,
      })
      .select()
      .single();
```
  - `findAll(officeId: string, filters?: any)` lines 59-92 — Supabase data access.
```ts
  async findAll(officeId: string, filters?: any) {
    // Pagination
    const page: number = Math.max(1, Number(filters?.page ?? 1));
    const limit: number = Math.min(100, Math.max(1, Number(filters?.limit ?? 50)));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Base query with total count
    let query = this.supabase
      .getClient()
      .from('appointments')
      .select('*', { count: 'exact' })
      .eq('office_id', officeId);
    
    // Filters
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.date) query = query.eq('date', filters.date);
    if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type);
    if (filters?.assigned_staff_id) query = query.eq('assigned_staff_id', filters.assigned_staff_id);
    if (filters?.property_id) query = query.eq('property_id', filters.property_id);
    if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id);
```
  - `findOne(officeId: string, id: string)` lines 94-103 — Supabase data access, error signalling.
```ts
  async findOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();
    if (error) throw new NotFoundException();
    return data;
  }
```
  - `update(officeId: string, id: string, dto: UpdateAppointmentDto)` lines 105-120 — Supabase data access, error signalling.
```ts
  async update(officeId: string, id: string, dto: UpdateAppointmentDto) {
    const updates: any = { updated_at: new Date().toISOString() };
    if (dto.title) updates.title = dto.title;
    if (dto.startTime) updates.start_time = dto.startTime;
    if (dto.endTime) updates.end_time = dto.endTime;

    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .eq('office_id', officeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
```
  - `remove(officeId: string, id: string)` lines 122-130 — Supabase data access, error signalling.
```ts
  async remove(officeId: string, id: string) {
    const { error } = await this.supabase.getClient()
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('office_id', officeId);
    if (error) throw error;
    return { message: 'Appointment deleted' };
  }
```
  - `getStats(officeId: string)` lines 132-134 — business logic.
```ts
  async getStats(officeId: string) {
    return { total: 0, today: 0, upcoming: 0 };
  }
```
  - `getCalendar(officeId: string, startDate: string, endDate: string)` lines 136-138 — business logic.
```ts
  async getCalendar(officeId: string, startDate: string, endDate: string) {
    return [];
  }
```
  - `getToday(officeId: string)` lines 140-142 — business logic.
```ts
  async getToday(officeId: string) {
    return [];
  }
```
  - `getUpcoming(officeId: string, limit?: number)` lines 144-146 — business logic.
```ts
  async getUpcoming(officeId: string, limit?: number) {
    return [];
  }
```
  - `updateStatus(officeId: string, id: string, userId: string, dto: any)` lines 148-150 — business logic.
```ts
  async updateStatus(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```
  - `cancel(officeId: string, id: string, userId: string, dto: any)` lines 152-154 — business logic.
```ts
  async cancel(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```
  - `complete(officeId: string, id: string, dto: any)` lines 156-158 — business logic.
```ts
  async complete(officeId: string, id: string, dto: any) {
    return {};
  }
```
  - `sendReminder(officeId: string, id: string)` lines 160-162 — business logic.
```ts
  async sendReminder(officeId: string, id: string) {
    return { message: 'Reminder sent' };
  }
```
  - `checkAvailability(officeId: string, dto: any)` lines 164-166 — business logic.
```ts
  async checkAvailability(officeId: string, dto: any) {
    return { available: true };
  }
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.

### DTOs
- `CancelAppointmentDto` (`/workspace/api/src/appointments/dto/cancel-appointment.dto.ts`)
  - Fields:
    - `cancellationReason`: `string`; validators: @ApiProperty({ example: 'العميل طلب إلغاء الموعد', description: 'سبب الإلغاء' }), @IsString()
  - Used by: AppointmentsController.cancel
- `CheckAvailabilityDto` (`/workspace/api/src/appointments/dto/check-availability.dto.ts`)
  - Fields:
    - `date`: `string`; validators: @ApiProperty({ example: '2025-10-20', description: 'التاريخ' }), @IsDateString()
    - `startTime`: `string`; validators: @ApiProperty({ example: '10:00:00', description: 'وقت البداية' }), @IsString()
    - `endTime`: `string`; validators: @ApiProperty({ example: '11:00:00', description: 'وقت النهاية' }), @IsString()
    - `assignedStaffId`: `string`; validators: @ApiProperty({ example: 'uuid-staff-id', description: 'معرف الموظف' }), @IsUUID()
  - Used by: AppointmentsController.checkAvailability
- `CompleteAppointmentDto` (`/workspace/api/src/appointments/dto/complete-appointment.dto.ts`)
  - Fields:
    - `completionNotes`: `string`; validators: @ApiProperty({ example: 'تمت المعاينة بنجاح، العميل مهتم بالعقار', description: 'ملاحظات الإتمام' }), @IsString()
  - Used by: AppointmentsController.complete
- `CreateAppointmentDto` (`/workspace/api/src/appointments/dto/create-appointment.dto.ts`)
  - Fields:
  - Used by: AppointmentsController.create
- `FilterAppointmentsDto` (`/workspace/api/src/appointments/dto/filter-appointments.dto.ts`)
  - Fields:
    - `page`: `number`; validators: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `limit`: `number`; validators: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `search`: `string`; validators: @ApiPropertyOptional({ example: 'معاينة', description: 'البحث في العنوان/الوصف' }), @IsOptional(), @IsString()
    - `type`: `string`; validators: @ApiPropertyOptional({ enum: ['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'], description: 'نوع الموعد' }), @IsOptional(), @IsEnum(['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'])
    - `status`: `string`; validators: @ApiPropertyOptional({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], description: 'حالة الموعد' }), @IsOptional(), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
    - `date`: `string`; validators: @ApiPropertyOptional({ example: '2025-10-20', description: 'التاريخ المحدد' }), @IsOptional(), @IsDateString()
    - `start_date`: `string`; validators: @ApiPropertyOptional({ example: '2025-10-01', description: 'من تاريخ' }), @IsOptional(), @IsDateString()
    - `end_date`: `string`; validators: @ApiPropertyOptional({ example: '2025-10-31', description: 'إلى تاريخ' }), @IsOptional(), @IsDateString()
    - `property_id`: `string`; validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العقار' }), @IsOptional(), @IsUUID()
    - `customer_id`: `string`; validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العميل' }), @IsOptional(), @IsUUID()
    - `assigned_staff_id`: `string`; validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف' }), @IsOptional(), @IsUUID()
    - `order_by`: `string`; validators: @ApiPropertyOptional({ enum: ['date', 'created_at', 'start_time'], example: 'date', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
    - `order`: `string`; validators: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])
  - Used by: AppointmentsController.findAll
- `UpdateAppointmentDto` (`/workspace/api/src/appointments/dto/update-appointment.dto.ts`)
  - Fields:
  - Used by: AppointmentsController.update
- `UpdateStatusDto` (`/workspace/api/src/appointments/dto/update-status.dto.ts`)
  - Fields:
    - `status`: `string`; validators: @ApiProperty({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], example: 'confirmed', description: 'الحالة الجديدة' }), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
    - `notes`: `string`; validators: @ApiPropertyOptional({ example: 'تم تأكيد الموعد مع العميل', description: 'ملاحظات' }), @IsString(), @IsOptional()
  - Used by: AppointmentsController.updateStatus


## Components Module Deep Dive
- Summary: The `Components` module encapsulates domain responsibilities.

### Frontend Surfaces
- File `/workspace/Web/src/components/analytics/executive/GoalsTracking.tsx`
  - Exports: `GoalsTracking`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `GoalsTracking` spans lines 19-135 and encapsulates UI state for components.
```tsx
export function GoalsTracking({
  /**
   * الأيقونة حسب المعرف
   */
  const getIcon = (id: string) => {
    if (id.includes('revenue')) return <DollarSign className="w-6 h-6" />
    if (id.includes('deals')) return <TrendingUp className="w-6 h-6" />
    if (id.includes('occupancy')) return <Target className="w-6 h-6" />
    if (id.includes('satisfaction')) return <Star className="w-6 h-6" />
    return <Target className="w-6 h-6" />
  }

  /**
   * حالة الهدف
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
```
- File `/workspace/Web/src/components/analytics/executive/KPIsGrid.tsx`
  - Exports: `KPIsGrid`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `KPIsGrid` spans lines 19-130 and encapsulates UI state for components.
```tsx
export function KPIsGrid({
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
```
- File `/workspace/Web/src/components/analytics/executive/MarketInsights.tsx`
  - Exports: `MarketInsights`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `MarketInsights` spans lines 29-135 and encapsulates UI state for components.
```tsx
export function MarketInsights({
  /**
   * الأيقونة حسب النوع
   */
  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="w-6 h-6" />
      case 'trend':
        return <TrendingUp className="w-6 h-6" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />
      case 'alert':
        return <Target className="w-6 h-6" />
      case 'info':
        return <DollarSign className="w-6 h-6" />
      default:
        return <Lightbulb className="w-6 h-6" />
```
- File `/workspace/Web/src/components/analytics/executive/RevenueBreakdown.tsx`
  - Exports: `RevenueBreakdown`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `RevenueBreakdown` spans lines 27-84 and encapsulates UI state for components.
```tsx
export function RevenueBreakdown({
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        تفصيل الإيرادات (آخر 6 أشهر)
      </h3>
```
- File `/workspace/Web/src/components/analytics/executive/SalesFunnel.tsx`
  - Exports: `SalesFunnel`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `SalesFunnel` spans lines 17-92 and encapsulates UI state for components.
```tsx
export function SalesFunnel({
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }

  // حساب أقصى عرض للقمع
  const maxCount = Math.max(...stages.map(s => s.count))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">
```
- File `/workspace/Web/src/components/analytics/executive/SummaryCards.tsx`
  - Exports: `SummaryCards`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `SummaryCards` spans lines 18-139 and encapsulates UI state for components.
```tsx
export function SummaryCards({
  /**
   * رسم Sparkline
   */
  const renderSparkline = (data: number[], color: string) => {
    if (!data || data.length === 0) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 40 - ((value - min) / range) * 40
      return `${x},${y}`
    }).join(' ')
    
    return (
```
- File `/workspace/Web/src/components/analytics/executive/TopPerformers.tsx`
  - Exports: `TopPerformers`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `TopPerformers` spans lines 18-182 and encapsulates UI state for components.
```tsx
export function TopPerformers({
  /**
   * Emoji للترتيب
   */
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank.toString()
  }

  /**
   * تقييم بالنجوم
   */
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
```
- File `/workspace/Web/src/components/appointments/AppointmentCalendar.tsx`
  - Exports: `AppointmentCalendar`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentCalendar` spans lines 20-224 and encapsulates UI state for components.
```tsx
export function AppointmentCalendar({
  appointments, 
  selectedDate: propSelectedDate,
  onDateSelect, 
  onAddClick,
  onStatusUpdate,
  onRefresh 
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(propSelectedDate || null);

  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
      setCurrentMonth(propSelectedDate);
    }
  }, [propSelectedDate]);
```
- File `/workspace/Web/src/components/appointments/AppointmentCard.tsx`
  - Exports: `AppointmentCard`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentCard` spans lines 34-159 and encapsulates UI state for components.
```tsx
export function AppointmentCard({
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeAppointment } = useAppointmentsStore();
  
  const isExpired = isPast(appointment.date, appointment.endTime);

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;

    setIsDeleting(true);
    try {
      await deleteAppointment(appointment.id);
      removeAppointment(appointment.id);
      toast.success('تم حذف الموعد بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
```
- File `/workspace/Web/src/components/appointments/AppointmentDetailsCard.tsx`
  - Exports: `AppointmentDetailsCard`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentDetailsCard` spans lines 19-160 and encapsulates UI state for components.
```tsx
export function AppointmentDetailsCard({
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{appointment.title}</h2>
        <div className="flex items-center gap-2">
          <Badge className={getAppointmentTypeColor(appointment.type)}>
            {getAppointmentTypeLabel(appointment.type)}
          </Badge>
          <Badge className={getAppointmentStatusColor(appointment.status)}>
            {getAppointmentStatusLabel(appointment.status)}
          </Badge>
        </div>
      </div>

      {/* Description */}
      {appointment.description && (
```
- File `/workspace/Web/src/components/appointments/AppointmentForm.tsx`
  - Exports: `AppointmentForm`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentForm` spans lines 41-204 and encapsulates UI state for components.
```tsx
export function AppointmentForm({
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!appointment;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      title: appointment.title,
      description: appointment.description || '',
      type: appointment.type,
      date: appointment.date,
```
- File `/workspace/Web/src/components/appointments/AppointmentStats.tsx`
  - Exports: `AppointmentStats`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentStats` spans lines 10-88 and encapsulates UI state for components.
```tsx
export function AppointmentStats({
  const statCards = [
    {
      title: 'إجمالي المواعيد',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `${stats.todayAppointments} موعد اليوم`,
    },
    {
      title: 'مجدولة',
      value: stats.scheduled,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: 'في الانتظار',
    },
```
- File `/workspace/Web/src/components/appointments/AppointmentsFilters.tsx`
  - Exports: `AppointmentsFilters`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentsFilters` spans lines 20-134 and encapsulates UI state for components.
```tsx
export function AppointmentsFilters({
  const { filters, setFilters, resetFilters, viewMode, setViewMode } = useAppointmentsStore();

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && value !== ''
  ).length;

  const appointmentTypes: { value: AppointmentType | 'all'; label: string }[] = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'viewing', label: 'معاينة عقار' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'contract_signing', label: 'توقيع عقد' },
    { value: 'handover', label: 'تسليم عقار' },
    { value: 'inspection', label: 'فحص عقار' },
    { value: 'other', label: 'أخرى' },
  ];

  const appointmentStatuses: { value: AppointmentStatus | 'all'; label: string }[] = [
```
- File `/workspace/Web/src/components/appointments/AppointmentsList.tsx`
  - Exports: `AppointmentsList`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AppointmentsList` spans lines 14-68 and encapsulates UI state for components.
```tsx
export function AppointmentsList({
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          لا توجد مواعيد
        </h3>
        <p className="mt-2 text-gray-600">
          لم يتم العثور على مواعيد مطابقة للفلاتر
        </p>
      </div>
    );
  }

  const groupedAppointments = groupAppointmentsByDate(appointments);
  const sortedDates = Object.keys(groupedAppointments).sort();
```
- File `/workspace/Web/src/components/appointments/CancelDialog.tsx`
  - Exports: `CancelDialog`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CancelDialog` spans lines 18-79 and encapsulates UI state for components.
```tsx
export function CancelDialog({
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('يجب إدخال سبب الإلغاء');
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelAppointment(appointmentId, reason);
      toast.success('تم إلغاء الموعد بنجاح');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Cancel error:', error);
```
- File `/workspace/Web/src/components/appointments/CompleteDialog.tsx`
  - Exports: `CompleteDialog`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CompleteDialog` spans lines 18-70 and encapsulates UI state for components.
```tsx
export function CompleteDialog({
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeAppointment(appointmentId, notes || undefined);
      toast.success('تم تعليم الموعد كمكتمل');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Complete error:', error);
      toast.error('حدث خطأ في تحديث الموعد');
    } finally {
      setIsSubmitting(false);
    }
  };
```
- File `/workspace/Web/src/components/appointments/QuickAddDialog.tsx`
  - Exports: `QuickAddDialog`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `QuickAddDialog` spans lines 32-129 and encapsulates UI state for components.
```tsx
export function QuickAddDialog({
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<QuickFormData>({
    resolver: zodResolver(quickSchema),
    defaultValues: {
      date: initialDate || new Date().toISOString().split('T')[0],
      type: 'viewing',
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const types: { value: AppointmentType; label: string }[] = [
    { value: 'viewing', label: 'معاينة عقار' },
    { value: 'meeting', label: 'اجتماع' },
    { value: 'contract_signing', label: 'توقيع عقد' },
    { value: 'handover', label: 'تسليم' },
```
- File `/workspace/Web/src/components/appointments/StatusUpdateDialog.tsx`
  - Exports: `StatusUpdateDialog`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `StatusUpdateDialog` spans lines 19-85 and encapsulates UI state for components.
```tsx
export function StatusUpdateDialog({
  const [status, setStatus] = useState<AppointmentStatus>('confirmed');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statuses: { value: AppointmentStatus; label: string }[] = [
    { value: 'scheduled', label: 'مجدول' },
    { value: 'confirmed', label: 'مؤكد' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'no_show', label: 'لم يحضر' },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateAppointmentStatus(appointmentId, status, notes || undefined);
      toast.success('تم تحديث حالة الموعد بنجاح');
```
- File `/workspace/Web/src/components/contracts/ContractCard.tsx`
  - Exports: `ContractCard`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ContractCard` spans lines 49-257 and encapsulates UI state for components.
```tsx
export function ContractCard({
  contract,
  onView,
  onEdit,
  onPrint,
  onTerminate
}: ContractCardProps) {
  /**
   * تنسيق التاريخ
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
```
- File `/workspace/Web/src/components/contracts/ContractsFilters.tsx`
  - Exports: `ContractsFilters`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ContractsFilters` spans lines 29-251 and encapsulates UI state for components.
```tsx
export function ContractsFilters({
  filters,
  onFiltersChange,
  onReset
}: ContractsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  /**
   * تحديث نوع العقد
   */
  const handleTypeChange = (type: ContractType, checked: boolean) => {
    const currentTypes = filters.type || []
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type)
    
    onFiltersChange({ ...filters, type: newTypes.length > 0 ? newTypes : undefined })
  }
```
- File `/workspace/Web/src/components/contracts/ContractsTable.tsx`
  - Exports: `ContractsTable`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ContractsTable` spans lines 57-295 and encapsulates UI state for components.
```tsx
export function ContractsTable({
  contracts,
  isLoading,
  onView,
  onEdit,
  onPrint,
  onTerminate
}: ContractsTableProps) {
  /**
   * تنسيق التاريخ
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
```
- File `/workspace/Web/src/components/contracts/StatsCards.tsx`
  - Exports: `StatsCards`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `StatsCards` spans lines 23-100 and encapsulates UI state for components.
```tsx
export function StatsCards({
  const cards = [
    {
      title: 'العقود النشطة',
      value: stats.totalActive,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'المنتهية (هذا الشهر)',
      value: stats.expiredThisMonth,
      icon: XCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'القيمة الإجمالية',
```
- File `/workspace/Web/src/components/customers/AddInteractionDialog.tsx`
  - Exports: `AddInteractionDialog`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AddInteractionDialog` spans lines 46-213 and encapsulates UI state for components.
```tsx
export function AddInteractionDialog({
  open, 
  onOpenChange, 
  customerId,
  onSuccess 
}: AddInteractionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InteractionForm>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
```
- File `/workspace/Web/src/components/customers/AddNoteDialog.tsx`
  - Exports: `AddNoteDialog`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `AddNoteDialog` spans lines 38-207 and encapsulates UI state for components.
```tsx
export function AddNoteDialog({
  open, 
  onOpenChange, 
  customerId,
  onSuccess 
}: AddNoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NoteForm>({
```
- File `/workspace/Web/src/components/customers/CustomerCard.tsx`
  - Exports: `CustomerCard`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerCard` spans lines 62-369 and encapsulates UI state for components.
```tsx
export function CustomerCard({
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { removeCustomer } = useCustomersStore();

  const valueTier = getCustomerValueTier(customer);
  const avatarColor = getAvatarColor(customer.id);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(customer.id);
      removeCustomer(customer.id);
      toast.success('تم حذف العميل بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
```
- File `/workspace/Web/src/components/customers/CustomerContractsList.tsx`
  - Exports: `CustomerContractsList`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerContractsList` spans lines 15-154 and encapsulates UI state for components.
```tsx
export function CustomerContractsList({
  const router = useRouter();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'نشط',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      pending: 'قيد الانتظار',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
```
- File `/workspace/Web/src/components/customers/CustomerFilters.tsx`
  - Exports: `CustomerFilters`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerFilters` spans lines 31-286 and encapsulates UI state for components.
```tsx
export function CustomerFilters({
  const { filters, setFilters, resetFilters } = useCustomersStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  const handleReset = () => {
    resetFilters();
    setIsOpen(false);
  };

  return (
```
- File `/workspace/Web/src/components/customers/CustomerForm.tsx`
  - Exports: `CustomerForm`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerForm` spans lines 44-399 and encapsulates UI state for components.
```tsx
export function CustomerForm({
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      nationalId: customer.nationalId || '',
```
- File `/workspace/Web/src/components/customers/CustomerInfoCard.tsx`
  - Exports: `CustomerInfoCard`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerInfoCard` spans lines 37-289 and encapsulates UI state for components.
```tsx
export function CustomerInfoCard({
  const valueTier = getCustomerValueTier(customer);
  const avatarColor = getAvatarColor(customer.id);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}>
            {getInitials(customer.name)}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
```
- File `/workspace/Web/src/components/customers/CustomerInteractionsList.tsx`
  - Exports: `CustomerInteractionsList`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerInteractionsList` spans lines 13-148 and encapsulates UI state for components.
```tsx
export function CustomerInteractionsList({
  const getInteractionIcon = (type: InteractionType) => {
    const icons: Record<InteractionType, any> = {
      call: Phone,
      meeting: Users,
      property_viewing: Eye,
      contract_signing: FileText,
      payment: DollarSign,
      complaint: AlertCircle,
      inquiry: MessageSquare,
      follow_up: Calendar,
    };
    return icons[type] || MessageSquare;
  };

  const getInteractionLabel = (type: InteractionType) => {
    const labels: Record<InteractionType, string> = {
      call: 'اتصال هاتفي',
```
- File `/workspace/Web/src/components/customers/CustomerNotesList.tsx`
  - Exports: `CustomerNotesList`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerNotesList` spans lines 28-143 and encapsulates UI state for components.
```tsx
export function CustomerNotesList({
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteCustomerNote(customerId, deleteId);
      toast.success('تم حذف الملاحظة بنجاح');
      onRefresh?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('حدث خطأ في حذف الملاحظة');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
```
- File `/workspace/Web/src/components/customers/CustomerPagination.tsx`
  - Exports: `CustomerPagination`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerPagination` spans lines 13-164 and encapsulates UI state for components.
```tsx
export function CustomerPagination({
  currentPage,
  totalPages,
  totalCount,
}: CustomerPaginationProps) {
  const { setPage } = useCustomersStore();

  const handlePrevious = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };
```
- File `/workspace/Web/src/components/customers/CustomerPropertiesList.tsx`
  - Exports: `CustomerPropertiesList`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerPropertiesList` spans lines 18-171 and encapsulates UI state for components.
```tsx
export function CustomerPropertiesList({
  properties, 
  customerId,
  onRefresh 
}: CustomerPropertiesListProps) {
  const router = useRouter();

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      owner: 'مالك',
      tenant: 'مستأجر',
      interested: 'مهتم',
      viewed: 'شاهد العقار',
    };
    return labels[relationship] || relationship;
  };

  const getRelationshipColor = (relationship: string) => {
```
- File `/workspace/Web/src/components/customers/CustomerStats.tsx`
  - Exports: `CustomerStats`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomerStats` spans lines 11-82 and encapsulates UI state for components.
```tsx
export function CustomerStats({
  const statCards = [
    {
      title: 'إجمالي العملاء',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `${stats.newThisMonth} جديد هذا الشهر`,
    },
    {
      title: 'عملاء نشطون',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${Math.round((stats.active / stats.total) * 100)}% من الإجمالي`,
    },
```
- File `/workspace/Web/src/components/customers/export/ColumnSelector.tsx`
  - Exports: `ColumnSelector`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ColumnSelector` spans lines 24-209 and encapsulates UI state for components.
```tsx
export function ColumnSelector({
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
```
- File `/workspace/Web/src/components/customers/export/ExportHistory.tsx`
  - Exports: `ExportHistory`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExportHistory` spans lines 60-145 and encapsulates UI state for components.
```tsx
export function ExportHistory() {
  /**
   * الحصول على أيقونة حسب نوع الملف
   */
  const getFileIcon = (format: string) => {
    switch (format) {
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      case 'csv':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'pdf':
        return <FileType className="w-4 h-4 text-red-600" />
      default:
        return <FileSpreadsheet className="w-4 h-4" />
    }
  }
  
  /**
```
- File `/workspace/Web/src/components/customers/export/ExportOptions.tsx`
  - Exports: `ExportOptions`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExportOptions` spans lines 24-171 and encapsulates UI state for components.
```tsx
export function ExportOptions({
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#0066CC]" />
        خيارات التصدير
      </h3>
      
      <RadioGroup
        value={config.exportType}
        onValueChange={(value) => onConfigChange({ exportType: value as any })}
        className="space-y-4"
      >
        {/* تصدير الكل */}
        <div className="flex items-start space-x-3 space-x-reverse">
          <RadioGroupItem value="all" id="export-all" className="mt-1" />
          <div className="flex-1">
            <Label
```
- File `/workspace/Web/src/components/customers/export/ExportPreview.tsx`
  - Exports: `ExportPreview`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExportPreview` spans lines 77-216 and encapsulates UI state for components.
```tsx
export function ExportPreview({
  // الحصول على معلومات الأعمدة المحددة
  const selectedColumnsInfo = config.columns.map(colKey => 
    AVAILABLE_COLUMNS.find(col => col.key === colKey)
  ).filter(Boolean)
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#0066CC]" />
            معاينة التصدير
          </DialogTitle>
          <p className="text-sm text-gray-600">
            معاينة أول 5 صفوف من البيانات المراد تصديرها
          </p>
        </DialogHeader>
```
- File `/workspace/Web/src/components/customers/export/ExportProgress.tsx`
  - Exports: `ExportProgress`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExportProgress` spans lines 21-68 and encapsulates UI state for components.
```tsx
export function ExportProgress({
  const percentage = Math.round((progress / total) * 100)
  
  return (
    <Card className="p-6 fixed bottom-6 left-6 right-6 shadow-lg z-50 max-w-md mx-auto">
      <div className="space-y-4">
        {/* العنوان */}
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Download className="w-6 h-6 text-[#0066CC] animate-bounce" />
          )}
          <div className="flex-1">
            <div className="font-semibold">
              {isComplete ? 'اكتمل التصدير!' : 'جاري تصدير العملاء...'}
            </div>
            <div className="text-sm text-gray-600">
```
- File `/workspace/Web/src/components/customers/export/FormatOptions.tsx`
  - Exports: `FormatOptions`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `FormatOptions` spans lines 25-210 and encapsulates UI state for components.
```tsx
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
```
- File `/workspace/Web/src/components/customers/templates/CustomTemplateCreator.tsx`
  - Exports: `CustomTemplateCreator`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CustomTemplateCreator` spans lines 39-354 and encapsulates UI state for components.
```tsx
export function CustomTemplateCreator({
  template, 
  onSave, 
  onCancel 
}: CustomTemplateCreatorProps) {
  const isEditing = !!template
  
  // حالة النموذج
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [selectedFields, setSelectedFields] = useState<TemplateField[]>(
    template?.fields || []
  )
  const [showPreview, setShowPreview] = useState(false)
  
  /**
   * تحديد/إلغاء تحديد حقل
   */
```
- File `/workspace/Web/src/components/customers/templates/MyTemplates.tsx`
  - Exports: `MyTemplates`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `MyTemplates` spans lines 37-139 and encapsulates UI state for components.
```tsx
export function MyTemplates({
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
```
- File `/workspace/Web/src/components/customers/templates/TemplateCard.tsx`
  - Exports: `TemplateCard`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `TemplateCard` spans lines 38-208 and encapsulates UI state for components.
```tsx
export function TemplateCard({
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
```
- File `/workspace/Web/src/components/customers/templates/TemplatesGallery.tsx`
  - Exports: `TemplatesGallery`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `TemplatesGallery` spans lines 18-26 and encapsulates UI state for components.
```tsx
export function TemplatesGallery({
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
```
- File `/workspace/Web/src/components/dashboard/Header.tsx`
  - Exports: `Header`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `Header` spans lines 21-108 and encapsulates UI state for components.
```tsx
export function Header({
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
```
- File `/workspace/Web/src/components/dashboard/Sidebar.tsx`
  - Exports: `Sidebar`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `Sidebar` spans lines 23-80 and encapsulates UI state for components.
```tsx
export function Sidebar({
  const pathname = usePathname()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-64 bg-white border-l shadow-xl transform transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
```
- File `/workspace/Web/src/components/finance/ActiveContractsTable.tsx`
  - Exports: `ActiveContractsTable`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ActiveContractsTable` spans lines 19-159 and encapsulates UI state for components.
```tsx
export function ActiveContractsTable({
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
```
- File `/workspace/Web/src/components/finance/BudgetSection.tsx`
  - Exports: `BudgetSection`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `BudgetSection` spans lines 18-165 and encapsulates UI state for components.
```tsx
export function BudgetSection({
  // تحديد ما إذا كان هناك تحذير (تجاوز 90%)
  const isWarning = budget.percentage >= 90;
  const isExceeded = budget.percentage >= 100;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
```
- File `/workspace/Web/src/components/finance/CashFlowChart.tsx`
  - Exports: `CashFlowChart`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `CashFlowChart` spans lines 28-155 and encapsulates UI state for components.
```tsx
export function CashFlowChart({
  /**
   * تنسيق القيمة في Tooltip
   */
  const formatValue = (value: number) => {
    return `${value.toLocaleString()} ريال`;
  };

  /**
   * Custom Tooltip
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const inflow = payload.find((p: any) => p.dataKey === 'inflow')?.value || 0;
    const outflow = payload.find((p: any) => p.dataKey === 'outflow')?.value || 0;
    const net = inflow - outflow;
```
- File `/workspace/Web/src/components/finance/DateRangeFilter.tsx`
  - Exports: `DateRangeFilter`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `DateRangeFilter` spans lines 30-130 and encapsulates UI state for components.
```tsx
export function DateRangeFilter({
  /**
   * تطبيق نطاق سريع
   */
  const applyQuickSelect = (select: QuickDateSelect) => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (select) {
      case 'this-month':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth);
```
- File `/workspace/Web/src/components/finance/ExpensesDonutChart.tsx`
  - Exports: `ExpensesDonutChart`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExpensesDonutChart` spans lines 25-160 and encapsulates UI state for components.
```tsx
export function ExpensesDonutChart({
  /**
   * تنسيق القيمة في Tooltip
   */
  const formatValue = (value: number) => {
    return `${value.toLocaleString()} ريال`;
  };

  /**
   * Custom label للنسب
   */
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
```
- File `/workspace/Web/src/components/finance/KPICards.tsx`
  - Exports: `KPICards`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `KPICards` spans lines 26-227 and encapsulates UI state for components.
```tsx
export function KPICards({
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  /**
```
- File `/workspace/Web/src/components/finance/ProfitLossStatement.tsx`
  - Exports: `ProfitLossStatementComponent`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ProfitLossStatementComponent` spans lines 18-165 and encapsulates UI state for components.
```tsx
export function ProfitLossStatementComponent({
  statement, 
  isLoading 
}: ProfitLossStatementProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }
```
- File `/workspace/Web/src/components/finance/ReportGenerator.tsx`
  - Exports: `ReportGenerator`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ReportGenerator` spans lines 39-294 and encapsulates UI state for components.
```tsx
export function ReportGenerator({
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [reportType, setReportType] = useState<ReportType>('comprehensive')
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()).toISOString().split('T')[0],
    to: endOfMonth(new Date()).toISOString().split('T')[0]
  })

  /**
   * تطبيق نطاق سريع
   */
  const applyQuickDate = (type: string) => {
    const now = new Date()
    let from: Date, to: Date
```
- File `/workspace/Web/src/components/finance/RevenueChart.tsx`
  - Exports: `RevenueChart`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `RevenueChart` spans lines 28-108 and encapsulates UI state for components.
```tsx
export function RevenueChart({
  /**
   * تنسيق القيمة في Tooltip
   */
  const formatValue = (value: number) => {
    return `${value.toLocaleString()} ريال`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </Card>
    )
  }
```
- File `/workspace/Web/src/components/finance/RevenuePieChart.tsx`
  - Exports: `RevenuePieChart`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `RevenuePieChart` spans lines 25-147 and encapsulates UI state for components.
```tsx
export function RevenuePieChart({
  /**
   * تنسيق القيمة في Tooltip
   */
  const formatValue = (value: number) => {
    return `${value.toLocaleString()} ريال`;
  };

  /**
   * Custom label للنسب
   */
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
```
- File `/workspace/Web/src/components/finance/TopPropertiesTable.tsx`
  - Exports: `TopPropertiesTable`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `TopPropertiesTable` spans lines 19-137 and encapsulates UI state for components.
```tsx
export function TopPropertiesTable({
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
```
- File `/workspace/Web/src/components/layout/NotificationsPanel.tsx`
  - Exports: `NotificationsPanel`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `NotificationsPanel` spans lines 28-213 and encapsulates UI state for components.
```tsx
export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => n.status === 'unread').length

  /**
   * الأيقونة حسب النوع
   */
  const getIcon = (type: NotificationType) => {
    const icons = {
      appointment: Calendar,
      customer: Users,
      whatsapp: MessageCircle,
      maintenance: Wrench,
      payment: DollarSign,
      contract: FileText,
      property: Building,
```
- File `/workspace/Web/src/components/maintenance/MaintenanceStats.tsx`
  - Exports: `MaintenanceStats`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `MaintenanceStats` spans lines 19-94 and encapsulates UI state for components.
```tsx
export function MaintenanceStats({
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-gray-200 rounded w-10"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
```
- File `/workspace/Web/src/components/maintenance/RequestsTable.tsx`
  - Exports: `RequestsTable`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `RequestsTable` spans lines 48-293 and encapsulates UI state for components.
```tsx
export function RequestsTable({
  requests,
  isLoading,
  onView,
  onEdit,
  onAssign,
  onComplete,
  onDelete
}: RequestsTableProps) {
  /**
   * أيقونة نوع المشكلة
   */
  const getIssueIcon = (type: IssueType) => {
    const icons = {
      electrical: Zap,
      plumbing: Droplet,
      ac: Wind,
      carpentry: Hammer,
```
- File `/workspace/Web/src/components/payments/BulkActions.tsx`
  - Exports: `BulkActions`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `BulkActions` spans lines 21-74 and encapsulates UI state for components.
```tsx
export function BulkActions({
  selectedCount,
  onMarkAsPaid,
  onSendReminders,
  onExport,
  onDelete,
  onDeselectAll
}: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-gray-900">
```
- File `/workspace/Web/src/components/payments/OverdueAlerts.tsx`
  - Exports: `OverdueAlerts`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `OverdueAlerts` spans lines 20-64 and encapsulates UI state for components.
```tsx
export function OverdueAlerts({
  count,
  totalAmount,
  onView,
  onSendReminders,
  onDismiss
}: OverdueAlertsProps) {
  if (count === 0) return null

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-900">
              لديك {count} دفعات متأخرة
            </p>
```
- File `/workspace/Web/src/components/payments/PaymentCharts.tsx`
  - Exports: `PaymentCharts`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PaymentCharts` spans lines 43-223 and encapsulates UI state for components.
```tsx
export function PaymentCharts({
  monthlyData,
  statusDistribution,
  methodDistribution,
  monthlyTypeData,
  isLoading
}: PaymentChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </Card>
        ))}
```
- File `/workspace/Web/src/components/payments/PaymentFilters.tsx`
  - Exports: `PaymentFiltersComponent`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PaymentFiltersComponent` spans lines 30-317 and encapsulates UI state for components.
```tsx
export function PaymentFiltersComponent({
  const [isExpanded, setIsExpanded] = useState(true)

  /**
   * تطبيق نطاق سريع
   */
  const applyQuickDate = (type: string) => {
    const now = new Date()
    let from: Date, to: Date

    switch (type) {
      case 'today':
        from = to = now
        break
      case 'this-week':
        from = new Date(now.setDate(now.getDate() - now.getDay()))
        to = new Date()
        break
```
- File `/workspace/Web/src/components/payments/PaymentStats.tsx`
  - Exports: `PaymentStats`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PaymentStats` spans lines 20-87 and encapsulates UI state for components.
```tsx
export function PaymentStats({
  collectionRate,
  averageAmount,
  fastestPayment,
  averageDelay,
  isLoading
}: PaymentStatsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </Card>
    )
```
- File `/workspace/Web/src/components/payments/PaymentsTable.tsx`
  - Exports: `PaymentsTable`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PaymentsTable` spans lines 58-358 and encapsulates UI state for components.
```tsx
export function PaymentsTable({
  payments,
  isLoading,
  selectedIds,
  onSelectionChange,
  onViewDetails,
  onEdit,
  onMarkAsPaid,
  onSendReminder
}: PaymentsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  /**
   * Toggle selection
   */
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
```
- File `/workspace/Web/src/components/payments/QuickActions.tsx`
  - Exports: `QuickActions`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `QuickActions` spans lines 19-48 and encapsulates UI state for components.
```tsx
export function QuickActions({
  onAddPayment,
  onSendReminders,
  onOverdueReport,
  onExportAll
}: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onAddPayment} size="lg">
        <Plus className="w-5 h-5 ml-2" />
        دفعة جديدة
      </Button>

      <Button variant="outline" onClick={onSendReminders}>
        <Send className="w-4 h-4 ml-2" />
        إرسال تذكير
      </Button>
```
- File `/workspace/Web/src/components/payments/StatsCards.tsx`
  - Exports: `StatsCards`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `StatsCards` spans lines 26-178 and encapsulates UI state for components.
```tsx
export function StatsCards({
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
```
- File `/workspace/Web/src/components/properties/PropertiesFilters.tsx`
  - Exports: `PropertiesFilters`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PropertiesFilters` spans lines 23-238 and encapsulates UI state for components.
```tsx
export function PropertiesFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: PropertiesFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cities = [
    'الرياض',
    'جدة',
    'مكة المكرمة',
    'المدينة المنورة',
    'الدمام',
    'الخبر',
    'الظهران',
    'تبوك',
    'أبها',
    'الطائف',
```
- File `/workspace/Web/src/components/properties/PropertiesPagination.tsx`
  - Exports: `PropertiesPagination`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PropertiesPagination` spans lines 12-129 and encapsulates UI state for components.
```tsx
export function PropertiesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PropertiesPaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // عدد الصفحات المرئية

    if (totalPages <= showPages) {
      // إذا كان العدد قليل، اعرض الكل
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // دائماً اعرض الصفحة الأولى
```
- File `/workspace/Web/src/components/properties/PropertyCard.tsx`
  - Exports: `PropertyCard`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `PropertyCard` spans lines 16-149 and encapsulates UI state for components.
```tsx
export function PropertyCard({
  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    sold: 'bg-red-100 text-red-800 border-red-200',
    rented: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const statusLabels = {
    available: 'متاح',
    sold: 'مباع',
    rented: 'مؤجر',
    pending: 'قيد الانتظار',
  };

  const typeLabels = {
    apartment: 'شقة',
    villa: 'فيلا',
```
- File `/workspace/Web/src/components/properties/import/ColumnMapper.tsx`
  - Exports: `ColumnMapper`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ColumnMapper` spans lines 22-162 and encapsulates UI state for components.
```tsx
export function ColumnMapper({
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
```
- File `/workspace/Web/src/components/properties/import/DataPreview.tsx`
  - Exports: `DataPreview`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `DataPreview` spans lines 34-295 and encapsulates UI state for components.
```tsx
export function DataPreview({
  data,
  mappings,
  errors,
  warnings,
  onConfirm,
  onCancel,
  isImporting
}: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const rowsPerPage = 10
  const totalPages = Math.ceil(data.length / rowsPerPage)
  
  const paginatedData = data.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  )
```
- File `/workspace/Web/src/components/properties/import/ExcelUploader.tsx`
  - Exports: `ExcelUploader`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ExcelUploader` spans lines 15-173 and encapsulates UI state for components.
```tsx
export function ExcelUploader({
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(async (selectedFile: File) => {
    setIsProcessing(true)
    
    try {
      // تحديد نوع الملف ومعالجته
      const extension = selectedFile.name.split('.').pop()?.toLowerCase()
      let parsedData: any
      
      if (extension === 'csv') {
        parsedData = await parseCSVFile(selectedFile)
      } else {
        parsedData = await parseExcelFile(selectedFile)
      }
```
- File `/workspace/Web/src/components/properties/import/ImportProgress.tsx`
  - Exports: `ImportProgress`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ImportProgress` spans lines 20-193 and encapsulates UI state for components.
```tsx
export function ImportProgress({
  currentCount, 
  totalCount,
  isComplete,
  successCount = 0,
  failedCount = 0
}: ImportProgressProps) {
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(null)

  // حساب النسبة المئوية
  const percentage = totalCount > 0 ? Math.round((currentCount / totalCount) * 100) : 0

  // تحديث الوقت المنقضي والمتبقي
  useEffect(() => {
    if (isComplete) return
```
- File `/workspace/Web/src/components/properties/import/ValidationSummary.tsx`
  - Exports: `ValidationSummary`
  - Purpose: Renders Next.js experiences aligned with this domain, consuming API routes documented above.
  - `ValidationSummary` spans lines 17-210 and encapsulates UI state for components.
```tsx
export function ValidationSummary({
  totalRows, 
  errors, 
  warnings 
}: ValidationSummaryProps) {
  // حساب الإحصائيات
  const errorRows = new Set(errors.map(e => e.row)).size
  const warningRows = new Set(warnings.map(w => w.row)).size
  const validRows = totalRows - errorRows - warningRows
  const validPercentage = totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0
  const warningPercentage = totalRows > 0 ? Math.round((warningRows / totalRows) * 100) : 0
  const errorPercentage = totalRows > 0 ? Math.round((errorRows / totalRows) * 100) : 0

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* العنوان */}
        <div className="flex items-center gap-3">
```


## Customers Module Deep Dive
- Summary: Delivers CRM capabilities including notes, interactions, property linking, and Excel import/export flows.

### Controllers
#### File: `/workspace/api/src/customers/customers.controller.ts`
- Purpose: Orchestrates 13 endpoint(s) for customers workflows while enforcing guards and role checks.
- Injected services: `customersService: CustomersService`
- Decorators/guards: @ApiOperation({ summary: 'إحصائيات العملاء' }), @ApiOperation({ summary: 'إضافة عميل جديد' }), @ApiOperation({ summary: 'إضافة ملاحظة للعميل' }), @ApiOperation({ summary: 'البحث السريع عن عملاء' }), @ApiOperation({ summary: 'تصدير العملاء إلى Excel' }), @ApiOperation({ summary: 'تعديل عميل' }), @ApiOperation({ summary: 'تفاصيل عميل' }), @ApiOperation({ summary: 'حذف عميل' }), @ApiOperation({ summary: 'حذف ملاحظة' }), @ApiOperation({ summary: 'ربط عقار بالعميل' }), @ApiOperation({ summary: 'قائمة العملاء مع filters' }), @ApiOperation({ summary: 'قائمة تعاملات العميل' }), @ApiOperation({ summary: 'قائمة ملاحظات العميل' }), @ApiQuery({ name: 'q', required: true, description: 'كلمة البحث' }), @Delete(':id'), @Delete(':id/notes/:noteId'), @Get(':id'), @Get(':id/interactions'), @Get(':id/notes'), @Get('export'), @Get('search'), @Get('stats'), @Get(), @Patch(':id'), @Post(':id/notes'), @Post(':id/properties'), @Post(), @Roles('manager'), @Roles('manager', 'staff')
- Key Methods:
  - `findAll` → Get `/customers`; roles: Public (requires JWT context); DTOs: `FilterCustomersDto`; services: `CustomersService.findAll`.
```ts
  async findAll(@Req() req: any, @Query() filters: FilterCustomersDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findAll(officeId, filters);
  }
```
  - `getStats` → Get `/customers/stats`; roles: Public (requires JWT context); DTOs: None; services: `CustomersService.getStats`.
```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getStats(officeId);
  }
```
  - `search` → Get `/customers/search`; roles: Public (requires JWT context); DTOs: None; services: `CustomersService.search`.
```ts
  async search(@Req() req: any, @Query('q') searchTerm: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.search(officeId, searchTerm);
  }
```
  - `exportExcel` → Get `/customers/export`; roles: manager, staff; DTOs: None; services: `CustomersService.exportExcel`.
```ts
  async exportExcel(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');

    const data = await this.customersService.exportExcel(officeId);
    
    const exportData = data.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      national_id: c.national_id,
      type: c.type,
      status: c.status,
      city: c.city,
      address: c.address,
      source: c.source,
      rating: c.rating,
```
  - `findOne` → Get `/customers/:id`; roles: Public (requires JWT context); DTOs: None; services: `CustomersService.findOne`.
```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findOne(officeId, id);
  }
```
  - `create` → Post `/customers`; roles: manager, staff; DTOs: `CreateCustomerDto`; services: `CustomersService.create`.
```ts
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.create(officeId, userId, dto);
    return { success: true, customer };
  }
```
  - `update` → Patch `/customers/:id`; roles: manager, staff; DTOs: `UpdateCustomerDto`; services: `CustomersService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.update(officeId, id, dto);
    return { success: true, customer };
  }
```
  - `remove` → Delete `/customers/:id`; roles: manager; DTOs: None; services: `CustomersService.remove`.
```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.remove(officeId, id);
  }
```
  - `getNotes` → Get `/customers/:id/notes`; roles: Public (requires JWT context); DTOs: None; services: `CustomersService.getNotes`.
```ts
  async getNotes(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getNotes(officeId, customerId);
  }
```
  - `createNote` → Post `/customers/:id/notes`; roles: manager, staff; DTOs: `CreateCustomerNoteDto`; services: `CustomersService.createNote`.
```ts
  async createNote(@Req() req: any, @Param('id') customerId: string, @Body() dto: CreateCustomerNoteDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const note = await this.customersService.createNote(officeId, customerId, userId, dto);
    return { success: true, note };
  }
```
  - `removeNote` → Delete `/customers/:id/notes/:noteId`; roles: manager, staff; DTOs: None; services: `CustomersService.removeNote`.
```ts
  async removeNote(@Req() req: any, @Param('id') customerId: string, @Param('noteId') noteId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.removeNote(officeId, customerId, noteId);
  }
```
  - `getInteractions` → Get `/customers/:id/interactions`; roles: Public (requires JWT context); DTOs: None; services: `CustomersService.getInteractions`.
```ts
  async getInteractions(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getInteractions(officeId, customerId);
  }
```
  - `linkProperty` → Post `/customers/:id/properties`; roles: manager, staff; DTOs: `LinkPropertyDto`; services: `CustomersService.linkProperty`.
```ts
  async linkProperty(@Req() req: any, @Param('id') customerId: string, @Body() dto: LinkPropertyDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const relationship = await this.customersService.linkProperty(officeId, customerId, dto);
    return { success: true, relationship };
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

#### File: `/workspace/api/src/customers/excel.controller.ts`
- Purpose: Orchestrates 3 endpoint(s) for customers workflows while enforcing guards and role checks.
- Injected services: `excelService: ExcelService`
- Decorators/guards: @Get('import-stats'), @Get('templates'), @Post('validate-file'), @UseInterceptors(FileInterceptor('file'))
- Key Methods:
  - `getTemplates` → Get `/customers/excel/templates`; roles: Public (requires JWT context); DTOs: None; services: `logger.log`, `ExcelService.getTemplates`, `logger.error`.
```ts
  async getTemplates() {
    this.logger.log('تلقي طلب جلب القوالب');

    try {
      const templates = await this.excelService.getTemplates();

      return {
        success: true,
        message: 'تم جلب القوالب بنجاح',
        data: templates
      };
    } catch (error) {
      this.logger.error('خطأ في جلب القوالب:', error);
      throw error;
    }
  }
```
  - `validateFile` → Post `/customers/excel/validate-file`; roles: Public (requires JWT context); DTOs: None; services: `logger.log`.
```ts
  async validateFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('تلقي طلب التحقق من الملف');

    if (!file) {
      throw new BadRequestException('الملف مطلوب');
    }

    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    const isValidType = allowedMimeTypes.includes(file.mimetype);
    const isValidSize = file.size <= maxSize;
```
  - `getImportStats` → Get `/customers/excel/import-stats`; roles: Public (requires JWT context); DTOs: None; services: `logger.log`.
```ts
  async getImportStats() {
    this.logger.log('تلقي طلب إحصائيات الاستيراد');

    // في التطبيق الحقيقي، يمكن حفظ هذه الإحصائيات في قاعدة البيانات
    // هنا نرجع بيانات تجريبية للتوضيح
    return {
      success: true,
      data: {
        totalImports: 0,
        totalRowsImported: 0,
        lastImportDate: null,
        averageImportTime: 0,
        errorRate: 0
      },
      message: 'جاري تطوير هذه الميزة'
    };
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/customers/customers.service.ts`
- Purpose: Implements customers business rules with 16 public method(s).
- Dependencies: `supabase: SupabaseService`
- Methods:
  - `create(officeId: string, userId: string, dto: CreateCustomerDto)` lines 33-57 — Supabase data access.
```ts
  async create(officeId: string, userId: string, dto: CreateCustomerDto) {
    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .insert({
        office_id: officeId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email || null,
        national_id: dto.nationalId || null,
        type: dto.type,
        status: dto.status || 'potential',
        address: dto.address || null,
        city: dto.city || null,
        preferred_contact_method: dto.preferredContactMethod || 'phone',
        notes: dto.notes || null,
        tags: dto.tags || [],
        source: dto.source || null,
        rating: dto.rating || null,
        created_by: userId,
      })
      .select()
      .single();
```
  - `findAll(officeId: string, filters?: any)` lines 59-98 — Supabase data access.
```ts
  async findAll(officeId: string, filters?: any) {
    // Pagination
    const page: number = Math.max(1, Number(filters?.page ?? 1));
    const limit: number = Math.min(100, Math.max(1, Number(filters?.limit ?? 20)));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Base query with total count
    let query = this.supabase
      .getClient()
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('office_id', officeId);

    // Filters (minimal useful subset; extend as needed)
    if (filters?.type && filters.type !== 'all') query = query.eq('type', filters.type);
    if (filters?.status && filters.status !== 'all') query = query.eq('status', filters.status);
    if (filters?.city) query = query.eq('city', filters.city);
    if (filters?.assigned_staff_id) query = query.eq('assigned_staff_id', filters.assigned_staff_id);
    if (filters?.search) {
      const term = String(filters.search).trim();
      if (term) {
```
  - `findOne(officeId: string, id: string)` lines 100-109 — Supabase data access, error signalling.
```ts
  async findOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();
    if (error) throw new NotFoundException();
    return data;
  }
```
  - `update(officeId: string, id: string, dto: UpdateCustomerDto)` lines 111-130 — Supabase data access, error signalling.
```ts
  async update(officeId: string, id: string, dto: UpdateCustomerDto) {
    const updates: any = { updated_at: new Date().toISOString() };
    if (dto.name) updates.name = dto.name;
    if (dto.phone) updates.phone = dto.phone;
    if (dto.email) updates.email = dto.email;
    if (dto.nationalId) updates.national_id = dto.nationalId;
    if (dto.type) updates.type = dto.type;
    if (dto.status) updates.status = dto.status;
    if (dto.preferredContactMethod) updates.preferred_contact_method = dto.preferredContactMethod;

    const { data, error } = await this.supabase.getClient()
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('office_id', officeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
```
  - `remove(officeId: string, id: string)` lines 132-140 — Supabase data access, error signalling.
```ts
  async remove(officeId: string, id: string) {
    const { error } = await this.supabase.getClient()
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('office_id', officeId);
    if (error) throw error;
    return { message: 'Customer deleted' };
  }
```
  - `getStats(officeId: string)` lines 142-144 — business logic.
```ts
  async getStats(officeId: string) {
    return { total: 0, active: 0, potential: 0 };
  }
```
  - `search(officeId: string, term: string)` lines 146-153 — Supabase data access.
```ts
  async search(officeId: string, term: string) {
    const { data } = await this.supabase.getClient()
      .from('customers')
      .select('*')
      .eq('office_id', officeId)
      .or(`name.ilike.%${term}%,phone.ilike.%${term}%`);
    return data || [];
  }
```
  - `exportExcel(officeId: string)` lines 155-157 — business logic.
```ts
  async exportExcel(officeId: string) {
    return [];
  }
```
  - `getNotes(officeId: string, customerId: string)` lines 159-161 — business logic.
```ts
  async getNotes(officeId: string, customerId: string) {
    return [];
  }
```
  - `createNote(officeId: string, customerId: string, userId: string, dto: any)` lines 163-165 — business logic.
```ts
  async createNote(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }
```
  - `updateNote(officeId: string, customerId: string, noteId: string, dto: any)` lines 167-169 — business logic.
```ts
  async updateNote(officeId: string, customerId: string, noteId: string, dto: any) {
    return {};
  }
```
  - `removeNote(officeId: string, customerId: string, noteId: string)` lines 171-173 — business logic.
```ts
  async removeNote(officeId: string, customerId: string, noteId: string) {
    return { message: 'Note deleted' };
  }
```
  - `getInteractions(officeId: string, customerId: string)` lines 175-177 — business logic.
```ts
  async getInteractions(officeId: string, customerId: string) {
    return [];
  }
```
  - `createInteraction(officeId: string, customerId: string, userId: string, dto: any)` lines 179-181 — business logic.
```ts
  async createInteraction(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }
```
  - `linkProperty(officeId: string, customerId: string, dto: any)` lines 183-185 — business logic.
```ts
  async linkProperty(officeId: string, customerId: string, dto: any) {
    return {};
  }
```
  - `unlinkProperty(officeId: string, customerId: string, propertyId: string)` lines 187-189 — business logic.
```ts
  async unlinkProperty(officeId: string, customerId: string, propertyId: string) {
    return { message: 'Property unlinked' };
  }
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.

#### File: `/workspace/api/src/customers/excel.service.ts`
- Purpose: Implements customers business rules with 0 public method(s).
- Dependencies: None
- Methods:
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.

### DTOs
- `CreateCustomerInteractionDto` (`/workspace/api/src/customers/dto/create-customer-interaction.dto.ts`)
  - Fields:
    - `type`: `string`; validators: @ApiProperty({ enum: ['call', 'meeting', 'email', 'whatsapp', 'visit'], example: 'call', description: 'نوع التعامل' }), @IsEnum(['call', 'meeting', 'email', 'whatsapp', 'visit'])
    - `description`: `string`; validators: @ApiProperty({ example: 'تم الاتصال لمتابعة طلب العميل', description: 'وصف التعامل' }), @IsString()
    - `date`: `string`; validators: @ApiProperty({ example: '2025-10-20T10:00:00Z', description: 'تاريخ التعامل' }), @IsDateString()
    - `propertyId`: `string`; validators: @ApiPropertyOptional({ example: 'uuid-property-id', description: 'معرف العقار المرتبط' }), @IsUUID(), @IsOptional()
    - `contractId`: `string`; validators: @ApiPropertyOptional({ example: 'uuid-contract-id', description: 'معرف العقد المرتبط' }), @IsUUID(), @IsOptional()
    - `outcome`: `string`; validators: @ApiPropertyOptional({ example: 'العميل مهتم ويريد زيارة العقار', description: 'نتيجة التعامل' }), @IsString(), @IsOptional()
    - `nextFollowUp`: `string`; validators: @ApiPropertyOptional({ example: '2025-10-25T14:00:00Z', description: 'تاريخ المتابعة القادمة' }), @IsDateString(), @IsOptional()
    - `staffId`: `string`; validators: @ApiPropertyOptional({ example: 'uuid-staff-id', description: 'معرف الموظف' }), @IsUUID(), @IsOptional()
  - Used by: None
- `CreateCustomerNoteDto` (`/workspace/api/src/customers/dto/create-customer-note.dto.ts`)
  - Fields:
    - `content`: `string`; validators: @ApiProperty({ example: 'العميل مهتم بالشقق في شمال الرياض', description: 'محتوى الملاحظة' }), @IsString()
    - `isImportant`: `boolean`; validators: @ApiPropertyOptional({ example: false, description: 'هل الملاحظة مهمة؟' }), @IsBoolean(), @IsOptional()
    - `tags`: `any`; validators: @ApiPropertyOptional({ example: { category: 'follow_up' }, description: 'الوسوم' }), @IsObject(), @IsOptional()
  - Used by: CustomersController.createNote
- `CreateCustomerDto` (`/workspace/api/src/customers/dto/create-customer.dto.ts`)
  - Fields:
  - Used by: CustomersController.create
- `CustomerFiltersDto` (`/workspace/api/src/customers/dto/export-customers.dto.ts`)
  - Fields:
    - `type`: `string[]`; validators: @IsOptional(), @IsArray(), @IsEnum(['buyer', 'seller', 'tenant', 'landlord'], { each: true })
    - `status`: `string[]`; validators: @IsOptional(), @IsArray(), @IsEnum(['active', 'inactive', 'archived'], { each: true })
    - `city`: `string`; validators: @IsOptional(), @IsString()
    - `source`: `string`; validators: @IsOptional(), @IsString()
    - `dateFrom`: `string`; validators: @IsOptional(), @IsDateString()
    - `dateTo`: `string`; validators: @IsOptional(), @IsDateString()
    - `search`: `string`; validators: @IsOptional(), @IsString()
    - `ids`: `string[]`; validators: @IsOptional(), @IsArray(), @IsString({ each: true })
  - Used by: None
- `ExportCustomersDto` (`/workspace/api/src/customers/dto/export-customers.dto.ts`)
  - Fields:
    - `filters`: `CustomerFiltersDto`; validators: @IsOptional(), @ValidateNested(), @Type(() => CustomerFiltersDto)
    - `columns`: `string[]`; validators: @IsArray({ message: 'الأعمدة يجب أن تكون مصفوفة' }), @IsString({ each: true })
    - `includeStatistics`: `boolean`; validators: @IsOptional(), @IsBoolean()
    - `applyFormatting`: `boolean`; validators: @IsOptional(), @IsBoolean()
    - `includeHeader`: `boolean`; validators: @IsOptional(), @IsBoolean()
    - `fileName`: `string`; validators: @IsOptional(), @IsString()
  - Used by: None
- `ExportTemplateDto` (`/workspace/api/src/customers/dto/export-customers.dto.ts`)
  - Fields:
    - `templateId`: `string`; validators: @IsString({ message: 'معرف القالب مطلوب' })
    - `includeExamples`: `boolean`; validators: @IsOptional(), @IsBoolean()
    - `includeInstructions`: `boolean`; validators: @IsOptional(), @IsBoolean()
    - `format`: `'xlsx' | 'csv'`; validators: @IsOptional(), @IsEnum(['xlsx', 'csv'], { message: 'التنسيق يجب أن يكون xlsx أو csv' })
  - Used by: None
- `FilterCustomersDto` (`/workspace/api/src/customers/dto/filter-customers.dto.ts`)
  - Fields:
    - `page`: `number`; validators: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `limit`: `number`; validators: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `search`: `string`; validators: @ApiPropertyOptional({ example: 'محمد', description: 'البحث في الاسم/البريد/الهاتف' }), @IsOptional(), @IsString()
    - `type`: `string`; validators: @ApiPropertyOptional({ enum: ['buyer', 'seller', 'renter', 'landlord', 'both'], description: 'نوع العميل' }), @IsOptional(), @IsEnum(['buyer', 'seller', 'renter', 'landlord', 'both'])
    - `status`: `string`; validators: @ApiPropertyOptional({ enum: ['active', 'inactive', 'blocked'], description: 'حالة العميل' }), @IsOptional(), @IsEnum(['active', 'inactive', 'blocked'])
    - `city`: `string`; validators: @ApiPropertyOptional({ example: 'الرياض', description: 'المدينة' }), @IsOptional(), @IsString()
    - `source`: `string`; validators: @ApiPropertyOptional({ example: 'website', description: 'المصدر' }), @IsOptional(), @IsString()
    - `rating`: `number`; validators: @ApiPropertyOptional({ example: 5, description: 'التقييم' }), @IsOptional(), @Type(() => Number), @IsInt()
    - `assigned_staff_id`: `string`; validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف المسؤول' }), @IsOptional(), @IsString()
    - `order_by`: `string`; validators: @ApiPropertyOptional({ enum: ['created_at', 'updated_at', 'name', 'last_contact_date'], example: 'created_at', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
    - `order`: `string`; validators: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])
  - Used by: CustomersController.findAll
- `ColumnMappingDto` (`/workspace/api/src/customers/dto/import-customers.dto.ts`)
  - Fields:
    - `excelColumn`: `string`; validators: @IsNotEmpty({ message: 'اسم عمود Excel مطلوب' }), @IsString()
    - `systemField`: `string`; validators: @IsNotEmpty({ message: 'اسم حقل النظام مطلوب' }), @IsString()
    - `required`: `boolean`; validators: @IsOptional(), @IsBoolean()
    - `transform`: `string`; validators: @IsOptional(), @IsString()
  - Used by: None
- `ImportCustomersDto` (`/workspace/api/src/customers/dto/import-customers.dto.ts`)
  - Fields:
    - `mapping`: `ColumnMappingDto[]`; validators: @IsArray({ message: 'مطابقة الأعمدة يجب أن تكون مصفوفة' }), @ValidateNested({ each: true }), @Type(() => ColumnMappingDto)
    - `duplicateHandling`: `'skip' | 'update' | 'error'`; validators: None
    - `validateOnly`: `boolean`; validators: @IsOptional(), @IsBoolean()
    - `batchSize`: `number`; validators: @IsOptional(), @IsNumber(), @Min(10, { message: 'حجم الدفعة يجب أن يكون على الأقل 10' }), @Max(1000, { message: 'حجم الدفعة يجب أن لا يتجاوز 1000' })
    - `skipInvalidRows`: `boolean`; validators: @IsOptional(), @IsBoolean()
  - Used by: None
- `PreviewImportDto` (`/workspace/api/src/customers/dto/import-customers.dto.ts`)
  - Fields:
    - `mapping`: `ColumnMappingDto[]`; validators: @IsArray(), @ValidateNested({ each: true }), @Type(() => ColumnMappingDto)
    - `previewRows`: `number`; validators: @IsOptional(), @IsNumber(), @Min(1), @Max(100)
  - Used by: None
- `LinkPropertyDto` (`/workspace/api/src/customers/dto/link-property.dto.ts`)
  - Fields:
    - `property_id`: `string`; validators: @ApiProperty({ example: 'uuid-property-id', description: 'معرف العقار' }), @IsUUID()
    - `relationship`: `string`; validators: @ApiProperty({ enum: ['owner', 'interested', 'viewed', 'negotiating', 'contracted'], example: 'interested', description: 'نوع العلاقة' }), @IsEnum(['owner', 'interested', 'viewed', 'negotiating', 'contracted'])
    - `start_date`: `string`; validators: @ApiPropertyOptional({ example: '2025-10-20T10:00:00Z', description: 'تاريخ البداية' }), @IsDateString(), @IsOptional()
    - `end_date`: `string`; validators: @ApiPropertyOptional({ example: '2025-11-20T10:00:00Z', description: 'تاريخ النهاية' }), @IsDateString(), @IsOptional()
  - Used by: CustomersController.linkProperty
- `UpdateCustomerNoteDto` (`/workspace/api/src/customers/dto/update-customer-note.dto.ts`)
  - Fields:
  - Used by: None
- `UpdateCustomerDto` (`/workspace/api/src/customers/dto/update-customer.dto.ts`)
  - Fields:
  - Used by: CustomersController.update


## Health Module Deep Dive
- Summary: Exposes readiness and health probes for infrastructure orchestration.

### Controllers
#### File: `/workspace/api/src/health/health.controller.ts`
- Purpose: Orchestrates 0 endpoint(s) for health workflows while enforcing guards and role checks.
- Injected services: `configService: ConfigService`, `supabaseService: SupabaseService`
- Decorators/guards: None
- Key Methods:
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.


## Integrations Module Deep Dive
- Summary: Bridges automations (e.g., n8n) and external ecosystems with the core platform.

### Services
#### File: `/workspace/api/src/integrations/n8n/n8n.service.ts`
- Purpose: Implements integrations business rules with 0 public method(s).
- Dependencies: `supabase: SupabaseService`
- Methods:
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.


## Maintenance Module Deep Dive
- Summary: Tracks maintenance requests, technician workflows, and public intake forms.

### Controllers
#### File: `/workspace/api/src/maintenance/maintenance.controller.ts`
- Purpose: Orchestrates 6 endpoint(s) for maintenance workflows while enforcing guards and role checks.
- Injected services: `maintenanceService: MaintenanceService`
- Decorators/guards: @Get('maintenance'), @Get('maintenance/:id'), @Patch('maintenance/:id'), @Post('maintenance'), @Post('maintenance/:id/complete'), @Post('public/maintenance'), @Roles('manager', 'staff', 'technician'), @Roles('technician', 'manager')
- Key Methods:
  - `list` → Get `/maintenance`; roles: manager, staff, technician; DTOs: `FilterMaintenanceDto`; services: `MaintenanceService.list`.
```ts
  async list(@Req() req: any, @Query() filters: FilterMaintenanceDto) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.list(officeId, filters);
  }
```
  - `getOne` → Get `/maintenance/:id`; roles: Public (requires JWT context); DTOs: None; services: `MaintenanceService.getOne`.
```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.getOne(officeId, id);
  }
```
  - `create` → Post `/maintenance`; roles: manager, staff, technician; DTOs: `CreateMaintenanceDto`; services: `MaintenanceService.createInternal`.
```ts
  async create(@Req() req: any, @Body() dto: CreateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const officeCode = req?.user?.office_id; // بافتراض أن office_id هو نفسه code
    const userId = req?.user?.user_id ?? null;
    const created = await this.maintenanceService.createInternal(officeId, officeCode, userId, dto);
    return { success: true, request: created };
  }
```
  - `createPublic` → Post `/public/maintenance`; roles: Public (requires JWT context); DTOs: `PublicCreateMaintenanceDto`; services: `MaintenanceService.createPublic`.
```ts
  async createPublic(@Req() req: any, @Body() dto: PublicCreateMaintenanceDto) {
    const officeId = req?.user?.office_id ?? dto?.property_id ?? 'public';
    const officeCode = req?.user?.office_id ?? 'public';
    const created = await this.maintenanceService.createPublic(officeId, officeCode, dto);
    return { success: true, request: created };
  }
```
  - `update` → Patch `/maintenance/:id`; roles: manager, staff, technician; DTOs: `UpdateMaintenanceDto`; services: `MaintenanceService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.update(officeId, id, dto);
    return { success: true, request: updated };
  }
```
  - `complete` → Post `/maintenance/:id/complete`; roles: technician, manager; DTOs: `CompleteMaintenanceDto`; services: `MaintenanceService.complete`.
```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.complete(officeId, id, dto);
    return { success: true, request: updated };
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/maintenance/maintenance.service.ts`
- Purpose: Implements maintenance business rules with 6 public method(s).
- Dependencies: `supabase: SupabaseService`, `n8n: N8nService`
- Methods:
  - `list(officeId: string, filters: any)` lines 16-35 — Supabase data access, error signalling.
```ts
  async list(officeId: string, filters: any) {
    let query = this.supabase.getClient()
      .from('maintenance_requests')
      .select('*, property:properties(*)')
      .eq('office_id', officeId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.issue_type) query = query.eq('issue_type', filters.issue_type);
    if (filters.property_id) query = query.eq('property_id', filters.property_id);
    if (filters.tenant_phone) query = query.eq('tenant_phone', filters.tenant_phone);
    if (filters.assigned_technician) query = query.eq('assigned_technician', filters.assigned_technician);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }
```
  - `getOne(officeId: string, id: string)` lines 37-47 — Supabase data access, error signalling.
```ts
  async getOne(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .select('*, property:properties(*)')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (error || !data) throw new NotFoundException('سجل الصيانة غير موجود');
    return data;
  }
```
  - `createInternal(officeId: string, officeCode: string, userId: string | null, dto: CreateMaintenanceDto)` lines 49-88 — Supabase data access, error signalling.
```ts
  async createInternal(officeId: string, officeCode: string, userId: string | null, dto: CreateMaintenanceDto) {
    const cleanedPhone = sanitizePhone(dto.tenant_phone);
    const requestNumber = await this.generateRequestNumber(officeCode);

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .insert({
        office_id: officeId,
        property_id: dto.property_id ?? null,
        tenant_phone: cleanedPhone ?? null,
        tenant_name: dto.tenant_name ?? null,
        issue_type: dto.issue_type,
        priority: dto.priority,
        description: dto.description ?? null,
        before_images: dto.before_images ?? null,
        status: 'new',
        request_number: requestNumber,
      })
      .select()
      .single();

    if (error) throw error;
```
  - `createPublic(officeId: string, officeCode: string, dto: PublicCreateMaintenanceDto)` lines 90-132 — Supabase data access, error signalling.
```ts
  async createPublic(officeId: string, officeCode: string, dto: PublicCreateMaintenanceDto) {
    if (!dto.property_id && !dto.title) {
      throw new BadRequestException('يجب تحديد العقار أو عنوان البلاغ');
    }
    const cleanedPhone = sanitizePhone(dto.tenant_phone);
    const requestNumber = await this.generateRequestNumber(officeCode);

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .insert({
        office_id: officeId,
        property_id: dto.property_id ?? null,
        tenant_phone: cleanedPhone ?? null,
        tenant_name: dto.tenant_name ?? null,
        issue_type: dto.issue_type,
        priority: dto.priority,
        description: dto.description ?? dto.title ?? null,
        before_images: dto.before_images ?? null,
        status: 'new',
        request_number: requestNumber,
      })
      .select()
```
  - `update(officeId: string, id: string, dto: UpdateMaintenanceDto)` lines 134-162 — Supabase data access, error signalling.
```ts
  async update(officeId: string, id: string, dto: UpdateMaintenanceDto) {
    const item = await this.getOne(officeId, id);

    const nextStatus = dto.status ?? item.status;
    if (!isValidTransition(item.status, nextStatus)) {
      throw new BadRequestException('انتقال حالة غير مسموح');
    }

    const updates: any = { status: nextStatus };
    if (dto.assigned_technician) updates.assigned_technician = dto.assigned_technician;
    if (dto.technician_name) updates.technician_name = dto.technician_name;
    if (dto.scheduled_date) updates.scheduled_date = new Date(dto.scheduled_date).toISOString();
    if (dto.estimated_cost) updates.estimated_cost = dto.estimated_cost;
    if (dto.actual_cost) updates.actual_cost = dto.actual_cost;
    if (dto.who_pays) updates.who_pays = dto.who_pays;
    if (dto.before_images) updates.before_images = dto.before_images;
    if (dto.after_images) updates.after_images = dto.after_images;
    if (dto.technician_notes) updates.technician_notes = dto.technician_notes;

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .update(updates)
```
  - `complete(officeId: string, id: string, dto: CompleteMaintenanceDto)` lines 164-186 — Supabase data access, error signalling.
```ts
  async complete(officeId: string, id: string, dto: CompleteMaintenanceDto) {
    const item = await this.getOne(officeId, id);
    
    const updates: any = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      actual_cost: dto.actual_cost,
    };
    if (dto.after_images) updates.after_images = dto.after_images;
    if (dto.technician_notes) updates.technician_notes = dto.technician_notes;
    if (dto.tenant_rating) updates.tenant_rating = Number(dto.tenant_rating);
    if (dto.tenant_feedback) updates.tenant_feedback = dto.tenant_feedback;

    const { data: saved, error } = await this.supabase.getClient()
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return saved;
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.

### DTOs
- `CompleteMaintenanceDto` (`/workspace/api/src/maintenance/dto/complete-maintenance.dto.ts`)
  - Fields:
  - Used by: MaintenanceController.complete
- `CreateMaintenanceDto` (`/workspace/api/src/maintenance/dto/create-maintenance.dto.ts`)
  - Fields:
    - `description`: `string`; validators: @IsOptional() @IsString()
    - `before_images`: `string[]`; validators: @IsOptional() @IsArray() @IsString({ each: true })
  - Used by: MaintenanceController.create
- `FilterMaintenanceDto` (`/workspace/api/src/maintenance/dto/filter-maintenance.dto.ts`)
  - Fields:
  - Used by: MaintenanceController.list
- `PublicCreateMaintenanceDto` (`/workspace/api/src/maintenance/dto/public-create-maintenance.dto.ts`)
  - Fields:
    - `description`: `string`; validators: @IsOptional() @IsString()
    - `before_images`: `string[]`; validators: @IsOptional() @IsArray() @IsString({ each: true })
  - Used by: MaintenanceController.createPublic
- `UpdateMaintenanceDto` (`/workspace/api/src/maintenance/dto/update-maintenance.dto.ts`)
  - Fields:
  - Used by: MaintenanceController.update


## Onboarding Module Deep Dive
- Summary: Guides new offices through activation sequences and initial data population.

### Controllers
#### File: `/workspace/api/src/onboarding/onboarding.controller.ts`
- Purpose: Orchestrates 3 endpoint(s) for onboarding workflows while enforcing guards and role checks.
- Injected services: `onboarding: OnboardingService`
- Decorators/guards: @Get('verify-code'), @Post('complete'), @Post('office')
- Key Methods:
  - `createOffice` → Post `/onboarding/office`; roles: Public (requires JWT context); DTOs: None; services: `OnboardingService.createOffice`.
```ts
  async createOffice(@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    return this.onboarding.createOffice(body);
  }
```
  - `verify` → Get `/onboarding/verify-code`; roles: Public (requires JWT context); DTOs: None; services: `OnboardingService.verifyCodeAvailable`.
```ts
  async verify(@Query('office_code') officeCode: string) {
    if (!officeCode) throw new BadRequestException('office_code مفقود');
    const res = await this.onboarding.verifyCodeAvailable(officeCode);
    return res;
  }
```
  - `complete` → Post `/onboarding/complete`; roles: Public (requires JWT context); DTOs: None; services: `OnboardingService.complete`.
```ts
  async complete(@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    return this.onboarding.complete(body);
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/onboarding/onboarding.service.ts`
- Purpose: Implements onboarding business rules with 3 public method(s).
- Dependencies: `supabase: SupabaseService`
- Methods:
  - `verifyCodeAvailable(code: string)` lines 9-17 — Supabase data access.
```ts
  async verifyCodeAvailable(code: string) {
    const { data } = await this.supabase.getClient()
      .from('offices')
      .select('id')
      .eq('office_code', code)
      .single();

    return { available: !data };
  }
```
  - `createOffice(body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string })` lines 24-73 — Supabase data access, error signalling.
```ts
  async createOffice(body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    if (!body.office_name || !body.manager_email) throw new BadRequestException('بيانات المكتب غير مكتملة');
    const code = this.generateOfficeCode(body.office_name);
    const available = await this.verifyCodeAvailable(code);
    if (!available.available) throw new BadRequestException('رمز المكتب مستخدم');

    const { data: savedOffice, error: officeError } = await this.supabase.getClient()
      .from('offices')
      .insert({
        office_code: code,
        office_name: body.office_name,
        max_properties: 1000,
        max_users: 50,
        subscription_plan: 'free',
        whatsapp_phone_number: body.whatsapp_number ?? null,
      })
      .select()
      .single();

    if (officeError) throw officeError;

    const { data: manager, error: managerError } = await this.supabase.getClient()
```
  - `complete(body: { office_id: string; whatsapp_config?: any; subscription_plan?: string })` lines 75-100 — Supabase data access, error signalling.
```ts
  async complete(body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    const { data: office } = await this.supabase.getClient()
      .from('offices')
      .select('*')
      .eq('id', body.office_id)
      .single();

    if (!office) throw new BadRequestException('المكتب غير موجود');

    const updates: any = { onboarding_completed: true };
    if (body.subscription_plan) updates.subscription_plan = body.subscription_plan;
    if (body.whatsapp_config?.access_token) {
      updates.whatsapp_api_token = encrypt(body.whatsapp_config.access_token);
    }
    if (body.whatsapp_config?.api_base_url) updates.whatsapp_api_url = body.whatsapp_config.api_base_url;
    if (body.whatsapp_config?.phone_number) updates.whatsapp_phone_number = body.whatsapp_config.phone_number;
    if (body.whatsapp_config?.phone_number_id) updates.whatsapp_phone_number_id = body.whatsapp_config.phone_number_id;

    const { error } = await this.supabase.getClient()
      .from('offices')
      .update(updates)
      .eq('id', body.office_id);
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.


## Payments Module Deep Dive
- Summary: Manages rental payment lifecycle, reminders, and Supabase finance ledger integration.

### Controllers
#### File: `/workspace/api/src/payments/payments.controller.ts`
- Purpose: Orchestrates 5 endpoint(s) for payments workflows while enforcing guards and role checks.
- Injected services: `paymentsService: PaymentsService`
- Decorators/guards: @Get('contracts/:contractId/payments'), @Get('payments'), @Get('payments/overdue'), @Patch('payments/:id/mark-paid'), @Post('payments/:id/send-reminder'), @Roles('manager', 'staff'), @Roles('manager', 'staff', 'accountant')
- Key Methods:
  - `list` → Get `/payments`; roles: Public (requires JWT context); DTOs: `FilterPaymentsDto`; services: `PaymentsService.findPayments`.
```ts
  async list(@Req() req: any, @Query() filters: FilterPaymentsDto) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findPayments(officeId, filters);
  }
```
  - `byContract` → Get `/contracts/:contractId/payments`; roles: Public (requires JWT context); DTOs: None; services: `PaymentsService.findByContract`.
```ts
  async byContract(@Req() req: any, @Param('contractId') contractId: string) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findByContract(officeId, contractId);
  }
```
  - `markPaid` → Patch `/payments/:id/mark-paid`; roles: manager, staff, accountant; DTOs: `MarkPaidDto`; services: `PaymentsService.markPaid`.
```ts
  async markPaid(@Req() req: any, @Param('id') id: string, @Body() dto: MarkPaidDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.paymentsService.markPaid(officeId, id, dto);
    return { success: true, payment: updated };
  }
```
  - `overdue` → Get `/payments/overdue`; roles: Public (requires JWT context); DTOs: None; services: `PaymentsService.getOverdue`.
```ts
  async overdue(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.getOverdue(officeId);
  }
```
  - `sendReminder` → Post `/payments/:id/send-reminder`; roles: manager, staff; DTOs: `SendReminderDto`; services: `PaymentsService.sendReminder`.
```ts
  async sendReminder(@Req() req: any, @Param('id') id: string, @Body() body: SendReminderDto) {
    const officeId = req?.user?.office_id;
    const res = await this.paymentsService.sendReminder(officeId, id, body?.message);
    return res;
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/payments/payments.service.ts`
- Purpose: Implements payments business rules with 5 public method(s).
- Dependencies: `supabase: SupabaseService`
- Methods:
  - `findPayments(officeId: string, filters: FilterPaymentsDto & { page?: number; limit?: number })` lines 10-33 — Supabase data access, error signalling.
```ts
  async findPayments(officeId: string, filters: FilterPaymentsDto & { page?: number; limit?: number }) {
    const page: number = Math.max(1, Number(filters?.page ?? 1));
    const limit: number = Math.min(100, Math.max(1, Number(filters?.limit ?? 50)));
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)', { count: 'exact' })
      .eq('office_id', officeId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters.tenant_phone) query = query.eq('tenant_phone', filters.tenant_phone);
    if (filters.due_from) query = query.gte('due_date', filters.due_from);
    if (filters.due_to) query = query.lt('due_date', filters.due_to);

    query = query.order('due_date', { ascending: true }).range(start, end);

    const { data, error, count } = await query;
    if (error) throw error;
```
  - `findByContract(officeId: string, contractId: string)` lines 35-45 — Supabase data access, error signalling.
```ts
  async findByContract(officeId: string, contractId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('office_id', officeId)
      .eq('contract_id', contractId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }
```
  - `markPaid(officeId: string, id: string, dto: MarkPaidDto)` lines 47-89 — Supabase data access, error signalling.
```ts
  async markPaid(officeId: string, id: string, dto: MarkPaidDto) {
    const { data: payment } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (!payment) throw new NotFoundException('الدفعة غير موجودة');
    if (payment.status === 'paid') throw new BadRequestException('تم سداد هذه الدفعة مسبقاً');

    const contract = payment.contract;
    const rate = Number(contract?.office_commission_rate ?? 0) / 100;
    const amountPaid = Number(dto.amount_paid);
    if (isNaN(amountPaid) || amountPaid <= 0) throw new BadRequestException('قيمة السداد غير صحيحة');

    const officeCommission = round2(amountPaid * rate);
    const ownerAmount = round2(amountPaid - officeCommission);

    const { data: saved, error } = await this.supabase.getClient()
      .from('rental_payments')
      .update({
```
  - `getOverdue(officeId: string)` lines 91-148 — Supabase data access, error signalling.
```ts
  async getOverdue(officeId: string) {
    const today = new Date().toISOString().slice(0, 10);
    
    const { data: items, error } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('office_id', officeId)
      .eq('status', 'pending')
      .lt('due_date', today);

    if (error) throw error;

    for (const p of items || []) {
      const days = daysBetween(p.due_date, today);
      const { alertType, level } = classifyAlert(days);
      if (!alertType) continue;

      const { data: existing } = await this.supabase.getClient()
        .from('payment_alerts')
        .select('*')
        .eq('payment_id', p.id)
        .eq('alert_type', alertType)
```
  - `sendReminder(officeId: string, paymentId: string, message?: string)` lines 150-198 — Supabase data access, error signalling.
```ts
  async sendReminder(officeId: string, paymentId: string, message?: string) {
    const { data: payment } = await this.supabase.getClient()
      .from('rental_payments')
      .select('*, contract:rental_contracts(*)')
      .eq('id', paymentId)
      .eq('office_id', officeId)
      .single();

    if (!payment) throw new NotFoundException('الدفعة غير موجودة');

    await this.supabase.getClient()
      .from('payment_alerts')
      .insert({
        office_id: officeId,
        contract_id: payment.contract_id,
        payment_id: payment.id,
        alert_type: 'manual_reminder',
        alert_level: 0,
        due_date: payment.due_date,
        amount: payment.amount_due,
        days_overdue: null,
        is_sent: true,
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.

### DTOs
- `FilterPaymentsDto` (`/workspace/api/src/payments/dto/filter-payments.dto.ts`)
  - Fields:
    - `status`: `string`; validators: @IsOptional(), @IsString()
    - `contract_id`: `string`; validators: @IsOptional(), @IsString()
    - `tenant_phone`: `string`; validators: @IsOptional(), @IsString()
    - `due_from`: `string`; validators: @IsOptional(), @IsDateString()
    - `due_to`: `string`; validators: @IsOptional(), @IsDateString()
  - Used by: PaymentsController.list
- `MarkPaidDto` (`/workspace/api/src/payments/dto/mark-paid.dto.ts`)
  - Fields:
    - `payment_method`: `string`; validators: @IsOptional(), @IsString()
    - `payment_reference`: `string`; validators: @IsOptional(), @IsString(), @Length(0, 128)
  - Used by: PaymentsController.markPaid
- `SendReminderDto` (`/workspace/api/src/payments/dto/send-reminder.dto.ts`)
  - Fields:
    - `message`: `string`; validators: @IsOptional(), @IsString()
  - Used by: PaymentsController.sendReminder


## Properties Module Deep Dive
- Summary: Core property lifecycle management including listing, filtering, media, and public sharing.

### Controllers
#### File: `/workspace/api/src/properties/excel.controller.ts`
- Purpose: Orchestrates 3 endpoint(s) for properties workflows while enforcing guards and role checks.
- Injected services: `propertiesService: PropertiesService`
- Decorators/guards: @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }), @ApiConsumes('multipart/form-data'), @Get('properties/export'), @Post('properties/import'), @Post('properties/import/confirm'), @Roles('manager', 'staff'), @UseInterceptors(FileInterceptor('file'))
- Key Methods:
  - `importExcel` → Post `/properties/import`; roles: manager, staff; DTOs: None; services: Inline logic.
```ts
  async importExcel(@Req() req: any, @UploadedFile() file?: any) {
    if (!file) {
      return { valid: [], invalid: [{ row: 0, errors: ['ملف الإكسل مفقود'] }] };
    }
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const valid: any[] = [];
    const invalid: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];
      if (!row.property_code) errors.push('property_code مطلوب');
      if (!row.property_type) errors.push('property_type مطلوب');
      if (!row.listing_type) errors.push('listing_type مطلوب');
```
  - `importConfirm` → Post `/properties/import/confirm`; roles: manager, staff; DTOs: None; services: `PropertiesService.create`.
```ts
  async importConfirm(@Req() req: any, @Body() body: { rows: any[] }) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!Array.isArray(body?.rows)) {
      throw new Error('صيغة بيانات غير صحيحة');
    }

    const created: string[] = [];
    for (const row of body.rows) {
      const createdProp = await this.propertiesService.create(officeId, userId, row);
      created.push(createdProp.id);
    }

    return { success: created.length, errors: [] };
  }
```
  - `exportExcel` → Get `/properties/export`; roles: manager, staff; DTOs: `FilterPropertiesDto`; services: `PropertiesService.findAll`.
```ts
  async exportExcel(@Req() req: any, @Query() filters: FilterPropertiesDto, @Res({ passthrough: true }) res: Response) {
    const officeId = req?.user?.office_id;
    const result = await this.propertiesService.findAll(officeId, filters);

    const data = result.data.map((p) => ({
      id: p.id,
      office_id: p.officeId,
      property_code: p.propertyCode,
      property_type: p.propertyType,
      listing_type: p.listingType,
      city: p.locationCity,
      district: p.locationDistrict,
      street: p.locationStreet,
      price: p.price,
      currency: p.currency,
      area_sqm: p.areaSqm,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

#### File: `/workspace/api/src/properties/media.controller.ts`
- Purpose: Orchestrates 4 endpoint(s) for properties workflows while enforcing guards and role checks.
- Injected services: `propertiesService: PropertiesService`
- Decorators/guards: @Delete('properties/:propertyId/images/:imageId'), @Patch('properties/:propertyId/images/:imageId'), @Post('media/signed-url'), @Post('properties/:id/images')
- Key Methods:
  - `signedUrl` → Post `/media/signed-url`; roles: Public (requires JWT context); DTOs: None; services: Inline logic.
```ts
  async signedUrl(@Req() req: any, @Body() body: { property_id: string; filename: string; contentType: string }) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const { property_id, filename, contentType } = body || ({} as any);

    if (!property_id || !filename || !contentType) throw new BadRequestException('بيانات غير مكتملة');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) throw new BadRequestException('نوع الملف غير مسموح');

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) throw new BadRequestException('إعدادات Supabase غير متوفرة');

    const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const bucket = 'properties';
    const path = `${officeId}/${property_id}/${uuidv4()}-${sanitize(filename)}`;
    const expiresIn = 60 * 10; // 10 دقائق
```
  - `addImage` → Post `/properties/:id/images`; roles: Public (requires JWT context); DTOs: None; services: `PropertiesService.addImage`.
```ts
  async addImage(@Req() req: any, @Param('id') id: string, @Body() body: { url: string; fileName?: string; fileSize?: number; isFeatured?: boolean }) {
    const userId = req?.user?.user_id;
    const { url, fileName, fileSize, isFeatured } = body || ({} as any);
    if (!url) throw new BadRequestException('رابط الصورة مطلوب');
    const image = await this.propertiesService.addImage(id, url, userId, fileName, fileSize, isFeatured);
    return { success: true, image };
  }
```
  - `setFeatured` → Patch `/properties/:propertyId/images/:imageId`; roles: Public (requires JWT context); DTOs: None; services: `PropertiesService.setFeaturedImage`.
```ts
  async setFeatured(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const image = await this.propertiesService.setFeaturedImage(propertyId, imageId);
    return { success: true, image };
  }
```
  - `removeImage` → Delete `/properties/:propertyId/images/:imageId`; roles: Public (requires JWT context); DTOs: None; services: `PropertiesService.removeImage`.
```ts
  async removeImage(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const res = await this.propertiesService.removeImage(propertyId, imageId);
    return res;
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

#### File: `/workspace/api/src/properties/properties.controller.ts`
- Purpose: Orchestrates 5 endpoint(s) for properties workflows while enforcing guards and role checks.
- Injected services: `propertiesService: PropertiesService`
- Decorators/guards: @Delete(':id'), @Get(':id'), @Get(), @Patch(':id'), @Post(), @Roles('manager'), @Roles('manager', 'staff')
- Key Methods:
  - `list` → Get `/properties`; roles: Public (requires JWT context); DTOs: `FilterPropertiesDto`; services: `PropertiesService.findAll`.
```ts
  async list(@Req() req: any, @Query() query: FilterPropertiesDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى قائمة العقارات');
    return this.propertiesService.findAll(officeId, query);
  }
```
  - `getOne` → Get `/properties/:id`; roles: Public (requires JWT context); DTOs: None; services: `PropertiesService.findOneWithImages`.
```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى تفاصيل العقار');
    return this.propertiesService.findOneWithImages(officeId, id);
  }
```
  - `create` → Post `/properties`; roles: manager, staff; DTOs: `CreatePropertyDto`; services: `PropertiesService.create`.
```ts
  async create(@Req() req: any, @Body() dto: CreatePropertyDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    const created = await this.propertiesService.create(officeId, userId, dto);
    return { success: true, property: created };
  }
```
  - `update` → Patch `/properties/:id`; roles: manager, staff; DTOs: `UpdatePropertyDto`; services: `PropertiesService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.propertiesService.update(officeId, id, dto);
    return { success: true, property: updated };
  }
```
  - `softDelete` → Delete `/properties/:id`; roles: manager; DTOs: None; services: `PropertiesService.softDelete`.
```ts
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    const res = await this.propertiesService.softDelete(officeId, id);
    return res;
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

#### File: `/workspace/api/src/properties/public.controller.ts`
- Purpose: Orchestrates 2 endpoint(s) for properties workflows while enforcing guards and role checks.
- Injected services: `propertiesService: PropertiesService`
- Decorators/guards: @Get('offices/:officeCode/listings'), @Get('offices/:officeCode/properties/:slug')
- Key Methods:
  - `listings` → Get `/public/offices/:officeCode/listings`; roles: Public (requires JWT context); DTOs: `FilterPropertiesDto`; services: `PropertiesService.getPublicListings`.
```ts
  async listings(@Param('officeCode') officeCode: string, @Query() query: FilterPropertiesDto) {
    const res = await this.propertiesService.getPublicListings(officeCode, query);
    return res;
  }
```
  - `bySlug` → Get `/public/offices/:officeCode/properties/:slug`; roles: Public (requires JWT context); DTOs: None; services: `PropertiesService.getPublicBySlug`.
```ts
  async bySlug(@Param('officeCode') officeCode: string, @Param('slug') slug: string) {
    const property = await this.propertiesService.getPublicBySlug(officeCode, slug);
    return property;
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/properties/properties.service.ts`
- Purpose: Implements properties business rules with 10 public method(s).
- Dependencies: `supabase: SupabaseService`
- Methods:
  - `findAll(officeId: string, filters: FilterPropertiesDto)` lines 11-49 — Supabase data access.
```ts
  async findAll(officeId: string, filters: FilterPropertiesDto) {
    let query = this.supabase.getClient()
      .from('properties')
      .select('*, images:property_images(*)', { count: 'exact' })
      .eq('office_id', officeId);

    if (filters.type) query = query.eq('property_type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.city) query = query.eq('location_city', filters.city);
    if (filters.district) query = query.eq('location_district', filters.district);
    if (typeof filters.is_featured === 'boolean') query = query.eq('is_featured', filters.is_featured);

    if (filters.min_price) query = query.gte('price', Number(filters.min_price));
    if (filters.max_price) query = query.lte('price', Number(filters.max_price));
    if (filters.min_area) query = query.gte('area_sqm', Number(filters.min_area));
    if (filters.max_area) query = query.lte('area_sqm', Number(filters.max_area));
    if (typeof filters.bedrooms === 'number') query = query.eq('bedrooms', filters.bedrooms);
    if (typeof filters.bathrooms === 'number') query = query.eq('bathrooms', filters.bathrooms);

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
```
  - `findOneWithImages(officeId: string, id: string)` lines 51-61 — Supabase data access, error signalling.
```ts
  async findOneWithImages(officeId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (error || !data) throw new NotFoundException('العقار غير موجود');
    return data;
  }
```
  - `create(officeId: string, userId: string, dto: CreatePropertyDto)` lines 63-105 — Supabase data access, error signalling.
```ts
  async create(officeId: string, userId: string, dto: CreatePropertyDto) {
    const { data: exists } = await this.supabase.getClient()
      .from('properties')
      .select('id')
      .eq('property_code', dto.property_code)
      .single();

    if (exists) throw new BadRequestException('رمز العقار مستخدم مسبقاً');

    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .insert({
        office_id: officeId,
        property_code: dto.property_code,
        property_type: dto.property_type,
        listing_type: dto.listing_type,
        location_city: dto.location_city ?? null,
        location_district: dto.location_district ?? null,
        location_street: dto.location_street ?? null,
        price: dto.price ?? null,
        currency: dto.currency ?? null,
        area_sqm: dto.area_sqm ?? null,
```
  - `update(officeId: string, id: string, dto: UpdatePropertyDto)` lines 107-152 — Supabase data access, error signalling.
```ts
  async update(officeId: string, id: string, dto: UpdatePropertyDto) {
    const { data: property } = await this.supabase.getClient()
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('office_id', officeId)
      .single();

    if (!property) throw new NotFoundException('العقار غير موجود');

    const updates: any = {};
    if (dto.property_code) updates.property_code = dto.property_code;
    if (dto.property_type) updates.property_type = dto.property_type;
    if (dto.listing_type) updates.listing_type = dto.listing_type;
    if (dto.location_city) updates.location_city = dto.location_city;
    if (dto.location_district) updates.location_district = dto.location_district;
    if (dto.location_street) updates.location_street = dto.location_street;
    if (dto.price) updates.price = dto.price;
    if (dto.currency) updates.currency = dto.currency;
    if (dto.area_sqm) updates.area_sqm = dto.area_sqm;
    if (typeof dto.bedrooms === 'number') updates.bedrooms = dto.bedrooms;
    if (typeof dto.bathrooms === 'number') updates.bathrooms = dto.bathrooms;
```
  - `softDelete(officeId: string, id: string)` lines 154-163 — Supabase data access, error signalling.
```ts
  async softDelete(officeId: string, id: string) {
    const { error } = await this.supabase.getClient()
      .from('properties')
      .update({ status: 'deleted' })
      .eq('id', id)
      .eq('office_id', officeId);

    if (error) throw error;
    return { success: true };
  }
```
  - `getPublicListings(officeCode: string, filters: FilterPropertiesDto)` lines 165-167 — business logic.
```ts
  async getPublicListings(officeCode: string, filters: FilterPropertiesDto) {
    return this.findAll(officeCode, { ...filters, status: 'available' });
  }
```
  - `getPublicBySlug(officeCode: string, slug: string)` lines 169-185 — Supabase data access, error signalling.
```ts
  async getPublicBySlug(officeCode: string, slug: string) {
    const { data, error } = await this.supabase.getClient()
      .from('properties')
      .select('*, images:property_images(*)')
      .eq('slug', slug)
      .eq('office_id', officeCode)
      .single();

    if (error || !data) throw new NotFoundException('العقار غير موجود');

    await this.supabase.getClient()
      .from('properties')
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq('id', data.id);

    return data;
  }
```
  - `addImage(propertyId: string, url: string, userId?: string, fileName?: string, fileSize?: number, isFeatured?: boolean)` lines 187-238 — Supabase data access, error signalling.
```ts
  async addImage(propertyId: string, url: string, userId?: string, fileName?: string, fileSize?: number, isFeatured?: boolean) {
    const { data: property } = await this.supabase.getClient()
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .single();

    if (!property) throw new NotFoundException('العقار غير موجود');

    const { data: image, error } = await this.supabase.getClient()
      .from('property_images')
      .insert({
        property_id: propertyId,
        image_url: url,
        uploaded_by: userId ?? null,
        file_name: fileName ?? null,
        file_size: fileSize ?? null,
        is_featured: Boolean(isFeatured),
      })
      .select()
      .single();
```
  - `setFeaturedImage(propertyId: string, imageId: string)` lines 240-266 — Supabase data access, error signalling.
```ts
  async setFeaturedImage(propertyId: string, imageId: string) {
    const { data: image } = await this.supabase.getClient()
      .from('property_images')
      .select('*')
      .eq('id', imageId)
      .eq('property_id', propertyId)
      .single();

    if (!image) throw new NotFoundException('الصورة غير موجودة');

    await this.supabase.getClient()
      .from('property_images')
      .update({ is_featured: false })
      .eq('property_id', propertyId);

    await this.supabase.getClient()
      .from('property_images')
      .update({ is_featured: true })
      .eq('id', imageId);

    await this.supabase.getClient()
      .from('properties')
```
  - `removeImage(propertyId: string, imageId: string)` lines 268-288 — Supabase data access, error signalling.
```ts
  async removeImage(propertyId: string, imageId: string) {
    const { error } = await this.supabase.getClient()
      .from('property_images')
      .delete()
      .eq('id', imageId)
      .eq('property_id', propertyId);

    if (error) throw error;

    const { count } = await this.supabase.getClient()
      .from('property_images')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId);

    await this.supabase.getClient()
      .from('properties')
      .update({ image_count: count || 0 })
      .eq('id', propertyId);

    return { success: true };
  }
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.

### DTOs
- `CreatePropertyDto` (`/workspace/api/src/properties/dto/create-property.dto.ts`)
  - Fields:
    - `location_city`: `string`; validators: @IsOptional(), @IsString()
    - `location_district`: `string`; validators: @IsOptional(), @IsString()
    - `location_street`: `string`; validators: @IsOptional(), @IsString()
    - `price`: `string`; validators: @IsOptional(), @IsNumberString({}, { message: 'السعر يجب أن يكون رقمياً' })
    - `currency`: `string`; validators: @IsOptional(), @IsString()
    - `area_sqm`: `string`; validators: @IsOptional(), @IsNumberString({}, { message: 'المساحة يجب أن تكون رقمية' })
    - `bedrooms`: `number`; validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `bathrooms`: `number`; validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `features`: `Record<string, any>`; validators: @IsOptional(), @IsObject()
    - `description`: `string`; validators: @IsOptional(), @IsString()
    - `images`: `string[]`; validators: @IsOptional(), @IsArray(), @IsString({ each: true })
    - `status`: `string`; validators: @IsOptional(), @IsString()
    - `contact_person`: `string`; validators: @IsOptional(), @IsString()
    - `contact_phone`: `string`; validators: @IsOptional(), @IsString()
    - `google_maps_link`: `string`; validators: @IsOptional(), @IsUrl({}, { message: 'رابط خرائط قوقل غير صالح' })
    - `latitude`: `string`; validators: @IsOptional(), @IsNumberString()
    - `longitude`: `string`; validators: @IsOptional(), @IsNumberString()
    - `slug`: `string`; validators: @IsOptional(), @IsString()
    - `is_featured`: `boolean`; validators: @IsOptional(), @IsBoolean()
  - Used by: PropertiesController.create
- `FilterPropertiesDto` (`/workspace/api/src/properties/dto/filter-properties.dto.ts`)
  - Fields:
    - `type`: `string`; validators: @IsOptional(), @IsString()
    - `status`: `string`; validators: @IsOptional(), @IsString()
    - `city`: `string`; validators: @IsOptional(), @IsString()
    - `district`: `string`; validators: @IsOptional(), @IsString()
    - `min_price`: `string`; validators: @IsOptional(), @IsNumberString()
    - `max_price`: `string`; validators: @IsOptional(), @IsNumberString()
    - `min_area`: `string`; validators: @IsOptional(), @IsNumberString()
    - `max_area`: `string`; validators: @IsOptional(), @IsNumberString()
    - `bedrooms`: `number`; validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `bathrooms`: `number`; validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `is_featured`: `boolean`; validators: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
    - `search`: `string`; validators: @IsOptional(), @IsString()
    - `order_by`: `'created_at' | 'price' | 'area'`; validators: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
    - `order`: `'asc' | 'desc'`; validators: @IsOptional(), @IsIn(['asc', 'desc'])
    - `page`: `number = 1`; validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `limit`: `number = 20`; validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)
  - Used by: ExcelController.exportExcel, PropertiesController.list, PublicController.listings
- `ImportRowDto` (`/workspace/api/src/properties/dto/import-excel.dto.ts`)
  - Fields:
  - Used by: None
- `ImportExcelDto` (`/workspace/api/src/properties/dto/import-excel.dto.ts`)
  - Fields:
  - Used by: None
- `UpdatePropertyDto` (`/workspace/api/src/properties/dto/update-property.dto.ts`)
  - Fields:
  - Used by: PropertiesController.update


## Supabase Access Module Deep Dive
- Summary: Wraps Supabase client configuration and reusable query helpers.

### Services
#### File: `/workspace/api/src/supabase/supabase.service.ts`
- Purpose: Implements supabase access business rules with 0 public method(s).
- Dependencies: None
- Methods:
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.


## WhatsApp Module Deep Dive
- Summary: Integrates with the Meta WhatsApp API for outbound notifications and conversations.

### Controllers
#### File: `/workspace/api/src/whatsapp/whatsapp.controller.ts`
- Purpose: Orchestrates 5 endpoint(s) for whatsapp workflows while enforcing guards and role checks.
- Injected services: `supabaseService: SupabaseService`, `meta: MetaApiService`
- Decorators/guards: @Get('templates'), @Get('webhook'), @Post('connect'), @Post('send-template'), @Post('webhook'), @Roles('manager'), @Roles('manager', 'staff')
- Key Methods:
  - `verify` → Get `/whatsapp/webhook`; roles: Public (requires JWT context); DTOs: None; services: Inline logic.
```ts
  async verify(@Query('hub.mode') mode: string, @Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
    if (mode === 'subscribe' && token && challenge) {
      if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return challenge;
      }
      throw new ForbiddenException('رمز التحقق غير صحيح');
    }
    throw new BadRequestException('معلمات التحقق غير صحيحة');
  }
```
  - `webhook` → Post `/whatsapp/webhook`; roles: Public (requires JWT context); DTOs: None; services: Inline logic.
```ts
  async webhook(@Body() payload: any) {
    // تمرير كما هو إلى n8n
    const url = process.env.N8N_WHATSAPP_WEBHOOK_URL || '';
    if (url) {
      try {
        await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } catch (_) {}
    }

    // استخراج البيانات الأساسية
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const fromPhone = messages?.[0]?.from;
    const text = messages?.[0]?.text?.body ?? null;
    const phoneNumberId = value?.metadata?.phone_number_id;
```
  - `connect` → Post `/whatsapp/connect`; roles: manager; DTOs: None; services: `SupabaseService.getClient`, `SupabaseService.getClient`.
```ts
  async connect(@Req() req: any, @Body() body: { phone_number_id: string; access_token: string; api_base_url?: string; phone_display?: string }) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    
    const { data: office, error } = await this.supabaseService.getClient()
      .from('offices')
      .select('*')
      .eq('id', officeId)
      .single();
    
    if (error || !office) throw new BadRequestException('المكتب غير موجود');

    if (!body?.phone_number_id || !body?.access_token) throw new BadRequestException('بيانات غير مكتملة');

    await this.supabaseService.getClient()
      .from('offices')
      .update({
        whatsapp_phone_number_id: body.phone_number_id,
```
  - `sendTemplate` → Post `/whatsapp/send-template`; roles: manager, staff; DTOs: None; services: `MetaApiService.sendTemplate`, `SupabaseService.getClient`.
```ts
  async sendTemplate(@Req() req: any, @Body() body: { to: string; template_name: string; language: string; components?: any[] }) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');

    const res = await this.meta.sendTemplate(officeId, body);

    await this.supabaseService.getClient()
      .from('conversations')
      .insert({
        office_id: officeId,
        user_phone: body.to,
        message_text: `[TEMPLATE:${body.template_name}]`,
        direction: 'outgoing',
        message_type: 'template',
        session_id: null,
        conversation_context: res,
      });
```
  - `templates` → Get `/whatsapp/templates`; roles: Public (requires JWT context); DTOs: None; services: `MetaApiService.fetchTemplates`.
```ts
  async templates(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const data = await this.meta.fetchTemplates(officeId);
    return data;
  }
```
- Execution Flow:
  1. Request enters through Nest middleware and `RolesGuard` verification.
  2. Controller derives tenant context (`req.user.office_id`).
  3. Domain service executes Supabase data access or side effects.
  4. Response is normalized and returned to the client/front-end consumer.

### Services
#### File: `/workspace/api/src/whatsapp/meta-api.service.ts`
- Purpose: Implements whatsapp business rules with 2 public method(s).
- Dependencies: `supabaseService: SupabaseService`
- Methods:
  - `sendTemplate(officeId: string, payload: SendTemplatePayload)` lines 38-69 — Supabase data access, error signalling.
```ts
  async sendTemplate(officeId: string, payload: SendTemplatePayload) {
    const { data: office, error } = await this.supabaseService.getClient()
      .from('offices')
      .select('*')
      .eq('id', officeId)
      .single();
    
    if (error || !office?.whatsapp_api_url || !office?.whatsapp_api_token || !office?.whatsapp_phone_number_id) {
      throw new Error('إعدادات واتساب غير مكتملة');
    }

    const url = `${office.whatsapp_api_url}/${office.whatsapp_phone_number_id}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to: payload.to,
      type: 'template',
      template: {
        name: payload.template_name,
        language: { code: payload.language },
        components: payload.components ?? [],
      },
    };
```
  - `fetchTemplates(officeId: string)` lines 71-97 — Supabase data access, caching, error signalling.
```ts
  async fetchTemplates(officeId: string) {
    const { data: office, error } = await this.supabaseService.getClient()
      .from('offices')
      .select('*')
      .eq('id', officeId)
      .single();
    
    if (error || !office?.whatsapp_api_url || !office?.whatsapp_api_token || !office?.whatsapp_phone_number_id) {
      throw new Error('إعدادات واتساب غير مكتملة');
    }

    const cacheKey = `${officeId}:templates`;
    const cached = this.templatesCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) return cached.data;

    const url = `${office.whatsapp_api_url}/${office.whatsapp_phone_number_id}/message_templates`;
    const res = await this.requestWithRetry(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${decrypt(office.whatsapp_api_token)}`,
      },
```
- Observability: Instrument via OpenTelemetry spans when accessing Supabase or mutating financial data.
