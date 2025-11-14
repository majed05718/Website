# 🔐 **الدليل النهائي للمصادقة - Final Authentication Guide**

**التاريخ:** 12 نوفمبر 2025  
**الحالة:** ✅ **جاهز للاستخدام**

---

## ✅ **بنية قاعدة البيانات الصحيحة**

### **الجدول: `user_permissions`**

```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL,
  user_id UUID,                    -- Supabase Auth UUID (nullable)
  name VARCHAR NOT NULL,
  phone VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR NOT NULL,           -- SystemAdmin, OfficeAdmin, Manager, etc.
  password_hash TEXT NOT NULL,     -- bcrypt hashed
  is_active BOOLEAN DEFAULT TRUE,  -- ✅ استخدم is_active (ليس status)
  permissions JSONB,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **الأعمدة المهمة:**
- ✅ `phone` - رقم الجوال (مع +966)
- ✅ `password_hash` - كلمة المرور المشفرة (bcrypt)
- ✅ `is_active` - الحالة (true/false)
- ✅ `role` - الصلاحية (SystemAdmin, OfficeAdmin, Manager, etc.)

---

## 📋 **الاستعلام الصحيح للتحقق من حسابك:**

```sql
-- في Supabase SQL Editor
SELECT 
  id,
  office_id,
  user_id,
  name,
  phone,
  email,
  role,
  is_active,
  password_hash IS NOT NULL as has_password,
  CASE 
    WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' 
    THEN '✅ مشفرة bcrypt'
    ELSE '❌ غير مشفرة'
  END as password_status,
  last_login,
  created_at
FROM user_permissions 
WHERE phone = '+966557431343';  -- ← حط رقمك الكامل
```

**النتيجة المتوقعة:**
```
name: azoz
phone: +966557431343
email: az22722101239oz@gmail.com
role: SystemAdmin
is_active: true
has_password: true
password_status: ✅ مشفرة bcrypt
```

---

## 🚀 **على السيرفر - نفذ هذه الأوامر:**

```bash
cd /var/www/Website

# 1. سحب آخر إصلاح (مهم جداً!)
git pull origin develop

# 2. إعادة بناء API
cd api
npm run build

# 3. إعادة تشغيل API
cd ..
pm2 restart prod-api

# 4. الانتظار
sleep 5

# 5. التحقق من السجلات
pm2 logs prod-api --lines 30 --nostream
```

---

## 🧪 **اختبار تسجيل الدخول من Terminal:**

```bash
# على السيرفر
curl -X POST http://localhost:3031/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "557431343",
    "password": "Az143134"
  }' -v
```

### **النتيجة المتوقعة (نجاح):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "azoz",
    "phone": "+966557431343",
    "email": "az22722101239oz@gmail.com",
    "role": "SystemAdmin",
    "office_id": "uuid-here"
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

### **رسائل الخطأ المحتملة:**

#### **1. المستخدم غير موجود:**
```json
{"statusCode": 401, "message": "رقم الجوال أو كلمة المرور غير صحيحة"}
```
**الحل:** تأكد من رقم الجوال في SQL

#### **2. كلمة المرور خاطئة:**
```json
{"statusCode": 401, "message": "رقم الجوال أو كلمة المرور غير صحيحة"}
```
**الحل:** تأكد من كلمة المرور

#### **3. المستخدم غير نشط:**
```json
{"statusCode": 401, "message": "حساب المستخدم غير نشط"}
```
**الحل:** نفذ هذا SQL:
```sql
UPDATE user_permissions SET is_active = true WHERE phone = '+966557431343';
```

---

## 🎯 **تسجيل الدخول من المتصفح:**

1. **افتح:** `http://64.227.166.229:3000`
2. **أدخل البيانات:**
   - رقم الجوال: `557431343` (بدون +966 في الواجهة)
   - كلمة المرور: `Az143134`
3. **اضغط:** تسجيل الدخول

---

## 🔍 **إذا ظهر خطأ "يجب تسجيل الدخول":**

هذا يعني المشكلة في:
1. **JWT Token غير صحيح** - تحقق من JWT_SECRET في .env
2. **CORS مشكلة** - تحقق من ALLOWED_ORIGINS
3. **Backend غير شغال** - تحقق من `pm2 list`

### **التحقق من Backend:**
```bash
# تحقق من أن API يعمل
curl http://localhost:3031/health

# المفروض يطلع:
# {"status":"ok","environment":"production","port":3031}
```

### **التحقق من CORS:**
```bash
# في logs API، شوف سطر CORS Origins
pm2 logs prod-api --lines 50 --nostream | grep "CORS Origins"

# المفروض يطلع:
# 🔒 CORS Origins: http://64.227.166.229:3000, http://64.227.166.229, https://64.227.166.229
```

---

## 🔧 **إصلاح مشكلة "انتهت صلاحية الجلسة":**

هذي المشكلة تظهر لما:
1. **Access Token منتهي** (عمره 15 دقيقة)
2. **Refresh Token مو موجود** (HttpOnly cookie)

### **الحل:**
```bash
# امسح كل الـ cookies و localStorage
# في المتصفح Console (F12):
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

# ثم أعد تحميل الصفحة
location.reload();
```

---

## 📊 **ملخص التغييرات في الكود:**

### **1. auth.service.ts**
```typescript
// ✅ الآن صحيح
async validateUser(phone: string, password: string) {
  const { data: user } = await supabase
    .from('user_permissions')  // ✅
    .eq('phone', phone);
  
  if (!user.is_active) {  // ✅
    throw new UnauthorizedException();
  }
}
```

### **2. Seed Script**
```typescript
// ✅ الآن صحيح
await supabase
  .from('user_permissions')  // ✅
  .insert({
    role: 'SystemAdmin',     // ✅
    is_active: true,         // ✅
    user_id: null,           // ✅
  });
```

---

## ✅ **قائمة التحقق النهائية:**

على السيرفر:
- [ ] `git pull origin develop` - سحب آخر كود
- [ ] `cd api && npm run build` - بناء API
- [ ] `pm2 restart prod-api` - إعادة تشغيل
- [ ] `pm2 logs prod-api` - التحقق من السجلات
- [ ] `curl http://localhost:3031/health` - اختبار API

على Supabase:
- [ ] تنفيذ استعلام التحقق من المستخدم
- [ ] التأكد من `is_active = true`
- [ ] التأكد من `password_hash` موجود
- [ ] التأكد من `role = 'SystemAdmin'`

في المتصفح:
- [ ] مسح localStorage
- [ ] مسح cookies
- [ ] إعادة تحميل الصفحة
- [ ] تسجيل الدخول

---

## 🆘 **إذا لم ينجح:**

**أرسل لي:**
1. نتيجة استعلام SQL على `user_permissions`
2. نتيجة `curl` للاختبار
3. سجلات `pm2 logs prod-api --err --lines 50`
4. لقطة شاشة من Console في المتصفح (F12)

---

**نفذ الأوامر الآن وأخبرني بالنتيجة!** 🚀
