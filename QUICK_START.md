# 🚀 Quick Start Guide

## ✅ تم إكمال Backend بنجاح!

تم إضافة وإكمال:
- ✅ **CustomersModule** - 15 endpoints
- ✅ **AppointmentsModule** - 14 endpoints  
- ✅ **Excel System** - موجود في PropertiesModule

---

## 📋 الخطوات السريعة للتشغيل

### 1️⃣ إعداد Supabase

قم بتنفيذ الـ SQL Schema في Supabase:

```bash
# افتح Supabase Dashboard → SQL Editor
# الصق محتوى ملف supabase_schema.sql
# اضغط Run
```

📄 الملف: `supabase_schema.sql`

---

### 2️⃣ إعداد Environment Variables

تأكد من وجود `.env` في مجلد `api/`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=3001
NODE_ENV=development
```

---

### 3️⃣ تشغيل Backend

```bash
cd api
npm install      # إذا لم يتم بعد
npm run start:dev
```

الخادم سيعمل على: `http://localhost:3001`

---

### 4️⃣ فتح Swagger Documentation

افتح المتصفح:
```
http://localhost:3001/api/docs
```

---

## 📚 الوثائق المتوفرة

1. **BACKEND_COMPLETION_REPORT.md** - تقرير مفصل عن كل ما تم إنجازه
2. **API_USAGE_GUIDE.md** - دليل شامل لاستخدام جميع الـ APIs مع أمثلة
3. **supabase_schema.sql** - SQL Schema للجداول المطلوبة
4. **QUICK_START.md** - هذا الملف (دليل البدء السريع)

---

## 🧪 اختبار الـ APIs

### باستخدام Swagger UI:

1. افتح `http://localhost:3001/api/docs`
2. اضغط **Authorize** في الأعلى
3. أدخل Bearer Token: `Bearer YOUR_JWT_TOKEN`
4. اختر أي endpoint واضغط **Try it out**
5. املأ البيانات المطلوبة
6. اضغط **Execute**

### باستخدام curl:

```bash
# مثال: قائمة العملاء
curl -X GET "http://localhost:3001/customers?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# مثال: إضافة عميل جديد
curl -X POST "http://localhost:3001/customers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "محمد أحمد",
    "phone": "+966501234567",
    "type": "buyer"
  }'
```

---

## 📊 الـ Modules المتوفرة

### ✅ CustomersModule

**Base Path:** `/customers`

**Endpoints:**
- List customers (with filters)
- Get customer stats
- Search customers
- Export to Excel
- Customer CRUD operations
- Customer notes management
- Customer interactions tracking
- Property linking

**للتفاصيل:** راجع `API_USAGE_GUIDE.md` → Customers API

---

### ✅ AppointmentsModule

**Base Path:** `/appointments`

**Endpoints:**
- List appointments (with filters)
- Get appointment stats
- Calendar view
- Today's appointments
- Upcoming appointments
- Appointment CRUD operations
- Status management
- Cancel/Complete appointments
- Send reminders
- Check availability

**للتفاصيل:** راجع `API_USAGE_GUIDE.md` → Appointments API

---

### ✅ Excel System (PropertiesModule)

**Base Path:** `/properties`

**Endpoints:**
- `/properties/import` - Import Excel
- `/properties/import/confirm` - Confirm import
- `/properties/export` - Export Excel

**للتفاصيل:** راجع `API_USAGE_GUIDE.md` → Excel System

---

## 🔐 Authentication

جميع الـ endpoints تتطلب JWT Token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### الأدوار (Roles):
- **manager**: كامل الصلاحيات
- **staff**: صلاحيات محدودة (بدون حذف)

---

## 🛠️ Troubleshooting

### ❌ المشكلة: "nest: not found"
**الحل:**
```bash
cd api
npm install
npx nest start
```

### ❌ المشكلة: Supabase connection error
**الحل:**
- تأكد من صحة `SUPABASE_URL` و `SUPABASE_SERVICE_KEY` في `.env`
- تأكد من تنفيذ `supabase_schema.sql`

### ❌ المشكلة: 401 Unauthorized
**الحل:**
- تأكد من وجود Bearer Token في الـ header
- تأكد من صلاحية الـ Token

### ❌ المشكلة: 404 Not Found
**الحل:**
- تأكد من تشغيل الـ server
- تأكد من استخدام الـ endpoint الصحيح
- راجع `API_USAGE_GUIDE.md`

---

## 📞 الدعم والمساعدة

### للمعلومات التفصيلية:

1. **فحص الأخطاء:**
   ```bash
   cd api
   npm run build
   ```

2. **مراجعة الـ logs:**
   ```bash
   npm run start:dev
   # راقب console logs
   ```

3. **اختبار Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```

### الملفات المرجعية:

- `BACKEND_COMPLETION_REPORT.md` - تقرير مفصل
- `API_USAGE_GUIDE.md` - أمثلة عملية
- `supabase_schema.sql` - قاعدة البيانات
- Swagger UI: `/api/docs` - توثيق تفاعلي

---

## ✨ المميزات الإضافية

### ✅ Features Implemented:

1. **Validation** - جميع DTOs مع class-validator
2. **Pagination** - لجميع list endpoints
3. **Filtering** - فلترة متقدمة
4. **Search** - بحث في عدة حقول
5. **Statistics** - dashboards إحصائية
6. **Excel Export** - تصدير للبيانات
7. **Error Handling** - معالجة شاملة للأخطاء
8. **CORS** - مضبوط للـ production/development
9. **Rate Limiting** - حماية من الإساءة
10. **Swagger Docs** - توثيق تفاعلي كامل
11. **TypeScript** - Type safety كامل
12. **Conflict Detection** - للمواعيد
13. **Role-Based Access** - تحكم في الصلاحيات

---

## 🎉 كل شيء جاهز!

Backend جاهز للاستخدام مع:
- ✅ 29 Endpoint جديد
- ✅ Validation كامل
- ✅ Error handling
- ✅ Documentation
- ✅ TypeScript
- ✅ Best practices

**ابدأ الاختبار الآن في Swagger UI!**

🔗 `http://localhost:3001/api/docs`
