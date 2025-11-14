#!/bin/bash

# Frontend Status Checker
# سكريبت فحص حالة Frontend

echo "════════════════════════════════════════════════════════"
echo "🔍 فحص حالة Frontend"
echo "════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# تحديد المسار
if [ -d "/var/www/Website/Web" ]; then
    FRONTEND_PATH="/var/www/Website/Web"
else
    FRONTEND_PATH="/workspace/Web"
fi

echo -e "${BLUE}📂 المسار: $FRONTEND_PATH${NC}"
echo ""

# 1. فحص مجلد المشروع
echo -e "${BLUE}1️⃣  فحص مجلد المشروع...${NC}"
if [ -d "$FRONTEND_PATH" ]; then
    echo -e "${GREEN}   ✓ المجلد موجود${NC}"
else
    echo -e "${RED}   ✗ المجلد غير موجود${NC}"
    exit 1
fi

# 2. فحص package.json
echo -e "${BLUE}2️⃣  فحص package.json...${NC}"
if [ -f "$FRONTEND_PATH/package.json" ]; then
    echo -e "${GREEN}   ✓ package.json موجود${NC}"
else
    echo -e "${RED}   ✗ package.json غير موجود${NC}"
    exit 1
fi

# 3. فحص node_modules
echo -e "${BLUE}3️⃣  فحص node_modules...${NC}"
if [ -d "$FRONTEND_PATH/node_modules" ]; then
    echo -e "${GREEN}   ✓ node_modules موجود${NC}"
else
    echo -e "${RED}   ✗ node_modules غير موجود${NC}"
    echo -e "${YELLOW}   ⚠ قم بتشغيل: npm install${NC}"
fi

# 4. فحص مجلد .next
echo -e "${BLUE}4️⃣  فحص مجلد البناء (.next)...${NC}"
if [ -d "$FRONTEND_PATH/.next" ]; then
    if [ -f "$FRONTEND_PATH/.next/BUILD_ID" ]; then
        BUILD_ID=$(cat "$FRONTEND_PATH/.next/BUILD_ID")
        echo -e "${GREEN}   ✓ البناء موجود (BUILD_ID: $BUILD_ID)${NC}"
    else
        echo -e "${RED}   ✗ مجلد .next موجود لكن BUILD_ID مفقود${NC}"
        echo -e "${YELLOW}   ⚠ قم بإعادة البناء: npm run build${NC}"
    fi
else
    echo -e "${RED}   ✗ مجلد .next غير موجود${NC}"
    echo -e "${YELLOW}   ⚠ قم بالبناء: npm run build${NC}"
fi

# 5. فحص PM2
echo -e "${BLUE}5️⃣  فحص حالة PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}   ✓ PM2 مثبت${NC}"
    
    # فحص التطبيقات
    PM2_APPS=$(pm2 jlist 2>/dev/null)
    if [ $? -eq 0 ]; then
        # البحث عن frontend أو staging-frontend
        FRONTEND_STATUS=$(echo "$PM2_APPS" | grep -E '"name":"(frontend|staging-frontend)"' | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | head -1)
        
        if [ -n "$FRONTEND_STATUS" ]; then
            if [ "$FRONTEND_STATUS" = "online" ]; then
                echo -e "${GREEN}   ✓ Frontend يعمل (online)${NC}"
            else
                echo -e "${YELLOW}   ⚠ Frontend في حالة: $FRONTEND_STATUS${NC}"
            fi
        else
            echo -e "${YELLOW}   ⚠ لا يوجد تطبيق frontend في PM2${NC}"
        fi
    fi
else
    echo -e "${RED}   ✗ PM2 غير مثبت${NC}"
    echo -e "${YELLOW}   ⚠ قم بتثبيت: npm install -g pm2${NC}"
fi

# 6. فحص البورت
echo -e "${BLUE}6️⃣  فحص البورت 8088...${NC}"
if command -v lsof &> /dev/null; then
    PORT_CHECK=$(lsof -i :8088 2>/dev/null)
    if [ -n "$PORT_CHECK" ]; then
        echo -e "${GREEN}   ✓ البورت 8088 مستخدم${NC}"
        echo "$PORT_CHECK" | tail -n +2 | while read line; do
            echo -e "${BLUE}     $line${NC}"
        done
    else
        echo -e "${YELLOW}   ⚠ البورت 8088 غير مستخدم${NC}"
    fi
elif command -v netstat &> /dev/null; then
    PORT_CHECK=$(netstat -tulpn 2>/dev/null | grep :8088)
    if [ -n "$PORT_CHECK" ]; then
        echo -e "${GREEN}   ✓ البورت 8088 مستخدم${NC}"
    else
        echo -e "${YELLOW}   ⚠ البورت 8088 غير مستخدم${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠ لا يمكن فحص البورت (lsof و netstat غير متوفرين)${NC}"
fi

# 7. فحص NODE_ENV
echo -e "${BLUE}7️⃣  فحص NODE_ENV...${NC}"
if command -v pm2 &> /dev/null; then
    PM2_ENV=$(pm2 jlist 2>/dev/null | grep -A 50 '"name":"frontend"' | grep '"NODE_ENV"' | head -1)
    if [ -n "$PM2_ENV" ]; then
        NODE_ENV_VALUE=$(echo "$PM2_ENV" | cut -d'"' -f4)
        if [ "$NODE_ENV_VALUE" = "production" ] || [ "$NODE_ENV_VALUE" = "development" ]; then
            echo -e "${GREEN}   ✓ NODE_ENV=$NODE_ENV_VALUE (صحيح)${NC}"
        else
            echo -e "${RED}   ✗ NODE_ENV=$NODE_ENV_VALUE (غير قياسي)${NC}"
            echo -e "${YELLOW}   ⚠ يجب أن يكون: production أو development${NC}"
        fi
    else
        echo -e "${YELLOW}   ⚠ لم يتم العثور على NODE_ENV في PM2${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠ PM2 غير متوفر${NC}"
fi

# 8. فحص ملف ecosystem.config.js
echo -e "${BLUE}8️⃣  فحص ملف ecosystem.config.js...${NC}"
if [ -d "/var/www/Website" ]; then
    ECOSYSTEM_PATH="/var/www/Website"
else
    ECOSYSTEM_PATH="/workspace"
fi

if [ -f "$ECOSYSTEM_PATH/ecosystem.config.js.local" ]; then
    echo -e "${GREEN}   ✓ ecosystem.config.js.local موجود${NC}"
elif [ -f "$ECOSYSTEM_PATH/ecosystem.config.js" ]; then
    echo -e "${GREEN}   ✓ ecosystem.config.js موجود${NC}"
else
    echo -e "${RED}   ✗ لا يوجد ملف ecosystem.config.js${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 الخلاصة:${NC}"
echo "════════════════════════════════════════════════════════"

# حساب المشاكل
ISSUES=0

if [ ! -d "$FRONTEND_PATH/.next" ] || [ ! -f "$FRONTEND_PATH/.next/BUILD_ID" ]; then
    echo -e "${RED}❌ المشروع غير مبني${NC}"
    ISSUES=$((ISSUES + 1))
fi

if command -v pm2 &> /dev/null; then
    PM2_APPS=$(pm2 jlist 2>/dev/null)
    FRONTEND_STATUS=$(echo "$PM2_APPS" | grep -E '"name":"(frontend|staging-frontend)"' | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ "$FRONTEND_STATUS" != "online" ]; then
        echo -e "${RED}❌ Frontend غير يعمل${NC}"
        ISSUES=$((ISSUES + 1))
    fi
fi

echo ""
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ كل شيء يبدو جيداً!${NC}"
    echo ""
    echo -e "${BLUE}🌐 يمكنك فتح التطبيق على:${NC}"
    echo "   http://localhost:8088"
else
    echo -e "${YELLOW}⚠️  تم اكتشاف $ISSUES مشكلة${NC}"
    echo ""
    echo -e "${BLUE}📝 للإصلاح، شغل:${NC}"
    echo "   bash fix-frontend-production.sh"
    echo ""
    echo -e "${BLUE}أو اقرأ:${NC}"
    echo "   cat الحل_السريع_للفرونت_اند.txt"
fi

echo "════════════════════════════════════════════════════════"
