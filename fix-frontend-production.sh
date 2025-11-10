#!/bin/bash

# Fix Frontend Production Build Issues
# هذا السكريبت يحل مشكلة بناء Next.js و NODE_ENV

echo "=========================================="
echo "🔧 إصلاح مشاكل بناء Frontend"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# الخطوة 1: التحقق من المسار
echo -e "${BLUE}📂 الخطوة 1: التحقق من المسار...${NC}"
if [ -d "/var/www/Website/Web" ]; then
    FRONTEND_PATH="/var/www/Website/Web"
    echo -e "${GREEN}✓ المسار موجود: $FRONTEND_PATH${NC}"
else
    FRONTEND_PATH="/workspace/Web"
    echo -e "${YELLOW}⚠ استخدام المسار المحلي: $FRONTEND_PATH${NC}"
fi
echo ""

# الخطوة 2: الانتقال إلى مجلد Frontend
echo -e "${BLUE}📂 الخطوة 2: الانتقال إلى مجلد Frontend...${NC}"
cd "$FRONTEND_PATH" || exit 1
echo -e "${GREEN}✓ تم الانتقال إلى: $(pwd)${NC}"
echo ""

# الخطوة 3: حذف البناء القديم إن وجد
echo -e "${BLUE}🗑️  الخطوة 3: حذف البناء القديم...${NC}"
if [ -d ".next" ]; then
    rm -rf .next
    echo -e "${GREEN}✓ تم حذف مجلد .next القديم${NC}"
else
    echo -e "${YELLOW}⚠ لا يوجد بناء قديم${NC}"
fi
echo ""

# الخطوة 4: التأكد من تثبيت الحزم
echo -e "${BLUE}📦 الخطوة 4: التحقق من الحزم...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ تثبيت الحزم...${NC}"
    npm install
    echo -e "${GREEN}✓ تم تثبيت الحزم${NC}"
else
    echo -e "${GREEN}✓ الحزم مثبتة مسبقاً${NC}"
fi
echo ""

# الخطوة 5: تعيين NODE_ENV
echo -e "${BLUE}🔧 الخطوة 5: تعيين NODE_ENV...${NC}"
export NODE_ENV=production
echo -e "${GREEN}✓ تم تعيين NODE_ENV=production${NC}"
echo ""

# الخطوة 6: بناء المشروع
echo -e "${BLUE}🏗️  الخطوة 6: بناء المشروع...${NC}"
echo -e "${YELLOW}⏳ هذه العملية قد تستغرق عدة دقائق...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ تم بناء المشروع بنجاح${NC}"
else
    echo ""
    echo -e "${RED}✗ فشل بناء المشروع${NC}"
    exit 1
fi
echo ""

# الخطوة 7: التحقق من البناء
echo -e "${BLUE}✅ الخطوة 7: التحقق من البناء...${NC}"
if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    echo -e "${GREEN}✓ BUILD_ID موجود: $BUILD_ID${NC}"
    echo -e "${GREEN}✓ البناء جاهز للتشغيل${NC}"
else
    echo -e "${RED}✗ BUILD_ID غير موجود${NC}"
    exit 1
fi
echo ""

# الخطوة 8: إعادة تشغيل PM2
echo -e "${BLUE}🔄 الخطوة 8: إعادة تشغيل PM2...${NC}"

# محاولة إيقاف التطبيقات القديمة
pm2 stop staging-frontend 2>/dev/null || echo "لا يوجد staging-frontend"
pm2 stop frontend 2>/dev/null || echo "لا يوجد frontend"
pm2 delete staging-frontend 2>/dev/null || echo "لا يوجد staging-frontend للحذف"
pm2 delete frontend 2>/dev/null || echo "لا يوجد frontend للحذف"

# العودة إلى المجلد الرئيسي
cd /var/www/Website 2>/dev/null || cd /workspace

# تشغيل PM2 بملف ecosystem الصحيح
if [ -f "ecosystem.config.js.local" ]; then
    echo -e "${BLUE}استخدام ecosystem.config.js.local${NC}"
    pm2 start ecosystem.config.js.local
elif [ -f "ecosystem.config.js" ]; then
    echo -e "${BLUE}استخدام ecosystem.config.js${NC}"
    pm2 start ecosystem.config.js
else
    echo -e "${RED}✗ لم يتم العثور على ملف ecosystem.config.js${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ تم إعادة تشغيل PM2${NC}"
echo ""

# الخطوة 9: حفظ إعدادات PM2
echo -e "${BLUE}💾 الخطوة 9: حفظ إعدادات PM2...${NC}"
pm2 save
echo -e "${GREEN}✓ تم حفظ الإعدادات${NC}"
echo ""

# عرض حالة PM2
echo -e "${BLUE}📊 حالة التطبيقات:${NC}"
pm2 list
echo ""

echo "=========================================="
echo -e "${GREEN}✅ تم إصلاح جميع المشاكل بنجاح!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}📝 ملاحظات مهمة:${NC}"
echo "  1. تأكد أن NODE_ENV=production في ملف ecosystem.config.js"
echo "  2. يمكنك مراقبة السجلات بـ: pm2 logs frontend"
echo "  3. يمكنك إعادة التشغيل بـ: pm2 restart frontend"
echo ""
echo -e "${BLUE}🌐 يمكنك الآن فتح المتصفح على:${NC}"
echo "  http://localhost:8088"
echo "  أو حسب إعدادات البورت في ecosystem.config.js"
echo ""
