# الرؤية الإستراتيجية وخارطة الطريق

- **تاريخ التوليد**: 2025-11-09 19:56 UTC
- **الهدف**: تحديد مسار التطور نحو قابلية التوسع والمرونة والقدرات المتقدمة.

## مسارات التوسع
- إعادة تنظيم الأحادية إلى أحادية معيارية عبر تجميع الوحدات الميزة وتسجيلها بشكل كسول من `app.module.ts`.
- إدخال طبقات تخزين مؤقت (Redis أو وظائف Supabase الطرفية) تغلف `PropertiesService.findAll` و`CustomersService.findAll` لتقليل التصفية المكثفة.
- تحضير حدود الخدمات المصغرة للمدفوعات والإشعارات عبر تغليف واجهات الخدمة واعتماد وسطاء الرسائل مثل NATS أو RabbitMQ.
- تنفيذ خيارات تقسيم قاعدة البيانات بفصل أحمال التحليلات إلى نسخ قراءة في Supabase والإبقاء على معاملات OLTP في الخادم الرئيسي.
- تعزيز المعالجة الخلفية بتبني طوابير متينة (BullMQ) لمهام استيراد Excel ودفعات تصنيف العملاء وتخمينات التقييم.
- توحيد إدارة الإعدادات عبر مخططات المتغيرات البيئية وتدوير الأسرار المدعوم بـ `ENV_TEMPLATE_BACKEND.env`.

## دمج الميزات المستقبلية
### التقييم العقاري المدعوم بالذكاء الاصطناعي
- إضافة `ValuationService` مخصصة تجمع بيانات Supabase التاريخية (`properties`, `contracts`, `rental_payments`) مع تغذية سوقية خارجية.
- تصميم واجهة REST `/properties/:id/valuation` يديرها `ValuationsController` جديد يفوض إلى مهام تقدير غير متزامنة.
- تدريب نماذج التعلم الآلي (مثل Gradient Boosting أو Transformers) خارجياً وتخزين النماذج في Supabase واستهلاكها عبر وظائف طرفية.
- تحديث `/Web/src/components/properties/PropertyCard.tsx` لإظهار نطاقات التقييم ونسب الثقة وأوقات التحديث.
- بناء دورة تغذية راجعة بتسجيل التعديلات اليدوية من مديري العقارات وإدخالها في إعادة التدريب.
### تصنيف العملاء المحتملين تلقائياً
- توسيع نطاق وحدة العملاء بخدمة `LeadScoringService` تجمع التفاعلات والملاحظات ونتائج المواعيد لكل ملف عميل.
- تخزين الدرجات في جدول Supabase جديد `customer_lead_scores` مع تتبع تاريخي لضمان الشفافية.
- عرض نقاط التصنيف عبر واجهات `CustomersController` (`GET /customers/:id/lead-score`) وفي لوحات التحليلات تحت `/Web/src/dashboard/analytics`.
- دمج مشغلات الإشعارات مع تدفقات واتساب لإبلاغ مندوبي المبيعات عند ظهور عملاء ذوي أولوية عالية.
- توفير تمثيل بصري داخل مكونات `CustomerDetail` المستقبلية لشرح مساهمة كل تفاعل.

## الوضع الحالي لكل وحدة
### بصمة وحدة التحليلات
- الوصف: يُجمع روتينات التحليلات في Supabase لتغذية لوحات المتابعة ومؤشرات الأداء والتقارير التنفيذية.
- المتحكمات: `AnalyticsController` (5 نقطة نهاية).
- الخدمات: `AnalyticsService` (6 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: تخزين مؤقت للتجميعات المكلفة في لوحة التحكم والنظر في المشاهد المادية للاتجاهات الشهرية.

### بصمة وحدة app
- الوصف: وحدة `app` تجمع منطقاً متخصصاً.
- المتحكمات: لا يوجد (0 نقطة نهاية).
- الخدمات: لا يوجد (0 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: `ExecutiveDashboardPage`، `EditAppointmentPage`، `AppointmentDetailsPage`، `NewAppointmentPage`، `AppointmentsPage`، `ContractsPage`، `EditCustomerPage`، `CustomerDetailsPage`، `CustomersExportPage`، `NewCustomerPage`، `CustomersPage`، `handleExport`، `CustomersTemplatesPage`، `FinancePage`، `DashboardLayout`، `MaintenancePage`، `DashboardPage`، `PaymentsPage`، `PropertyDetailsPage`، `ExportPropertiesPage`، `ImportPropertiesPage`، `NewPropertyPage`، `PropertiesPage`، `SettingsPage`، `metadata`، `RootLayout`، `LoginPage`، `Home`، `PublicMaintenancePage`.
- نقاط مراقبة التوسع: مراقبة أداء استعلامات Supabase وزمن الاستجابة لضمان النمو المستدام.

### بصمة وحدة المواعيد
- الوصف: ينسق جدولة المواعيد والتحقق من التوفر ومسارات الإكمال لمواعيد الموظفين.
- المتحكمات: `AppointmentsController` (13 نقطة نهاية).
- الخدمات: `AppointmentsService` (14 دالة جوهرية).
- كائنات DTO: `CancelAppointmentDto`، `CheckAvailabilityDto`، `CompleteAppointmentDto`، `CreateAppointmentDto`، `FilterAppointmentsDto`، `UpdateAppointmentDto`، `UpdateStatusDto`.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: فرض فترات زمنية فريدة لكل موظف لتفادي تعارضات Supabase أثناء الحجز المتوازي.

### بصمة وحدة components
- الوصف: وحدة `components` تجمع منطقاً متخصصاً.
- المتحكمات: لا يوجد (0 نقطة نهاية).
- الخدمات: لا يوجد (0 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: `GoalsTracking`، `KPIsGrid`، `MarketInsights`، `RevenueBreakdown`، `SalesFunnel`، `SummaryCards`، `TopPerformers`، `AppointmentCalendar`، `AppointmentCard`، `AppointmentDetailsCard`، `AppointmentForm`، `AppointmentStats`، `AppointmentsFilters`، `AppointmentsList`، `CancelDialog`، `CompleteDialog`، `QuickAddDialog`، `StatusUpdateDialog`، `ContractCard`، `ContractsFilters`، `ContractsTable`، `StatsCards`، `AddInteractionDialog`، `AddNoteDialog`، `CustomerCard`، `CustomerContractsList`، `CustomerFilters`، `CustomerForm`، `CustomerInfoCard`، `CustomerInteractionsList`، `CustomerNotesList`، `CustomerPagination`، `CustomerPropertiesList`، `CustomerStats`، `ColumnSelector`، `ExportHistory`، `ExportOptions`، `ExportPreview`، `ExportProgress`، `FormatOptions`، `CustomTemplateCreator`، `MyTemplates`، `TemplateCard`، `TemplatesGallery`، `Header`، `Sidebar`، `ActiveContractsTable`، `BudgetSection`، `CashFlowChart`، `DateRangeFilter`، `ExpensesDonutChart`، `KPICards`، `ProfitLossStatementComponent`، `ReportGenerator`، `RevenueChart`، `RevenuePieChart`، `TopPropertiesTable`، `NotificationsPanel`، `MaintenanceStats`، `RequestsTable`، `BulkActions`، `OverdueAlerts`، `PaymentCharts`، `PaymentFiltersComponent`، `PaymentStats`، `PaymentsTable`، `QuickActions`، `StatsCards`، `PropertiesFilters`، `PropertiesPagination`، `PropertyCard`، `ColumnMapper`، `DataPreview`، `ExcelUploader`، `ImportProgress`، `ValidationSummary`.
- نقاط مراقبة التوسع: مراقبة أداء استعلامات Supabase وزمن الاستجابة لضمان النمو المستدام.

### بصمة وحدة العملاء
- الوصف: يوفر قدرات إدارة علاقات العملاء بما يشمل الملاحظات والتفاعلات وربط العقارات ودفقات الاستيراد/التصدير عبر Excel.
- المتحكمات: `CustomersController`، `ExcelController` (16 نقطة نهاية).
- الخدمات: `CustomersService`، `ExcelService` (16 دالة جوهرية).
- كائنات DTO: `CreateCustomerInteractionDto`، `CreateCustomerNoteDto`، `CreateCustomerDto`، `CustomerFiltersDto`، `ExportCustomersDto`، `ExportTemplateDto`، `FilterCustomersDto`، `ColumnMappingDto`، `ImportCustomersDto`، `PreviewImportDto`، `LinkPropertyDto`، `UpdateCustomerNoteDto`، `UpdateCustomerDto`.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: تقسيم مهام التصدير/الاستيراد إلى طوابير خلفية لحماية زمن استجابة HTTP.

### بصمة وحدة الصحة
- الوصف: يُظهر فحوصات الجاهزية والصحة لتنظيم البنية التحتية.
- المتحكمات: `HealthController` (0 نقطة نهاية).
- الخدمات: لا يوجد (0 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: مراقبة أداء استعلامات Supabase وزمن الاستجابة لضمان النمو المستدام.

### بصمة وحدة التكاملات
- الوصف: يربط الأتمتة (مثل n8n) والأنظمة الخارجية مع المنصة الأساسية.
- المتحكمات: لا يوجد (0 نقطة نهاية).
- الخدمات: `N8nService` (0 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: مراقبة أداء استعلامات Supabase وزمن الاستجابة لضمان النمو المستدام.

### بصمة وحدة الصيانة
- الوصف: يتتبع طلبات الصيانة ومسارات الفنيين ونماذج الإدخال العامة.
- المتحكمات: `MaintenanceController` (6 نقطة نهاية).
- الخدمات: `MaintenanceService` (6 دالة جوهرية).
- كائنات DTO: `CompleteMaintenanceDto`، `CreateMaintenanceDto`، `FilterMaintenanceDto`، `PublicCreateMaintenanceDto`، `UpdateMaintenanceDto`.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: توسيع تعيين الفنيين عبر إضافة فهارس للحالات وفصل الطلبات العامة.

### بصمة وحدة التهيئة
- الوصف: يرشد المكاتب الجديدة خلال مراحل التفعيل وتعبئة البيانات الأولية.
- المتحكمات: `OnboardingController` (3 نقطة نهاية).
- الخدمات: `OnboardingService` (3 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: مراقبة أداء استعلامات Supabase وزمن الاستجابة لضمان النمو المستدام.

### بصمة وحدة المدفوعات
- الوصف: يدير دورة حياة المدفوعات الإيجارية والتنبيهات ودمج دفتر الحسابات المالي في Supabase.
- المتحكمات: `PaymentsController` (5 نقطة نهاية).
- الخدمات: `PaymentsService` (5 دالة جوهرية).
- كائنات DTO: `FilterPaymentsDto`، `MarkPaidDto`، `SendReminderDto`.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: منع الكتابة المزدوجة عبر تغليف تحديثات Supabase ضمن معاملات حالما تصبح متاحة.

### بصمة وحدة العقارات
- الوصف: يدير دورة حياة العقار بما يشمل الإدراج والتصفية والوسائط والمشاركة العامة.
- المتحكمات: `ExcelController`، `MediaController`، `PropertiesController`، `PublicController` (14 نقطة نهاية).
- الخدمات: `PropertiesService` (10 دالة جوهرية).
- كائنات DTO: `CreatePropertyDto`، `FilterPropertiesDto`، `ImportRowDto`، `ImportExcelDto`، `UpdatePropertyDto`.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: إدخال نسخ قراءة أو عروض مخزنة مؤقتاً للتعامل مع التصفية الكثيفة في قنوات القوائم.

### بصمة وحدة وصول Supabase
- الوصف: يغلف إعدادات عميل Supabase ومساعدات الاستعلام القابلة لإعادة الاستخدام.
- المتحكمات: لا يوجد (0 نقطة نهاية).
- الخدمات: `SupabaseService` (0 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: مراقبة أداء استعلامات Supabase وزمن الاستجابة لضمان النمو المستدام.

### بصمة وحدة واتساب
- الوصف: يتكامل مع واجهة WhatsApp التابعة لـ Meta لإرسال الإشعارات والمحادثات.
- المتحكمات: `WhatsAppController` (5 نقطة نهاية).
- الخدمات: `MetaApiService` (2 دالة جوهرية).
- كائنات DTO: لا يوجد.
- مكونات الواجهة الأمامية: لا يوجد.
- نقاط مراقبة التوسع: تنظيم معدل المحادثات الصادرة وتخزين حالة الرسائل لاستعادة الحالة عند إعادة محاولات الويبهوك.

## خارطة المبادرات الإستراتيجية
### المرحلة 1 – الأساس (0-3 أشهر)
- إتمام إعادة الهيكلة المعيارية، إدخال التخزين المؤقت، وتوثيق العقود داخل `/Project_Documentation/AR/ADD_AR.md`.
- إنشاء فحوصات جودة بيانات آلية على جداول Supabase عبر وظائف مجدولة.
- نشر منظومة مراقبة (OpenTelemetry وتسجيلات منظمة).
### المرحلة 2 – الذكاء (3-6 أشهر)
- إطلاق الإصدار الأول من التقييم الذكي ولوحات معاينة تصنيف العملاء.
- تشغيل تدفقات واتساب المرتبطة بدرجات العملاء المحتملين.
- توسيع تقارير التحليلات بمؤشرات تنبؤية ونماذج توقع.
### المرحلة 3 – النظام البيئي (6-12 شهراً)
- فصل المدفوعات إلى خدمة مصغرة مع تتبع أحداث لأغراض التدقيق.
- توفير واجهات شركاء للوسطاء وت嵌يد عناصر مخصصة باستخدام Edge Middleware في Next.js.
- تعزيز الحوكمة متعددة المستأجرين والفوترة والتقارير الالتزامية الآلية.

## مصفوفة المخاطر
### مخاطر تقنية
- حدود معدل Supabase أثناء التحليلات المكثفة — الحل عبر التخزين المؤقت ونسخ القراءة.
- انجراف نماذج التقييم — فرض إعادة تدريب ربع سنوية ولوحات مراقبة.
- تضخم حزم الواجهة الأمامية — تطبيق تقسيم الشيفرة حسب الصفحات ومراجعة المكونات المشتركة.
### مخاطر تنظيمية
- إدارة التغيير لفرق المبيعات مع اعتماد التصنيف الآلي — إطلاق ورش تمكين.
- الاعتمادية على التكاملات الخارجية (n8n، واتساب) — توفير قنوات بديلة ومراقبة اتفاقيات الخدمة.
- تسريع تأهيل الموظفين — استخدام `Codebase_Deep_Dive_AR.md` ودوارات البرمجة الثنائية.
### مخاطر البيانات والامتثال
- تدفق بيانات حساسة إلى مسارات الذكاء الاصطناعي — تطبيق إخفاء الهوية وتتبّع الموافقات.
- ضمان الاستعداد لـ GDPR/CCPA عبر سياسات الاحتفاظ المرمزة في قواعد أمان Supabase.
- الحفاظ على سجلات تدقيق لتعديلات التقييم متاحة للمراجعين.

## مؤشرات النجاح وقياسات الأداء
- زمن استجابة واجهة `/properties` أقل من 250 مللي ثانية وسطياً.
- زيادة نسبة تحويل العملاء المحتملين إلى مبيعات بمعدل 15٪ بعد إطلاق التصنيف الآلي.
- تغطية تقييم آلي بنسبة 90٪ من محفظة العقارات النشطة.
- خفض الاستيراد اليدوي عبر Excel بنسبة 60٪ بفضل الأتمتة الخلفية.
- زمن معالجة تذاكر الدعم أقل من 24 ساعة بدعم مسارات الصيانة.

## الجاهزية التشغيلية
- إعداد أدلة تشغيل تغطي النشر والتراجع وتصعيد الحوادث.
- اعتماد استراتيجية نشر زرقاء/خضراء باستخدام الحاويات (Docker + ECS/Kubernetes).
- ترسيخ مراجعات الأمان وفحص الاعتماديات ضمن خطوط CI.
- توسيع الاختبارات الآلية لتغطية حالات استيراد العقارات واسترجاعات التحليلات.

## الخطوات التالية العاجلة
- إقرار ميثاق حوكمة البيانات ومزامنة المعنيين حول معالم ميزات الذكاء الاصطناعي.
- تجهيز عنقود Redis للتجارب مع التخزين المؤقت وقياس أداء التصفية الكثيفة.
- توثيق حدود الخدمات المصغرة المرشحة وإعداد مسودات تجريبية للترحيل.
- جدولة مراجعات تصميمية مشتركة لتجربة التقييم ونتائج تصنيف العملاء.

---
