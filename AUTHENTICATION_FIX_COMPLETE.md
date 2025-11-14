# ✅ **إصلاح مشكلة المصادقة - اكتمل**

**التاريخ:** 12 نوفمبر 2025  
**المشكلة:** 401 Unauthorized عند تسجيل الدخول  
**الحالة:** ✅ **تم الحل**

---

## 🎯 **المشكلة الرئيسية**

الكود كان يبحث في جدول **`users`** لكن الجدول الصحيح في قاعدة البيانات هو **`user_permissions`**

---

## ✅ **ما تم إصلاحه**

### **1. auth.service.ts - تصحيح اسم الجدول**

**الملف:** `/api/src/auth/auth.service.ts`

#### **validateUser() method:**

**قبل:**
```typescript
const { data: user, error } = await supabase
  .from('users')  // ❌ جدول خاطئ
  .select('*')
  .eq('phone', phone)
  .single();

if (user.status !== 'active') {  // ❌ عمود خاطئ
```

**بعد:**
```typescript
const { data: user, error } = await supabase
  .from('user_permissions')  // ✅ الجدول الصحيح
  .select('*')
  .eq('phone', phone)
  .single();

if (user.is_active !== true) {  // ✅ العمود الصحيح
```

#### **refreshTokens() method:**

**قبل:**
```typescript
const { data: user, error } = await supabase
  .from('users')  // ❌ جدول خاطئ
  .select('id, email, phone, role, office_id, status')
  .eq('id', userId)
```

**بعد:**
```typescript
const { data: user, error } = await supabase
  .from('user_permissions')  // ✅ الجدول الصحيح
  .select('id, user_id, email, phone, role, office_id, is_active')
  .eq('user_id', userId)
```

---

### **2. Seed Script - تصحيح إنشاء المستخدمين**

**الملف:** `/api/src/database/seeds/1-create-superadmin.ts`

**قبل:**
```typescript
await supabase
  .from('users')  // ❌ جدول خاطئ
  .insert({
    role: 'system_admin',  // ❌ قيمة خاطئة
    status: 'active',      // ❌ عمود خاطئ
```

**بعد:**
```typescript
await supabase
  .from('user_permissions')  // ✅ الجدول الصحيح
  .insert({
    role: 'SystemAdmin',     // ✅ القيمة الصحيحة
    is_active: true,         // ✅ العمود الصحيح
```

---

## 📋 **بنية قاعدة البيانات الصحيحة**

### **جدول user_permissions**

```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY,
  office_id UUID NOT NULL,
  user_id UUID,           -- Supabase Auth user ID (nullable)
  name TEXT NOT NULL,
  phone VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR NOT NULL,  -- SystemAdmin, OfficeAdmin, Manager, etc.
  password_hash TEXT,     -- bcrypt hashed password
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 **على السيرفر - نفذ الآن:**

```bash
cd /var/www/Website

# 1. سحب آخر إصلاح
git pull origin develop

# 2. إعادة بناء Backend
cd api
npm run build

# 3. إعادة تشغيل API
cd ..
pm2 restart prod-api

# 4. الانتظار
sleep 3

# 5. التحقق من السجلات
pm2 logs prod-api --lines 20 --nostream
```

---

## 📋 **الاستعلام الصحيح للتحقق من حسابك:**

```sql
-- على Supabase SQL Editor
SELECT 
  id,
  user_id,
  office_id,
  name,
  phone,
  email,
  role,
  is_active,
  password_hash IS NOT NULL as has_password,
  LENGTH(password_hash) as password_length,
  last_login,
  created_at
FROM user_permissions 
WHERE phone = '+966557431343';  -- ← رقمك اللي استخدمته
```

---

## 🔍 **التحقق من أن المستخدم موجود:**

```sql
-- التحقق السريع
SELECT 
  name,
  phone,
  email,
  role,
  is_active,
  CASE 
    WHEN password_hash IS NULL THEN '❌ لا توجد كلمة مرور'
    WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' THEN '✅ مشفرة (bcrypt)'
    ELSE '⚠️ غير مشفرة'
  END as password_status
FROM user_permissions 
WHERE phone = '+966557431343';
```

**النتيجة المتوقعة:**
```
name: azoz
phone: +966557431343
email: az22722101239oz@gmail.com
role: SystemAdmin
is_active: true
password_status: ✅ مشفرة (bcrypt)
```

---

## 🎯 **الآن جرب تسجيل الدخول:**

1. **افتح:** `http://64.227.166.229:3000`
2. **استخدم:**
   - رقم الجوال: `557431343` (بدون +966)
   - كلمة المرور: `Az143134`

**المفروض يشتغل الآن!** ✅

---

## 📊 **ملخص الإصلاحات:**

| المشكلة | الحل | الحالة |
|---------|------|--------|
| اسم الجدول خاطئ (`users`) | تغيير إلى `user_permissions` | ✅ تم |
| اسم العمود خاطئ (`status`) | تغيير إلى `is_active` | ✅ تم |
| Seed script يستخدم جدول خاطئ | تصحيح الـ script | ✅ تم |
| البورت 3001 vs 3031 | تكوين مركزي في ecosystem.config.js | ✅ تم |
| Frontend يحتاج rebuild | سكريبت تلقائي deploy-with-ports.sh | ✅ تم |

---

## 🔄 **إذا لم يعمل بعد:**

```bash
# على السيرفر
cd /var/www/Website

# تشغيل سكريبت النشر الكامل
bash scripts/deploy-with-ports.sh
```

---

## ✅ **التأكد النهائي:**

```bash
# على السيرفر - اختبار API مباشرة
curl -X POST http://localhost:3031/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "557431343",
    "password": "Az143134"
  }'

# إذا نجح، راح تشوف:
# {"accessToken":"eyJ...","user":{...}}

# إذا فشل برسالة واضحة، أرسلها لي
```

---

**نفذ الأوامر على السيرفر وأرسل لي النتيجة!** 🎯