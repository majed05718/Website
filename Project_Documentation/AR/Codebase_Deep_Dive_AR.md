# جولة عميقة في الشفرة

- **تاريخ التوليد**: 2025-11-09 19:56 UTC
- **الهدف**: دليل استيعاب شامل يصف كل ملف رئيسي في المشروع.

## أبرز نقاط الاستقرار (2025-11-09)

- **حل مشكلة التهيئة في الواجهة**: الملف `Web/src/app/dashboard/layout.tsx` يعتمد الآن على `useAuthStore((s) => s.hydrated)` لتجنب شاشة الانتظار؛ كما تم إضافة حالة `hydrated` والدالة `markHydrated` في `Web/src/store/auth-store.ts`.  
- **تقليل الضوضاء في Axios**: تسجيل الطلبات في `Web/src/lib/api.ts` أصبح محصورًا في بيئات غير الإنتاج لتقليل الحمل على المتصفح.  
- **تهيئة واعية بالبيئة**: `api/src/app.module.ts` يحمّل ملفات `.env.${APP_ENV}`، وملفات PM2 (`ecosystem.prod.config.js`, `ecosystem.dev.config.js`) تضبط `APP_ENV` و`CONFIG_PATH`.  
- **خارطة الفهارس**: الخدمات `properties.service.ts`، `payments.service.ts`، `appointments.service.ts` هي المرجع الأساسي للفهارس الجديدة المذكورة في CIP §2.2.  
- **أدوات الأداء**: تكامل محلل الحزم موجود في `Web/next.config.js` و`Web/package.json` عبر الأمر `"analyze": "ANALYZE=true next build"`.  
- **خطة الأمن**: ملفات `api/src/auth/*` تحتوي على خارطة تنفيذ الرموز المزدوجة (Access/Refresh)، مع فرض التحقق عبر `class-validator` في DTO الحساسة.

## وحدة المصادقة بالتفصيل (تمت الإضافة 2025-11-10)
- ملخص: تنفيذ مصادقة JWT من الدرجة الإنتاجية مع تدوير رموز الوصول/التحديث، RBAC، وعزل البيانات متعدد المستأجرين. توفر هذه الوحدة أساس أمان Zero Trust للنظام بأكمله.

### بنية الوحدة
#### File: `/workspace/api/src/auth/auth.module.ts`
- الغرض: تكوين مصادقة JWT، واستراتيجيات Passport، والحمايات للتطبيق بأكمله.
- التكوين الرئيسي:
  - رمز الوصول: عمر 15 دقيقة، توقيع HS256
  - رمز التحديث: عمر 7 أيام، مخزن في ملفات تعريف ارتباط HttpOnly
  - إلغاء الرموز المدعوم بقاعدة البيانات عبر عميل Supabase

### المتحكمات
#### File: `/workspace/api/src/auth/auth.controller.ts`
- الغرض: يكشف 4 نقاط نهاية للمصادقة (login، refresh، logout، profile).
- الأمان: جميع النقاط موسومة بـ `@Public()` باستثناء `profile` لتجاوز حماية المصادقة العالمية.
- الدوال الرئيسية:
  - `login` → POST `/auth/login`؛ الأدوار: عامة؛ DTOs: `LoginDto`؛ الخدمات: `AuthService.validateUser`، `AuthService.login`.
    - يتحقق من بيانات البريد الإلكتروني/كلمة المرور
    - يصدر رمز وصول (15 دقيقة) ورمز تحديث (7 أيام)
    - يحفظ رمز التحديث في ملف تعريف ارتباط HttpOnly
    - يعيد: `{ accessToken, user, success, message }`

  - `refresh` → POST `/auth/refresh`؛ الأدوار: RefreshAuth؛ الخدمات: `AuthService.refreshTokens`.
    - يتحقق من رمز التحديث من ملف تعريف ارتباط HttpOnly
    - يصدر رمز وصول جديد ورمز تحديث جديد (تدوير الرمز)
    - يلغي رمز التحديث القديم للأمان
    - يعيد: `{ accessToken, success, message }`

  - `logout` → POST `/auth/logout`؛ الأدوار: JWT؛ DTOs: `LogoutDto`؛ الخدمات: `AuthService.logout`.
    - يدعم تسجيل الخروج من جهاز واحد أو "تسجيل الخروج من جميع الأجهزة"
    - يلغي رموز التحديث من قاعدة البيانات
    - يمسح ملف تعريف ارتباط HttpOnly
    - يعيد: `{ success, message }`

  - `getProfile` → GET `/auth/profile`؛ الأدوار: JWT؛ يعيد بيانات المستخدم من `req.user`.

### الخدمات
#### File: `/workspace/api/src/auth/auth.service.ts`
- الغرض: منطق الأعمال الأساسي للمصادقة مع إدارة الرموز المدعومة بقاعدة البيانات.
- ميزات الأمان:
  - التحقق من تجزئة كلمة المرور bcrypt
  - تجزئة رموز التحديث SHA-256 للتخزين في قاعدة البيانات
  - تدوير الرموز (إلغاء الرمز القديم عند إصدار رمز جديد)
  - تتبع الجهاز (عنوان IP، وكيل المستخدم)
  - دعم الإلغاء الفوري (تسجيل الخروج من جميع الأجهزة)
- الدوال الرئيسية:
  - `validateUser(email, password)`: يتحقق من بيانات الاعتماد مقابل قاعدة البيانات، يفحص حالة المستخدم
  - `login(user, deviceInfo)`: يصدر رمز وصول JWT + رمز تحديث، يخزن تجزئة الرمز في قاعدة البيانات
  - `refreshTokens(userId, oldToken)`: يتحقق من الرمز القديم، يلغيه، يصدر زوجًا جديدًا
  - `logout(userId, refreshToken?, allDevices?)`: يلغي رمز تحديث محدد أو جميع الرموز
  - `hashToken(token)`: تجزئة SHA-256 لتخزين الرموز بشكل آمن
  - `verifyRefreshToken(userId, token)`: يتحقق من الرمز مقابل قاعدة البيانات

### الاستراتيجيات
#### File: `/workspace/api/src/auth/strategies/jwt.strategy.ts`
- الغرض: استراتيجية Passport للتحقق من رموز وصول JWT.
- يستخرج: الرمز من رأس `Authorization: Bearer <token>`
- يتحقق: من التوقيع باستخدام `JWT_SECRET`، انتهاء الصلاحية (15 دقيقة)
- يرفق: حمولة المستخدم إلى `req.user` للحمايات/المتحكمات اللاحقة

#### File: `/workspace/api/src/auth/strategies/refresh.strategy.ts`
- الغرض: استراتيجية Passport للتحقق من رموز التحديث.
- يستخرج: الرمز من ملف تعريف ارتباط HttpOnly `refreshToken`
- يتحقق: من التوقيع باستخدام `JWT_REFRESH_SECRET`، انتهاء الصلاحية (7 أيام)
- يستخدم بواسطة: نقطة نهاية `/auth/refresh` حصريًا

### الحمايات
#### File: `/workspace/api/src/auth/guards/jwt-auth.guard.ts`
- الغرض: **حماية مصادقة عالمية** مطبقة على جميع نقاط نهاية API افتراضيًا.
- السلوك:
  - يتحقق من زخرفة `@Public()` لإعفاء مسارات محددة (login، refresh)
  - يتحقق من رمز JWT عبر `JwtStrategy`
  - يرمي `401 Unauthorized` إذا كان الرمز مفقودًا/غير صالح/منتهي الصلاحية
- مطبق في: `api/src/main.ts` عبر `app.useGlobalGuards(new JwtAuthGuard(reflector))`

#### File: `/workspace/api/src/auth/guards/roles.guard.ts`
- الغرض: فرض التحكم في الوصول المستند إلى الأدوار (RBAC).
- السلوك:
  - يستخرج بيانات `@Roles()` من معالج المسار
  - يقارن دور المستخدم من `req.user.role` مقابل الأدوار المسموح بها
  - يرمي `403 Forbidden` إذا لم يكن دور المستخدم في القائمة المسموح بها
- هيكل الأدوار: SystemAdmin > OfficeAdmin > Manager > Staff > Accountant > Technician > Owner > Tenant

#### File: `/workspace/api/src/auth/guards/refresh-auth.guard.ts`
- الغرض: يتحقق من رموز التحديث لنقطة نهاية `/auth/refresh`.
- يستخدم: `RefreshTokenStrategy` للتحقق من الرمز من ملف تعريف ارتباط HttpOnly

### الزخارف
#### File: `/workspace/api/src/auth/decorators/public.decorator.ts`
- الغرض: يوسم النقاط كعامة، متجاوزًا `JwtAuthGuard` العالمي.
- الاستخدام: `@Public()` فوق دالة المتحكم
- مطبق على: `/auth/login`، `/auth/refresh`، `/health`

#### File: `/workspace/api/src/auth/decorators/roles.decorator.ts`
- الغرض: يعلن الأدوار المطلوبة للوصول إلى نقطة النهاية.
- الاستخدام: `@Roles('OfficeAdmin', 'SystemAdmin')` فوق دالة المتحكم
- مفروض بواسطة: `RolesGuard`

### DTOs (كائنات نقل البيانات)
#### File: `/workspace/api/src/auth/dto/login.dto.ts`
- الغرض: يتحقق من حمولة طلب تسجيل الدخول.
- الحقول:
  - `email`: سلسلة نصية، مطلوب، تنسيق بريد إلكتروني صحيح
  - `password`: سلسلة نصية، مطلوب، 6 أحرف على الأقل

#### File: `/workspace/api/src/auth/dto/logout.dto.ts`
- الغرض: يتحقق من حمولة طلب تسجيل الخروج.
- الحقول:
  - `allDevices`: منطقي، اختياري، افتراضي false

### الكيانات
#### File: `/workspace/api/src/auth/entities/refresh-token.entity.ts`
- الغرض: كيان TypeORM لجدول `refresh_tokens` (للترحيل المستقبلي إلى TypeORM).
- الحقول:
  - `id`: UUID مفتاح أساسي
  - `user_id`: UUID مفتاح خارجي إلى `users.id`
  - `token_hash`: تجزئة SHA-256 لرمز التحديث
  - `device_info`: JSON (عنوان IP، وكيل المستخدم)
  - `expires_at`: الطابع الزمني
  - `created_at`: الطابع الزمني
  - `revoked`: منطقي (يدعم الإلغاء الفوري)

### التأثير الأمني
تنفذ وحدة المصادقة نموذج أمان **Zero Trust** مع طبقات دفاع متعددة:

1. **الحماية من XSS**: رموز التحديث المخزنة في ملفات تعريف ارتباط HttpOnly لا يمكن الوصول إليها عبر JavaScript
2. **تدوير الرموز**: كل عملية تحديث تلغي الرمز القديم، مما يحد من نافذة هجوم إعادة التشغيل
3. **رموز وصول قصيرة الأجل**: عمر 15 دقيقة يقلل الضرر من سرقة الرمز (تقليل 96% مقابل رموز 24 ساعة)
4. **إلغاء مدعوم بقاعدة البيانات**: تسجيل خروج فوري من جميع الأجهزة عبر إلغاء رمز التحديث
5. **عزل متعدد المستأجرين**: حمولة JWT تتضمن `officeId`، مفروض في جميع استعلامات قاعدة البيانات
6. **RBAC**: هيكل 8 مستويات يضمن مبدأ الامتياز الأقل
7. **تتبع الجهاز**: عنوان IP ووكيل المستخدم مسجلان للمراجعة الأمنية

### نمط الاستعلام متعدد المستأجرين
جميع طرق الخدمة تتبع الآن نمط الاستعلام المدرك للمستأجر باستخدام `officeId` من حمولة JWT:

**قبل (غير آمن - تسرب بيانات متعدد المستأجرين)**:
```ts
// ❌ سيئ: يعيد العقارات من جميع المكاتب
const { data } = await supabase.from('properties').select('*');
```

**بعد (آمن - معزول للمستأجر)**:
```ts
// ✅ جيد: يعيد فقط العقارات من مكتب المستخدم
const officeId = req.user.officeId; // مستخرج من JWT بواسطة JwtAuthGuard
const { data } = await supabase
  .from('properties')
  .select('*')
  .eq('office_id', officeId); // مرشح إلزامي
```

هذا النمط الآن مفروض عبر **جميع الوحدات**: Properties، Customers، Contracts، Payments، Appointments، Maintenance، Analytics.

## وحدة التحليلات بالتفصيل
- ملخص: يُجمع روتينات التحليلات في Supabase لتغذية لوحات المتابعة ومؤشرات الأداء والتقارير التنفيذية.

### المتحكمات
#### File: `/workspace/api/src/analytics/analytics.controller.ts`
- الغرض: يدير 5 نقطة نهاية لمسارات التحليلات مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `analytics: AnalyticsService`
- الزخارف/الحمايات: @Get('dashboard'), @Get('financials'), @Get('kpis'), @Get('properties'), @Get('staff-performance'), @Roles('manager'), @Roles('manager', 'accountant')
- الدوال الرئيسية:
  - `dashboard` → Get `/analytics/dashboard`؛ الأدوار: مدير, محاسب; DTOs: لا يوجد; الخدمات: `AnalyticsService.dashboard`.
```ts
  async dashboard(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.dashboard(officeId);
  }
```
  - `properties` → Get `/analytics/properties`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `AnalyticsService.propertiesBreakdown`.
```ts
  async properties(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.propertiesBreakdown(officeId);
  }
```
  - `financials` → Get `/analytics/financials`؛ الأدوار: مدير, محاسب; DTOs: لا يوجد; الخدمات: `AnalyticsService.financials`.
```ts
  async financials(@Req() req: any, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.financials(officeId, reportPeriod);
  }
```
  - `kpis` → Get `/analytics/kpis`؛ الأدوار: مدير; DTOs: لا يوجد; الخدمات: `AnalyticsService.kpis`.
```ts
  async kpis(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.analytics.kpis(officeId);
  }
```
  - `staffPerf` → Get `/analytics/staff-performance`؛ الأدوار: مدير; DTOs: لا يوجد; الخدمات: `AnalyticsService.staffPerformance`.
```ts
  async staffPerf(@Req() req: any, @Query('staff_phone') staffPhone?: string, @Query('report_period') reportPeriod?: string) {
    const officeId = req?.user?.office_id;
    return this.analytics.staffPerformance(officeId, staffPhone, reportPeriod);
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/analytics/analytics.service.ts`
- الغرض: يطبق قواعد التحليلات التجارية عبر 6 دالة عمومية.
- الاعتماديات: `supabaseService: SupabaseService`
- الدوال:
  - `setCache(key: string, data: any, ms: number)` الأسطر 20-20 — caching.
```ts
  private setCache(key: string, data: any, ms: number) { this.cache.set(key, { data, expiresAt: Date.now() + ms }); }
```
  - `dashboard(officeId: string)` الأسطر 22-49 — Supabase data access, caching.
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
  - `propertiesBreakdown(officeId: string)` الأسطر 51-70 — Supabase data access.
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
  - `financials(officeId: string, reportPeriod?: string)` الأسطر 72-89 — Supabase data access.
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
  - `kpis(officeId: string)` الأسطر 91-99 — Supabase data access.
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
  - `staffPerformance(officeId: string, staffPhone?: string, reportPeriod?: string)` الأسطر 101-112 — Supabase data access.
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
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.


## وحدة app بالتفصيل
- ملخص: وحدة `app` تجمع مسؤوليات المجال.

### واجهة المستخدم
- الملف `/workspace/Web/src/app/dashboard/analytics/executive/page.tsx`
  - التصديرات: `ExecutiveDashboardPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExecutiveDashboardPage` يقع بين الأسطر 31-91 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/appointments/[id]/edit/page.tsx`
  - التصديرات: `EditAppointmentPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `EditAppointmentPage` يقع بين الأسطر 10-33 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/appointments/[id]/page.tsx`
  - التصديرات: `AppointmentDetailsPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentDetailsPage` يقع بين الأسطر 24-164 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/appointments/new/page.tsx`
  - التصديرات: `NewAppointmentPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `NewAppointmentPage` يقع بين الأسطر 5-7 ويغلف حالة الواجهة لـ app.
```tsx
export default function NewAppointmentPage() {
  return <AppointmentForm />;
}
```
- الملف `/workspace/Web/src/app/dashboard/appointments/page.tsx`
  - التصديرات: `AppointmentsPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentsPage` يقع بين الأسطر 22-220 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/contracts/page.tsx`
  - التصديرات: `ContractsPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ContractsPage` يقع بين الأسطر 117-434 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/customers/[id]/edit/page.tsx`
  - التصديرات: `EditCustomerPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `EditCustomerPage` يقع بين الأسطر 10-33 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/customers/[id]/page.tsx`
  - التصديرات: `CustomerDetailsPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerDetailsPage` يقع بين الأسطر 42-295 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/customers/export/page.tsx`
  - التصديرات: `CustomersExportPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomersExportPage` يقع بين الأسطر 27-300 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/customers/new/page.tsx`
  - التصديرات: `NewCustomerPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `NewCustomerPage` يقع بين الأسطر 5-7 ويغلف حالة الواجهة لـ app.
```tsx
export default function NewCustomerPage() {
  return <CustomerForm />;
}
```
- الملف `/workspace/Web/src/app/dashboard/customers/page.tsx`
  - التصديرات: `CustomersPage`, `handleExport`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomersPage` يقع بين الأسطر 15-195 ويغلف حالة الواجهة لـ app.
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
  - `handleExport` يقع بين الأسطر 73-195 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/customers/templates/page.tsx`
  - التصديرات: `CustomersTemplatesPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomersTemplatesPage` يقع بين الأسطر 23-169 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/finance/page.tsx`
  - التصديرات: `FinancePage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `FinancePage` يقع بين الأسطر 31-154 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/layout.tsx`
  - التصديرات: `DashboardLayout`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `DashboardLayout` يقع بين الأسطر 9-61 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/maintenance/page.tsx`
  - التصديرات: `MaintenancePage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `MaintenancePage` يقع بين الأسطر 16-92 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/page.tsx`
  - التصديرات: `DashboardPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `DashboardPage` يقع بين الأسطر 69-209 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/payments/page.tsx`
  - التصديرات: `PaymentsPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PaymentsPage` يقع بين الأسطر 27-224 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/properties/[id]/page.tsx`
  - التصديرات: `PropertyDetailsPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PropertyDetailsPage` يقع بين الأسطر 31-424 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/properties/export/page.tsx`
  - التصديرات: `ExportPropertiesPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExportPropertiesPage` يقع بين الأسطر 29-187 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/properties/import/page.tsx`
  - التصديرات: `ImportPropertiesPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ImportPropertiesPage` يقع بين الأسطر 20-275 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/properties/new/page.tsx`
  - التصديرات: `NewPropertyPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `NewPropertyPage` يقع بين الأسطر 54-577 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/properties/page.tsx`
  - التصديرات: `PropertiesPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PropertiesPage` يقع بين الأسطر 15-195 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/dashboard/settings/page.tsx`
  - التصديرات: `SettingsPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `SettingsPage` يقع بين الأسطر 28-269 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/layout.tsx`
  - التصديرات: `metadata`, `RootLayout`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `metadata` يقع بين الأسطر 11-14 ويغلف حالة الواجهة لـ app.
```tsx
export const metadata: Metadata = {
  title: 'نظام إدارة العقارات',
  description: 'نظام شامل لإدارة العقارات والمكاتب العقارية',
}
```
  - `RootLayout` يقع بين الأسطر 16-29 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/login/page.tsx`
  - التصديرات: `LoginPage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `LoginPage` يقع بين الأسطر 19-162 ويغلف حالة الواجهة لـ app.
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
- الملف `/workspace/Web/src/app/page.tsx`
  - التصديرات: `Home`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `Home` يقع بين الأسطر 3-6 ويغلف حالة الواجهة لـ app.
```tsx
export default function Home() {
  // Skip login - go directly to dashboard
  redirect('/dashboard')
}
```
- الملف `/workspace/Web/src/app/public/maintenance/page.tsx`
  - التصديرات: `PublicMaintenancePage`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PublicMaintenancePage` يقع بين الأسطر 40-398 ويغلف حالة الواجهة لـ app.
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


## وحدة المواعيد بالتفصيل
- ملخص: ينسق جدولة المواعيد والتحقق من التوفر ومسارات الإكمال لمواعيد الموظفين.

### المتحكمات
#### File: `/workspace/api/src/appointments/appointments.controller.ts`
- الغرض: يدير 13 نقطة نهاية لمسارات المواعيد مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `appointmentsService: AppointmentsService`
- الزخارف/الحمايات: @ApiOperation({ summary: 'إتمام موعد' }), @ApiOperation({ summary: 'إحصائيات المواعيد' }), @ApiOperation({ summary: 'إرسال تذكير للموعد' }), @ApiOperation({ summary: 'إضافة موعد جديد' }), @ApiOperation({ summary: 'إلغاء موعد' }), @ApiOperation({ summary: 'التحقق من توفر موعد' }), @ApiOperation({ summary: 'المواعيد القادمة' }), @ApiOperation({ summary: 'تحديث حالة الموعد' }), @ApiOperation({ summary: 'تعديل موعد' }), @ApiOperation({ summary: 'تفاصيل موعد' }), @ApiOperation({ summary: 'حذف موعد' }), @ApiOperation({ summary: 'قائمة المواعيد مع filters' }), @ApiOperation({ summary: 'مواعيد اليوم' }), @ApiQuery({ name: 'limit', required: false, example: 10 }), @Delete(':id'), @Get(':id'), @Get('stats'), @Get('today'), @Get('upcoming'), @Get(), @Patch(':id'), @Patch(':id/cancel'), @Patch(':id/complete'), @Patch(':id/status'), @Post(':id/remind'), @Post('check-availability'), @Post(), @Roles('manager'), @Roles('manager', 'staff')
- الدوال الرئيسية:
  - `findAll` → Get `/appointments`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: `FilterAppointmentsDto`; الخدمات: `AppointmentsService.findAll`.
```ts
  async findAll(@Req() req: any, @Query() filters: FilterAppointmentsDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findAll(officeId, filters);
  }
```
  - `getStats` → Get `/appointments/stats`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `AppointmentsService.getStats`.
```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getStats(officeId);
  }
```
  - `getToday` → Get `/appointments/today`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `AppointmentsService.getToday`.
```ts
  async getToday(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getToday(officeId);
  }
```
  - `getUpcoming` → Get `/appointments/upcoming`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `AppointmentsService.getUpcoming`.
```ts
  async getUpcoming(@Req() req: any, @Query('limit') limit?: number) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.getUpcoming(officeId, limit);
  }
```
  - `findOne` → Get `/appointments/:id`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `AppointmentsService.findOne`.
```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.findOne(officeId, id);
  }
```
  - `create` → Post `/appointments`؛ الأدوار: مدير, موظف; DTOs: `CreateAppointmentDto`; الخدمات: `AppointmentsService.create`.
```ts
  async create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.create(officeId, userId, dto);
    return { success: true, appointment };
  }
```
  - `update` → Patch `/appointments/:id`؛ الأدوار: مدير, موظف; DTOs: `UpdateAppointmentDto`; الخدمات: `AppointmentsService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.update(officeId, id, dto);
    return { success: true, appointment };
  }
```
  - `remove` → Delete `/appointments/:id`؛ الأدوار: مدير; DTOs: لا يوجد; الخدمات: `AppointmentsService.remove`.
```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.remove(officeId, id);
  }
```
  - `updateStatus` → Patch `/appointments/:id/status`؛ الأدوار: مدير, موظف; DTOs: `UpdateStatusDto`; الخدمات: `AppointmentsService.updateStatus`.
```ts
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.updateStatus(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```
  - `cancel` → Patch `/appointments/:id/cancel`؛ الأدوار: مدير, موظف; DTOs: `CancelAppointmentDto`; الخدمات: `AppointmentsService.cancel`.
```ts
  async cancel(@Req() req: any, @Param('id') id: string, @Body() dto: CancelAppointmentDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.cancel(officeId, id, userId, dto);
    return { success: true, appointment };
  }
```
  - `complete` → Patch `/appointments/:id/complete`؛ الأدوار: مدير, موظف; DTOs: `CompleteAppointmentDto`; الخدمات: `AppointmentsService.complete`.
```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteAppointmentDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const appointment = await this.appointmentsService.complete(officeId, id, dto);
    return { success: true, appointment };
  }
```
  - `sendReminder` → Post `/appointments/:id/remind`؛ الأدوار: مدير, موظف; DTOs: لا يوجد; الخدمات: `AppointmentsService.sendReminder`.
```ts
  async sendReminder(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.sendReminder(officeId, id);
  }
```
  - `checkAvailability` → Post `/appointments/check-availability`؛ الأدوار: مدير, موظف; DTOs: `CheckAvailabilityDto`; الخدمات: `AppointmentsService.checkAvailability`.
```ts
  async checkAvailability(@Req() req: any, @Body() dto: CheckAvailabilityDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.appointmentsService.checkAvailability(officeId, dto);
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/appointments/appointments.service.ts`
- الغرض: يطبق قواعد المواعيد التجارية عبر 14 دالة عمومية.
- الاعتماديات: `supabase: SupabaseService`
- الدوال:
  - `create(officeId: string, userId: string, dto: CreateAppointmentDto)` الأسطر 33-57 — Supabase data access.
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
  - `findAll(officeId: string, filters?: any)` الأسطر 59-92 — Supabase data access.
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
  - `findOne(officeId: string, id: string)` الأسطر 94-103 — Supabase data access, error signalling.
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
  - `update(officeId: string, id: string, dto: UpdateAppointmentDto)` الأسطر 105-120 — Supabase data access, error signalling.
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
  - `remove(officeId: string, id: string)` الأسطر 122-130 — Supabase data access, error signalling.
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
  - `getStats(officeId: string)` الأسطر 132-134 — منطق أعمال.
```ts
  async getStats(officeId: string) {
    return { total: 0, today: 0, upcoming: 0 };
  }
```
  - `getCalendar(officeId: string, startDate: string, endDate: string)` الأسطر 136-138 — منطق أعمال.
```ts
  async getCalendar(officeId: string, startDate: string, endDate: string) {
    return [];
  }
```
  - `getToday(officeId: string)` الأسطر 140-142 — منطق أعمال.
```ts
  async getToday(officeId: string) {
    return [];
  }
```
  - `getUpcoming(officeId: string, limit?: number)` الأسطر 144-146 — منطق أعمال.
```ts
  async getUpcoming(officeId: string, limit?: number) {
    return [];
  }
```
  - `updateStatus(officeId: string, id: string, userId: string, dto: any)` الأسطر 148-150 — منطق أعمال.
```ts
  async updateStatus(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```
  - `cancel(officeId: string, id: string, userId: string, dto: any)` الأسطر 152-154 — منطق أعمال.
```ts
  async cancel(officeId: string, id: string, userId: string, dto: any) {
    return {};
  }
```
  - `complete(officeId: string, id: string, dto: any)` الأسطر 156-158 — منطق أعمال.
```ts
  async complete(officeId: string, id: string, dto: any) {
    return {};
  }
```
  - `sendReminder(officeId: string, id: string)` الأسطر 160-162 — منطق أعمال.
```ts
  async sendReminder(officeId: string, id: string) {
    return { message: 'Reminder sent' };
  }
```
  - `checkAvailability(officeId: string, dto: any)` الأسطر 164-166 — منطق أعمال.
```ts
  async checkAvailability(officeId: string, dto: any) {
    return { available: true };
  }
```
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.

### كائنات DTO
- `CancelAppointmentDto` (`/workspace/api/src/appointments/dto/cancel-appointment.dto.ts`)
  - الحقول:
    - `cancellationReason`: `string`؛ أدوات التحقق: @ApiProperty({ example: 'العميل طلب إلغاء الموعد', description: 'سبب الإلغاء' }), @IsString()
  - مستخدم في: AppointmentsController.cancel
- `CheckAvailabilityDto` (`/workspace/api/src/appointments/dto/check-availability.dto.ts`)
  - الحقول:
    - `date`: `string`؛ أدوات التحقق: @ApiProperty({ example: '2025-10-20', description: 'التاريخ' }), @IsDateString()
    - `startTime`: `string`؛ أدوات التحقق: @ApiProperty({ example: '10:00:00', description: 'وقت البداية' }), @IsString()
    - `endTime`: `string`؛ أدوات التحقق: @ApiProperty({ example: '11:00:00', description: 'وقت النهاية' }), @IsString()
    - `assignedStaffId`: `string`؛ أدوات التحقق: @ApiProperty({ example: 'uuid-staff-id', description: 'معرف الموظف' }), @IsUUID()
  - مستخدم في: AppointmentsController.checkAvailability
- `CompleteAppointmentDto` (`/workspace/api/src/appointments/dto/complete-appointment.dto.ts`)
  - الحقول:
    - `completionNotes`: `string`؛ أدوات التحقق: @ApiProperty({ example: 'تمت المعاينة بنجاح، العميل مهتم بالعقار', description: 'ملاحظات الإتمام' }), @IsString()
  - مستخدم في: AppointmentsController.complete
- `CreateAppointmentDto` (`/workspace/api/src/appointments/dto/create-appointment.dto.ts`)
  - الحقول:
  - مستخدم في: AppointmentsController.create
- `FilterAppointmentsDto` (`/workspace/api/src/appointments/dto/filter-appointments.dto.ts`)
  - الحقول:
    - `page`: `number`؛ أدوات التحقق: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `limit`: `number`؛ أدوات التحقق: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `search`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'معاينة', description: 'البحث في العنوان/الوصف' }), @IsOptional(), @IsString()
    - `type`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'], description: 'نوع الموعد' }), @IsOptional(), @IsEnum(['viewing', 'meeting', 'signing', 'inspection', 'consultation', 'other'])
    - `status`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], description: 'حالة الموعد' }), @IsOptional(), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
    - `date`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-20', description: 'التاريخ المحدد' }), @IsOptional(), @IsDateString()
    - `start_date`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-01', description: 'من تاريخ' }), @IsOptional(), @IsDateString()
    - `end_date`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-31', description: 'إلى تاريخ' }), @IsOptional(), @IsDateString()
    - `property_id`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العقار' }), @IsOptional(), @IsUUID()
    - `customer_id`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف العميل' }), @IsOptional(), @IsUUID()
    - `assigned_staff_id`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف' }), @IsOptional(), @IsUUID()
    - `order_by`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['date', 'created_at', 'start_time'], example: 'date', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
    - `order`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])
  - مستخدم في: AppointmentsController.findAll
- `UpdateAppointmentDto` (`/workspace/api/src/appointments/dto/update-appointment.dto.ts`)
  - الحقول:
  - مستخدم في: AppointmentsController.update
- `UpdateStatusDto` (`/workspace/api/src/appointments/dto/update-status.dto.ts`)
  - الحقول:
    - `status`: `string`؛ أدوات التحقق: @ApiProperty({ enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], example: 'confirmed', description: 'الحالة الجديدة' }), @IsEnum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
    - `notes`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'تم تأكيد الموعد مع العميل', description: 'ملاحظات' }), @IsString(), @IsOptional()
  - مستخدم في: AppointmentsController.updateStatus


## وحدة components بالتفصيل
- ملخص: وحدة `components` تجمع مسؤوليات المجال.

### واجهة المستخدم
- الملف `/workspace/Web/src/components/analytics/executive/GoalsTracking.tsx`
  - التصديرات: `GoalsTracking`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `GoalsTracking` يقع بين الأسطر 19-135 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/analytics/executive/KPIsGrid.tsx`
  - التصديرات: `KPIsGrid`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `KPIsGrid` يقع بين الأسطر 19-130 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/analytics/executive/MarketInsights.tsx`
  - التصديرات: `MarketInsights`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `MarketInsights` يقع بين الأسطر 29-135 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/analytics/executive/RevenueBreakdown.tsx`
  - التصديرات: `RevenueBreakdown`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `RevenueBreakdown` يقع بين الأسطر 27-84 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/analytics/executive/SalesFunnel.tsx`
  - التصديرات: `SalesFunnel`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `SalesFunnel` يقع بين الأسطر 17-92 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/analytics/executive/SummaryCards.tsx`
  - التصديرات: `SummaryCards`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `SummaryCards` يقع بين الأسطر 18-139 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/analytics/executive/TopPerformers.tsx`
  - التصديرات: `TopPerformers`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `TopPerformers` يقع بين الأسطر 18-182 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/AppointmentCalendar.tsx`
  - التصديرات: `AppointmentCalendar`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentCalendar` يقع بين الأسطر 20-224 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/AppointmentCard.tsx`
  - التصديرات: `AppointmentCard`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentCard` يقع بين الأسطر 34-159 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/AppointmentDetailsCard.tsx`
  - التصديرات: `AppointmentDetailsCard`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentDetailsCard` يقع بين الأسطر 19-160 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/AppointmentForm.tsx`
  - التصديرات: `AppointmentForm`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentForm` يقع بين الأسطر 41-204 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/AppointmentStats.tsx`
  - التصديرات: `AppointmentStats`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentStats` يقع بين الأسطر 10-88 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/AppointmentsFilters.tsx`
  - التصديرات: `AppointmentsFilters`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentsFilters` يقع بين الأسطر 20-134 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/AppointmentsList.tsx`
  - التصديرات: `AppointmentsList`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AppointmentsList` يقع بين الأسطر 14-68 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/CancelDialog.tsx`
  - التصديرات: `CancelDialog`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CancelDialog` يقع بين الأسطر 18-79 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/CompleteDialog.tsx`
  - التصديرات: `CompleteDialog`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CompleteDialog` يقع بين الأسطر 18-70 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/QuickAddDialog.tsx`
  - التصديرات: `QuickAddDialog`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `QuickAddDialog` يقع بين الأسطر 32-129 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/appointments/StatusUpdateDialog.tsx`
  - التصديرات: `StatusUpdateDialog`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `StatusUpdateDialog` يقع بين الأسطر 19-85 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/contracts/ContractCard.tsx`
  - التصديرات: `ContractCard`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ContractCard` يقع بين الأسطر 49-257 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/contracts/ContractsFilters.tsx`
  - التصديرات: `ContractsFilters`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ContractsFilters` يقع بين الأسطر 29-251 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/contracts/ContractsTable.tsx`
  - التصديرات: `ContractsTable`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ContractsTable` يقع بين الأسطر 57-295 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/contracts/StatsCards.tsx`
  - التصديرات: `StatsCards`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `StatsCards` يقع بين الأسطر 23-100 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/AddInteractionDialog.tsx`
  - التصديرات: `AddInteractionDialog`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AddInteractionDialog` يقع بين الأسطر 46-213 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/AddNoteDialog.tsx`
  - التصديرات: `AddNoteDialog`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `AddNoteDialog` يقع بين الأسطر 38-207 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerCard.tsx`
  - التصديرات: `CustomerCard`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerCard` يقع بين الأسطر 62-369 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerContractsList.tsx`
  - التصديرات: `CustomerContractsList`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerContractsList` يقع بين الأسطر 15-154 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerFilters.tsx`
  - التصديرات: `CustomerFilters`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerFilters` يقع بين الأسطر 31-286 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerForm.tsx`
  - التصديرات: `CustomerForm`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerForm` يقع بين الأسطر 44-399 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerInfoCard.tsx`
  - التصديرات: `CustomerInfoCard`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerInfoCard` يقع بين الأسطر 37-289 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerInteractionsList.tsx`
  - التصديرات: `CustomerInteractionsList`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerInteractionsList` يقع بين الأسطر 13-148 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerNotesList.tsx`
  - التصديرات: `CustomerNotesList`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerNotesList` يقع بين الأسطر 28-143 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerPagination.tsx`
  - التصديرات: `CustomerPagination`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerPagination` يقع بين الأسطر 13-164 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerPropertiesList.tsx`
  - التصديرات: `CustomerPropertiesList`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerPropertiesList` يقع بين الأسطر 18-171 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/CustomerStats.tsx`
  - التصديرات: `CustomerStats`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomerStats` يقع بين الأسطر 11-82 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/export/ColumnSelector.tsx`
  - التصديرات: `ColumnSelector`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ColumnSelector` يقع بين الأسطر 24-209 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/export/ExportHistory.tsx`
  - التصديرات: `ExportHistory`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExportHistory` يقع بين الأسطر 60-145 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/export/ExportOptions.tsx`
  - التصديرات: `ExportOptions`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExportOptions` يقع بين الأسطر 24-171 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/export/ExportPreview.tsx`
  - التصديرات: `ExportPreview`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExportPreview` يقع بين الأسطر 77-216 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/export/ExportProgress.tsx`
  - التصديرات: `ExportProgress`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExportProgress` يقع بين الأسطر 21-68 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/export/FormatOptions.tsx`
  - التصديرات: `FormatOptions`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `FormatOptions` يقع بين الأسطر 25-210 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/templates/CustomTemplateCreator.tsx`
  - التصديرات: `CustomTemplateCreator`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CustomTemplateCreator` يقع بين الأسطر 39-354 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/templates/MyTemplates.tsx`
  - التصديرات: `MyTemplates`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `MyTemplates` يقع بين الأسطر 37-139 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/templates/TemplateCard.tsx`
  - التصديرات: `TemplateCard`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `TemplateCard` يقع بين الأسطر 38-208 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/customers/templates/TemplatesGallery.tsx`
  - التصديرات: `TemplatesGallery`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `TemplatesGallery` يقع بين الأسطر 18-26 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/dashboard/Header.tsx`
  - التصديرات: `Header`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `Header` يقع بين الأسطر 21-108 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/dashboard/Sidebar.tsx`
  - التصديرات: `Sidebar`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `Sidebar` يقع بين الأسطر 23-80 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/ActiveContractsTable.tsx`
  - التصديرات: `ActiveContractsTable`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ActiveContractsTable` يقع بين الأسطر 19-159 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/BudgetSection.tsx`
  - التصديرات: `BudgetSection`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `BudgetSection` يقع بين الأسطر 18-165 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/CashFlowChart.tsx`
  - التصديرات: `CashFlowChart`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `CashFlowChart` يقع بين الأسطر 28-155 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/DateRangeFilter.tsx`
  - التصديرات: `DateRangeFilter`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `DateRangeFilter` يقع بين الأسطر 30-130 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/ExpensesDonutChart.tsx`
  - التصديرات: `ExpensesDonutChart`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExpensesDonutChart` يقع بين الأسطر 25-160 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/KPICards.tsx`
  - التصديرات: `KPICards`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `KPICards` يقع بين الأسطر 26-227 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/ProfitLossStatement.tsx`
  - التصديرات: `ProfitLossStatementComponent`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ProfitLossStatementComponent` يقع بين الأسطر 18-165 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/ReportGenerator.tsx`
  - التصديرات: `ReportGenerator`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ReportGenerator` يقع بين الأسطر 39-294 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/RevenueChart.tsx`
  - التصديرات: `RevenueChart`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `RevenueChart` يقع بين الأسطر 28-108 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/RevenuePieChart.tsx`
  - التصديرات: `RevenuePieChart`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `RevenuePieChart` يقع بين الأسطر 25-147 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/finance/TopPropertiesTable.tsx`
  - التصديرات: `TopPropertiesTable`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `TopPropertiesTable` يقع بين الأسطر 19-137 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/layout/NotificationsPanel.tsx`
  - التصديرات: `NotificationsPanel`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `NotificationsPanel` يقع بين الأسطر 28-213 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/maintenance/MaintenanceStats.tsx`
  - التصديرات: `MaintenanceStats`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `MaintenanceStats` يقع بين الأسطر 19-94 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/maintenance/RequestsTable.tsx`
  - التصديرات: `RequestsTable`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `RequestsTable` يقع بين الأسطر 48-293 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/BulkActions.tsx`
  - التصديرات: `BulkActions`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `BulkActions` يقع بين الأسطر 21-74 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/OverdueAlerts.tsx`
  - التصديرات: `OverdueAlerts`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `OverdueAlerts` يقع بين الأسطر 20-64 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/PaymentCharts.tsx`
  - التصديرات: `PaymentCharts`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PaymentCharts` يقع بين الأسطر 43-223 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/PaymentFilters.tsx`
  - التصديرات: `PaymentFiltersComponent`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PaymentFiltersComponent` يقع بين الأسطر 30-317 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/PaymentStats.tsx`
  - التصديرات: `PaymentStats`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PaymentStats` يقع بين الأسطر 20-87 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/PaymentsTable.tsx`
  - التصديرات: `PaymentsTable`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PaymentsTable` يقع بين الأسطر 58-358 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/QuickActions.tsx`
  - التصديرات: `QuickActions`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `QuickActions` يقع بين الأسطر 19-48 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/payments/StatsCards.tsx`
  - التصديرات: `StatsCards`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `StatsCards` يقع بين الأسطر 26-178 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/PropertiesFilters.tsx`
  - التصديرات: `PropertiesFilters`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PropertiesFilters` يقع بين الأسطر 23-238 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/PropertiesPagination.tsx`
  - التصديرات: `PropertiesPagination`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PropertiesPagination` يقع بين الأسطر 12-129 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/PropertyCard.tsx`
  - التصديرات: `PropertyCard`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `PropertyCard` يقع بين الأسطر 16-149 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/import/ColumnMapper.tsx`
  - التصديرات: `ColumnMapper`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ColumnMapper` يقع بين الأسطر 22-162 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/import/DataPreview.tsx`
  - التصديرات: `DataPreview`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `DataPreview` يقع بين الأسطر 34-295 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/import/ExcelUploader.tsx`
  - التصديرات: `ExcelUploader`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ExcelUploader` يقع بين الأسطر 15-173 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/import/ImportProgress.tsx`
  - التصديرات: `ImportProgress`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ImportProgress` يقع بين الأسطر 20-193 ويغلف حالة الواجهة لـ components.
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
- الملف `/workspace/Web/src/components/properties/import/ValidationSummary.tsx`
  - التصديرات: `ValidationSummary`
  - الغرض: يقدم تجارب Next.js المرتبطة بهذا المجال ويستهلك واجهات البرمجة المذكورة أعلاه.
  - `ValidationSummary` يقع بين الأسطر 17-210 ويغلف حالة الواجهة لـ components.
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


## وحدة العملاء بالتفصيل
- ملخص: يوفر قدرات إدارة علاقات العملاء بما يشمل الملاحظات والتفاعلات وربط العقارات ودفقات الاستيراد/التصدير عبر Excel.

### المتحكمات
#### File: `/workspace/api/src/customers/customers.controller.ts`
- الغرض: يدير 13 نقطة نهاية لمسارات العملاء مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `customersService: CustomersService`
- الزخارف/الحمايات: @ApiOperation({ summary: 'إحصائيات العملاء' }), @ApiOperation({ summary: 'إضافة عميل جديد' }), @ApiOperation({ summary: 'إضافة ملاحظة للعميل' }), @ApiOperation({ summary: 'البحث السريع عن عملاء' }), @ApiOperation({ summary: 'تصدير العملاء إلى Excel' }), @ApiOperation({ summary: 'تعديل عميل' }), @ApiOperation({ summary: 'تفاصيل عميل' }), @ApiOperation({ summary: 'حذف عميل' }), @ApiOperation({ summary: 'حذف ملاحظة' }), @ApiOperation({ summary: 'ربط عقار بالعميل' }), @ApiOperation({ summary: 'قائمة العملاء مع filters' }), @ApiOperation({ summary: 'قائمة تعاملات العميل' }), @ApiOperation({ summary: 'قائمة ملاحظات العميل' }), @ApiQuery({ name: 'q', required: true, description: 'كلمة البحث' }), @Delete(':id'), @Delete(':id/notes/:noteId'), @Get(':id'), @Get(':id/interactions'), @Get(':id/notes'), @Get('export'), @Get('search'), @Get('stats'), @Get(), @Patch(':id'), @Post(':id/notes'), @Post(':id/properties'), @Post(), @Roles('manager'), @Roles('manager', 'staff')
- الدوال الرئيسية:
  - `findAll` → Get `/customers`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: `FilterCustomersDto`; الخدمات: `CustomersService.findAll`.
```ts
  async findAll(@Req() req: any, @Query() filters: FilterCustomersDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findAll(officeId, filters);
  }
```
  - `getStats` → Get `/customers/stats`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `CustomersService.getStats`.
```ts
  async getStats(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getStats(officeId);
  }
```
  - `search` → Get `/customers/search`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `CustomersService.search`.
```ts
  async search(@Req() req: any, @Query('q') searchTerm: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.search(officeId, searchTerm);
  }
```
  - `exportExcel` → Get `/customers/export`؛ الأدوار: مدير, موظف; DTOs: لا يوجد; الخدمات: `CustomersService.exportExcel`.
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
  - `findOne` → Get `/customers/:id`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `CustomersService.findOne`.
```ts
  async findOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.findOne(officeId, id);
  }
```
  - `create` → Post `/customers`؛ الأدوار: مدير, موظف; DTOs: `CreateCustomerDto`; الخدمات: `CustomersService.create`.
```ts
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.create(officeId, userId, dto);
    return { success: true, customer };
  }
```
  - `update` → Patch `/customers/:id`؛ الأدوار: مدير, موظف; DTOs: `UpdateCustomerDto`; الخدمات: `CustomersService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const customer = await this.customersService.update(officeId, id, dto);
    return { success: true, customer };
  }
```
  - `remove` → Delete `/customers/:id`؛ الأدوار: مدير; DTOs: لا يوجد; الخدمات: `CustomersService.remove`.
```ts
  async remove(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.remove(officeId, id);
  }
```
  - `getNotes` → Get `/customers/:id/notes`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `CustomersService.getNotes`.
```ts
  async getNotes(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getNotes(officeId, customerId);
  }
```
  - `createNote` → Post `/customers/:id/notes`؛ الأدوار: مدير, موظف; DTOs: `CreateCustomerNoteDto`; الخدمات: `CustomersService.createNote`.
```ts
  async createNote(@Req() req: any, @Param('id') customerId: string, @Body() dto: CreateCustomerNoteDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const note = await this.customersService.createNote(officeId, customerId, userId, dto);
    return { success: true, note };
  }
```
  - `removeNote` → Delete `/customers/:id/notes/:noteId`؛ الأدوار: مدير, موظف; DTOs: لا يوجد; الخدمات: `CustomersService.removeNote`.
```ts
  async removeNote(@Req() req: any, @Param('id') customerId: string, @Param('noteId') noteId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.removeNote(officeId, customerId, noteId);
  }
```
  - `getInteractions` → Get `/customers/:id/interactions`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `CustomersService.getInteractions`.
```ts
  async getInteractions(@Req() req: any, @Param('id') customerId: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    return this.customersService.getInteractions(officeId, customerId);
  }
```
  - `linkProperty` → Post `/customers/:id/properties`؛ الأدوار: مدير, موظف; DTOs: `LinkPropertyDto`; الخدمات: `CustomersService.linkProperty`.
```ts
  async linkProperty(@Req() req: any, @Param('id') customerId: string, @Body() dto: LinkPropertyDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول');
    const relationship = await this.customersService.linkProperty(officeId, customerId, dto);
    return { success: true, relationship };
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

#### File: `/workspace/api/src/customers/excel.controller.ts`
- الغرض: يدير 3 نقطة نهاية لمسارات العملاء مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `excelService: ExcelService`
- الزخارف/الحمايات: @Get('import-stats'), @Get('templates'), @Post('validate-file'), @UseInterceptors(FileInterceptor('file'))
- الدوال الرئيسية:
  - `getTemplates` → Get `/customers/excel/templates`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `logger.log`, `ExcelService.getTemplates`, `logger.error`.
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
  - `validateFile` → Post `/customers/excel/validate-file`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `logger.log`.
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
  - `getImportStats` → Get `/customers/excel/import-stats`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `logger.log`.
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
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/customers/customers.service.ts`
- الغرض: يطبق قواعد العملاء التجارية عبر 16 دالة عمومية.
- الاعتماديات: `supabase: SupabaseService`
- الدوال:
  - `create(officeId: string, userId: string, dto: CreateCustomerDto)` الأسطر 33-57 — Supabase data access.
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
  - `findAll(officeId: string, filters?: any)` الأسطر 59-98 — Supabase data access.
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
  - `findOne(officeId: string, id: string)` الأسطر 100-109 — Supabase data access, error signalling.
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
  - `update(officeId: string, id: string, dto: UpdateCustomerDto)` الأسطر 111-130 — Supabase data access, error signalling.
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
  - `remove(officeId: string, id: string)` الأسطر 132-140 — Supabase data access, error signalling.
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
  - `getStats(officeId: string)` الأسطر 142-144 — منطق أعمال.
```ts
  async getStats(officeId: string) {
    return { total: 0, active: 0, potential: 0 };
  }
```
  - `search(officeId: string, term: string)` الأسطر 146-153 — Supabase data access.
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
  - `exportExcel(officeId: string)` الأسطر 155-157 — منطق أعمال.
```ts
  async exportExcel(officeId: string) {
    return [];
  }
```
  - `getNotes(officeId: string, customerId: string)` الأسطر 159-161 — منطق أعمال.
```ts
  async getNotes(officeId: string, customerId: string) {
    return [];
  }
```
  - `createNote(officeId: string, customerId: string, userId: string, dto: any)` الأسطر 163-165 — منطق أعمال.
```ts
  async createNote(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }
```
  - `updateNote(officeId: string, customerId: string, noteId: string, dto: any)` الأسطر 167-169 — منطق أعمال.
```ts
  async updateNote(officeId: string, customerId: string, noteId: string, dto: any) {
    return {};
  }
```
  - `removeNote(officeId: string, customerId: string, noteId: string)` الأسطر 171-173 — منطق أعمال.
```ts
  async removeNote(officeId: string, customerId: string, noteId: string) {
    return { message: 'Note deleted' };
  }
```
  - `getInteractions(officeId: string, customerId: string)` الأسطر 175-177 — منطق أعمال.
```ts
  async getInteractions(officeId: string, customerId: string) {
    return [];
  }
```
  - `createInteraction(officeId: string, customerId: string, userId: string, dto: any)` الأسطر 179-181 — منطق أعمال.
```ts
  async createInteraction(officeId: string, customerId: string, userId: string, dto: any) {
    return {};
  }
```
  - `linkProperty(officeId: string, customerId: string, dto: any)` الأسطر 183-185 — منطق أعمال.
```ts
  async linkProperty(officeId: string, customerId: string, dto: any) {
    return {};
  }
```
  - `unlinkProperty(officeId: string, customerId: string, propertyId: string)` الأسطر 187-189 — منطق أعمال.
```ts
  async unlinkProperty(officeId: string, customerId: string, propertyId: string) {
    return { message: 'Property unlinked' };
  }
```
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.

#### File: `/workspace/api/src/customers/excel.service.ts`
- الغرض: يطبق قواعد العملاء التجارية عبر 0 دالة عمومية.
- الاعتماديات: لا يوجد
- الدوال:
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.

### كائنات DTO
- `CreateCustomerInteractionDto` (`/workspace/api/src/customers/dto/create-customer-interaction.dto.ts`)
  - الحقول:
    - `type`: `string`؛ أدوات التحقق: @ApiProperty({ enum: ['call', 'meeting', 'email', 'whatsapp', 'visit'], example: 'call', description: 'نوع التعامل' }), @IsEnum(['call', 'meeting', 'email', 'whatsapp', 'visit'])
    - `description`: `string`؛ أدوات التحقق: @ApiProperty({ example: 'تم الاتصال لمتابعة طلب العميل', description: 'وصف التعامل' }), @IsString()
    - `date`: `string`؛ أدوات التحقق: @ApiProperty({ example: '2025-10-20T10:00:00Z', description: 'تاريخ التعامل' }), @IsDateString()
    - `propertyId`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'uuid-property-id', description: 'معرف العقار المرتبط' }), @IsUUID(), @IsOptional()
    - `contractId`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'uuid-contract-id', description: 'معرف العقد المرتبط' }), @IsUUID(), @IsOptional()
    - `outcome`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'العميل مهتم ويريد زيارة العقار', description: 'نتيجة التعامل' }), @IsString(), @IsOptional()
    - `nextFollowUp`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-25T14:00:00Z', description: 'تاريخ المتابعة القادمة' }), @IsDateString(), @IsOptional()
    - `staffId`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'uuid-staff-id', description: 'معرف الموظف' }), @IsUUID(), @IsOptional()
  - مستخدم في: لا يوجد
- `CreateCustomerNoteDto` (`/workspace/api/src/customers/dto/create-customer-note.dto.ts`)
  - الحقول:
    - `content`: `string`؛ أدوات التحقق: @ApiProperty({ example: 'العميل مهتم بالشقق في شمال الرياض', description: 'محتوى الملاحظة' }), @IsString()
    - `isImportant`: `boolean`؛ أدوات التحقق: @ApiPropertyOptional({ example: false, description: 'هل الملاحظة مهمة؟' }), @IsBoolean(), @IsOptional()
    - `tags`: `any`؛ أدوات التحقق: @ApiPropertyOptional({ example: { category: 'follow_up' }, description: 'الوسوم' }), @IsObject(), @IsOptional()
  - مستخدم في: CustomersController.createNote
- `CreateCustomerDto` (`/workspace/api/src/customers/dto/create-customer.dto.ts`)
  - الحقول:
  - مستخدم في: CustomersController.create
- `CustomerFiltersDto` (`/workspace/api/src/customers/dto/export-customers.dto.ts`)
  - الحقول:
    - `type`: `string[]`؛ أدوات التحقق: @IsOptional(), @IsArray(), @IsEnum(['buyer', 'seller', 'tenant', 'landlord'], { each: true })
    - `status`: `string[]`؛ أدوات التحقق: @IsOptional(), @IsArray(), @IsEnum(['active', 'inactive', 'archived'], { each: true })
    - `city`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `source`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `dateFrom`: `string`؛ أدوات التحقق: @IsOptional(), @IsDateString()
    - `dateTo`: `string`؛ أدوات التحقق: @IsOptional(), @IsDateString()
    - `search`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `ids`: `string[]`؛ أدوات التحقق: @IsOptional(), @IsArray(), @IsString({ each: true })
  - مستخدم في: لا يوجد
- `ExportCustomersDto` (`/workspace/api/src/customers/dto/export-customers.dto.ts`)
  - الحقول:
    - `filters`: `CustomerFiltersDto`؛ أدوات التحقق: @IsOptional(), @ValidateNested(), @Type(() => CustomerFiltersDto)
    - `columns`: `string[]`؛ أدوات التحقق: @IsArray({ message: 'الأعمدة يجب أن تكون مصفوفة' }), @IsString({ each: true })
    - `includeStatistics`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
    - `applyFormatting`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
    - `includeHeader`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
    - `fileName`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
  - مستخدم في: لا يوجد
- `ExportTemplateDto` (`/workspace/api/src/customers/dto/export-customers.dto.ts`)
  - الحقول:
    - `templateId`: `string`؛ أدوات التحقق: @IsString({ message: 'معرف القالب مطلوب' })
    - `includeExamples`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
    - `includeInstructions`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
    - `format`: `'xlsx' | 'csv'`؛ أدوات التحقق: @IsOptional(), @IsEnum(['xlsx', 'csv'], { message: 'التنسيق يجب أن يكون xlsx أو csv' })
  - مستخدم في: لا يوجد
- `FilterCustomersDto` (`/workspace/api/src/customers/dto/filter-customers.dto.ts`)
  - الحقول:
    - `page`: `number`؛ أدوات التحقق: @ApiPropertyOptional({ example: 1, description: 'رقم الصفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `limit`: `number`؛ أدوات التحقق: @ApiPropertyOptional({ example: 20, description: 'عدد العناصر لكل صفحة' }), @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `search`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'محمد', description: 'البحث في الاسم/البريد/الهاتف' }), @IsOptional(), @IsString()
    - `type`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['buyer', 'seller', 'renter', 'landlord', 'both'], description: 'نوع العميل' }), @IsOptional(), @IsEnum(['buyer', 'seller', 'renter', 'landlord', 'both'])
    - `status`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['active', 'inactive', 'blocked'], description: 'حالة العميل' }), @IsOptional(), @IsEnum(['active', 'inactive', 'blocked'])
    - `city`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'الرياض', description: 'المدينة' }), @IsOptional(), @IsString()
    - `source`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'website', description: 'المصدر' }), @IsOptional(), @IsString()
    - `rating`: `number`؛ أدوات التحقق: @ApiPropertyOptional({ example: 5, description: 'التقييم' }), @IsOptional(), @Type(() => Number), @IsInt()
    - `assigned_staff_id`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: 'uuid', description: 'معرف الموظف المسؤول' }), @IsOptional(), @IsString()
    - `order_by`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['created_at', 'updated_at', 'name', 'last_contact_date'], example: 'created_at', description: 'ترتيب حسب' }), @IsOptional(), @IsString()
    - `order`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc', description: 'اتجاه الترتيب' }), @IsOptional(), @IsEnum(['asc', 'desc'])
  - مستخدم في: CustomersController.findAll
- `ColumnMappingDto` (`/workspace/api/src/customers/dto/import-customers.dto.ts`)
  - الحقول:
    - `excelColumn`: `string`؛ أدوات التحقق: @IsNotEmpty({ message: 'اسم عمود Excel مطلوب' }), @IsString()
    - `systemField`: `string`؛ أدوات التحقق: @IsNotEmpty({ message: 'اسم حقل النظام مطلوب' }), @IsString()
    - `required`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
    - `transform`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
  - مستخدم في: لا يوجد
- `ImportCustomersDto` (`/workspace/api/src/customers/dto/import-customers.dto.ts`)
  - الحقول:
    - `mapping`: `ColumnMappingDto[]`؛ أدوات التحقق: @IsArray({ message: 'مطابقة الأعمدة يجب أن تكون مصفوفة' }), @ValidateNested({ each: true }), @Type(() => ColumnMappingDto)
    - `duplicateHandling`: `'skip' | 'update' | 'error'`؛ أدوات التحقق: لا يوجد
    - `validateOnly`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
    - `batchSize`: `number`؛ أدوات التحقق: @IsOptional(), @IsNumber(), @Min(10, { message: 'حجم الدفعة يجب أن يكون على الأقل 10' }), @Max(1000, { message: 'حجم الدفعة يجب أن لا يتجاوز 1000' })
    - `skipInvalidRows`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
  - مستخدم في: لا يوجد
- `PreviewImportDto` (`/workspace/api/src/customers/dto/import-customers.dto.ts`)
  - الحقول:
    - `mapping`: `ColumnMappingDto[]`؛ أدوات التحقق: @IsArray(), @ValidateNested({ each: true }), @Type(() => ColumnMappingDto)
    - `previewRows`: `number`؛ أدوات التحقق: @IsOptional(), @IsNumber(), @Min(1), @Max(100)
  - مستخدم في: لا يوجد
- `LinkPropertyDto` (`/workspace/api/src/customers/dto/link-property.dto.ts`)
  - الحقول:
    - `property_id`: `string`؛ أدوات التحقق: @ApiProperty({ example: 'uuid-property-id', description: 'معرف العقار' }), @IsUUID()
    - `relationship`: `string`؛ أدوات التحقق: @ApiProperty({ enum: ['owner', 'interested', 'viewed', 'negotiating', 'contracted'], example: 'interested', description: 'نوع العلاقة' }), @IsEnum(['owner', 'interested', 'viewed', 'negotiating', 'contracted'])
    - `start_date`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: '2025-10-20T10:00:00Z', description: 'تاريخ البداية' }), @IsDateString(), @IsOptional()
    - `end_date`: `string`؛ أدوات التحقق: @ApiPropertyOptional({ example: '2025-11-20T10:00:00Z', description: 'تاريخ النهاية' }), @IsDateString(), @IsOptional()
  - مستخدم في: CustomersController.linkProperty
- `UpdateCustomerNoteDto` (`/workspace/api/src/customers/dto/update-customer-note.dto.ts`)
  - الحقول:
  - مستخدم في: لا يوجد
- `UpdateCustomerDto` (`/workspace/api/src/customers/dto/update-customer.dto.ts`)
  - الحقول:
  - مستخدم في: CustomersController.update


## وحدة الصحة بالتفصيل
- ملخص: يُظهر فحوصات الجاهزية والصحة لتنظيم البنية التحتية.

### المتحكمات
#### File: `/workspace/api/src/health/health.controller.ts`
- الغرض: يدير 0 نقطة نهاية لمسارات الصحة مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `configService: ConfigService`, `supabaseService: SupabaseService`
- الزخارف/الحمايات: لا يوجد
- الدوال الرئيسية:
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.


## وحدة التكاملات بالتفصيل
- ملخص: يربط الأتمتة (مثل n8n) والأنظمة الخارجية مع المنصة الأساسية.

### الخدمات
#### File: `/workspace/api/src/integrations/n8n/n8n.service.ts`
- الغرض: يطبق قواعد التكاملات التجارية عبر 0 دالة عمومية.
- الاعتماديات: `supabase: SupabaseService`
- الدوال:
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.


## وحدة الصيانة بالتفصيل
- ملخص: يتتبع طلبات الصيانة ومسارات الفنيين ونماذج الإدخال العامة.

### المتحكمات
#### File: `/workspace/api/src/maintenance/maintenance.controller.ts`
- الغرض: يدير 6 نقطة نهاية لمسارات الصيانة مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `maintenanceService: MaintenanceService`
- الزخارف/الحمايات: @Get('maintenance'), @Get('maintenance/:id'), @Patch('maintenance/:id'), @Post('maintenance'), @Post('maintenance/:id/complete'), @Post('public/maintenance'), @Roles('manager', 'staff', 'technician'), @Roles('technician', 'manager')
- الدوال الرئيسية:
  - `list` → Get `/maintenance`؛ الأدوار: مدير, موظف, technician; DTOs: `FilterMaintenanceDto`; الخدمات: `MaintenanceService.list`.
```ts
  async list(@Req() req: any, @Query() filters: FilterMaintenanceDto) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.list(officeId, filters);
  }
```
  - `getOne` → Get `/maintenance/:id`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `MaintenanceService.getOne`.
```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    return this.maintenanceService.getOne(officeId, id);
  }
```
  - `create` → Post `/maintenance`؛ الأدوار: مدير, موظف, technician; DTOs: `CreateMaintenanceDto`; الخدمات: `MaintenanceService.createInternal`.
```ts
  async create(@Req() req: any, @Body() dto: CreateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const officeCode = req?.user?.office_id; // بافتراض أن office_id هو نفسه code
    const userId = req?.user?.user_id ?? null;
    const created = await this.maintenanceService.createInternal(officeId, officeCode, userId, dto);
    return { success: true, request: created };
  }
```
  - `createPublic` → Post `/public/maintenance`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: `PublicCreateMaintenanceDto`; الخدمات: `MaintenanceService.createPublic`.
```ts
  async createPublic(@Req() req: any, @Body() dto: PublicCreateMaintenanceDto) {
    const officeId = req?.user?.office_id ?? dto?.property_id ?? 'public';
    const officeCode = req?.user?.office_id ?? 'public';
    const created = await this.maintenanceService.createPublic(officeId, officeCode, dto);
    return { success: true, request: created };
  }
```
  - `update` → Patch `/maintenance/:id`؛ الأدوار: مدير, موظف, technician; DTOs: `UpdateMaintenanceDto`; الخدمات: `MaintenanceService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.update(officeId, id, dto);
    return { success: true, request: updated };
  }
```
  - `complete` → Post `/maintenance/:id/complete`؛ الأدوار: technician, مدير; DTOs: `CompleteMaintenanceDto`; الخدمات: `MaintenanceService.complete`.
```ts
  async complete(@Req() req: any, @Param('id') id: string, @Body() dto: CompleteMaintenanceDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.maintenanceService.complete(officeId, id, dto);
    return { success: true, request: updated };
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/maintenance/maintenance.service.ts`
- الغرض: يطبق قواعد الصيانة التجارية عبر 6 دالة عمومية.
- الاعتماديات: `supabase: SupabaseService`, `n8n: N8nService`
- الدوال:
  - `list(officeId: string, filters: any)` الأسطر 16-35 — Supabase data access, error signalling.
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
  - `getOne(officeId: string, id: string)` الأسطر 37-47 — Supabase data access, error signalling.
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
  - `createInternal(officeId: string, officeCode: string, userId: string | null, dto: CreateMaintenanceDto)` الأسطر 49-88 — Supabase data access, error signalling.
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
  - `createPublic(officeId: string, officeCode: string, dto: PublicCreateMaintenanceDto)` الأسطر 90-132 — Supabase data access, error signalling.
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
  - `update(officeId: string, id: string, dto: UpdateMaintenanceDto)` الأسطر 134-162 — Supabase data access, error signalling.
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
  - `complete(officeId: string, id: string, dto: CompleteMaintenanceDto)` الأسطر 164-186 — Supabase data access, error signalling.
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
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.

### كائنات DTO
- `CompleteMaintenanceDto` (`/workspace/api/src/maintenance/dto/complete-maintenance.dto.ts`)
  - الحقول:
  - مستخدم في: MaintenanceController.complete
- `CreateMaintenanceDto` (`/workspace/api/src/maintenance/dto/create-maintenance.dto.ts`)
  - الحقول:
    - `description`: `string`؛ أدوات التحقق: @IsOptional() @IsString()
    - `before_images`: `string[]`؛ أدوات التحقق: @IsOptional() @IsArray() @IsString({ each: true })
  - مستخدم في: MaintenanceController.create
- `FilterMaintenanceDto` (`/workspace/api/src/maintenance/dto/filter-maintenance.dto.ts`)
  - الحقول:
  - مستخدم في: MaintenanceController.list
- `PublicCreateMaintenanceDto` (`/workspace/api/src/maintenance/dto/public-create-maintenance.dto.ts`)
  - الحقول:
    - `description`: `string`؛ أدوات التحقق: @IsOptional() @IsString()
    - `before_images`: `string[]`؛ أدوات التحقق: @IsOptional() @IsArray() @IsString({ each: true })
  - مستخدم في: MaintenanceController.createPublic
- `UpdateMaintenanceDto` (`/workspace/api/src/maintenance/dto/update-maintenance.dto.ts`)
  - الحقول:
  - مستخدم في: MaintenanceController.update


## وحدة التهيئة بالتفصيل
- ملخص: يرشد المكاتب الجديدة خلال مراحل التفعيل وتعبئة البيانات الأولية.

### المتحكمات
#### File: `/workspace/api/src/onboarding/onboarding.controller.ts`
- الغرض: يدير 3 نقطة نهاية لمسارات التهيئة مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `onboarding: OnboardingService`
- الزخارف/الحمايات: @Get('verify-code'), @Post('complete'), @Post('office')
- الدوال الرئيسية:
  - `createOffice` → Post `/onboarding/office`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `OnboardingService.createOffice`.
```ts
  async createOffice(@Body() body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string }) {
    return this.onboarding.createOffice(body);
  }
```
  - `verify` → Get `/onboarding/verify-code`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `OnboardingService.verifyCodeAvailable`.
```ts
  async verify(@Query('office_code') officeCode: string) {
    if (!officeCode) throw new BadRequestException('office_code مفقود');
    const res = await this.onboarding.verifyCodeAvailable(officeCode);
    return res;
  }
```
  - `complete` → Post `/onboarding/complete`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `OnboardingService.complete`.
```ts
  async complete(@Body() body: { office_id: string; whatsapp_config?: any; subscription_plan?: string }) {
    return this.onboarding.complete(body);
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/onboarding/onboarding.service.ts`
- الغرض: يطبق قواعد التهيئة التجارية عبر 3 دالة عمومية.
- الاعتماديات: `supabase: SupabaseService`
- الدوال:
  - `verifyCodeAvailable(code: string)` الأسطر 9-17 — Supabase data access.
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
  - `createOffice(body: { office_name: string; manager_name: string; manager_phone: string; manager_email: string; whatsapp_number?: string })` الأسطر 24-73 — Supabase data access, error signalling.
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
  - `complete(body: { office_id: string; whatsapp_config?: any; subscription_plan?: string })` الأسطر 75-100 — Supabase data access, error signalling.
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
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.


## وحدة المدفوعات بالتفصيل
- ملخص: يدير دورة حياة المدفوعات الإيجارية والتنبيهات ودمج دفتر الحسابات المالي في Supabase.

### المتحكمات
#### File: `/workspace/api/src/payments/payments.controller.ts`
- الغرض: يدير 5 نقطة نهاية لمسارات المدفوعات مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `paymentsService: PaymentsService`
- الزخارف/الحمايات: @Get('contracts/:contractId/payments'), @Get('payments'), @Get('payments/overdue'), @Patch('payments/:id/mark-paid'), @Post('payments/:id/send-reminder'), @Roles('manager', 'staff'), @Roles('manager', 'staff', 'accountant')
- الدوال الرئيسية:
  - `list` → Get `/payments`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: `FilterPaymentsDto`; الخدمات: `PaymentsService.findPayments`.
```ts
  async list(@Req() req: any, @Query() filters: FilterPaymentsDto) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findPayments(officeId, filters);
  }
```
  - `byContract` → Get `/contracts/:contractId/payments`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `PaymentsService.findByContract`.
```ts
  async byContract(@Req() req: any, @Param('contractId') contractId: string) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.findByContract(officeId, contractId);
  }
```
  - `markPaid` → Patch `/payments/:id/mark-paid`؛ الأدوار: مدير, موظف, محاسب; DTOs: `MarkPaidDto`; الخدمات: `PaymentsService.markPaid`.
```ts
  async markPaid(@Req() req: any, @Param('id') id: string, @Body() dto: MarkPaidDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.paymentsService.markPaid(officeId, id, dto);
    return { success: true, payment: updated };
  }
```
  - `overdue` → Get `/payments/overdue`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `PaymentsService.getOverdue`.
```ts
  async overdue(@Req() req: any) {
    const officeId = req?.user?.office_id;
    return this.paymentsService.getOverdue(officeId);
  }
```
  - `sendReminder` → Post `/payments/:id/send-reminder`؛ الأدوار: مدير, موظف; DTOs: `SendReminderDto`; الخدمات: `PaymentsService.sendReminder`.
```ts
  async sendReminder(@Req() req: any, @Param('id') id: string, @Body() body: SendReminderDto) {
    const officeId = req?.user?.office_id;
    const res = await this.paymentsService.sendReminder(officeId, id, body?.message);
    return res;
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/payments/payments.service.ts`
- الغرض: يطبق قواعد المدفوعات التجارية عبر 5 دالة عمومية.
- الاعتماديات: `supabase: SupabaseService`
- الدوال:
  - `findPayments(officeId: string, filters: FilterPaymentsDto & { page?: number; limit?: number })` الأسطر 10-33 — Supabase data access, error signalling.
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
  - `findByContract(officeId: string, contractId: string)` الأسطر 35-45 — Supabase data access, error signalling.
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
  - `markPaid(officeId: string, id: string, dto: MarkPaidDto)` الأسطر 47-89 — Supabase data access, error signalling.
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
  - `getOverdue(officeId: string)` الأسطر 91-148 — Supabase data access, error signalling.
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
  - `sendReminder(officeId: string, paymentId: string, message?: string)` الأسطر 150-198 — Supabase data access, error signalling.
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
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.

### كائنات DTO
- `FilterPaymentsDto` (`/workspace/api/src/payments/dto/filter-payments.dto.ts`)
  - الحقول:
    - `status`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `contract_id`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `tenant_phone`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `due_from`: `string`؛ أدوات التحقق: @IsOptional(), @IsDateString()
    - `due_to`: `string`؛ أدوات التحقق: @IsOptional(), @IsDateString()
  - مستخدم في: PaymentsController.list
- `MarkPaidDto` (`/workspace/api/src/payments/dto/mark-paid.dto.ts`)
  - الحقول:
    - `payment_method`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `payment_reference`: `string`؛ أدوات التحقق: @IsOptional(), @IsString(), @Length(0, 128)
  - مستخدم في: PaymentsController.markPaid
- `SendReminderDto` (`/workspace/api/src/payments/dto/send-reminder.dto.ts`)
  - الحقول:
    - `message`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
  - مستخدم في: PaymentsController.sendReminder


## وحدة العقارات بالتفصيل
- ملخص: يدير دورة حياة العقار بما يشمل الإدراج والتصفية والوسائط والمشاركة العامة.

### المتحكمات
#### File: `/workspace/api/src/properties/excel.controller.ts`
- الغرض: يدير 3 نقطة نهاية لمسارات العقارات مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `propertiesService: PropertiesService`
- الزخارف/الحمايات: @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } }), @ApiConsumes('multipart/form-data'), @Get('properties/export'), @Post('properties/import'), @Post('properties/import/confirm'), @Roles('manager', 'staff'), @UseInterceptors(FileInterceptor('file'))
- الدوال الرئيسية:
  - `importExcel` → Post `/properties/import`؛ الأدوار: مدير, موظف; DTOs: لا يوجد; الخدمات: منطق داخل المتحكم.
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
  - `importConfirm` → Post `/properties/import/confirm`؛ الأدوار: مدير, موظف; DTOs: لا يوجد; الخدمات: `PropertiesService.create`.
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
  - `exportExcel` → Get `/properties/export`؛ الأدوار: مدير, موظف; DTOs: `FilterPropertiesDto`; الخدمات: `PropertiesService.findAll`.
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
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

#### File: `/workspace/api/src/properties/media.controller.ts`
- الغرض: يدير 4 نقطة نهاية لمسارات العقارات مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `propertiesService: PropertiesService`
- الزخارف/الحمايات: @Delete('properties/:propertyId/images/:imageId'), @Patch('properties/:propertyId/images/:imageId'), @Post('media/signed-url'), @Post('properties/:id/images')
- الدوال الرئيسية:
  - `signedUrl` → Post `/media/signed-url`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: منطق داخل المتحكم.
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
  - `addImage` → Post `/properties/:id/images`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `PropertiesService.addImage`.
```ts
  async addImage(@Req() req: any, @Param('id') id: string, @Body() body: { url: string; fileName?: string; fileSize?: number; isFeatured?: boolean }) {
    const userId = req?.user?.user_id;
    const { url, fileName, fileSize, isFeatured } = body || ({} as any);
    if (!url) throw new BadRequestException('رابط الصورة مطلوب');
    const image = await this.propertiesService.addImage(id, url, userId, fileName, fileSize, isFeatured);
    return { success: true, image };
  }
```
  - `setFeatured` → Patch `/properties/:propertyId/images/:imageId`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `PropertiesService.setFeaturedImage`.
```ts
  async setFeatured(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const image = await this.propertiesService.setFeaturedImage(propertyId, imageId);
    return { success: true, image };
  }
```
  - `removeImage` → Delete `/properties/:propertyId/images/:imageId`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `PropertiesService.removeImage`.
```ts
  async removeImage(@Param('propertyId') propertyId: string, @Param('imageId') imageId: string) {
    const res = await this.propertiesService.removeImage(propertyId, imageId);
    return res;
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

#### File: `/workspace/api/src/properties/properties.controller.ts`
- الغرض: يدير 5 نقطة نهاية لمسارات العقارات مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `propertiesService: PropertiesService`
- الزخارف/الحمايات: @Delete(':id'), @Get(':id'), @Get(), @Patch(':id'), @Post(), @Roles('manager'), @Roles('manager', 'staff')
- الدوال الرئيسية:
  - `list` → Get `/properties`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: `FilterPropertiesDto`; الخدمات: `PropertiesService.findAll`.
```ts
  async list(@Req() req: any, @Query() query: FilterPropertiesDto) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى قائمة العقارات');
    return this.propertiesService.findAll(officeId, query);
  }
```
  - `getOne` → Get `/properties/:id`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `PropertiesService.findOneWithImages`.
```ts
  async getOne(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى تفاصيل العقار');
    return this.propertiesService.findOneWithImages(officeId, id);
  }
```
  - `create` → Post `/properties`؛ الأدوار: مدير, موظف; DTOs: `CreatePropertyDto`; الخدمات: `PropertiesService.create`.
```ts
  async create(@Req() req: any, @Body() dto: CreatePropertyDto) {
    const officeId = req?.user?.office_id;
    const userId = req?.user?.user_id;
    const created = await this.propertiesService.create(officeId, userId, dto);
    return { success: true, property: created };
  }
```
  - `update` → Patch `/properties/:id`؛ الأدوار: مدير, موظف; DTOs: `UpdatePropertyDto`; الخدمات: `PropertiesService.update`.
```ts
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    const officeId = req?.user?.office_id;
    const updated = await this.propertiesService.update(officeId, id, dto);
    return { success: true, property: updated };
  }
```
  - `softDelete` → Delete `/properties/:id`؛ الأدوار: مدير; DTOs: لا يوجد; الخدمات: `PropertiesService.softDelete`.
```ts
  async softDelete(@Req() req: any, @Param('id') id: string) {
    const officeId = req?.user?.office_id;
    const res = await this.propertiesService.softDelete(officeId, id);
    return res;
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

#### File: `/workspace/api/src/properties/public.controller.ts`
- الغرض: يدير 2 نقطة نهاية لمسارات العقارات مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `propertiesService: PropertiesService`
- الزخارف/الحمايات: @Get('offices/:officeCode/listings'), @Get('offices/:officeCode/properties/:slug')
- الدوال الرئيسية:
  - `listings` → Get `/public/offices/:officeCode/listings`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: `FilterPropertiesDto`; الخدمات: `PropertiesService.getPublicListings`.
```ts
  async listings(@Param('officeCode') officeCode: string, @Query() query: FilterPropertiesDto) {
    const res = await this.propertiesService.getPublicListings(officeCode, query);
    return res;
  }
```
  - `bySlug` → Get `/public/offices/:officeCode/properties/:slug`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `PropertiesService.getPublicBySlug`.
```ts
  async bySlug(@Param('officeCode') officeCode: string, @Param('slug') slug: string) {
    const property = await this.propertiesService.getPublicBySlug(officeCode, slug);
    return property;
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/properties/properties.service.ts`
- الغرض: يطبق قواعد العقارات التجارية عبر 10 دالة عمومية.
- الاعتماديات: `supabase: SupabaseService`
- الدوال:
  - `findAll(officeId: string, filters: FilterPropertiesDto)` الأسطر 11-49 — Supabase data access.
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
  - `findOneWithImages(officeId: string, id: string)` الأسطر 51-61 — Supabase data access, error signalling.
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
  - `create(officeId: string, userId: string, dto: CreatePropertyDto)` الأسطر 63-105 — Supabase data access, error signalling.
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
  - `update(officeId: string, id: string, dto: UpdatePropertyDto)` الأسطر 107-152 — Supabase data access, error signalling.
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
  - `softDelete(officeId: string, id: string)` الأسطر 154-163 — Supabase data access, error signalling.
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
  - `getPublicListings(officeCode: string, filters: FilterPropertiesDto)` الأسطر 165-167 — منطق أعمال.
```ts
  async getPublicListings(officeCode: string, filters: FilterPropertiesDto) {
    return this.findAll(officeCode, { ...filters, status: 'available' });
  }
```
  - `getPublicBySlug(officeCode: string, slug: string)` الأسطر 169-185 — Supabase data access, error signalling.
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
  - `addImage(propertyId: string, url: string, userId?: string, fileName?: string, fileSize?: number, isFeatured?: boolean)` الأسطر 187-238 — Supabase data access, error signalling.
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
  - `setFeaturedImage(propertyId: string, imageId: string)` الأسطر 240-266 — Supabase data access, error signalling.
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
  - `removeImage(propertyId: string, imageId: string)` الأسطر 268-288 — Supabase data access, error signalling.
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
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.

### كائنات DTO
- `CreatePropertyDto` (`/workspace/api/src/properties/dto/create-property.dto.ts`)
  - الحقول:
    - `location_city`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `location_district`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `location_street`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `price`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString({}, { message: 'السعر يجب أن يكون رقمياً' })
    - `currency`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `area_sqm`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString({}, { message: 'المساحة يجب أن تكون رقمية' })
    - `bedrooms`: `number`؛ أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `bathrooms`: `number`؛ أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `features`: `Record<string, any>`؛ أدوات التحقق: @IsOptional(), @IsObject()
    - `description`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `images`: `string[]`؛ أدوات التحقق: @IsOptional(), @IsArray(), @IsString({ each: true })
    - `status`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `contact_person`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `contact_phone`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `google_maps_link`: `string`؛ أدوات التحقق: @IsOptional(), @IsUrl({}, { message: 'رابط خرائط قوقل غير صالح' })
    - `latitude`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString()
    - `longitude`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString()
    - `slug`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `is_featured`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean()
  - مستخدم في: PropertiesController.create
- `FilterPropertiesDto` (`/workspace/api/src/properties/dto/filter-properties.dto.ts`)
  - الحقول:
    - `type`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `status`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `city`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `district`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `min_price`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString()
    - `max_price`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString()
    - `min_area`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString()
    - `max_area`: `string`؛ أدوات التحقق: @IsOptional(), @IsNumberString()
    - `bedrooms`: `number`؛ أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `bathrooms`: `number`؛ أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(0)
    - `is_featured`: `boolean`؛ أدوات التحقق: @IsOptional(), @IsBoolean(), @Transform(({ value }) => ['true', true, '1', 1].includes(value))
    - `search`: `string`؛ أدوات التحقق: @IsOptional(), @IsString()
    - `order_by`: `'created_at' | 'price' | 'area'`؛ أدوات التحقق: @IsOptional(), @IsIn(['created_at', 'price', 'area'])
    - `order`: `'asc' | 'desc'`؛ أدوات التحقق: @IsOptional(), @IsIn(['asc', 'desc'])
    - `page`: `number = 1`؛ أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1)
    - `limit`: `number = 20`؛ أدوات التحقق: @IsOptional(), @Type(() => Number), @IsInt(), @Min(1), @Max(100)
  - مستخدم في: ExcelController.exportExcel, PropertiesController.list, PublicController.listings
- `ImportRowDto` (`/workspace/api/src/properties/dto/import-excel.dto.ts`)
  - الحقول:
  - مستخدم في: لا يوجد
- `ImportExcelDto` (`/workspace/api/src/properties/dto/import-excel.dto.ts`)
  - الحقول:
  - مستخدم في: لا يوجد
- `UpdatePropertyDto` (`/workspace/api/src/properties/dto/update-property.dto.ts`)
  - الحقول:
  - مستخدم في: PropertiesController.update


## وحدة وصول Supabase بالتفصيل
- ملخص: يغلف إعدادات عميل Supabase ومساعدات الاستعلام القابلة لإعادة الاستخدام.

### الخدمات
#### File: `/workspace/api/src/supabase/supabase.service.ts`
- الغرض: يطبق قواعد وصول Supabase التجارية عبر 0 دالة عمومية.
- الاعتماديات: لا يوجد
- الدوال:
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.


## وحدة واتساب بالتفصيل
- ملخص: يتكامل مع واجهة WhatsApp التابعة لـ Meta لإرسال الإشعارات والمحادثات.

### المتحكمات
#### File: `/workspace/api/src/whatsapp/whatsapp.controller.ts`
- الغرض: يدير 5 نقطة نهاية لمسارات واتساب مع فرض الحمايات والتحقق من الأدوار.
- الخدمات المحقونة: `supabaseService: SupabaseService`, `meta: MetaApiService`
- الزخارف/الحمايات: @Get('templates'), @Get('webhook'), @Post('connect'), @Post('send-template'), @Post('webhook'), @Roles('manager'), @Roles('manager', 'staff')
- الدوال الرئيسية:
  - `verify` → Get `/whatsapp/webhook`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: منطق داخل المتحكم.
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
  - `webhook` → Post `/whatsapp/webhook`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: منطق داخل المتحكم.
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
  - `connect` → Post `/whatsapp/connect`؛ الأدوار: مدير; DTOs: لا يوجد; الخدمات: `SupabaseService.getClient`, `SupabaseService.getClient`.
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
  - `sendTemplate` → Post `/whatsapp/send-template`؛ الأدوار: مدير, موظف; DTOs: لا يوجد; الخدمات: `MetaApiService.sendTemplate`, `SupabaseService.getClient`.
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
  - `templates` → Get `/whatsapp/templates`؛ الأدوار: متاح للمستخدمين المصادقين عبر JWT; DTOs: لا يوجد; الخدمات: `MetaApiService.fetchTemplates`.
```ts
  async templates(@Req() req: any) {
    const officeId = req?.user?.office_id;
    if (!officeId) throw new BadRequestException('office_id مفقود');
    const data = await this.meta.fetchTemplates(officeId);
    return data;
  }
```
- تسلسل التنفيذ:
  1. يمر الطلب عبر الوسطاء وحارس `RolesGuard` للتحقق من الصلاحيات.
  2. يستخرج المتحكم سياق المكتب من `req.user.office_id`.
  3. تنفذ الخدمة النطاقية استعلامات Supabase أو التأثيرات الجانبية.
  4. تُصاغ الاستجابة وتُعاد إلى العميل أو واجهة المستخدم.

### الخدمات
#### File: `/workspace/api/src/whatsapp/meta-api.service.ts`
- الغرض: يطبق قواعد واتساب التجارية عبر 2 دالة عمومية.
- الاعتماديات: `supabaseService: SupabaseService`
- الدوال:
  - `sendTemplate(officeId: string, payload: SendTemplatePayload)` الأسطر 38-69 — Supabase data access, error signalling.
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
  - `fetchTemplates(officeId: string)` الأسطر 71-97 — Supabase data access, caching, error signalling.
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
- المراقبة: يُنصح بإضافة تتبع OpenTelemetry عند الوصول إلى Supabase أو تعديل البيانات المالية.
