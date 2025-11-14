# ✅ إعداد PM2 مكتمل - PM2 Setup Complete

## 📋 ملخص المشكلة - Problem Summary

### المشاكل التي تم حلها:
1. ❌ **الواجهة (Frontend) لم تكن مبنية** - Dependencies غير مثبتة
2. ❌ **الخلفية (Backend/API) لم تكن مبنية** - ملف `dist/main.js` غير موجود
3. ❌ **PM2 يستخدم وضع Cluster** - مما سبب مشاكل في المنافذ
4. ❌ **المنافذ غير محددة بشكل صريح** - في PM2 configuration

---

## ✅ الحلول المطبقة - Solutions Applied

### 1. بناء الواجهة (Frontend Build)
```bash
cd /var/www/Website/Web
npm install
npm run build
```

### 2. بناء الخلفية (Backend Build)
```bash
cd /var/www/Website/api
npm install
npm run build
```

### 3. تعديل إعدادات PM2
تم تغيير `exec_mode` من `cluster` إلى `fork` وإضافة المنافذ بشكل صريح:

**ملف:** `ecosystem.config.js`

```javascript
{
  name: 'prod-api',
  exec_mode: 'fork',  // ← تم التغيير من cluster
  env: {
    NODE_ENV: 'production',
    PORT: 3001,       // ← تم الإضافة
  }
}

{
  name: 'prod-frontend',
  exec_mode: 'fork',  // ← تم التغيير من cluster
  env: {
    NODE_ENV: 'production',
    PORT: 3000,       // ← تم الإضافة
  }
}
```

---

## 🚀 حالة الخدمات - Services Status

### الخدمات العاملة الآن:

```bash
┌────┬──────────────────┬─────────┬──────────┬───────────┐
│ id │ name             │ mode    │ pid      │ status    │
├────┼──────────────────┼─────────┼──────────┼───────────┤
│ 0  │ prod-api         │ fork    │ 6221     │ ✅ online │
│ 1  │ prod-frontend    │ fork    │ 6222     │ ✅ online │
└────┴──────────────────┴─────────┴──────────┴───────────┘
```

### اختبار الخدمات:

#### ✅ Backend (API)
```bash
curl http://localhost:3001/health
# النتيجة:
{
  "status": "ok",
  "timestamp": "2025-11-11T12:57:04.399Z",
  "environment": "production",
  "port": 3001
}
```

#### ✅ Frontend
```bash
curl -I http://localhost:3000
# النتيجة: HTTP/1.1 307 Temporary Redirect
# يتم التوجيه إلى صفحة تسجيل الدخول ✅
```

---

## 📝 أوامر PM2 المفيدة - Useful PM2 Commands

### إدارة العمليات:
```bash
# عرض حالة جميع العمليات
pm2 list

# عرض السجلات
pm2 logs
pm2 logs prod-api
pm2 logs prod-frontend

# إعادة تشغيل
pm2 restart prod-api
pm2 restart prod-frontend
pm2 restart all

# إيقاف
pm2 stop prod-api
pm2 stop all

# حذف العمليات
pm2 delete prod-api
pm2 delete all

# حفظ التكوين
pm2 save

# معلومات تفصيلية عن عملية
pm2 show prod-api
pm2 monit
```

### بدء الخدمات:
```bash
# بدء خدمات الإنتاج فقط
pm2 start ecosystem.config.js --only prod-api,prod-frontend

# بدء خدمات التطوير فقط
pm2 start ecosystem.config.js --only dev-api,dev-frontend

# بدء جميع الخدمات
pm2 start ecosystem.config.js
```

---

## 🌐 المنافذ المستخدمة - Ports Configuration

| الخدمة | المنفذ | البيئة | الحالة |
|--------|--------|--------|---------|
| **prod-api** | 3001 | Production | ✅ يعمل |
| **prod-frontend** | 3000 | Production | ✅ يعمل |
| **dev-api** | 3002 | Development | غير مشغل |
| **dev-frontend** | 8088 | Development | غير مشغل |

---

## 🔄 إعداد البدء التلقائي - Auto-start Setup

لتشغيل PM2 تلقائياً عند إعادة تشغيل الخادم:

```bash
# توليد سكريبت البدء التلقائي
pm2 startup

# تشغيل الأمر الذي يظهر (مثال):
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u azozsu --hp /home/azozsu

# حفظ القائمة الحالية
pm2 save
```

---

## 📊 المراقبة والصيانة - Monitoring & Maintenance

### مراقبة الموارد:
```bash
# واجهة المراقبة التفاعلية
pm2 monit

# معلومات النظام
pm2 info prod-api

# استخدام الذاكرة
pm2 list
```

### تنظيف السجلات:
```bash
# مسح السجلات
pm2 flush

# إعادة تحميل السجلات
pm2 reloadLogs
```

---

## 🛠️ استكشاف الأخطاء - Troubleshooting

### إذا لم تعمل الخدمات:

1. **تحقق من السجلات:**
```bash
pm2 logs prod-api --lines 50
pm2 logs prod-frontend --lines 50
```

2. **تحقق من البناء:**
```bash
# للـ API
ls -la /var/www/Website/api/dist/main.js

# للـ Frontend
ls -la /var/www/Website/Web/.next
```

3. **أعد البناء إذا لزم الأمر:**
```bash
# إعادة بناء API
cd /var/www/Website/api && npm run build

# إعادة بناء Frontend
cd /var/www/Website/Web && npm run build
```

4. **أعد تشغيل الخدمات:**
```bash
pm2 restart all
```

### إذا كان المنفذ مستخدماً:
```bash
# اعرف ما يستخدم المنفذ
sudo netstat -tulpn | grep :3001
sudo lsof -i :3001

# أوقف العملية القديمة
sudo kill -9 <PID>
```

---

## 📝 ملاحظات مهمة - Important Notes

1. **وضع Fork vs Cluster:**
   - تم استخدام `fork` بدلاً من `cluster` لتجنب مشاكل المنافذ
   - `fork` يعمل بشكل أفضل مع NestJS و Next.js في هذا الإعداد

2. **المتغيرات البيئية:**
   - يتم قراءة المتغيرات من `/var/www/Website/api/.env.production`
   - يتم تحديد المنافذ في `ecosystem.config.js`

3. **الأمان:**
   - تأكد من تغيير `JWT_SECRET` في `.env.production`
   - تحديث `ALLOWED_ORIGINS` بالنطاقات الصحيحة

---

## ✨ النتيجة النهائية - Final Result

### ✅ جميع الخدمات تعمل بنجاح!

- **Backend API:** http://localhost:3001 ✅
- **Frontend:** http://localhost:3000 ✅
- **PM2 Status:** All services online ✅
- **Auto-restart:** Enabled ✅

---

## 📅 التاريخ
- **تاريخ الإعداد:** 2025-11-11
- **آخر تحديث:** 2025-11-11 12:57 UTC

---

تم بحمد الله! 🎉
