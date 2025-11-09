# Software Requirements Specification (SRS)

- **Project**: Real Estate Management System
- **Document Version**: 2.0
- **Generated**: 2025-11-09 19:56 UTC
- **Scope**: Comprehensive functional catalogue across backend and frontend touchpoints, including validation, access control, data flow, and operational scenarios.

## Contents
- [Analytics](#analytics)
- [App](#app)
- [Appointments](#appointments)
- [Components](#components)
- [Customers](#customers)
- [Health](#health)
- [Integrations](#integrations)
- [Maintenance](#maintenance)
- [Onboarding](#onboarding)
- [Payments](#payments)
- [Properties](#properties)
- [Supabase Access](#supabase-access)
- [WhatsApp](#whatsapp)

## Analytics

The `Analytics` module aggregates 1 controller(s), 1 service(s), and 0 DTO definitions.

### Controller `AnalyticsController` (`/workspace/api/src/analytics/analytics.controller.ts`)
- Injected services: `analytics: AnalyticsService`
#### Endpoint: Get `/analytics/dashboard`

- **Controller Method**: `AnalyticsController.dashboard()` (lines 16-19 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/analytics/dashboard`
- **Required Roles**: manager, accountant
- **Guards**: `@Get('dashboard'), @Roles('manager', 'accountant')`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AnalyticsService.dashboard` defined in `/workspace/api/src/analytics/analytics.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AnalyticsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async dashboard(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.dashboard(officeId);
  }
```

#### Endpoint: Get `/analytics/properties`

- **Controller Method**: `AnalyticsController.properties()` (lines 22-25 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/analytics/properties`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('properties')`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AnalyticsService.propertiesBreakdown` defined in `/workspace/api/src/analytics/analytics.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AnalyticsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async properties(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.propertiesBreakdown(officeId);
  }
```

#### Endpoint: Get `/analytics/financials`

- **Controller Method**: `AnalyticsController.financials()` (lines 29-32 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/analytics/financials`
- **Required Roles**: manager, accountant
- **Guards**: `@Get('financials'), @Roles('manager', 'accountant')`

**Request Parameters**

- `@Req() req: any`
- `@Query('report_period') reportPeriod?: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AnalyticsService.financials` defined in `/workspace/api/src/analytics/analytics.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AnalyticsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async financials(@Req() req: any, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.financials(officeId, reportPeriod);
  }
```

#### Endpoint: Get `/analytics/kpis`

- **Controller Method**: `AnalyticsController.kpis()` (lines 36-39 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/analytics/kpis`
- **Required Roles**: manager
- **Guards**: `@Get('kpis'), @Roles('manager')`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AnalyticsService.kpis` defined in `/workspace/api/src/analytics/analytics.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AnalyticsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async kpis(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.kpis(officeId);
  }
```

#### Endpoint: Get `/analytics/staff-performance`

- **Controller Method**: `AnalyticsController.staffPerf()` (lines 43-46 in `/workspace/api/src/analytics/analytics.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/analytics/staff-performance`
- **Required Roles**: manager
- **Guards**: `@Get('staff-performance'), @Roles('manager')`

**Request Parameters**

- `@Req() req: any`
- `@Query('staff_phone') staffPhone?: string`
- `@Query('report_period') reportPeriod?: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AnalyticsService.staffPerformance` defined in `/workspace/api/src/analytics/analytics.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AnalyticsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async staffPerf(@Req() req: any, @Query('staff_phone') staffPhone?: string, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.staffPerformance(officeId, staffPhone, reportPeriod);
  }
```

---

## App

The `App` module aggregates 0 controller(s), 0 service(s), and 0 DTO definitions.

---

## Appointments

The `Appointments` module aggregates 1 controller(s), 1 service(s), and 7 DTO definitions.

### Controller `AppointmentsController` (`/workspace/api/src/appointments/appointments.controller.ts`)
- Injected services: `appointmentsService: AppointmentsService`
#### Endpoint: Get `/appointments`

- **Controller Method**: `AppointmentsController.findAll()` (lines 23-27 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/appointments`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get(), @ApiOperation({ summary: 'قائمة المواعيد مع filters' })`

**Request Parameters**

- `@Req() req: any`
- `@Query() filters: FilterAppointmentsDto`

**Validation Rules**

DTO `FilterAppointmentsDto` defined in `/workspace/api/src/appointments/dto/filter-appointments.dto.ts`
- Field `page`: `number` — validators: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- Field `limit`: `number` — validators: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- Field `search`: `string` — validators: @ApiPropertyOptional({ example: 'معاينة', description: 'البحث في العنوان/الوصف' }), @IsOptional(), @IsString()
- Field `type`: `string` — validators: @ApiPropertyOptional({ enum: ['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'], description: 'نوع الموعد' }), @IsOptional(), @IsEnum(['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'])
- Field `status`: `string` — validators: @ApiPropertyOptional({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], description: 'حالة الموعد' }), @IsOptional(), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
- Field `date`: `string` — validators: @ApiPropertyOptional({ example: '2025-10-20', description: 'التاريخ المحدد' }), @IsOptional(), @IsDateString()
- Field `start_date`: `string` — validators: @ApiPropertyOptional({ example: '2025-10-01', description: 'من تاريخ' }), @IsOptional(), @IsDateString()
- Field `end_date`: `string` — validators: @ApiPropertyOptional({ example: '2025-10-31', description: 'إلى تاريخ' }), @IsOptional(), @IsDateString()
- Field `property_id`: `string` — validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العقار' }), @IsOptional(), @IsUUID()
- Field `customer_id`: `string` — validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العميل' }), @IsOptional(), @IsUUID()
- Field `assigned_staff_id`: `string` — validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف' }), @IsOptional(), @IsUUID()
- Field `order_by`: `string` — validators: @ApiPropertyOptional({ enum: ['date', 'created_at', 'start_time'], example: 'date', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
- Field `order`: `string` — validators: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])

**Service Delegation**

- Delegates to `AppointmentsService.findAll` defined in `/workspace/api/src/appointments/appointments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async findAll(@Req() req: any, @Query() filters: FilterAppointmentsDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findAll(officeId, filters);
  }
```

#### Endpoint: Get `/appointments/stats`

- **Controller Method**: `AppointmentsController.getStats()` (lines 31-35 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/appointments/stats`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('stats'), @ApiOperation({ summary: 'إحصائيات المواعيد' })`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AppointmentsService.getStats` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async getStats(officeId: string) {
    return { total: 0, today: 0, upcoming: 0 };
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getStats(officeId);
  }
```

#### Endpoint: Get `/appointments/today`

- **Controller Method**: `AppointmentsController.getToday()` (lines 53-57 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/appointments/today`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('today'), @ApiOperation({ summary: 'مواعيد اليوم' })`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AppointmentsService.getToday` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async getToday(officeId: string) {
    return [];
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getToday(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getToday(officeId);
  }
```

#### Endpoint: Get `/appointments/upcoming`

- **Controller Method**: `AppointmentsController.getUpcoming()` (lines 62-66 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/appointments/upcoming`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('upcoming'), @ApiOperation({ summary: 'المواعيد القادمة' }), @ApiQuery({ name: 'limit', required: false, example: 10 })`

**Request Parameters**

- `@Req() req: any`
- `@Query('limit') limit?: number`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AppointmentsService.getUpcoming` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async getUpcoming(officeId: string, limit?: number) {
    return [];
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getUpcoming(@Req() req: any, @Query('limit') limit?: number) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getUpcoming(officeId, limit);
  }
```

#### Endpoint: Get `/appointments/:id`

- **Controller Method**: `AppointmentsController.findOne()` (lines 70-74 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/appointments/:id`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get(':id'), @ApiOperation({ summary: 'تفاصيل موعد' })`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AppointmentsService.findOne` defined in `/workspace/api/src/appointments/appointments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findOne(officeId, id);
  }
```

#### Endpoint: Post `/appointments`

- **Controller Method**: `AppointmentsController.create()` (lines 79-85 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/appointments`
- **Required Roles**: manager, staff
- **Guards**: `@Post(), @ApiOperation({ summary: 'إضافة موعد جديد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Body() dto: CreateAppointmentDto`

**Validation Rules**

DTO `CreateAppointmentDto` defined in `/workspace/api/src/appointments/dto/create-appointment.dto.ts`

**Service Delegation**

- Delegates to `AppointmentsService.create` defined in `/workspace/api/src/appointments/appointments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.create(officeId, userId, dto);
    return { success: true, appointment };
  }
```

#### Endpoint: Patch `/appointments/:id`

- **Controller Method**: `AppointmentsController.update()` (lines 90-95 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/appointments/:id`
- **Required Roles**: manager, staff
- **Guards**: `@Patch(':id'), @ApiOperation({ summary: 'تعديل موعد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateAppointmentDto`

**Validation Rules**

DTO `UpdateAppointmentDto` defined in `/workspace/api/src/appointments/dto/update-appointment.dto.ts`

**Service Delegation**

- Delegates to `AppointmentsService.update` defined in `/workspace/api/src/appointments/appointments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.update(officeId, id, dto);
    return { success: true, appointment };
  }
```

#### Endpoint: Delete `/appointments/:id`

- **Controller Method**: `AppointmentsController.remove()` (lines 100-104 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Delete`
- **Route**: `/appointments/:id`
- **Required Roles**: manager
- **Guards**: `@Delete(':id'), @ApiOperation({ summary: 'حذف موعد' }), @Roles('manager')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AppointmentsService.remove` defined in `/workspace/api/src/appointments/appointments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.remove(officeId, id);
  }
```

#### Endpoint: Patch `/appointments/:id/status`

- **Controller Method**: `AppointmentsController.updateStatus()` (lines 109-115 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/appointments/:id/status`
- **Required Roles**: manager, staff
- **Guards**: `@Patch(':id/status'), @ApiOperation({ summary: 'تحديث حالة الموعد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateStatusDto`

**Validation Rules**

DTO `UpdateStatusDto` defined in `/workspace/api/src/appointments/dto/update-status.dto.ts`
- Field `status`: `string` — validators: @ApiProperty({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], example: 'confirmed', description: 'الحالة الجديدة' }), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
- Field `notes`: `string` — validators: @ApiPropertyOptional({ example: 'تم تأكيد الموعد مع العميل', description: 'ملاحظات' }), @IsString(), @IsOptional()

**Service Delegation**

- Delegates to `AppointmentsService.updateStatus` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async updateStatus(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.updateStatus(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```

#### Endpoint: Patch `/appointments/:id/cancel`

- **Controller Method**: `AppointmentsController.cancel()` (lines 120-126 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/appointments/:id/cancel`
- **Required Roles**: manager, staff
- **Guards**: `@Patch(':id/cancel'), @ApiOperation({ summary: 'إلغاء موعد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: CancelAppointmentDto`

**Validation Rules**

DTO `CancelAppointmentDto` defined in `/workspace/api/src/appointments/dto/cancel-appointment.dto.ts`
- Field `cancellationReason`: `string` — validators: @ApiProperty({ example: 'العميل طلب إلغاء الموعد', description: 'سبب الإلغاء' }), @IsString()

**Service Delegation**

- Delegates to `AppointmentsService.cancel` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async cancel(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async cancel(@Req() req: any, @Param('id') id: string, @Body() dto: CancelAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.cancel(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```

#### Endpoint: Patch `/appointments/:id/complete`

- **Controller Method**: `AppointmentsController.complete()` (lines 131-136 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/appointments/:id/complete`
- **Required Roles**: manager, staff
- **Guards**: `@Patch(':id/complete'), @ApiOperation({ summary: 'إتمام موعد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: CompleteAppointmentDto`

**Validation Rules**

DTO `CompleteAppointmentDto` defined in `/workspace/api/src/appointments/dto/complete-appointment.dto.ts`
- Field `completionNotes`: `string` — validators: @ApiProperty({ example: 'تمت المعاينة بنجاح، العميل مهتم بالعقار', description: 'ملاحظات الإتمام' }), @IsString()

**Service Delegation**

- Delegates to `AppointmentsService.complete` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async complete(officeId: string, id: string, dto: any) {
    return {};
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.complete(officeId, id, dto);
    return { success: true, appointment };
  }
```

#### Endpoint: Post `/appointments/:id/remind`

- **Controller Method**: `AppointmentsController.sendReminder()` (lines 141-145 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/appointments/:id/remind`
- **Required Roles**: manager, staff
- **Guards**: `@Post(':id/remind'), @ApiOperation({ summary: 'إرسال تذكير للموعد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `AppointmentsService.sendReminder` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async sendReminder(officeId: string, id: string) {
    return { message: 'Reminder sent' };
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async sendReminder(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.sendReminder(officeId, id);
  }
```

#### Endpoint: Post `/appointments/check-availability`

- **Controller Method**: `AppointmentsController.checkAvailability()` (lines 150-154 in `/workspace/api/src/appointments/appointments.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/appointments/check-availability`
- **Required Roles**: manager, staff
- **Guards**: `@Post('check-availability'), @ApiOperation({ summary: 'التحقق من توفر موعد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Body() dto: CheckAvailabilityDto`

**Validation Rules**

DTO `CheckAvailabilityDto` defined in `/workspace/api/src/appointments/dto/check-availability.dto.ts`
- Field `date`: `string` — validators: @ApiProperty({ example: '2025-10-20', description: 'التاريخ' }), @IsDateString()
- Field `startTime`: `string` — validators: @ApiProperty({ example: '10:00:00', description: 'وقت البداية' }), @IsString()
- Field `endTime`: `string` — validators: @ApiProperty({ example: '11:00:00', description: 'وقت النهاية' }), @IsString()
- Field `assignedStaffId`: `string` — validators: @ApiProperty({ example: 'uuid-staff-id', description: 'معرف الموظف' }), @IsUUID()

**Service Delegation**

- Delegates to `AppointmentsService.checkAvailability` defined in `/workspace/api/src/appointments/appointments.service.ts`.
```ts
  async checkAvailability(officeId: string, dto: any) {
    return { available: true };
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `AppointmentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async checkAvailability(@Req() req: any, @Body() dto: CheckAvailabilityDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.checkAvailability(officeId, dto);
  }
```

---

## Components

The `Components` module aggregates 0 controller(s), 0 service(s), and 0 DTO definitions.

---

## Customers

The `Customers` module aggregates 2 controller(s), 2 service(s), and 13 DTO definitions.

### Controller `CustomersController` (`/workspace/api/src/customers/customers.controller.ts`)
- Injected services: `customersService: CustomersService`
#### Endpoint: Get `/customers`

- **Controller Method**: `CustomersController.findAll()` (lines 25-29 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get(), @ApiOperation({ summary: 'قائمة العملاء مع filters' })`

**Request Parameters**

- `@Req() req: any`
- `@Query() filters: FilterCustomersDto`

**Validation Rules**

DTO `FilterCustomersDto` defined in `/workspace/api/src/customers/dto/filter-customers.dto.ts`
- Field `page`: `number` — validators: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- Field `limit`: `number` — validators: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- Field `search`: `string` — validators: @ApiPropertyOptional({ example: 'محمد', description: 'البحث في الاسم/البريد/الهاتف' }), @IsOptional(), @IsString()
- Field `type`: `string` — validators: @ApiPropertyOptional({ enum: ['buyer', 'seller', 'renter', 'landlord', 'both'], description: 'نوع العميل' }), @IsOptional(), @IsEnum(['buyer', 'seller', 'renter', 'landlord', 'both'])
- Field `status`: `string` — validators: @ApiPropertyOptional({ enum: ['active', 'inactive', 'blocked'], description: 'حالة العميل' }), @IsOptional(), @IsEnum(['active', 'inactive', 'blocked'])
- Field `city`: `string` — validators: @ApiPropertyOptional({ example: 'الرياض', description: 'المدينة' }), @IsOptional(), @IsString()
- Field `source`: `string` — validators: @ApiPropertyOptional({ example: 'website', description: 'المصدر' }), @IsOptional(), @IsString()
- Field `rating`: `number` — validators: @ApiPropertyOptional({ example: 5, description: 'التقييم' }), @IsOptional(), @Type(() => Number), @IsInt()
- Field `assigned_staff_id`: `string` — validators: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف المسؤول' }), @IsOptional(), @IsString()
- Field `order_by`: `string` — validators: @ApiPropertyOptional({ enum: ['created_at', 'updated_at', 'name', 'last_contact_date'], example: 'created_at', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
- Field `order`: `string` — validators: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])

**Service Delegation**

- Delegates to `CustomersService.findAll` defined in `/workspace/api/src/customers/customers.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async findAll(@Req() req: any, @Query() filters: FilterCustomersDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findAll(officeId, filters);
  }
```

#### Endpoint: Get `/customers/stats`

- **Controller Method**: `CustomersController.getStats()` (lines 33-37 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/stats`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('stats'), @ApiOperation({ summary: 'إحصائيات العملاء' })`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.getStats` defined in `/workspace/api/src/customers/customers.service.ts`.
```ts
  async getStats(officeId: string) {
    return { total: 0, active: 0, potential: 0 };
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getStats(officeId);
  }
```

#### Endpoint: Get `/customers/search`

- **Controller Method**: `CustomersController.search()` (lines 42-46 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/search`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('search'), @ApiOperation({ summary: 'البحث السريع عن عملاء' }), @ApiQuery({ name: 'q', required: true, description: 'كلمة البحث' })`

**Request Parameters**

- `@Req() req: any`
- `@Query('q') searchTerm: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.search` defined in `/workspace/api/src/customers/customers.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async search(@Req() req: any, @Query('q') searchTerm: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.search(officeId, searchTerm);
  }
```

#### Endpoint: Get `/customers/export`

- **Controller Method**: `CustomersController.exportExcel()` (lines 51-83 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/export`
- **Required Roles**: manager, staff
- **Guards**: `@Get('export'), @ApiOperation({ summary: 'تصدير العملاء إلى Excel' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Res({ passthrough: true }) res: Response`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.exportExcel` defined in `/workspace/api/src/customers/customers.service.ts`.
```ts
  async exportExcel(officeId: string) {
    return [];
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Get `/customers/:id`

- **Controller Method**: `CustomersController.findOne()` (lines 87-91 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/:id`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get(':id'), @ApiOperation({ summary: 'تفاصيل عميل' })`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.findOne` defined in `/workspace/api/src/customers/customers.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findOne(officeId, id);
  }
```

#### Endpoint: Post `/customers`

- **Controller Method**: `CustomersController.create()` (lines 96-102 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/customers`
- **Required Roles**: manager, staff
- **Guards**: `@Post(), @ApiOperation({ summary: 'إضافة عميل جديد' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Body() dto: CreateCustomerDto`

**Validation Rules**

DTO `CreateCustomerDto` defined in `/workspace/api/src/customers/dto/create-customer.dto.ts`

**Service Delegation**

- Delegates to `CustomersService.create` defined in `/workspace/api/src/customers/customers.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.create(officeId, userId, dto);
    return { success: true, customer };
  }
```

#### Endpoint: Patch `/customers/:id`

- **Controller Method**: `CustomersController.update()` (lines 107-112 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/customers/:id`
- **Required Roles**: manager, staff
- **Guards**: `@Patch(':id'), @ApiOperation({ summary: 'تعديل عميل' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateCustomerDto`

**Validation Rules**

DTO `UpdateCustomerDto` defined in `/workspace/api/src/customers/dto/update-customer.dto.ts`

**Service Delegation**

- Delegates to `CustomersService.update` defined in `/workspace/api/src/customers/customers.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.update(officeId, id, dto);
    return { success: true, customer };
  }
```

#### Endpoint: Delete `/customers/:id`

- **Controller Method**: `CustomersController.remove()` (lines 117-121 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Delete`
- **Route**: `/customers/:id`
- **Required Roles**: manager
- **Guards**: `@Delete(':id'), @ApiOperation({ summary: 'حذف عميل' }), @Roles('manager')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.remove` defined in `/workspace/api/src/customers/customers.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.remove(officeId, id);
  }
```

#### Endpoint: Get `/customers/:id/notes`

- **Controller Method**: `CustomersController.getNotes()` (lines 126-130 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/:id/notes`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get(':id/notes'), @ApiOperation({ summary: 'قائمة ملاحظات العميل' })`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') customerId: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.getNotes` defined in `/workspace/api/src/customers/customers.service.ts`.
```ts
  async getNotes(officeId: string, customerId: string) {
    return [];
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getNotes(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getNotes(officeId, customerId);
  }
```

#### Endpoint: Post `/customers/:id/notes`

- **Controller Method**: `CustomersController.createNote()` (lines 135-141 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/customers/:id/notes`
- **Required Roles**: manager, staff
- **Guards**: `@Post(':id/notes'), @ApiOperation({ summary: 'إضافة ملاحظة للعميل' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') customerId: string`
- `@Body() dto: CreateCustomerNoteDto`

**Validation Rules**

DTO `CreateCustomerNoteDto` defined in `/workspace/api/src/customers/dto/create-customer-note.dto.ts`
- Field `content`: `string` — validators: @ApiProperty({ example: 'العميل مهتم بالشقق في شمال الرياض', description: 'محتوى الملاحظة' }), @IsString()
- Field `isImportant`: `boolean` — validators: @ApiPropertyOptional({ example: false, description: 'هل الملاحظة مهمة؟' }), @IsBoolean(), @IsOptional()
- Field `tags`: `any` — validators: @ApiPropertyOptional({ example: { category: 'follow_up' }, description: 'الوسوم' }), @IsObject(), @IsOptional()

**Service Delegation**

- Delegates to `CustomersService.createNote` defined in `/workspace/api/src/customers/customers.service.ts`.
```ts
  async createNote(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async createNote(@Req() req: any, @Param('id') customerId: string, @Body() dto: CreateCustomerNoteDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const note = await this.customersService.createNote(officeId, customerId, userId, dto);
    return { success: true, note };
  }
```

#### Endpoint: Delete `/customers/:id/notes/:noteId`

- **Controller Method**: `CustomersController.removeNote()` (lines 161-165 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Delete`
- **Route**: `/customers/:id/notes/:noteId`
- **Required Roles**: manager, staff
- **Guards**: `@Delete(':id/notes/:noteId'), @ApiOperation({ summary: 'حذف ملاحظة' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') customerId: string`
- `@Param('noteId') noteId: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.removeNote` defined in `/workspace/api/src/customers/customers.service.ts`.
```ts
  async removeNote(officeId: string, customerId: string, noteId: string) {
    return { message: 'Note deleted' };
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async removeNote(@Req() req: any, @Param('id') customerId: string, @Param('noteId') noteId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.removeNote(officeId, customerId, noteId);
  }
```

#### Endpoint: Get `/customers/:id/interactions`

- **Controller Method**: `CustomersController.getInteractions()` (lines 170-174 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/:id/interactions`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get(':id/interactions'), @ApiOperation({ summary: 'قائمة تعاملات العميل' })`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') customerId: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `CustomersService.getInteractions` defined in `/workspace/api/src/customers/customers.service.ts`.
```ts
  async getInteractions(officeId: string, customerId: string) {
    return [];
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getInteractions(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getInteractions(officeId, customerId);
  }
```

#### Endpoint: Post `/customers/:id/properties`

- **Controller Method**: `CustomersController.linkProperty()` (lines 195-200 in `/workspace/api/src/customers/customers.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/customers/:id/properties`
- **Required Roles**: manager, staff
- **Guards**: `@Post(':id/properties'), @ApiOperation({ summary: 'ربط عقار بالعميل' }), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') customerId: string`
- `@Body() dto: LinkPropertyDto`

**Validation Rules**

DTO `LinkPropertyDto` defined in `/workspace/api/src/customers/dto/link-property.dto.ts`
- Field `property_id`: `string` — validators: @ApiProperty({ example: 'uuid-property-id', description: 'معرف العقار' }), @IsUUID()
- Field `relationship`: `string` — validators: @ApiProperty({ enum: ['owner', 'interested', 'viewed', 'negotiating', 'contracted'], example: 'interested', description: 'نوع العلاقة' }), @IsEnum(['owner', 'interested', 'viewed', 'negotiating', 'contracted'])
- Field `start_date`: `string` — validators: @ApiPropertyOptional({ example: '2025-10-20T10:00:00Z', description: 'تاريخ البداية' }), @IsDateString(), @IsOptional()
- Field `end_date`: `string` — validators: @ApiPropertyOptional({ example: '2025-11-20T10:00:00Z', description: 'تاريخ النهاية' }), @IsDateString(), @IsOptional()

**Service Delegation**

- Delegates to `CustomersService.linkProperty` defined in `/workspace/api/src/customers/customers.service.ts`.
```ts
  async linkProperty(officeId: string, customerId: string, dto: any) {
    return {};
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `CustomersService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async linkProperty(@Req() req: any, @Param('id') customerId: string, @Body() dto: LinkPropertyDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const relationship = await this.customersService.linkProperty(officeId, customerId, dto);
    return { success: true, relationship };
  }
```

### Controller `ExcelController` (`/workspace/api/src/customers/excel.controller.ts`)
- Injected services: `excelService: ExcelService`
#### Endpoint: Get `/customers/excel/templates`

- **Controller Method**: `ExcelController.getTemplates()` (lines 216-231 in `/workspace/api/src/customers/excel.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/excel/templates`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('templates')`

**Request Parameters**

- ∅

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Calls `logger.log()` (service definition not resolved automatically).
- Delegates to `ExcelService.getTemplates` defined in `/workspace/api/src/customers/excel.service.ts`.
- Calls `logger.error()` (service definition not resolved automatically).

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `ExcelService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Post `/customers/excel/validate-file`

- **Controller Method**: `ExcelController.validateFile()` (lines 329-363 in `/workspace/api/src/customers/excel.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/customers/excel/validate-file`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Post('validate-file'), @UseInterceptors(FileInterceptor('file'))`

**Request Parameters**

- `@UploadedFile() file: Express.Multer.File`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Calls `logger.log()` (service definition not resolved automatically).

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `ExcelService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Get `/customers/excel/import-stats`

- **Controller Method**: `ExcelController.getImportStats()` (lines 374-390 in `/workspace/api/src/customers/excel.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/customers/excel/import-stats`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('import-stats')`

**Request Parameters**

- ∅

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Calls `logger.log()` (service definition not resolved automatically).

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `ExcelService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

## Health

The `Health` module aggregates 1 controller(s), 0 service(s), and 0 DTO definitions.

### Controller `HealthController` (`/workspace/api/src/health/health.controller.ts`)
- Injected services: `configService: ConfigService`, `supabaseService: SupabaseService`
*No HTTP endpoints defined in this controller.*

---

## Integrations

The `Integrations` module aggregates 0 controller(s), 1 service(s), and 0 DTO definitions.

---

## Maintenance

The `Maintenance` module aggregates 1 controller(s), 1 service(s), and 5 DTO definitions.

### Controller `MaintenanceController` (`/workspace/api/src/maintenance/maintenance.controller.ts`)
- Injected services: `maintenanceService: MaintenanceService`
#### Endpoint: Get `/maintenance`

- **Controller Method**: `MaintenanceController.list()` (lines 21-24 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/maintenance`
- **Required Roles**: manager, staff, technician
- **Guards**: `@Get('maintenance'), @Roles('manager', 'staff', 'technician')`

**Request Parameters**

- `@Req() req: any`
- `@Query() filters: FilterMaintenanceDto`

**Validation Rules**

DTO `FilterMaintenanceDto` defined in `/workspace/api/src/maintenance/dto/filter-maintenance.dto.ts`

**Service Delegation**

- Delegates to `MaintenanceService.list` defined in `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `MaintenanceService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async list(@Req() req: any, @Query() filters: FilterMaintenanceDto) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.list(officeId, filters);
  }
```

#### Endpoint: Get `/maintenance/:id`

- **Controller Method**: `MaintenanceController.getOne()` (lines 27-30 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/maintenance/:id`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('maintenance/:id')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `MaintenanceService.getOne` defined in `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `MaintenanceService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.getOne(officeId, id);
  }
```

#### Endpoint: Post `/maintenance`

- **Controller Method**: `MaintenanceController.create()` (lines 34-40 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/maintenance`
- **Required Roles**: manager, staff, technician
- **Guards**: `@Post('maintenance'), @Roles('manager', 'staff', 'technician')`

**Request Parameters**

- `@Req() req: any`
- `@Body() dto: CreateMaintenanceDto`

**Validation Rules**

DTO `CreateMaintenanceDto` defined in `/workspace/api/src/maintenance/dto/create-maintenance.dto.ts`
- Field `description`: `string` — validators: @IsOptional() @IsString()
- Field `before_images`: `string[]` — validators: @IsOptional() @IsArray() @IsString({ each: true })

**Service Delegation**

- Delegates to `MaintenanceService.createInternal` defined in `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `MaintenanceService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async create(@Req() req: any, @Body() dto: CreateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const officeCode = req?.user?.office_id; // بافتراض أن office_id هو نفسه code
    const userId = req?.user?.user_id ?? null;
    const created = await this.maintenanceService.createInternal(officeId, officeCode, userId, dto);
    return { success: true, request: created };
  }
```

#### Endpoint: Post `/public/maintenance`

- **Controller Method**: `MaintenanceController.createPublic()` (lines 43-48 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/public/maintenance`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Post('public/maintenance')`

**Request Parameters**

- `@Req() req: any`
- `@Body() dto: PublicCreateMaintenanceDto`

**Validation Rules**

DTO `PublicCreateMaintenanceDto` defined in `/workspace/api/src/maintenance/dto/public-create-maintenance.dto.ts`
- Field `description`: `string` — validators: @IsOptional() @IsString()
- Field `before_images`: `string[]` — validators: @IsOptional() @IsArray() @IsString({ each: true })

**Service Delegation**

- Delegates to `MaintenanceService.createPublic` defined in `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `MaintenanceService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async createPublic(@Req() req: any, @Body() dto: PublicCreateMaintenanceDto) {
    const officeId = req?.user?.office_id ?? dto?.property_id ?? 'public';
    const officeCode = req?.user?.office_id ?? 'public';
    const created = await this.maintenanceService.createPublic(officeId, officeCode, dto);
    return { success: true, request: created };
  }
```

#### Endpoint: Patch `/maintenance/:id`

- **Controller Method**: `MaintenanceController.update()` (lines 52-56 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/maintenance/:id`
- **Required Roles**: manager, staff, technician
- **Guards**: `@Patch('maintenance/:id'), @Roles('manager', 'staff', 'technician')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdateMaintenanceDto`

**Validation Rules**

DTO `UpdateMaintenanceDto` defined in `/workspace/api/src/maintenance/dto/update-maintenance.dto.ts`

**Service Delegation**

- Delegates to `MaintenanceService.update` defined in `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `MaintenanceService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.update(officeId, id, dto);
    return { success: true, request: updated };
  }
```

#### Endpoint: Post `/maintenance/:id/complete`

- **Controller Method**: `MaintenanceController.complete()` (lines 60-64 in `/workspace/api/src/maintenance/maintenance.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/maintenance/:id/complete`
- **Required Roles**: technician, manager
- **Guards**: `@Post('maintenance/:id/complete'), @Roles('technician', 'manager')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: CompleteMaintenanceDto`

**Validation Rules**

DTO `CompleteMaintenanceDto` defined in `/workspace/api/src/maintenance/dto/complete-maintenance.dto.ts`

**Service Delegation**

- Delegates to `MaintenanceService.complete` defined in `/workspace/api/src/maintenance/maintenance.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `MaintenanceService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.complete(officeId, id, dto);
    return { success: true, request: updated };
  }
```

---

## Onboarding

The `Onboarding` module aggregates 1 controller(s), 1 service(s), and 0 DTO definitions.

### Controller `OnboardingController` (`/workspace/api/src/onboarding/onboarding.controller.ts`)
- Injected services: `onboarding: OnboardingService`
#### Endpoint: Post `/onboarding/office`

- **Controller Method**: `OnboardingController.createOffice()` (lines 11-13 in `/workspace/api/src/onboarding/onboarding.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/onboarding/office`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Post('office')`

**Request Parameters**

- `@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `OnboardingService.createOffice` defined in `/workspace/api/src/onboarding/onboarding.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `OnboardingService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async createOffice(@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    return this.onboarding.createOffice(body);
  }
```

#### Endpoint: Get `/onboarding/verify-code`

- **Controller Method**: `OnboardingController.verify()` (lines 16-20 in `/workspace/api/src/onboarding/onboarding.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/onboarding/verify-code`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('verify-code')`

**Request Parameters**

- `@Query('office_code') officeCode: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `OnboardingService.verifyCodeAvailable` defined in `/workspace/api/src/onboarding/onboarding.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `OnboardingService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async verify(@Query('office_code') officeCode: string) {
    if (!officeCode) throw new BadRequestException('office_code مفقود');
    const res = await this.onboarding.verifyCodeAvailable(officeCode);
    return res;
  }
```

#### Endpoint: Post `/onboarding/complete`

- **Controller Method**: `OnboardingController.complete()` (lines 23-25 in `/workspace/api/src/onboarding/onboarding.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/onboarding/complete`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Post('complete')`

**Request Parameters**

- `@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `OnboardingService.complete` defined in `/workspace/api/src/onboarding/onboarding.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `OnboardingService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async complete(@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    return this.onboarding.complete(body);
  }
```

---

## Payments

The `Payments` module aggregates 1 controller(s), 1 service(s), and 3 DTO definitions.

### Controller `PaymentsController` (`/workspace/api/src/payments/payments.controller.ts`)
- Injected services: `paymentsService: PaymentsService`
#### Endpoint: Get `/payments`

- **Controller Method**: `PaymentsController.list()` (lines 18-21 in `/workspace/api/src/payments/payments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/payments`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('payments')`

**Request Parameters**

- `@Req() req: any`
- `@Query() filters: FilterPaymentsDto`

**Validation Rules**

DTO `FilterPaymentsDto` defined in `/workspace/api/src/payments/dto/filter-payments.dto.ts`
- Field `status`: `string` — validators: @IsOptional(), @IsString()
- Field `contract_id`: `string` — validators: @IsOptional(), @IsString()
- Field `tenant_phone`: `string` — validators: @IsOptional(), @IsString()
- Field `due_from`: `string` — validators: @IsOptional(), @IsDateString()
- Field `due_to`: `string` — validators: @IsOptional(), @IsDateString()

**Service Delegation**

- Delegates to `PaymentsService.findPayments` defined in `/workspace/api/src/payments/payments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PaymentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async list(@Req() req: any, @Query() filters: FilterPaymentsDto) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findPayments(officeId, filters);
  }
```

#### Endpoint: Get `/contracts/:contractId/payments`

- **Controller Method**: `PaymentsController.byContract()` (lines 24-27 in `/workspace/api/src/payments/payments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/contracts/:contractId/payments`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('contracts/:contractId/payments')`

**Request Parameters**

- `@Req() req: any`
- `@Param('contractId') contractId: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PaymentsService.findByContract` defined in `/workspace/api/src/payments/payments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PaymentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async byContract(@Req() req: any, @Param('contractId') contractId: string) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findByContract(officeId, contractId);
  }
```

#### Endpoint: Patch `/payments/:id/mark-paid`

- **Controller Method**: `PaymentsController.markPaid()` (lines 31-35 in `/workspace/api/src/payments/payments.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/payments/:id/mark-paid`
- **Required Roles**: manager, staff, accountant
- **Guards**: `@Patch('payments/:id/mark-paid'), @Roles('manager', 'staff', 'accountant')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: MarkPaidDto`

**Validation Rules**

DTO `MarkPaidDto` defined in `/workspace/api/src/payments/dto/mark-paid.dto.ts`
- Field `payment_method`: `string` — validators: @IsOptional(), @IsString()
- Field `payment_reference`: `string` — validators: @IsOptional(), @IsString(), @Length(0, 128)

**Service Delegation**

- Delegates to `PaymentsService.markPaid` defined in `/workspace/api/src/payments/payments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PaymentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async markPaid(@Req() req: any, @Param('id') id: string, @Body() dto: MarkPaidDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.paymentsService.markPaid(officeId, id, dto);
    return { success: true, payment: updated };
  }
```

#### Endpoint: Get `/payments/overdue`

- **Controller Method**: `PaymentsController.overdue()` (lines 38-41 in `/workspace/api/src/payments/payments.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/payments/overdue`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('payments/overdue')`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PaymentsService.getOverdue` defined in `/workspace/api/src/payments/payments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PaymentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async overdue(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.getOverdue(officeId);
  }
```

#### Endpoint: Post `/payments/:id/send-reminder`

- **Controller Method**: `PaymentsController.sendReminder()` (lines 45-49 in `/workspace/api/src/payments/payments.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/payments/:id/send-reminder`
- **Required Roles**: manager, staff
- **Guards**: `@Post('payments/:id/send-reminder'), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() body: SendReminderDto`

**Validation Rules**

DTO `SendReminderDto` defined in `/workspace/api/src/payments/dto/send-reminder.dto.ts`
- Field `message`: `string` — validators: @IsOptional(), @IsString()

**Service Delegation**

- Delegates to `PaymentsService.sendReminder` defined in `/workspace/api/src/payments/payments.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PaymentsService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async sendReminder(@Req() req: any, @Param('id') id: string, @Body() body: SendReminderDto) {
    const officeId = req?.user?.office_id;
    const res = await this.paymentsService.sendReminder(officeId, id, body?.message);
    return res;
  }
```

---

## Properties

The `Properties` module aggregates 4 controller(s), 1 service(s), and 5 DTO definitions.

### Controller `ExcelController` (`/workspace/api/src/properties/excel.controller.ts`)
- Injected services: `propertiesService: PropertiesService`
#### Endpoint: Post `/properties/import`

- **Controller Method**: `ExcelController.importExcel()` (lines 23-51 in `/workspace/api/src/properties/excel.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/properties/import`
- **Required Roles**: manager, staff
- **Guards**: `@Post('properties/import'), @Roles('manager', 'staff'), @UseInterceptors(FileInterceptor('file')), @ApiConsumes('multipart/form-data'), @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })`

**Request Parameters**

- `@Req() req: any`
- `@UploadedFile() file?: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Direct inline logic without delegation.

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Post `/properties/import/confirm`

- **Controller Method**: `ExcelController.importConfirm()` (lines 55-69 in `/workspace/api/src/properties/excel.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/properties/import/confirm`
- **Required Roles**: manager, staff
- **Guards**: `@Post('properties/import/confirm'), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Body() body: { rows: any[] }`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PropertiesService.create` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Get `/properties/export`

- **Controller Method**: `ExcelController.exportExcel()` (lines 73-104 in `/workspace/api/src/properties/excel.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/properties/export`
- **Required Roles**: manager, staff
- **Guards**: `@Get('properties/export'), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Query() filters: FilterPropertiesDto`
- `@Res({ passthrough: true }) res: Response`

**Validation Rules**

DTO `FilterPropertiesDto` defined in `/workspace/api/src/properties/dto/filter-properties.dto.ts`
- Field `type`: `string` — validators: @IsOptional(), @IsString()
- Field `status`: `string` — validators: @IsOptional(), @IsString()
- Field `city`: `string` — validators: @IsOptional(), @IsString()
- Field `district`: `string` — validators: @IsOptional(), @IsString()
- Field `min_price`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `max_price`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `min_area`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `max_area`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `bedrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `bathrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `is_featured`: `boolean` — validators: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
- Field `search`: `string` — validators: @IsOptional(), @IsString()
- Field `order_by`: `'created_at' | 'price' | 'area'` — validators: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
- Field `order`: `'asc' | 'desc'` — validators: @IsOptional(), @IsIn(['asc', 'desc'])
- Field `page`: `number = 1` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- Field `limit`: `number = 20` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)

**Service Delegation**

- Delegates to `PropertiesService.findAll` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

### Controller `MediaController` (`/workspace/api/src/properties/media.controller.ts`)
- Injected services: `propertiesService: PropertiesService`
#### Endpoint: Post `/media/signed-url`

- **Controller Method**: `MediaController.signedUrl()` (lines 14-36 in `/workspace/api/src/properties/media.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/media/signed-url`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Post('media/signed-url')`

**Request Parameters**

- `@Req() req: any`
- `@Body() body: { property_id: string; filename: string; contentType: string }`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Direct inline logic without delegation.

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Post `/properties/:id/images`

- **Controller Method**: `MediaController.addImage()` (lines 39-45 in `/workspace/api/src/properties/media.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/properties/:id/images`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Post('properties/:id/images')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() body: { url: string; fileName?: string; fileSize?: number; isFeatured?: boolean }`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PropertiesService.addImage` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async addImage(@Req() req: any, @Param('id') id: string, @Body() body: { url: string; fileName?: string; fileSize?: number; isFeatured?: boolean }) {
    const userId = req?.user?.user_id;
    const { url, fileName, fileSize, isFeatured } = body || ({} as any);
    if (!url) throw new BadRequestException('رابط الصورة مطلوب');
    const image = await this.propertiesService.addImage(id, url, userId, fileName, fileSize, isFeatured);
    return { success: true, image };
  }
```

#### Endpoint: Patch `/properties/:propertyId/images/:imageId`

- **Controller Method**: `MediaController.setFeatured()` (lines 48-51 in `/workspace/api/src/properties/media.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/properties/:propertyId/images/:imageId`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Patch('properties/:propertyId/images/:imageId')`

**Request Parameters**

- `@Param('propertyId') propertyId: string`
- `@Param('imageId') imageId: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PropertiesService.setFeaturedImage` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async setFeatured(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const image = await this.propertiesService.setFeaturedImage(propertyId, imageId);
    return { success: true, image };
  }
```

#### Endpoint: Delete `/properties/:propertyId/images/:imageId`

- **Controller Method**: `MediaController.removeImage()` (lines 54-57 in `/workspace/api/src/properties/media.controller.ts`)
- **HTTP Method**: `Delete`
- **Route**: `/properties/:propertyId/images/:imageId`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Delete('properties/:propertyId/images/:imageId')`

**Request Parameters**

- `@Param('propertyId') propertyId: string`
- `@Param('imageId') imageId: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PropertiesService.removeImage` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async removeImage(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const res = await this.propertiesService.removeImage(propertyId, imageId);
    return res;
  }
```

### Controller `PropertiesController` (`/workspace/api/src/properties/properties.controller.ts`)
- Injected services: `propertiesService: PropertiesService`
#### Endpoint: Get `/properties`

- **Controller Method**: `PropertiesController.list()` (lines 18-22 in `/workspace/api/src/properties/properties.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/properties`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get()`

**Request Parameters**

- `@Req() req: any`
- `@Query() query: FilterPropertiesDto`

**Validation Rules**

DTO `FilterPropertiesDto` defined in `/workspace/api/src/properties/dto/filter-properties.dto.ts`
- Field `type`: `string` — validators: @IsOptional(), @IsString()
- Field `status`: `string` — validators: @IsOptional(), @IsString()
- Field `city`: `string` — validators: @IsOptional(), @IsString()
- Field `district`: `string` — validators: @IsOptional(), @IsString()
- Field `min_price`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `max_price`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `min_area`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `max_area`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `bedrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `bathrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `is_featured`: `boolean` — validators: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
- Field `search`: `string` — validators: @IsOptional(), @IsString()
- Field `order_by`: `'created_at' | 'price' | 'area'` — validators: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
- Field `order`: `'asc' | 'desc'` — validators: @IsOptional(), @IsIn(['asc', 'desc'])
- Field `page`: `number = 1` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- Field `limit`: `number = 20` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)

**Service Delegation**

- Delegates to `PropertiesService.findAll` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async list(@Req() req: any, @Query() query: FilterPropertiesDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى قائمة العقارات');
    return this.propertiesService.findAll(officeId, query);
  }
```

#### Endpoint: Get `/properties/:id`

- **Controller Method**: `PropertiesController.getOne()` (lines 25-29 in `/workspace/api/src/properties/properties.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/properties/:id`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get(':id')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PropertiesService.findOneWithImages` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Throws `UnauthorizedException` when office context is missing.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى تفاصيل العقار');
    return this.propertiesService.findOneWithImages(officeId, id);
  }
```

#### Endpoint: Post `/properties`

- **Controller Method**: `PropertiesController.create()` (lines 33-38 in `/workspace/api/src/properties/properties.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/properties`
- **Required Roles**: manager, staff
- **Guards**: `@Post(), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Body() dto: CreatePropertyDto`

**Validation Rules**

DTO `CreatePropertyDto` defined in `/workspace/api/src/properties/dto/create-property.dto.ts`
- Field `location_city`: `string` — validators: @IsOptional(), @IsString()
- Field `location_district`: `string` — validators: @IsOptional(), @IsString()
- Field `location_street`: `string` — validators: @IsOptional(), @IsString()
- Field `price`: `string` — validators: @IsOptional(), @IsNumberString({}, { message: 'السعر يجب أن يكون رقمياً' })
- Field `currency`: `string` — validators: @IsOptional(), @IsString()
- Field `area_sqm`: `string` — validators: @IsOptional(), @IsNumberString({}, { message: 'المساحة يجب أن تكون رقمية' })
- Field `bedrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `bathrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `features`: `Record<string, any>` — validators: @IsOptional(), @IsObject()
- Field `description`: `string` — validators: @IsOptional(), @IsString()
- Field `images`: `string[]` — validators: @IsOptional(), @IsArray(), @IsString({ each: true })
- Field `status`: `string` — validators: @IsOptional(), @IsString()
- Field `contact_person`: `string` — validators: @IsOptional(), @IsString()
- Field `contact_phone`: `string` — validators: @IsOptional(), @IsString()
- Field `google_maps_link`: `string` — validators: @IsOptional(), @IsUrl({}, { message: 'رابط خرائط قوقل غير صالح' })
- Field `latitude`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `longitude`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `slug`: `string` — validators: @IsOptional(), @IsString()
- Field `is_featured`: `boolean` — validators: @IsOptional(), @IsBoolean()

**Service Delegation**

- Delegates to `PropertiesService.create` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async create(@Req() req: any, @Body() dto: CreatePropertyDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    const created = await this.propertiesService.create(officeId, userId, dto);
    return { success: true, property: created };
  }
```

#### Endpoint: Patch `/properties/:id`

- **Controller Method**: `PropertiesController.update()` (lines 42-46 in `/workspace/api/src/properties/properties.controller.ts`)
- **HTTP Method**: `Patch`
- **Route**: `/properties/:id`
- **Required Roles**: manager, staff
- **Guards**: `@Patch(':id'), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`
- `@Body() dto: UpdatePropertyDto`

**Validation Rules**

DTO `UpdatePropertyDto` defined in `/workspace/api/src/properties/dto/update-property.dto.ts`

**Service Delegation**

- Delegates to `PropertiesService.update` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.propertiesService.update(officeId, id, dto);
    return { success: true, property: updated };
  }
```

#### Endpoint: Delete `/properties/:id`

- **Controller Method**: `PropertiesController.softDelete()` (lines 50-54 in `/workspace/api/src/properties/properties.controller.ts`)
- **HTTP Method**: `Delete`
- **Route**: `/properties/:id`
- **Required Roles**: manager
- **Guards**: `@Delete(':id'), @Roles('manager')`

**Request Parameters**

- `@Req() req: any`
- `@Param('id') id: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PropertiesService.softDelete` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    const res = await this.propertiesService.softDelete(officeId, id);
    return res;
  }
```

### Controller `PublicController` (`/workspace/api/src/properties/public.controller.ts`)
- Injected services: `propertiesService: PropertiesService`
#### Endpoint: Get `/public/offices/:officeCode/listings`

- **Controller Method**: `PublicController.listings()` (lines 12-15 in `/workspace/api/src/properties/public.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/public/offices/:officeCode/listings`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('offices/:officeCode/listings')`

**Request Parameters**

- `@Param('officeCode') officeCode: string`
- `@Query() query: FilterPropertiesDto`

**Validation Rules**

DTO `FilterPropertiesDto` defined in `/workspace/api/src/properties/dto/filter-properties.dto.ts`
- Field `type`: `string` — validators: @IsOptional(), @IsString()
- Field `status`: `string` — validators: @IsOptional(), @IsString()
- Field `city`: `string` — validators: @IsOptional(), @IsString()
- Field `district`: `string` — validators: @IsOptional(), @IsString()
- Field `min_price`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `max_price`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `min_area`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `max_area`: `string` — validators: @IsOptional(), @IsNumberString()
- Field `bedrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `bathrooms`: `number` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
- Field `is_featured`: `boolean` — validators: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
- Field `search`: `string` — validators: @IsOptional(), @IsString()
- Field `order_by`: `'created_at' | 'price' | 'area'` — validators: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
- Field `order`: `'asc' | 'desc'` — validators: @IsOptional(), @IsIn(['asc', 'desc'])
- Field `page`: `number = 1` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
- Field `limit`: `number = 20` — validators: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)

**Service Delegation**

- Delegates to `PropertiesService.getPublicListings` defined in `/workspace/api/src/properties/properties.service.ts`.
```ts
  async getPublicListings(officeCode: string, filters: FilterPropertiesDto) {
    return this.findAll(officeCode, { ...filters, status: 'available' });
  }
```

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async listings(@Param('officeCode') officeCode: string, @Query() query: FilterPropertiesDto) {
    const res = await this.propertiesService.getPublicListings(officeCode, query);
    return res;
  }
```

#### Endpoint: Get `/public/offices/:officeCode/properties/:slug`

- **Controller Method**: `PublicController.bySlug()` (lines 18-21 in `/workspace/api/src/properties/public.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/public/offices/:officeCode/properties/:slug`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('offices/:officeCode/properties/:slug')`

**Request Parameters**

- `@Param('officeCode') officeCode: string`
- `@Param('slug') slug: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `PropertiesService.getPublicBySlug` defined in `/workspace/api/src/properties/properties.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `PropertiesService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async bySlug(@Param('officeCode') officeCode: string, @Param('slug') slug: string) {
    const property = await this.propertiesService.getPublicBySlug(officeCode, slug);
    return property;
  }
```

---

## Supabase Access

The `Supabase Access` module aggregates 0 controller(s), 1 service(s), and 0 DTO definitions.

---

## WhatsApp

The `WhatsApp` module aggregates 1 controller(s), 1 service(s), and 0 DTO definitions.

### Controller `WhatsAppController` (`/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- Injected services: `supabaseService: SupabaseService`, `meta: MetaApiService`
#### Endpoint: Get `/whatsapp/webhook`

- **Controller Method**: `WhatsAppController.verify()` (lines 19-27 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/whatsapp/webhook`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('webhook')`

**Request Parameters**

- `@Query('hub.mode') mode: string`
- `@Query('hub.verify_token') token: string`
- `@Query('hub.challenge') challenge: string`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Direct inline logic without delegation.

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `SupabaseService`, `MetaApiService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Post `/whatsapp/webhook`

- **Controller Method**: `WhatsAppController.webhook()` (lines 30-71 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/whatsapp/webhook`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Post('webhook')`

**Request Parameters**

- `@Body() payload: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Direct inline logic without delegation.

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `SupabaseService`, `MetaApiService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Post `/whatsapp/connect`

- **Controller Method**: `WhatsAppController.connect()` (lines 75-111 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/whatsapp/connect`
- **Required Roles**: manager
- **Guards**: `@Post('connect'), @Roles('manager')`

**Request Parameters**

- `@Req() req: any`
- `@Body() body: { phone_number_id: string; access_token: string; api_base_url?: string; phone_display?: string }`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `SupabaseService.getClient` defined in `/workspace/api/src/supabase/supabase.service.ts`.
- Delegates to `SupabaseService.getClient` defined in `/workspace/api/src/supabase/supabase.service.ts`.

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `SupabaseService`, `MetaApiService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Post `/whatsapp/send-template`

- **Controller Method**: `WhatsAppController.sendTemplate()` (lines 115-134 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **HTTP Method**: `Post`
- **Route**: `/whatsapp/send-template`
- **Required Roles**: manager, staff
- **Guards**: `@Post('send-template'), @Roles('manager', 'staff')`

**Request Parameters**

- `@Req() req: any`
- `@Body() body: { to: string; template_name: string; language: string; components?: any[] }`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `MetaApiService.sendTemplate` defined in `/workspace/api/src/whatsapp/meta-api.service.ts`.
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
- Delegates to `SupabaseService.getClient` defined in `/workspace/api/src/supabase/supabase.service.ts`.

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `SupabaseService`, `MetaApiService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

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

#### Endpoint: Get `/whatsapp/templates`

- **Controller Method**: `WhatsAppController.templates()` (lines 137-142 in `/workspace/api/src/whatsapp/whatsapp.controller.ts`)
- **HTTP Method**: `Get`
- **Route**: `/whatsapp/templates`
- **Required Roles**: Public (requires JWT context)
- **Guards**: `@Get('templates')`

**Request Parameters**

- `@Req() req: any`

**Validation Rules**

- (Parameters rely on primitive validation)

**Service Delegation**

- Delegates to `MetaApiService.fetchTemplates` defined in `/workspace/api/src/whatsapp/meta-api.service.ts`.
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

**Step-by-step Example**

1. Client sends the request with a JWT issued by `AuthService`.
2. `RolesGuard` verifies role membership before invoking the method.
3. The controller extracts the office context from `req.user` and forwards arguments to the domain service.
4. The service executes Supabase queries and returns a normalized payload.

**Error Handling**

- Surfaces `BadRequestException` upon validation failures.
- Service-level errors bubble up and are captured by `GlobalExceptionFilter`.

**Observability**

- Activity is logged by `ActivityLogInterceptor` ensuring audit trails.
- For high throughput routes, integrate metrics via `PrometheusModule` (future enhancement).

**Testing Notes**

- Unit-test controller logic with Nest testing utilities by mocking `SupabaseService`, `MetaApiService`.
- Use e2e tests to validate JWT guard integration and Supabase interactions.
- Frontend integration should mock API responses using MSW when exercising `/Web/src` components.

```ts
  async templates(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const data = await this.meta.fetchTemplates(officeId);
    return data;
  }
```

---
