# خطة تنفيذ التغييرات (CIP)

- **آخر تحديث**: 2025-11-09 20:30 UTC  
- **المالك**: المهندس الرئيسي ومدير العمليات التقنية  
- **الدافع**: تراجع في الأداء التشغيلي — صفحة `/dashboard` تحتاج 15–25 ثانية للتحميل بسبب تأخر تهيئة الواجهة، مع الحاجة إلى بيئة تجريبية (Staging) صلبة قبل أي تطوير إضافي.  
- **النطاق**: نظام إدارة العقارات (واجهة Next.js، واجهة برمجية NestJS، قاعدة بيانات Supabase). هذه الخطة تحل محل أي لوائح سابقة؛ يجب أن تتماشى جميع الوثائق المساندة (SRS، ADD، DDD، خارطة الطريق) مع المراحل الموضحة أدناه.

---

## المرحلة الأولى: الاستقرار وإعداد البيئات (أولوية فورية)

### 1.1 تحليل السبب الجذري ومعالجة بطء تحميل الصفحة

**العراض في الإنتاج**  
- ظهور شاشة التحميل “جاري التحميل...” لمدة 15–25 ثانية عند زيارة `/dashboard`.  
- سجلات `pm2 logs frontend` تُظهر محاولات Axios متكررة وتحذيرات متعلقة بالتهيئة.  
- انخفاض تقييم Lighthouse إلى 58 (شبكة Fast 3G) مع وصول وقت التفاعل إلى ≈ 28 ثانية.

**خطة التشخيص**  
1. الدخول إلى الخادم وتشغيل `pm2 logs frontend --lines 200` لرصد مدة التهيئة والأخطاء.  
2. تسجيل جلسة أداء في Chrome DevTools (قسم Performance) مع إبطاء CPU ×4 وشبكة Fast 3G.  
3. محليًا: تنفيذ `cd Web && npm run build && ANALYZE=true next build` (بعد تنفيذ §2.1) لفحص حجم الحِزم؛ الهدف أن يكون حجم حزمة صفحة لوحة التحكم أقل من 160 كيلوبايت.  
4. استخدام React Profiler للتأكد من أن `DashboardLayout` يعرض شاشة الانتظار قبل ظهور المكونات الفعلية.  
5. مقارنة زمن استجابة استعلامات Supabase مع بيئة التجارب بعد إعدادها (§1.2).

**النتيجة (مصدر الحقيقة)**  
- الملف `Web/src/app/dashboard/layout.tsx` يعتمد على متغير `mounted` ونتيجة `useAuthStore().isAuthenticated()` قبل عرض المحتوى، مما يفرض إظهار شاشة الانتظار في كل مرة.  
- الملف `Web/src/store/auth-store.ts` يستخدم إضافة `persist` في Zustand دون تتبع لحالة التهيئة، لذا يبقى `isAuthenticated()` مساويًا للقيمة `false` إلى أن تكتمل التهيئة على المتصفح.  
- الملف `Web/src/lib/api.ts` يقوم بتسجيل كل الطلبات والاستجابات حتى في بيئة الإنتاج، مما يزيد الحمل على المتصفحات والأجهزة الضعيفة.

**خطوات المعالجة**

1. إضافة حالة تهيئة صريحة في مخزن المصادقة:

```ts
// Web/src/store/auth-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,
      setAuth: (user, token) => set({ user, token }),
      logout: () => { /* منطق الخروج الحالي */ },
      markHydrated: () => set({ hydrated: true }),
      isAuthenticated: () => Boolean(get().token && get().user),
    }),
    {
      name: 'auth-storage',
      storage: typeof window !== 'undefined'
        ? createJSONStorage(() => localStorage)
        : undefined,
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
)
```

2. عرض الهيكل العام مباشرة ثم إعادة التوجيه بعد اكتمال التهيئة:

```tsx
// Web/src/app/dashboard/layout.tsx
const hydrated = useAuthStore((s) => s.hydrated)
const isAuthed = useAuthStore((s) => s.isAuthenticated())

useEffect(() => {
  if (hydrated && !isAuthed) router.replace('/login')
}, [hydrated, isAuthed, router])

if (!hydrated) {
  return <FullScreenSpinner message="تهيئة الجلسة ..." />
}
```

3. إيقاف تسجيل الطلبات في بيئة الإنتاج:

```ts
if (process.env.NODE_ENV !== 'production') {
  console.log('📤 Request:', config.method?.toUpperCase(), config.url)
}
```

**التحقق**  
- زمن أول رسم للمحتوى (FCP) ≤ 2.5 ثانية، وزمن التفاعل (TTI) ≤ 4 ثوانٍ في بيئة التجارب.  
- درجة Lighthouse ≥ 80 على شبكة Fast 3G.  
- سجلات `pm2` تؤكد اكتمال التهيئة خلال 400 مللي ثانية دون محاولات Axios متكررة.

---

### 1.2 تطبيق منهج احترافي لعمليات التطوير DevOps

#### 1.2.1 استراتيجية Git — فرعا `main` و `develop`

```
git checkout -B main origin/main            # التأكد من وجود الفرع محليًا
git push origin main:main                    # تفعيل الفرع المحمي
git checkout -B develop main
git push -u origin develop                   # ربط الفرع البعيد
git branch --set-upstream-to=origin/develop develop
git config branch.main.mergeoptions '--no-ff'
```

- `main`: للنشر الإنتاجي فقط، مع وسم الإصدارات (`vX.Y.Z`) والتحقق الإلزامي من الحالة.  
- `develop`: بيئة التجارب، يتم النشر تلقائيًا عند الدمج.  
- فروع الميزات: `feature/{ticket}-{summary}`، مع دمج Squash إلى `develop`.  
- إصلاحات عاجلة: `hotfix/{ticket}` تنطلق من `main` وتُدمج في `main` و `develop`.  
- الفحوصات الضرورية قبل الدمج: `npm run test`, `npm run lint`, `npm run type-check`, تقارير Lighthouse، اختبارات الدخان للواجهة البرمجية، وتجربة ترحيل Supabase.

#### 1.2.2 تجهيز خادم التجارب (`/var/www/real-estate-dev`)

```
sudo adduser --disabled-password devops
sudo mkdir -p /var/www/real-estate/{shared,staging/releases}
sudo chown -R devops:devops /var/www/real-estate
sudo apt-get update && sudo apt-get install -y nginx git nodejs npm pm2
sudo npm install -g pm2@latest
sudo -u devops ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519

sudo -u devops bash <<'EOF'
cd /var/www/real-estate/staging/releases
git clone git@github.com:ORG/real-estate-management.git 2025-11-09-01
ln -sfn 2025-11-09-01 ../current
cd ../current
git checkout develop
npm ci --workspace api --workspace Web
npm run --workspace api build
npm run --workspace Web build
cp /var/www/real-estate/shared/env/backend.staging api/.env.staging
cp /var/www/real-estate/shared/env/frontend.staging Web/.env.staging
EOF

pm2 start ecosystem.dev.config.js --env staging
pm2 save
```

- ضبط Nginx لدعم `staging.example.com` (منفذ الواجهة 4300) و `api-staging.example.com` (منفذ الواجهة البرمجية 4301) مع شهادات TLS عبر `certbot`.  
- إنشاء مهمة مجدولة لمراقبة عمليات PM2 حتى يتم بناء خط نشر آلي.  
- توثيق تفاصيل الخادم في `infra/staging.md` (حسابات، مفاتيح، العمليات الجارية).

---

### 1.3 إعداد التهيئة المعتمدة على البيئة

**الأهداف**  
- التبديل بين الإنتاج والتجارب بأمر واحد.  
- استخدام ملفات `.env` لكل بيئة مع تخزين آمن للأسرار.  
- ضمان أن PM2 يقرأ الإعداد الصحيح تلقائيًا.

1. **ملفات البيئة**  
   - الواجهة البرمجية: `api/config/env/.env.production`، `.env.staging`، `.env.test`.  
   - الواجهة الأمامية: `Web/config/env/.env.production`، `.env.staging`، `.env.local`.  
   - نسخ الخادم: `/var/www/real-estate/shared/env/{backend,frontend}.{production|staging}` مع صلاحيات `600`.

2. **تهيئة الواجهة البرمجية (`api/src/app.module.ts`)**

```ts
ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  expandVariables: true,
  envFilePath: [
    `config/env/.env.${process.env.APP_ENV ?? 'production'}`,
    'config/env/.env.local',
  ],
})
```

3. **تهيئة الواجهة الأمامية (`Web/next.config.js`)**

```js
const env = process.env.NEXT_PUBLIC_APP_ENV ?? 'production'
const apiUrl = env === 'staging'
  ? process.env.NEXT_PUBLIC_STAGING_API_URL
  : process.env.NEXT_PUBLIC_PROD_API_URL

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  compiler: { removeConsole: env === 'production' },
  env: {
    NEXT_PUBLIC_APP_ENV: env,
    NEXT_PUBLIC_API_URL: apiUrl,
  },
})
```

4. **تعريفات PM2**

`ecosystem.prod.config.js`

```js
module.exports = {
  apps: [
    {
      name: 'api-prod',
      cwd: '/var/www/real-estate/production/current/api',
      script: 'dist/main.js',
      env_production: {
        APP_ENV: 'production',
        NODE_ENV: 'production',
        CONFIG_PATH: '/var/www/real-estate/shared/env/backend.production',
      },
      interpreter_args: '-r dotenv/config dotenv_config_path=$CONFIG_PATH',
    },
    {
      name: 'web-prod',
      cwd: '/var/www/real-estate/production/current/Web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000 -H 0.0.0.0',
      env_production: {
        APP_ENV: 'production',
        NODE_ENV: 'production',
        NEXT_PUBLIC_PROD_API_URL: 'https://api.example.com',
      },
    },
  ],
}
```

`ecosystem.dev.config.js`

```js
module.exports = {
  apps: [
    {
      name: 'api-staging',
      cwd: '/var/www/real-estate/staging/current/api',
      script: 'dist/main.js',
      env_staging: {
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        CONFIG_PATH: '/var/www/real-estate/shared/env/backend.staging',
      },
      interpreter_args: '-r dotenv/config dotenv_config_path=$CONFIG_PATH',
    },
    {
      name: 'web-staging',
      cwd: '/var/www/real-estate/staging/current/Web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4300 -H 0.0.0.0',
      env_staging: {
        APP_ENV: 'staging',
        NODE_ENV: 'production',
        NEXT_PUBLIC_STAGING_API_URL: 'https://api-staging.example.com',
      },
    },
  ],
}
```

**التبديل بين البيئات**

```
pm2 reload ecosystem.prod.config.js --env production
pm2 reload ecosystem.dev.config.js --env staging
```

تشغيل `pm2 startup systemd` ثم `pm2 save` لضمان استمرار العمليات بعد إعادة التشغيل.

---

## المرحلة الثانية: تحسين الأداء على بيئة التجارب

### 2.1 التحليل والأدوات

1. **إضافة محلل الحزم**

```
cd Web
npm install --save-dev @next/bundle-analyzer
```

تعديل `Web/package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

2. **تشغيل التقارير** — `NEXT_PUBLIC_APP_ENV=staging npm run analyze` وتخزين النتائج في `docs/perf/dashboard-bundle.html`.  
3. **اختبارات Lighthouse** — `npx @shopify/lighthouse-ci https://staging.example.com/dashboard --preset=perf --collect.numberOfRuns=3`.  
4. **تتبع الواجهة البرمجية** — تفعيل `pg_stat_statements` في Supabase وتشغيل `EXPLAIN (ANALYZE, BUFFERS)` للاستعلامات البطيئة وتوثيقها.

### 2.2 خطة فهارس الأداء للواجهة البرمجية

| الجدول | الأعمدة / الفهرس | السبب | أمر SQL |
| --- | --- | --- | --- |
| `properties` | `(office_id, status, created_at DESC)` | يخدم استعلام `PropertiesService.findAll` مع ترتيب حسب `created_at` | `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_office_status_created_at ON properties (office_id, status, created_at DESC);` |
| `properties` | `(office_id, location_city, location_district)` | دعم فلاتر المدينة والحي | `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_location ON properties (office_id, location_city, location_district);` |
| `properties` | `price`, `area_sqm`, `bedrooms`, `bathrooms` | تحسين الفلاتر الرقمية (`gte/lte`) | إنشاء فهارس متزامنة لكل عمود (`idx_properties_price`، إلخ). |
| `properties` (بحث) | فهرس GIN باستخدام `pg_trgm` على العنوان والوصف | التعامل مع البحث باستخدام `ILIKE` | `CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_search_trgm ON properties USING gin ((coalesce(title,'') || ' ' || coalesce(description,'')) gin_trgm_ops);` |
| `rental_payments` | `(office_id, status, due_date)` | استعلامات المدفوعات والحالات المتأخرة | `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rental_payments_office_status_due ON rental_payments (office_id, status, due_date);` |
| `rental_payments` | `(office_id, tenant_phone)` | البحث حسب رقم المستأجر للتذكير | `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rental_payments_tenant_phone ON rental_payments (office_id, tenant_phone);` |
| `appointments` | `(office_id, status, date)` | عرض التقويم والفرز حسب التاريخ | `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_office_status_date ON appointments (office_id, status, date);` |
| `payment_alerts` | `(office_id, is_sent)` | تنظيف تنبيهات المدفوعات | `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_alerts_office_sent ON payment_alerts (office_id, is_sent);` |

يجب تنفيذ الأوامر عبر محرر SQL في Supabase أو من خلال ترحيلات آلية، مع توثيق نتائج `EXPLAIN ANALYZE` (الهدف أقل من 50 مللي ثانية للجدول المكون من 50 ألف سجل).

### 2.3 خطة تحسين واجهة المستخدم (أهم 3 إجراءات)

1. **تحميل كسول لمكتبة الرسوم البيانية**

```tsx
// Web/src/app/dashboard/page.tsx
const SalesChart = dynamic(() => import('@/components/dashboard/SalesChart'), {
  ssr: false,
  loading: () => <SkeletonChart />,
})
```

نقل استيراد `Recharts` إلى مكون منفصل لتقليل حجم حزمة لوحة التحكم بنحو 200 كيلوبايت.

2. **استفادة من البث التدريجي (Streaming)**

```tsx
// Web/src/app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <DashboardSkeleton />
}
```

استغلال نمط البث في Next.js لعرض الهيكل فورًا بينما تُحمّل المكونات العميلية تدريجيًا.

3. **تأخير تحديث المرشحات (Debounce)**

```tsx
const [isPending, startTransition] = useTransition()
const deferredFilters = useDeferredValue(filters)

useEffect(() => {
  startTransition(() => fetchProperties(deferredFilters))
}, [deferredFilters])
```

استخدام `AbortController` داخل `fetchProperties` لإلغاء الطلبات القديمة وتجنب التباطؤ عند تغيير المرشحات (`Web/src/app/dashboard/properties/page.tsx`).

---

## المرحلة الثالثة: الأمن وسلامة البيانات

### 3.1 تعزيز أمان JWT

- تطبيق نموذج الوصول/التحديث (Access & Refresh Tokens) باستخدام مفاتيح غير متماثلة (RS256) وتخزين رموز التحديث مجزأة في جدول Supabase مخصص (`user_tokens`).  
- إرسال الرموز عبر ملفات تعريف الارتباط HttpOnly (مع `Secure` و `SameSite=Strict`).  
- إضافة معترض Axios يعيد محاولة الطلب بعد التحديث الصامت:

```ts
api.interceptors.response.use(undefined, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true
    await axios.post('/auth/refresh', {}, { withCredentials: true })
    return api(error.config)
  }
  return Promise.reject(error)
})
```

- إنشاء نقطة نهاية لإلغاء جميع الجلسات وتسجيل النشاط، وتطبيق حماية CSRF عبر رمز مزدوج.

### 3.2 سلامة البيانات

- الإبقاء على `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` في `api/src/main.ts`.  
- معالجة الثغرات في DTO:  
  - استخدام تعداد (Enum) صحيح في `CreateAppointmentDto`.  
  - إضافة التحقق المفقود في DTO للمدفوعات (المبلغ، تاريخ الاستحقاق، بيانات المستأجر).  
- إضافة اختبارات (Jest + Supertest) لحالات البيانات غير الصحيحة.  
- عكس سياسات RLS في Supabase لكل بيئة وتوثيق خطة تعزيز JWT في `docs/security/jwt-hardening.md`.

---

## الحوكمة والتواصل

- اجتماع يومي قصير (10 دقائق) لمتابعة الاستقرار حتى اكتمال المرحلة الثانية.  
- نشر لوحات مراقبة (Grafana) تعرض حجم الحزم، FCP، والـ P95 لاستجابات الواجهة البرمجية في بيئة التجارب.  
- تقديم تقرير أسبوعي يوضح الإنجازات، العوائق، ومؤشرات الأداء.  
- أي انحراف عن هذه الخطة يتطلب موافقة المهندس الرئيسي ومدير المنتج.

