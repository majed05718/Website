# 🗄️ دليل إعداد قاعدة البيانات

## المشكلة المكتشفة

جداول قاعدة البيانات الأساسية **غير موجودة** في Supabase:
- ❌ `user_permissions` (جدول المستخدمين)
- ❌ `offices` (جدول المكاتب)
- ❌ `properties` (جدول العقارات)
- ❌ `refresh_tokens` (جداول المصادقة)

## ✅ الحل الكامل (خطوة بخطوة)

### الخطوة 1: إنشاء جداول قاعدة البيانات

#### الطريقة 1: عبر Supabase Dashboard (موصى بها)

1. **افتح SQL Editor في Supabase:**
   ```
   https://app.supabase.com/project/mbpznkqyeofxluqwybyo/sql/new
   ```

2. **انسخ محتوى ملف `/workspace/create-database-schema.sql`**

3. **الصق الكود في SQL Editor**

4. **اضغط "Run"** أو `Ctrl+Enter`

5. **تحقق من النتيجة:**
   - يجب أن ترى: "Success. No rows returned"
   - اذهب إلى Table Editor وتحقق من وجود الجداول

#### الطريقة 2: عبر سطر الأوامر (إذا كان لديك psql)

```bash
# افتح ملف SQL
cat /workspace/create-database-schema.sql

# أو استخدم psql مباشرة (احصل على connection string من Supabase)
psql "postgresql://postgres:[YOUR-PASSWORD]@db.mbpznkqyeofxluqwybyo.supabase.co:5432/postgres" \
  -f /workspace/create-database-schema.sql
```

---

### الخطوة 2: تشغيل سكريبت إنشاء المدير

بعد إنشاء الجداول، شغّل:

```bash
cd /var/www/Website/api

npm run seed:superadmin -- \
  --email="az22722101239oz@gmail.com" \
  --password="Az143134" \
  --name="azoz" \
  --phone="+966557431343"
```

---

## 📋 الجداول التي سيتم إنشاؤها

### 1. `offices`
- معلومات المكاتب العقارية
- الاشتراكات والخطط
- إعدادات WhatsApp

### 2. `user_permissions`
- حسابات المستخدمين
- الصلاحيات والأدوار
- كلمات المرور المشفرة

### 3. `properties`
- قوائم العقارات
- التفاصيل والمواصفات

### 4. `refresh_tokens`
- رموز المصادقة JWT

---

## ✅ التحقق من نجاح الإنشاء

### عبر Supabase Dashboard:

1. اذهب إلى: **Table Editor**
2. يجب أن ترى الجداول:
   - ✅ offices
   - ✅ user_permissions
   - ✅ properties
   - ✅ refresh_tokens

### عبر SQL:

```sql
-- التحقق من وجود الجداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('offices', 'user_permissions', 'properties', 'refresh_tokens');
```

---

## 🆘 إذا واجهت مشاكل

### مشكلة: "permission denied"

**الحل:**
- تأكد أنك مسجل دخول بحساب Owner في Supabase
- أو استخدم service_role key في الاتصال

### مشكلة: "table already exists"

**الحل:**
```sql
-- احذف الجداول القديمة (احذر: يحذف البيانات!)
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS offices CASCADE;

-- ثم شغّل السكريبت مرة أخرى
```

### مشكلة: "syntax error"

**الحل:**
- تأكد من نسخ الملف كاملاً
- تأكد من عدم وجود أحرف غريبة

---

## 📌 ملاحظات مهمة

### اسم الجدول الصحيح:
- ❌ `users` (خطأ)
- ✅ `user_permissions` (صحيح)

### أعمدة office:
- ❌ `whatsapp_number` (خطأ)
- ✅ `whatsapp_phone_number` (صحيح)

### أعمدة user:
- ✅ `is_active` (موجود)
- ❌ `status` (غير موجود في Entity)

---

## 🎯 الخطوات السريعة (نسخ ولصق)

```bash
# 1. افتح SQL Editor في Supabase
# https://app.supabase.com/project/mbpznkqyeofxluqwybyo/sql/new

# 2. انسخ محتوى هذا الملف:
cat /workspace/create-database-schema.sql

# 3. الصق في SQL Editor واضغط Run

# 4. بعد النجاح، شغّل:
cd /var/www/Website/api
npm run seed:superadmin -- \
  --email="az22722101239oz@gmail.com" \
  --password="Az143134" \
  --name="azoz" \
  --phone="+966557431343"
```

---

## ✅ النتيجة المتوقعة

```
════════════════════════════════════════════════════════════
  🔐 SuperAdmin User Seeder
════════════════════════════════════════════════════════════

🔗 Connecting to Supabase...
🔍 Checking if user already exists...
🏢 Checking for system office...
🏢 Creating system office...
✅ System office created
🔒 Hashing password...
👤 Creating superadmin user...

════════════════════════════════════════════════════════════
  ✅ SuperAdmin User Created Successfully!
════════════════════════════════════════════════════════════
User Details:
  ID:        xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  Email:     az22722101239oz@gmail.com
  Name:      azoz
  Role:      system_admin
════════════════════════════════════════════════════════════

🎉 You can now login with these credentials!
```

---

**تم التحديث:** 2025-11-11  
**الحالة:** ✅ جاهز للتنفيذ
