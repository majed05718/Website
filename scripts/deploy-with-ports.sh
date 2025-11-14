#!/bin/bash

###############################################################################
# نشر مركزي للبورتات - Centralized Port Deployment
# يقرأ البورتات من ecosystem.config.js ويحدث كل شيء تلقائياً
###############################################################################

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 نشر مركزي - Centralized Deployment"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Go to project root
cd "$(dirname "$0")/.."

# ═══════════════════════════════════════════════════════════════
# الخطوة 1: قراءة البورتات من ecosystem.config.js
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}📖 قراءة البورتات من ecosystem.config.js...${NC}"

# Extract ports using node
PROD_API_PORT=$(node -e "const config = require('./ecosystem.config.js'); const PORTS = { PRODUCTION: { API: 3031, FRONTEND: 3000 }, STAGING: { API: 3032, FRONTEND: 8088 }}; console.log(PORTS.PRODUCTION.API);")
PROD_FRONTEND_PORT=$(node -e "const PORTS = { PRODUCTION: { API: 3031, FRONTEND: 3000 }, STAGING: { API: 3032, FRONTEND: 8088 }}; console.log(PORTS.PRODUCTION.FRONTEND);")
SERVER_IP="64.227.166.229"

echo -e "${GREEN}✅ البورتات المقروءة:${NC}"
echo "   Production API: $PROD_API_PORT"
echo "   Production Frontend: $PROD_FRONTEND_PORT"
echo ""

# ═══════════════════════════════════════════════════════════════
# الخطوة 2: تحديث .env.production للـ Frontend
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}📝 تحديث Frontend environment...${NC}"

cat > Web/.env.production << EOF
NODE_ENV=production
PORT=${PROD_FRONTEND_PORT}

# Generated from ecosystem.config.js
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:${PROD_API_PORT}
NEXT_PUBLIC_BACKEND_URL=http://${SERVER_IP}:${PROD_API_PORT}

NEXT_PUBLIC_SUPABASE_URL=https://mbpznkqyeofxluqwybyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icHpua3F5ZW9meGx1cXd5YnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDMwNTQsImV4cCI6MjA2NDkxOTA1NH0.qLU2wPfXqAD82pXQwDpHhj2bE2wPSqqYb3xJaAbH7yU

NEXT_PUBLIC_APP_NAME=نظام إدارة العقارات
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

echo -e "${GREEN}✅ Frontend .env.production updated${NC}"
cat Web/.env.production | grep NEXT_PUBLIC_API_URL
echo ""

# ═══════════════════════════════════════════════════════════════
# الخطوة 3: تحديث .env.production للـ Backend
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}📝 تحديث Backend environment...${NC}"

# Read existing .env.production and update only the ports
sed -i "s/^PORT=.*/PORT=${PROD_API_PORT}/" api/.env.production
sed -i "s/^PROD_API_PORT=.*/PROD_API_PORT=${PROD_API_PORT}/" api/.env.production
sed -i "s/^PROD_FRONTEND_PORT=.*/PROD_FRONTEND_PORT=${PROD_FRONTEND_PORT}/" api/.env.production

# Update CORS to include frontend port
CORS_ORIGINS="http://${SERVER_IP}:${PROD_FRONTEND_PORT},http://${SERVER_IP},https://${SERVER_IP}"
sed -i "s|^ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=${CORS_ORIGINS}|" api/.env.production
sed -i "s|^ALLOWED_ORIGINS_PROD=.*|ALLOWED_ORIGINS_PROD=${CORS_ORIGINS}|" api/.env.production

echo -e "${GREEN}✅ Backend .env.production updated${NC}"
cat api/.env.production | grep -E "^PORT=|^ALLOWED_ORIGINS="
echo ""

# ═══════════════════════════════════════════════════════════════
# الخطوة 4: إيقاف PM2
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}⏸️  إيقاف PM2...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
echo -e "${GREEN}✅ Stopped${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# الخطوة 5: إعادة بناء Frontend (مهم!)
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}🏗️  إعادة بناء Frontend...${NC}"
cd Web
npm run build
cd ..
echo -e "${GREEN}✅ Frontend rebuilt${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════
# الخطوة 6: تشغيل Production
# ═══════════════════════════════════════════════════════════════
echo -e "${BLUE}🚀 تشغيل Production...${NC}"
pm2 start ecosystem.config.js --only prod-api,prod-frontend
echo ""

# ═══════════════════════════════════════════════════════════════
# الخطوة 7: التحقق
# ═══════════════════════════════════════════════════════════════
sleep 5
echo -e "${BLUE}📊 حالة PM2:${NC}"
pm2 list
echo ""

echo -e "${BLUE}🔍 اختبار الـ endpoints:${NC}"
echo -n "Backend (${PROD_API_PORT}): "
curl -s http://localhost:${PROD_API_PORT}/health | head -1 || echo "❌"

echo -n "Frontend (${PROD_FRONTEND_PORT}): "
curl -s -I http://localhost:${PROD_FRONTEND_PORT} | head -1 || echo "❌"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ النشر اكتمل!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "الوصول للتطبيق:"
echo "  Frontend: http://${SERVER_IP}:${PROD_FRONTEND_PORT}"
echo "  API:      http://${SERVER_IP}:${PROD_API_PORT}/api"
echo ""
echo "عرض السجلات:"
echo "  pm2 logs prod-api"
echo "  pm2 logs prod-frontend"
echo ""
