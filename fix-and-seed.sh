#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# سكريبت إصلاح وتشغيل seed:superadmin
# ═══════════════════════════════════════════════════════════════

set -e  # إيقاف عند أي خطأ

echo "════════════════════════════════════════════════════════════"
echo "🔧 سكريبت إصلاح وإنشاء المدير"
echo "════════════════════════════════════════════════════════════"
echo ""

# تحديد المسار
API_PATH="/var/www/Website/api"

# التحقق من وجود المجلد
if [ ! -d "$API_PATH" ]; then
    echo "❌ خطأ: المجلد $API_PATH غير موجود"
    echo "   هل أنت على الخادم الصحيح؟"
    exit 1
fi

echo "✅ المجلد موجود: $API_PATH"
cd "$API_PATH"

# خطوة 1: تثبيت الحزم
echo ""
echo "📦 الخطوة 1: تثبيت الحزم المطلوبة..."
echo "────────────────────────────────────────────────────────────"
npm install --silent

if [ -f "node_modules/tsconfig-paths/package.json" ]; then
    echo "✅ tsconfig-paths مثبت بنجاح"
else
    echo "❌ فشل تثبيت tsconfig-paths"
    exit 1
fi

# خطوة 2: التحقق من ملف .env
echo ""
echo "🔍 الخطوة 2: التحقق من ملف .env..."
echo "────────────────────────────────────────────────────────────"

if [ ! -f ".env" ]; then
    if [ -f ".env.development" ]; then
        cp .env.development .env
        echo "✅ تم إنشاء .env من .env.development"
    else
        echo "❌ خطأ: لا يوجد ملف .env أو .env.development"
        exit 1
    fi
else
    echo "✅ ملف .env موجود"
fi

# خطوة 3: التحقق من بيانات Supabase
echo ""
echo "🔍 الخطوة 3: التحقق من تكوين Supabase..."
echo "────────────────────────────────────────────────────────────"

SUPABASE_URL=$(grep "^SUPABASE_URL=" .env | cut -d '=' -f2)
SUPABASE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d '=' -f2)

echo "SUPABASE_URL: $SUPABASE_URL"

if [[ "$SUPABASE_URL" == *"YOUR_PROJECT_ID"* ]] || [[ "$SUPABASE_URL" == "" ]]; then
    echo "⚠️  تحذير: SUPABASE_URL غير مُعد بشكل صحيح"
    echo "   المفترض: https://mbpznkqyeofxluqwybyo.supabase.co"
    echo ""
    echo "هل تريد تحديثه تلقائياً؟ (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        sed -i 's|SUPABASE_URL=.*|SUPABASE_URL=https://mbpznkqyeofxluqwybyo.supabase.co|' .env
        echo "✅ تم تحديث SUPABASE_URL"
    fi
fi

if [[ "$SUPABASE_KEY" == *"YOUR_SERVICE_ROLE_KEY"* ]] || [[ "$SUPABASE_KEY" == "" ]]; then
    echo ""
    echo "⚠️  SUPABASE_SERVICE_ROLE_KEY غير مُعد!"
    echo ""
    echo "يرجى الحصول على المفتاح من:"
    echo "https://app.supabase.com/project/mbpznkqyeofxluqwybyo/settings/api"
    echo ""
    echo "ابحث عن 'service_role' key واضغط 'Reveal'"
    echo ""
    echo "أدخل المفتاح الآن (أو اضغط Enter للتخطي):"
    read -r service_role_key
    
    if [ -n "$service_role_key" ]; then
        sed -i "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$service_role_key|" .env
        echo "✅ تم تحديث SUPABASE_SERVICE_ROLE_KEY"
    else
        echo "⚠️  تم التخطي - يجب تحديث المفتاح يدوياً"
        echo "   استخدم: nano .env"
        exit 1
    fi
fi

# خطوة 4: تشغيل seed:superadmin
echo ""
echo "👤 الخطوة 4: إنشاء مستخدم المدير..."
echo "────────────────────────────────────────────────────────────"
echo ""
echo "البريد الإلكتروني: az22722101239oz@gmail.com"
echo "كلمة المرور: Az143134"
echo "الاسم: azoz"
echo "الهاتف: +966557431343"
echo ""
echo "هل تريد المتابعة؟ (y/n)"
read -r confirm

if [[ "$confirm" =~ ^[Yy]$ ]]; then
    npm run seed:superadmin -- \
      --email="az22722101239oz@gmail.com" \
      --password="Az143134" \
      --name="azoz" \
      --phone="+966557431343"
    
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "✅ تم إنشاء المدير بنجاح!"
    echo "════════════════════════════════════════════════════════════"
else
    echo "تم الإلغاء"
fi

echo ""
echo "✅ انتهى السكريبت"
