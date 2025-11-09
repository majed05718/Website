# وثيقة المتطلبات البرمجية (SRS)

 - **المشروع**: نظام إدارة العقارات
 - **إصدار الوثيقة**: 2.0
 - **تاريخ التوليد**: 2025-11-09 19:56 UTC
 - **النطاق**: جرد وظيفي شامل يغطي واجهات البرمجة الخلفية والواجهة الأمامية مع قواعد التحقق والتحكم بالوصول وتدفق البيانات.

## المحتويات
- [التحليلات](#التحليلات)
- [app](#app)
- [المواعيد](#المواعيد)
- [components](#components)
- [العملاء](#العملاء)
- [الصحة](#الصحة)
- [التكاملات](#التكاملات)
- [الصيانة](#الصيانة)
- [التهيئة](#التهيئة)
- [المدفوعات](#المدفوعات)
- [العقارات](#العقارات)
- [وصول Supabase](#وصول-supabase)
- [واتساب](#واتساب)

## التحليلات

تضم وحدة `التحليلات` عدد 1 متحكم/متحكمات، 1 خدمة، و 0 تعريفاً لكائنات DTO.

### المتحكم `AnalyticsController` (`/workspace/api/src/analytics/analytics.controller.ts`)
- الخدمات المحقونة: `analytics: AnalyticsService`
#### نقطة النهاية: Get `/analytics/dashboard`

- **دالة المتحكم**: `AnalyticsController.dashboard()` (lines 16-19 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/analytics/dashboard`
- **الأدوار المطلوبة**: مدير, محاسب
- **الحمايات**: `@Get('dashboard'), @Roles('manager', 'accountant')`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AnalyticsService.dashboard` في `/workspace/api/src/analytics/analytics.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AnalyticsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async dashboard(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.dashboard(officeId);
  }
```

#### نقطة النهاية: Get `/analytics/properties`

- **دالة المتحكم**: `AnalyticsController.properties()` (lines 22-25 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/analytics/properties`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('properties')`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AnalyticsService.propertiesBreakdown` في `/workspace/api/src/analytics/analytics.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AnalyticsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async properties(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.propertiesBreakdown(officeId);
  }
```

#### نقطة النهاية: Get `/analytics/financials`

- **دالة المتحكم**: `AnalyticsController.financials()` (lines 29-32 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/analytics/financials`
- **الأدوار المطلوبة**: مدير, محاسب
- **الحمايات**: `@Get('financials'), @Roles('manager', 'accountant')`

**معاملات الطلب**

- `@Req() req: any`
- `@Query('report_period') reportPeriod?: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AnalyticsService.financials` في `/workspace/api/src/analytics/analytics.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AnalyticsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async financials(@Req() req: any, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.financials(officeId, reportPeriod);
  }
```

#### نقطة النهاية: Get `/analytics/kpis`

- **دالة المتحكم**: `AnalyticsController.kpis()` (lines 36-39 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/analytics/kpis`
- **الأدوار المطلوبة**: مدير
- **الحمايات**: `@Get('kpis'), @Roles('manager')`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AnalyticsService.kpis` في `/workspace/api/src/analytics/analytics.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AnalyticsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async kpis(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.kpis(officeId);
  }
```

#### نقطة النهاية: Get `/analytics/staff-performance`

- **دالة المتحكم**: `AnalyticsController.staffPerf()` (lines 43-46 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/analytics/staff-performance`
- **الأدوار المطلوبة**: مدير
- **الحمايات**: `@Get('staff-performance'), @Roles('manager')`

**معاملات الطلب**

- `@Req() req: any`
- `@Query('staff_phone') staffPhone?: string`
- `@Query('report_period') reportPeriod?: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AnalyticsService.staffPerformance` في `/workspace/api/src/analytics/analytics.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AnalyticsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async staffPerf(@Req() req: any, @Query('staff_phone') staffPhone?: string, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.staffPerformance(officeId, staffPhone, reportPeriod);
  }
```

---

## app

تضم وحدة `app` عدد 0 متحكم/متحكمات، 0 خدمة، و 0 تعريفاً لكائنات DTO.

---

## المواعيد

تضم وحدة `المواعيد` عدد 1 متحكم/متحكمات، 1 خدمة، و 7 تعريفاً لكائنات DTO.

### المتحكم `AppointmentsController` (`/workspace/api/src/appointments/appointments.controller.ts`)
- الخدمات المحقونة: `appointmentsService: AppointmentsService`
#### نقطة النهاية: Get `/appointments`

- **دالة المتحكم**: `AppointmentsController.findAll()` (lines 23-27 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/appointments`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get(), @ApiOperation({ summary: 'قائمة المواعيد مع filters' })`

**معاملات الطلب**

- `@Req() req: any`
- `@Query() filters: FilterAppointmentsDto`

**قواعد التحقق**

كائن DTO `FilterAppointmentsDto` معرف في `/workspace/api/src/appointments/dto/filter-appointments.dto.ts`
- الحقل `page`: `number` — أدوات التحقق: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- الحقل `limit`: `number` — أدوات التحقق: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- الحقل `search`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'معاينة', description: 'البحث في العنوان/الوصف' }), @IsOptional(), @IsString()
- الحقل `type`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'], description: 'نوع الموعد' }), @IsOptional(), @IsEnum(['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'])
- الحقل `status`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], description: 'حالة الموعد' }), @IsOptional(), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
- الحقل `date`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-20', description: 'التاريخ المحدد' }), @IsOptional(), @IsDateString()
- الحقل `start_date`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-01', description: 'من تاريخ' }), @IsOptional(), @IsDateString()
- الحقل `end_date`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-31', description: 'إلى تاريخ' }), @IsOptional(), @IsDateString()
- الحقل `property_id`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العقار' }), @IsOptional(), @IsUUID()
- الحقل `customer_id`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العميل' }), @IsOptional(), @IsUUID()
- الحقل `assigned_staff_id`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف' }), @IsOptional(), @IsUUID()
- الحقل `order_by`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['date', 'created_at', 'start_time'], example: 'date', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
- الحقل `order`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.findAll` في `/workspace/api/src/appointments/appointments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async findAll(@Req() req: any, @Query() filters: FilterAppointmentsDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findAll(officeId, filters);
  }
```

#### نقطة النهاية: Get `/appointments/stats`

- **دالة المتحكم**: `AppointmentsController.getStats()` (lines 31-35 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/appointments/stats`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('stats'), @ApiOperation({ summary: 'إحصائيات المواعيد' })`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.getStats` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async getStats(officeId: string) {
    return { total: 0, today: 0, upcoming: 0 };
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getStats(officeId);
  }
```

#### نقطة النهاية: Get `/appointments/today`

- **دالة المتحكم**: `AppointmentsController.getToday()` (lines 53-57 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/appointments/today`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('today'), @ApiOperation({ summary: 'مواعيد اليوم' })`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.getToday` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async getToday(officeId: string) {
    return [];
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getToday(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getToday(officeId);
  }
```

#### نقطة النهاية: Get `/appointments/upcoming`

- **دالة المتحكم**: `AppointmentsController.getUpcoming()` (lines 62-66 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/appointments/upcoming`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('upcoming'), @ApiOperation({ summary: 'المواعيد القادمة' }), @ApiQuery({ name: 'limit', required: false, example: 10 })`

**معاملات الطلب**

- `@Req() req: any`
- `@Query('limit') limit?: number`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.getUpcoming` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async getUpcoming(officeId: string, limit?: number) {
    return [];
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getUpcoming(@Req() req: any, @Query('limit') limit?: number) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getUpcoming(officeId, limit);
  }
```

#### نقطة النهاية: Get `/appointments/:id`

- **دالة المتحكم**: `AppointmentsController.findOne()` (lines 70-74 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/appointments/:id`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get(':id'), @ApiOperation({ summary: 'تفاصيل موعد' })`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.findOne` في `/workspace/api/src/appointments/appointments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findOne(officeId, id);
  }
```

#### نقطة النهاية: Post `/appointments`

- **دالة المتحكم**: `AppointmentsController.create()` (lines 79-85 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/appointments`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post(), @ApiOperation({ summary: 'إضافة موعد جديد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() dto: CreateAppointmentDto`

**قواعد التحقق**

كائن DTO `CreateAppointmentDto` معرف في `/workspace/api/src/appointments/dto/create-appointment.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.create` في `/workspace/api/src/appointments/appointments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.create(officeId, userId, dto);
    return { success: true, appointment };
  }
```

#### نقطة النهاية: Patch `/appointments/:id`

- **دالة المتحكم**: `AppointmentsController.update()` (lines 90-95 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/appointments/:id`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Patch(':id'), @ApiOperation({ summary: 'تعديل موعد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateAppointmentDto`

**قواعد التحقق**

كائن DTO `UpdateAppointmentDto` معرف في `/workspace/api/src/appointments/dto/update-appointment.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.update` في `/workspace/api/src/appointments/appointments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.update(officeId, id, dto);
    return { success: true, appointment };
  }
```

#### نقطة النهاية: Delete `/appointments/:id`

- **دالة المتحكم**: `AppointmentsController.remove()` (lines 100-104 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Delete`
- **المسار**: `/appointments/:id`
- **الأدوار المطلوبة**: مدير
- **الحمايات**: `@Delete(':id'), @ApiOperation({ summary: 'حذف موعد' }), @Roles('manager')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.remove` في `/workspace/api/src/appointments/appointments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.remove(officeId, id);
  }
```

#### نقطة النهاية: Patch `/appointments/:id/status`

- **دالة المتحكم**: `AppointmentsController.updateStatus()` (lines 109-115 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/appointments/:id/status`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Patch(':id/status'), @ApiOperation({ summary: 'تحديث حالة الموعد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateStatusDto`

**قواعد التحقق**

كائن DTO `UpdateStatusDto` معرف في `/workspace/api/src/appointments/dto/update-status.dto.ts`
- الحقل `status`: `string` — أدوات التحقق: @ApiProperty({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], example: 'confirmed', description: 'الحالة الجديدة' }), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
- الحقل `notes`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'تم تأكيد الموعد مع العميل', description: 'ملاحظات' }), @IsString(), @IsOptional()

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.updateStatus` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async updateStatus(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.updateStatus(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```

#### نقطة النهاية: Patch `/appointments/:id/cancel`

- **دالة المتحكم**: `AppointmentsController.cancel()` (lines 120-126 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/appointments/:id/cancel`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Patch(':id/cancel'), @ApiOperation({ summary: 'إلغاء موعد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: CancelAppointmentDto`

**قواعد التحقق**

كائن DTO `CancelAppointmentDto` معرف في `/workspace/api/src/appointments/dto/cancel-appointment.dto.ts`
- الحقل `cancellationReason`: `string` — أدوات التحقق: @ApiProperty({ example: 'العميل طلب إلغاء الموعد', description: 'سبب الإلغاء' }), @IsString()

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.cancel` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async cancel(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async cancel(@Req() req: any, @Param('id') id: string, @Body() dto: CancelAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.cancel(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```

#### نقطة النهاية: Patch `/appointments/:id/complete`

- **دالة المتحكم**: `AppointmentsController.complete()` (lines 131-136 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/appointments/:id/complete`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Patch(':id/complete'), @ApiOperation({ summary: 'إتمام موعد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: CompleteAppointmentDto`

**قواعد التحقق**

كائن DTO `CompleteAppointmentDto` معرف في `/workspace/api/src/appointments/dto/complete-appointment.dto.ts`
- الحقل `completionNotes`: `string` — أدوات التحقق: @ApiProperty({ example: 'تمت المعاينة بنجاح، العميل مهتم بالعقار', description: 'ملاحظات الإتمام' }), @IsString()

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.complete` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async complete(officeId: string, id: string, dto: any) {
    return {};
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.complete(officeId, id, dto);
    return { success: true, appointment };
  }
```

#### نقطة النهاية: Post `/appointments/:id/remind`

- **دالة المتحكم**: `AppointmentsController.sendReminder()` (lines 141-145 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/appointments/:id/remind`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post(':id/remind'), @ApiOperation({ summary: 'إرسال تذكير للموعد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.sendReminder` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async sendReminder(officeId: string, id: string) {
    return { message: 'Reminder sent' };
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async sendReminder(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.sendReminder(officeId, id);
  }
```

#### نقطة النهاية: Post `/appointments/check-availability`

- **دالة المتحكم**: `AppointmentsController.checkAvailability()` (lines 150-154 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/appointments/check-availability`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post('check-availability'), @ApiOperation({ summary: 'التحقق من توفر موعد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() dto: CheckAvailabilityDto`

**قواعد التحقق**

كائن DTO `CheckAvailabilityDto` معرف في `/workspace/api/src/appointments/dto/check-availability.dto.ts`
- الحقل `date`: `string` — أدوات التحقق: @ApiProperty({ example: '2025-10-20', description: 'التاريخ' }), @IsDateString()
- الحقل `startTime`: `string` — أدوات التحقق: @ApiProperty({ example: '10:00:00', description: 'وقت البداية' }), @IsString()
- الحقل `endTime`: `string` — أدوات التحقق: @ApiProperty({ example: '11:00:00', description: 'وقت النهاية' }), @IsString()
- الحقل `assignedStaffId`: `string` — أدوات التحقق: @ApiProperty({ example: 'uuid-staff-id', description: 'معرف الموظف' }), @IsUUID()

**التفويض إلى الخدمة**

- يفوض إلى `AppointmentsService.checkAvailability` في `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async checkAvailability(officeId: string, dto: any) {
    return { available: true };
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات AppointmentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async checkAvailability(@Req() req: any, @Body() dto: CheckAvailabilityDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.checkAvailability(officeId, dto);
  }
```

---

## components

تضم وحدة `components` عدد 0 متحكم/متحكمات، 0 خدمة، و 0 تعريفاً لكائنات DTO.

---

## العملاء

تضم وحدة `العملاء` عدد 2 متحكم/متحكمات، 2 خدمة، و 13 تعريفاً لكائنات DTO.

### المتحكم `CustomersController` (`/workspace/api/src/customers/customers.controller.ts`)
- الخدمات المحقونة: `customersService: CustomersService`
#### نقطة النهاية: Get `/customers`

- **دالة المتحكم**: `CustomersController.findAll()` (lines 25-29 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get(), @ApiOperation({ summary: 'قائمة العملاء مع filters' })`

**معاملات الطلب**

- `@Req() req: any`
- `@Query() filters: FilterCustomersDto`

**قواعد التحقق**

كائن DTO `FilterCustomersDto` معرف في `/workspace/api/src/customers/dto/filter-customers.dto.ts`
- الحقل `page`: `number` — أدوات التحقق: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- الحقل `limit`: `number` — أدوات التحقق: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- الحقل `search`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'محمد', description: 'البحث في الاسم/البريد/الهاتف' }), @IsOptional(), @IsString()
- الحقل `type`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['buyer', 'seller', 'renter', 'landlord', 'both'], description: 'نوع العميل' }), @IsOptional(), @IsEnum(['buyer', 'seller', 'renter', 'landlord', 'both'])
- الحقل `status`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['active', 'inactive', 'blocked'], description: 'حالة العميل' }), @IsOptional(), @IsEnum(['active', 'inactive', 'blocked'])
- الحقل `city`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'الرياض', description: 'المدينة' }), @IsOptional(), @IsString()
- الحقل `source`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'website', description: 'المصدر' }), @IsOptional(), @IsString()
- الحقل `rating`: `number` — أدوات التحقق: @ApiPropertyOptional({ example: 5, description: 'التقييم' }), @IsOptional(), @Type(() => Number), @IsInt()
- الحقل `assigned_staff_id`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف المسؤول' }), @IsOptional(), @IsString()
- الحقل `order_by`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['created_at', 'updated_at', 'name', 'last_contact_date'], example: 'created_at', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
- الحقل `order`: `string` — أدوات التحقق: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.findAll` في `/workspace/api/src/customers/customers.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async findAll(@Req() req: any, @Query() filters: FilterCustomersDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findAll(officeId, filters);
  }
```

#### نقطة النهاية: Get `/customers/stats`

- **دالة المتحكم**: `CustomersController.getStats()` (lines 33-37 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/stats`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('stats'), @ApiOperation({ summary: 'إحصائيات العملاء' })`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.getStats` في `/workspace/api/src/customers/customers.service.ts`.
```ts
  async getStats(officeId: string) {
    return { total: 0, active: 0, potential: 0 };
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getStats(officeId);
  }
```

#### نقطة النهاية: Get `/customers/search`

- **دالة المتحكم**: `CustomersController.search()` (lines 42-46 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/search`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('search'), @ApiOperation({ summary: 'البحث السريع عن عملاء' }), @ApiQuery({ name: 'q', required: true, description: 'كلمة البحث' })`

**معاملات الطلب**

- `@Req() req: any`
- `@Query('q') searchTerm: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.search` في `/workspace/api/src/customers/customers.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async search(@Req() req: any, @Query('q') searchTerm: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.search(officeId, searchTerm);
  }
```

#### نقطة النهاية: Get `/customers/export`

- **دالة المتحكم**: `CustomersController.exportExcel()` (lines 51-83 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/export`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Get('export'), @ApiOperation({ summary: 'تصدير العملاء إلى Excel' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Res({ passthrough: true }) res: Response`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.exportExcel` في `/workspace/api/src/customers/customers.service.ts`.
```ts
  async exportExcel(officeId: string) {
    return [];
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Get `/customers/:id`

- **دالة المتحكم**: `CustomersController.findOne()` (lines 87-91 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/:id`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get(':id'), @ApiOperation({ summary: 'تفاصيل عميل' })`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.findOne` في `/workspace/api/src/customers/customers.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findOne(officeId, id);
  }
```

#### نقطة النهاية: Post `/customers`

- **دالة المتحكم**: `CustomersController.create()` (lines 96-102 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/customers`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post(), @ApiOperation({ summary: 'إضافة عميل جديد' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() dto: CreateCustomerDto`

**قواعد التحقق**

كائن DTO `CreateCustomerDto` معرف في `/workspace/api/src/customers/dto/create-customer.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.create` في `/workspace/api/src/customers/customers.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.create(officeId, userId, dto);
    return { success: true, customer };
  }
```

#### نقطة النهاية: Patch `/customers/:id`

- **دالة المتحكم**: `CustomersController.update()` (lines 107-112 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/customers/:id`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Patch(':id'), @ApiOperation({ summary: 'تعديل عميل' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateCustomerDto`

**قواعد التحقق**

كائن DTO `UpdateCustomerDto` معرف في `/workspace/api/src/customers/dto/update-customer.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.update` في `/workspace/api/src/customers/customers.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.update(officeId, id, dto);
    return { success: true, customer };
  }
```

#### نقطة النهاية: Delete `/customers/:id`

- **دالة المتحكم**: `CustomersController.remove()` (lines 117-121 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Delete`
- **المسار**: `/customers/:id`
- **الأدوار المطلوبة**: مدير
- **الحمايات**: `@Delete(':id'), @ApiOperation({ summary: 'حذف عميل' }), @Roles('manager')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.remove` في `/workspace/api/src/customers/customers.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.remove(officeId, id);
  }
```

#### نقطة النهاية: Get `/customers/:id/notes`

- **دالة المتحكم**: `CustomersController.getNotes()` (lines 126-130 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/:id/notes`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get(':id/notes'), @ApiOperation({ summary: 'قائمة ملاحظات العميل' })`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') customerId: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.getNotes` في `/workspace/api/src/customers/customers.service.ts`.
```ts
  async getNotes(officeId: string, customerId: string) {
    return [];
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getNotes(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getNotes(officeId, customerId);
  }
```

#### نقطة النهاية: Post `/customers/:id/notes`

- **دالة المتحكم**: `CustomersController.createNote()` (lines 135-141 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/customers/:id/notes`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post(':id/notes'), @ApiOperation({ summary: 'إضافة ملاحظة للعميل' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') customerId: string`
- `@Body() dto: CreateCustomerNoteDto`

**قواعد التحقق**

كائن DTO `CreateCustomerNoteDto` معرف في `/workspace/api/src/customers/dto/create-customer-note.dto.ts`
- الحقل `content`: `string` — أدوات التحقق: @ApiProperty({ example: 'العميل مهتم بالشقق في شمال الرياض', description: 'محتوى الملاحظة' }), @IsString()
- الحقل `isImportant`: `boolean` — أدوات التحقق: @ApiPropertyOptional({ example: false, description: 'هل الملاحظة مهمة؟' }), @IsBoolean(), @IsOptional()
- الحقل `tags`: `any` — أدوات التحقق: @ApiPropertyOptional({ example: { category: 'follow_up' }, description: 'الوسوم' }), @IsObject(), @IsOptional()

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.createNote` في `/workspace/api/src/customers/customers.service.ts`.
```ts
  async createNote(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async createNote(@Req() req: any, @Param('id') customerId: string, @Body() dto: CreateCustomerNoteDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const note = await this.customersService.createNote(officeId, customerId, userId, dto);
    return { success: true, note };
  }
```

#### نقطة النهاية: Delete `/customers/:id/notes/:noteId`

- **دالة المتحكم**: `CustomersController.removeNote()` (lines 161-165 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Delete`
- **المسار**: `/customers/:id/notes/:noteId`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Delete(':id/notes/:noteId'), @ApiOperation({ summary: 'حذف ملاحظة' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') customerId: string`
- `@Param('noteId') noteId: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.removeNote` في `/workspace/api/src/customers/customers.service.ts`.
```ts
  async removeNote(officeId: string, customerId: string, noteId: string) {
    return { message: 'Note deleted' };
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async removeNote(@Req() req: any, @Param('id') customerId: string, @Param('noteId') noteId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.removeNote(officeId, customerId, noteId);
  }
```

#### نقطة النهاية: Get `/customers/:id/interactions`

- **دالة المتحكم**: `CustomersController.getInteractions()` (lines 170-174 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/:id/interactions`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get(':id/interactions'), @ApiOperation({ summary: 'قائمة تعاملات العميل' })`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') customerId: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.getInteractions` في `/workspace/api/src/customers/customers.service.ts`.
```ts
  async getInteractions(officeId: string, customerId: string) {
    return [];
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getInteractions(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getInteractions(officeId, customerId);
  }
```

#### نقطة النهاية: Post `/customers/:id/properties`

- **دالة المتحكم**: `CustomersController.linkProperty()` (lines 195-200 in `/workspace/api/src/customers/customers.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/customers/:id/properties`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post(':id/properties'), @ApiOperation({ summary: 'ربط عقار بالعميل' }), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') customerId: string`
- `@Body() dto: LinkPropertyDto`

**قواعد التحقق**

كائن DTO `LinkPropertyDto` معرف في `/workspace/api/src/customers/dto/link-property.dto.ts`
- الحقل `property_id`: `string` — أدوات التحقق: @ApiProperty({ example: 'uuid-property-id', description: 'معرف العقار' }), @IsUUID()
- الحقل `relationship`: `string` — أدوات التحقق: @ApiProperty({ enum: ['owner', 'interested', 'viewed', 'negotiating', 'contracted'], example: 'interested', description: 'نوع العلاقة' }), @IsEnum(['owner', 'interested', 'viewed', 'negotiating', 'contracted'])
- الحقل `start_date`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-20T10:00:00Z', description: 'تاريخ البداية' }), @IsDateString(), @IsOptional()
- الحقل `end_date`: `string` — أدوات التحقق: @ApiPropertyOptional({ example: '2025-11-20T10:00:00Z', description: 'تاريخ النهاية' }), @IsDateString(), @IsOptional()

**التفويض إلى الخدمة**

- يفوض إلى `CustomersService.linkProperty` في `/workspace/api/src/customers/customers.service.ts`.
```ts
  async linkProperty(officeId: string, customerId: string, dto: any) {
    return {};
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات CustomersService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async linkProperty(@Req() req: any, @Param('id') customerId: string, @Body() dto: LinkPropertyDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const relationship = await this.customersService.linkProperty(officeId, customerId, dto);
    return { success: true, relationship };
  }
```

### المتحكم `ExcelController` (`/workspace/api/src/customers/excel.controller.ts`)
- الخدمات المحقونة: `excelService: ExcelService`
#### نقطة النهاية: Get `/customers/excel/templates`

- **دالة المتحكم**: `ExcelController.getTemplates()` (lines 216-231 in `/workspace/api/src/customers/excel.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/excel/templates`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('templates')`

**معاملات الطلب**

- ∅

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يستدعي `logger.log()` (تعذر تحديد موقع الخدمة تلقائياً).
- يفوض إلى `ExcelService.getTemplates` في `/workspace/api/src/customers/excel.service.ts`.
- يستدعي `logger.error()` (تعذر تحديد موقع الخدمة تلقائياً).

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات ExcelService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Post `/customers/excel/validate-file`

- **دالة المتحكم**: `ExcelController.validateFile()` (lines 329-363 in `/workspace/api/src/customers/excel.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/customers/excel/validate-file`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Post('validate-file'), @UseInterceptors(FileInterceptor('file'))`

**معاملات الطلب**

- `@UploadedFile() file: Express.Multer.File`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يستدعي `logger.log()` (تعذر تحديد موقع الخدمة تلقائياً).

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات ExcelService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Get `/customers/excel/import-stats`

- **دالة المتحكم**: `ExcelController.getImportStats()` (lines 374-390 in `/workspace/api/src/customers/excel.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/customers/excel/import-stats`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('import-stats')`

**معاملات الطلب**

- ∅

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يستدعي `logger.log()` (تعذر تحديد موقع الخدمة تلقائياً).

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات ExcelService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

---

## الصحة

تضم وحدة `الصحة` عدد 1 متحكم/متحكمات، 0 خدمة، و 0 تعريفاً لكائنات DTO.

### المتحكم `HealthController` (`/workspace/api/src/health/health.controller.ts`)
- الخدمات المحقونة: `configService: ConfigService`, `supabaseService: SupabaseService`
*لا توجد نقاط نهاية معرفة في هذا المتحكم.*

---

## التكاملات

تضم وحدة `التكاملات` عدد 0 متحكم/متحكمات، 1 خدمة، و 0 تعريفاً لكائنات DTO.

---

## الصيانة

تضم وحدة `الصيانة` عدد 1 متحكم/متحكمات، 1 خدمة، و 5 تعريفاً لكائنات DTO.

### المتحكم `MaintenanceController` (`/workspace/api/src/maintenance/maintenance.controller.ts`)
- الخدمات المحقونة: `maintenanceService: MaintenanceService`
#### نقطة النهاية: Get `/maintenance`

- **دالة المتحكم**: `MaintenanceController.list()` (lines 21-24 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/maintenance`
- **الأدوار المطلوبة**: مدير, موظف, technician
- **الحمايات**: `@Get('maintenance'), @Roles('manager', 'staff', 'technician')`

**معاملات الطلب**

- `@Req() req: any`
- `@Query() filters: FilterMaintenanceDto`

**قواعد التحقق**

كائن DTO `FilterMaintenanceDto` معرف في `/workspace/api/src/maintenance/dto/filter-maintenance.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `MaintenanceService.list` في `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات MaintenanceService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async list(@Req() req: any, @Query() filters: FilterMaintenanceDto) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.list(officeId, filters);
  }
```

#### نقطة النهاية: Get `/maintenance/:id`

- **دالة المتحكم**: `MaintenanceController.getOne()` (lines 27-30 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/maintenance/:id`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('maintenance/:id')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `MaintenanceService.getOne` في `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات MaintenanceService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.getOne(officeId, id);
  }
```

#### نقطة النهاية: Post `/maintenance`

- **دالة المتحكم**: `MaintenanceController.create()` (lines 34-40 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/maintenance`
- **الأدوار المطلوبة**: مدير, موظف, technician
- **الحمايات**: `@Post('maintenance'), @Roles('manager', 'staff', 'technician')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() dto: CreateMaintenanceDto`

**قواعد التحقق**

كائن DTO `CreateMaintenanceDto` معرف في `/workspace/api/src/maintenance/dto/create-maintenance.dto.ts`
- الحقل `description`: `string` — أدوات التحقق: @IsOptional() @IsString()
- الحقل `before_images`: `string[]` — أدوات التحقق: @IsOptional() @IsArray() @IsString({ each: true })

**التفويض إلى الخدمة**

- يفوض إلى `MaintenanceService.createInternal` في `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات MaintenanceService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async create(@Req() req: any, @Body() dto: CreateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const officeCode = req?.user?.office_id; // بافتراض أن office_id هو نفسه code
    const userId = req?.user?.user_id ?? null;
    const created = await this.maintenanceService.createInternal(officeId, officeCode, userId, dto);
    return { success: true, request: created };
  }
```

#### نقطة النهاية: Post `/public/maintenance`

- **دالة المتحكم**: `MaintenanceController.createPublic()` (lines 43-48 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/public/maintenance`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Post('public/maintenance')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() dto: PublicCreateMaintenanceDto`

**قواعد التحقق**

كائن DTO `PublicCreateMaintenanceDto` معرف في `/workspace/api/src/maintenance/dto/public-create-maintenance.dto.ts`
- الحقل `description`: `string` — أدوات التحقق: @IsOptional() @IsString()
- الحقل `before_images`: `string[]` — أدوات التحقق: @IsOptional() @IsArray() @IsString({ each: true })

**التفويض إلى الخدمة**

- يفوض إلى `MaintenanceService.createPublic` في `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات MaintenanceService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async createPublic(@Req() req: any, @Body() dto: PublicCreateMaintenanceDto) {
    const officeId = req?.user?.office_id ?? dto?.property_id ?? 'public';
    const officeCode = req?.user?.office_id ?? 'public';
    const created = await this.maintenanceService.createPublic(officeId, officeCode, dto);
    return { success: true, request: created };
  }
```

#### نقطة النهاية: Patch `/maintenance/:id`

- **دالة المتحكم**: `MaintenanceController.update()` (lines 52-56 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/maintenance/:id`
- **الأدوار المطلوبة**: مدير, موظف, technician
- **الحمايات**: `@Patch('maintenance/:id'), @Roles('manager', 'staff', 'technician')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateMaintenanceDto`

**قواعد التحقق**

كائن DTO `UpdateMaintenanceDto` معرف في `/workspace/api/src/maintenance/dto/update-maintenance.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `MaintenanceService.update` في `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات MaintenanceService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.update(officeId, id, dto);
    return { success: true, request: updated };
  }
```

#### نقطة النهاية: Post `/maintenance/:id/complete`

- **دالة المتحكم**: `MaintenanceController.complete()` (lines 60-64 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/maintenance/:id/complete`
- **الأدوار المطلوبة**: technician, مدير
- **الحمايات**: `@Post('maintenance/:id/complete'), @Roles('technician', 'manager')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: CompleteMaintenanceDto`

**قواعد التحقق**

كائن DTO `CompleteMaintenanceDto` معرف في `/workspace/api/src/maintenance/dto/complete-maintenance.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `MaintenanceService.complete` في `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات MaintenanceService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.complete(officeId, id, dto);
    return { success: true, request: updated };
  }
```

---

## التهيئة

تضم وحدة `التهيئة` عدد 1 متحكم/متحكمات، 1 خدمة، و 0 تعريفاً لكائنات DTO.

### المتحكم `OnboardingController` (`/workspace/api/src/onboarding/onboarding.controller.ts`)
- الخدمات المحقونة: `onboarding: OnboardingService`
#### نقطة النهاية: Post `/onboarding/office`

- **دالة المتحكم**: `OnboardingController.createOffice()` (lines 11-13 in `/workspace/api/src/onboarding/onboarding.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/onboarding/office`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Post('office')`

**معاملات الطلب**

- `@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `OnboardingService.createOffice` في `/workspace/api/src/onboarding/onboarding.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات OnboardingService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async createOffice(@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    return this.onboarding.createOffice(body);
  }
```

#### نقطة النهاية: Get `/onboarding/verify-code`

- **دالة المتحكم**: `OnboardingController.verify()` (lines 16-20 in `/workspace/api/src/onboarding/onboarding.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/onboarding/verify-code`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('verify-code')`

**معاملات الطلب**

- `@Query('office_code') officeCode: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `OnboardingService.verifyCodeAvailable` في `/workspace/api/src/onboarding/onboarding.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات OnboardingService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async verify(@Query('office_code') officeCode: string) {
    if (!officeCode) throw new BadRequestException('office_code مفقود');
    const res = await this.onboarding.verifyCodeAvailable(officeCode);
    return res;
  }
```

#### نقطة النهاية: Post `/onboarding/complete`

- **دالة المتحكم**: `OnboardingController.complete()` (lines 23-25 in `/workspace/api/src/onboarding/onboarding.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/onboarding/complete`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Post('complete')`

**معاملات الطلب**

- `@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `OnboardingService.complete` في `/workspace/api/src/onboarding/onboarding.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات OnboardingService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async complete(@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    return this.onboarding.complete(body);
  }
```

---

## المدفوعات

تضم وحدة `المدفوعات` عدد 1 متحكم/متحكمات، 1 خدمة، و 3 تعريفاً لكائنات DTO.

### المتحكم `PaymentsController` (`/workspace/api/src/payments/payments.controller.ts`)
- الخدمات المحقونة: `paymentsService: PaymentsService`
#### نقطة النهاية: Get `/payments`

- **دالة المتحكم**: `PaymentsController.list()` (lines 18-21 in `/workspace/api/src/payments/payments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/payments`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('payments')`

**معاملات الطلب**

- `@Req() req: any`
- `@Query() filters: FilterPaymentsDto`

**قواعد التحقق**

كائن DTO `FilterPaymentsDto` معرف في `/workspace/api/src/payments/dto/filter-payments.dto.ts`
- الحقل `status`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `contract_id`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `tenant_phone`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `due_from`: `string` — أدوات التحقق: @IsOptional(), @IsDateString()
- الحقل `due_to`: `string` — أدوات التحقق: @IsOptional(), @IsDateString()

**التفويض إلى الخدمة**

- يفوض إلى `PaymentsService.findPayments` في `/workspace/api/src/payments/payments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PaymentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async list(@Req() req: any, @Query() filters: FilterPaymentsDto) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findPayments(officeId, filters);
  }
```

#### نقطة النهاية: Get `/contracts/:contractId/payments`

- **دالة المتحكم**: `PaymentsController.byContract()` (lines 24-27 in `/workspace/api/src/payments/payments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/contracts/:contractId/payments`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('contracts/:contractId/payments')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('contractId') contractId: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PaymentsService.findByContract` في `/workspace/api/src/payments/payments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PaymentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async byContract(@Req() req: any, @Param('contractId') contractId: string) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findByContract(officeId, contractId);
  }
```

#### نقطة النهاية: Patch `/payments/:id/mark-paid`

- **دالة المتحكم**: `PaymentsController.markPaid()` (lines 31-35 in `/workspace/api/src/payments/payments.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/payments/:id/mark-paid`
- **الأدوار المطلوبة**: مدير, موظف, محاسب
- **الحمايات**: `@Patch('payments/:id/mark-paid'), @Roles('manager', 'staff', 'accountant')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: MarkPaidDto`

**قواعد التحقق**

كائن DTO `MarkPaidDto` معرف في `/workspace/api/src/payments/dto/mark-paid.dto.ts`
- الحقل `payment_method`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `payment_reference`: `string` — أدوات التحقق: @IsOptional(), @IsString(), @Length(0, 128)

**التفويض إلى الخدمة**

- يفوض إلى `PaymentsService.markPaid` في `/workspace/api/src/payments/payments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PaymentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async markPaid(@Req() req: any, @Param('id') id: string, @Body() dto: MarkPaidDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.paymentsService.markPaid(officeId, id, dto);
    return { success: true, payment: updated };
  }
```

#### نقطة النهاية: Get `/payments/overdue`

- **دالة المتحكم**: `PaymentsController.overdue()` (lines 38-41 in `/workspace/api/src/payments/payments.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/payments/overdue`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('payments/overdue')`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PaymentsService.getOverdue` في `/workspace/api/src/payments/payments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PaymentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async overdue(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.getOverdue(officeId);
  }
```

#### نقطة النهاية: Post `/payments/:id/send-reminder`

- **دالة المتحكم**: `PaymentsController.sendReminder()` (lines 45-49 in `/workspace/api/src/payments/payments.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/payments/:id/send-reminder`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post('payments/:id/send-reminder'), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() body: SendReminderDto`

**قواعد التحقق**

كائن DTO `SendReminderDto` معرف في `/workspace/api/src/payments/dto/send-reminder.dto.ts`
- الحقل `message`: `string` — أدوات التحقق: @IsOptional(), @IsString()

**التفويض إلى الخدمة**

- يفوض إلى `PaymentsService.sendReminder` في `/workspace/api/src/payments/payments.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PaymentsService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async sendReminder(@Req() req: any, @Param('id') id: string, @Body() body: SendReminderDto) {
    const officeId = req?.user?.office_id;
    const res = await this.paymentsService.sendReminder(officeId, id, body?.message);
    return res;
  }
```

---

## العقارات

تضم وحدة `العقارات` عدد 4 متحكم/متحكمات، 1 خدمة، و 5 تعريفاً لكائنات DTO.

### المتحكم `ExcelController` (`/workspace/api/src/properties/excel.controller.ts`)
- الخدمات المحقونة: `propertiesService: PropertiesService`
#### نقطة النهاية: Post `/properties/import`

- **دالة المتحكم**: `ExcelController.importExcel()` (lines 23-51 in `/workspace/api/src/properties/excel.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/properties/import`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post('properties/import'), @Roles('manager', 'staff'), @UseInterceptors(FileInterceptor('file')), @ApiConsumes('multipart/form-data'), @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })`

**معاملات الطلب**

- `@Req() req: any`
- `@UploadedFile() file?: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- منطق مباشر داخل المتحكم دون تفويض.

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Post `/properties/import/confirm`

- **دالة المتحكم**: `ExcelController.importConfirm()` (lines 55-69 in `/workspace/api/src/properties/excel.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/properties/import/confirm`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post('properties/import/confirm'), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() body: { rows: any[] }`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.create` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Get `/properties/export`

- **دالة المتحكم**: `ExcelController.exportExcel()` (lines 73-104 in `/workspace/api/src/properties/excel.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/properties/export`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Get('properties/export'), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Query() filters: FilterPropertiesDto`
- `@Res({ passthrough: true }) res: Response`

**قواعد التحقق**

كائن DTO `FilterPropertiesDto` معرف في `/workspace/api/src/properties/dto/filter-properties.dto.ts`
- الحقل `type`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `status`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `city`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `district`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `min_price`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `max_price`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `min_area`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `max_area`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `bedrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `bathrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `is_featured`: `boolean` — أدوات التحقق: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
- الحقل `search`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `order_by`: `'created_at' | 'price' | 'area'` — أدوات التحقق: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
- الحقل `order`: `'asc' | 'desc'` — أدوات التحقق: @IsOptional(), @IsIn(['asc', 'desc'])
- الحقل `page`: `number = 1` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- الحقل `limit`: `number = 20` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.findAll` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

### المتحكم `MediaController` (`/workspace/api/src/properties/media.controller.ts`)
- الخدمات المحقونة: `propertiesService: PropertiesService`
#### نقطة النهاية: Post `/media/signed-url`

- **دالة المتحكم**: `MediaController.signedUrl()` (lines 14-36 in `/workspace/api/src/properties/media.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/media/signed-url`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Post('media/signed-url')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() body: { property_id: string; filename: string; contentType: string }`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- منطق مباشر داخل المتحكم دون تفويض.

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Post `/properties/:id/images`

- **دالة المتحكم**: `MediaController.addImage()` (lines 39-45 in `/workspace/api/src/properties/media.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/properties/:id/images`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Post('properties/:id/images')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() body: { url: string; fileName?: string; fileSize?: number; isFeatured?: boolean }`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.addImage` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async addImage(@Req() req: any, @Param('id') id: string, @Body() body: { url: string; fileName?: string; fileSize?: number; isFeatured?: boolean }) {
    const userId = req?.user?.user_id;
    const { url, fileName, fileSize, isFeatured } = body || ({} as any);
    if (!url) throw new BadRequestException('رابط الصورة مطلوب');
    const image = await this.propertiesService.addImage(id, url, userId, fileName, fileSize, isFeatured);
    return { success: true, image };
  }
```

#### نقطة النهاية: Patch `/properties/:propertyId/images/:imageId`

- **دالة المتحكم**: `MediaController.setFeatured()` (lines 48-51 in `/workspace/api/src/properties/media.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/properties/:propertyId/images/:imageId`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Patch('properties/:propertyId/images/:imageId')`

**معاملات الطلب**

- `@Param('propertyId') propertyId: string`
- `@Param('imageId') imageId: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.setFeaturedImage` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async setFeatured(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const image = await this.propertiesService.setFeaturedImage(propertyId, imageId);
    return { success: true, image };
  }
```

#### نقطة النهاية: Delete `/properties/:propertyId/images/:imageId`

- **دالة المتحكم**: `MediaController.removeImage()` (lines 54-57 in `/workspace/api/src/properties/media.controller.ts`)
- **طريقة HTTP**: `Delete`
- **المسار**: `/properties/:propertyId/images/:imageId`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Delete('properties/:propertyId/images/:imageId')`

**معاملات الطلب**

- `@Param('propertyId') propertyId: string`
- `@Param('imageId') imageId: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.removeImage` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async removeImage(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const res = await this.propertiesService.removeImage(propertyId, imageId);
    return res;
  }
```

### المتحكم `PropertiesController` (`/workspace/api/src/properties/properties.controller.ts`)
- الخدمات المحقونة: `propertiesService: PropertiesService`
#### نقطة النهاية: Get `/properties`

- **دالة المتحكم**: `PropertiesController.list()` (lines 18-22 in `/workspace/api/src/properties/properties.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/properties`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get()`

**معاملات الطلب**

- `@Req() req: any`
- `@Query() query: FilterPropertiesDto`

**قواعد التحقق**

كائن DTO `FilterPropertiesDto` معرف في `/workspace/api/src/properties/dto/filter-properties.dto.ts`
- الحقل `type`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `status`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `city`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `district`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `min_price`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `max_price`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `min_area`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `max_area`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `bedrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `bathrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `is_featured`: `boolean` — أدوات التحقق: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
- الحقل `search`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `order_by`: `'created_at' | 'price' | 'area'` — أدوات التحقق: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
- الحقل `order`: `'asc' | 'desc'` — أدوات التحقق: @IsOptional(), @IsIn(['asc', 'desc'])
- الحقل `page`: `number = 1` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- الحقل `limit`: `number = 20` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.findAll` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async list(@Req() req: any, @Query() query: FilterPropertiesDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى قائمة العقارات');
    return this.propertiesService.findAll(officeId, query);
  }
```

#### نقطة النهاية: Get `/properties/:id`

- **دالة المتحكم**: `PropertiesController.getOne()` (lines 25-29 in `/workspace/api/src/properties/properties.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/properties/:id`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get(':id')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.findOneWithImages` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يرمي `UnauthorizedException` عند غياب هوية المكتب.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى تفاصيل العقار');
    return this.propertiesService.findOneWithImages(officeId, id);
  }
```

#### نقطة النهاية: Post `/properties`

- **دالة المتحكم**: `PropertiesController.create()` (lines 33-38 in `/workspace/api/src/properties/properties.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/properties`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post(), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() dto: CreatePropertyDto`

**قواعد التحقق**

كائن DTO `CreatePropertyDto` معرف في `/workspace/api/src/properties/dto/create-property.dto.ts`
- الحقل `location_city`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `location_district`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `location_street`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `price`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString({}, { message: 'السعر يجب أن يكون رقمياً' })
- الحقل `currency`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `area_sqm`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString({}, { message: 'المساحة يجب أن تكون رقمية' })
- الحقل `bedrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `bathrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `features`: `Record<string, any>` — أدوات التحقق: @IsOptional(), @IsObject()
- الحقل `description`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `images`: `string[]` — أدوات التحقق: @IsOptional(), @IsArray(), @IsString({ each: true })
- الحقل `status`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `contact_person`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `contact_phone`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `google_maps_link`: `string` — أدوات التحقق: @IsOptional(), @IsUrl({}, { message: 'رابط خرائط قوقل غير صالح' })
- الحقل `latitude`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `longitude`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `slug`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `is_featured`: `boolean` — أدوات التحقق: @IsOptional(), @IsBoolean()

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.create` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async create(@Req() req: any, @Body() dto: CreatePropertyDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    const created = await this.propertiesService.create(officeId, userId, dto);
    return { success: true, property: created };
  }
```

#### نقطة النهاية: Patch `/properties/:id`

- **دالة المتحكم**: `PropertiesController.update()` (lines 42-46 in `/workspace/api/src/properties/properties.controller.ts`)
- **طريقة HTTP**: `Patch`
- **المسار**: `/properties/:id`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Patch(':id'), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdatePropertyDto`

**قواعد التحقق**

كائن DTO `UpdatePropertyDto` معرف في `/workspace/api/src/properties/dto/update-property.dto.ts`

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.update` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.propertiesService.update(officeId, id, dto);
    return { success: true, property: updated };
  }
```

#### نقطة النهاية: Delete `/properties/:id`

- **دالة المتحكم**: `PropertiesController.softDelete()` (lines 50-54 in `/workspace/api/src/properties/properties.controller.ts`)
- **طريقة HTTP**: `Delete`
- **المسار**: `/properties/:id`
- **الأدوار المطلوبة**: مدير
- **الحمايات**: `@Delete(':id'), @Roles('manager')`

**معاملات الطلب**

- `@Req() req: any`
- `@Param('id') id: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.softDelete` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    const res = await this.propertiesService.softDelete(officeId, id);
    return res;
  }
```

### المتحكم `PublicController` (`/workspace/api/src/properties/public.controller.ts`)
- الخدمات المحقونة: `propertiesService: PropertiesService`
#### نقطة النهاية: Get `/public/offices/:officeCode/listings`

- **دالة المتحكم**: `PublicController.listings()` (lines 12-15 in `/workspace/api/src/properties/public.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/public/offices/:officeCode/listings`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('offices/:officeCode/listings')`

**معاملات الطلب**

- `@Param('officeCode') officeCode: string`
- `@Query() query: FilterPropertiesDto`

**قواعد التحقق**

كائن DTO `FilterPropertiesDto` معرف في `/workspace/api/src/properties/dto/filter-properties.dto.ts`
- الحقل `type`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `status`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `city`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `district`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `min_price`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `max_price`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `min_area`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `max_area`: `string` — أدوات التحقق: @IsOptional(), @IsNumberString()
- الحقل `bedrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `bathrooms`: `number` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- الحقل `is_featured`: `boolean` — أدوات التحقق: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
- الحقل `search`: `string` — أدوات التحقق: @IsOptional(), @IsString()
- الحقل `order_by`: `'created_at' | 'price' | 'area'` — أدوات التحقق: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
- الحقل `order`: `'asc' | 'desc'` — أدوات التحقق: @IsOptional(), @IsIn(['asc', 'desc'])
- الحقل `page`: `number = 1` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- الحقل `limit`: `number = 20` — أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.getPublicListings` في `/workspace/api/src/properties/properties.service.ts`.
```ts
  async getPublicListings(officeCode: string, filters: FilterPropertiesDto) {
    return this.findAll(officeCode, { ...filters, status: 'available' });
  }
```

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async listings(@Param('officeCode') officeCode: string, @Query() query: FilterPropertiesDto) {
    const res = await this.propertiesService.getPublicListings(officeCode, query);
    return res;
  }
```

#### نقطة النهاية: Get `/public/offices/:officeCode/properties/:slug`

- **دالة المتحكم**: `PublicController.bySlug()` (lines 18-21 in `/workspace/api/src/properties/public.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/public/offices/:officeCode/properties/:slug`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('offices/:officeCode/properties/:slug')`

**معاملات الطلب**

- `@Param('officeCode') officeCode: string`
- `@Param('slug') slug: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `PropertiesService.getPublicBySlug` في `/workspace/api/src/properties/properties.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات PropertiesService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async bySlug(@Param('officeCode') officeCode: string, @Param('slug') slug: string) {
    const property = await this.propertiesService.getPublicBySlug(officeCode, slug);
    return property;
  }
```

---

## وصول Supabase

تضم وحدة `وصول Supabase` عدد 0 متحكم/متحكمات، 1 خدمة، و 0 تعريفاً لكائنات DTO.

---

## واتساب

تضم وحدة `واتساب` عدد 1 متحكم/متحكمات، 1 خدمة، و 0 تعريفاً لكائنات DTO.

### المتحكم `WhatsAppController` (`/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- الخدمات المحقونة: `supabaseService: SupabaseService`, `meta: MetaApiService`
#### نقطة النهاية: Get `/whatsapp/webhook`

- **دالة المتحكم**: `WhatsAppController.verify()` (lines 19-27 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/whatsapp/webhook`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('webhook')`

**معاملات الطلب**

- `@Query('hub.mode') mode: string`
- `@Query('hub.verify_token') token: string`
- `@Query('hub.challenge') challenge: string`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- منطق مباشر داخل المتحكم دون تفويض.

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات SupabaseService، MetaApiService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Post `/whatsapp/webhook`

- **دالة المتحكم**: `WhatsAppController.webhook()` (lines 30-71 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/whatsapp/webhook`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Post('webhook')`

**معاملات الطلب**

- `@Body() payload: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- منطق مباشر داخل المتحكم دون تفويض.

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات SupabaseService، MetaApiService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Post `/whatsapp/connect`

- **دالة المتحكم**: `WhatsAppController.connect()` (lines 75-111 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/whatsapp/connect`
- **الأدوار المطلوبة**: مدير
- **الحمايات**: `@Post('connect'), @Roles('manager')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() body: { phone_number_id: string; access_token: string; api_base_url?: string; phone_display?: string }`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `SupabaseService.getClient` في `/workspace/api/src/supabase/supabase.service.ts`.
- يفوض إلى `SupabaseService.getClient` في `/workspace/api/src/supabase/supabase.service.ts`.

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات SupabaseService، MetaApiService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Post `/whatsapp/send-template`

- **دالة المتحكم**: `WhatsAppController.sendTemplate()` (lines 115-134 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **طريقة HTTP**: `Post`
- **المسار**: `/whatsapp/send-template`
- **الأدوار المطلوبة**: مدير, موظف
- **الحمايات**: `@Post('send-template'), @Roles('manager', 'staff')`

**معاملات الطلب**

- `@Req() req: any`
- `@Body() body: { to: string; template_name: string; language: string; components?: any[] }`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `MetaApiService.sendTemplate` في `/workspace/api/src/whatsapp/meta-api.service.ts`.
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
- يفوض إلى `SupabaseService.getClient` في `/workspace/api/src/supabase/supabase.service.ts`.

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات SupabaseService، MetaApiService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

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

#### نقطة النهاية: Get `/whatsapp/templates`

- **دالة المتحكم**: `WhatsAppController.templates()` (lines 137-142 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **طريقة HTTP**: `Get`
- **المسار**: `/whatsapp/templates`
- **الأدوار المطلوبة**: متاح للمستخدمين المصادقين عبر JWT
- **الحمايات**: `@Get('templates')`

**معاملات الطلب**

- `@Req() req: any`

**قواعد التحقق**

- (المعاملات تعتمد على التحقق الأساسي)

**التفويض إلى الخدمة**

- يفوض إلى `MetaApiService.fetchTemplates` في `/workspace/api/src/whatsapp/meta-api.service.ts`.
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

**مثال خطوة بخطوة**

1. يرسل العميل الطلب مع رمز JWT صادر من `AuthService`.
2. يتحقق `RolesGuard` من الأدوار قبل تنفيذ الدالة.
3. يستخلص المتحكم هوية المكتب من `req.user` ويمرر المعطيات إلى الخدمة.
4. تنفذ الخدمة استعلامات Supabase وتعيد استجابة موحدة.

**التعامل مع الأخطاء**

- يظهر `BadRequestException` عند فشل التحقق.
- الأخطاء المنبعثة من الخدمات تمر عبر `GlobalExceptionFilter`.

**المراقبة**

- يتم تسجيل النشاط بواسطة `ActivityLogInterceptor` لتأمين سجل تدقيق.
- للطرق ذات الكثافة العالية، يوصى بدمج قياسات عبر `PrometheusModule` (تحسين مستقبلي).

**ملاحظات الاختبار**

- يجب اختبار المتحكم بوحدات Nest مع محاكاة للخدمات SupabaseService، MetaApiService.
- توصي الاختبارات التكاملية بالتحقق من الحرس JWT وتفاعلات Supabase.
- ينبغي على الواجهة الأمامية محاكاة استجابات API باستخدام MSW عند اختبار مكونات `/Web/src`.

```ts
  async templates(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const data = await this.meta.fetchTemplates(officeId);
    return data;
  }
```

---
