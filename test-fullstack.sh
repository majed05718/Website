#!/bin/bash

echo "=================================================="
echo "🧪 Full Stack Testing Script"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ================================================
# PART 1: BACKEND TESTING
# ================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔵 BACKEND TESTING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "1️⃣  Backend PM2 Status..."
BACKEND_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="backend") | .pm2_env.status')
if [ "$BACKEND_STATUS" == "online" ]; then
    echo -e "${GREEN}✅ Backend PM2: Online${NC}"
    BACKEND_PID=$(pm2 jlist | jq -r '.[] | select(.name=="backend") | .pid')
    BACKEND_UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="backend") | .pm2_env.pm_uptime')
    BACKEND_RESTARTS=$(pm2 jlist | jq -r '.[] | select(.name=="backend") | .pm2_env.restart_time')
    BACKEND_MEMORY=$(pm2 jlist | jq -r '.[] | select(.name=="backend") | .monit.memory')
    BACKEND_MEMORY_MB=$((BACKEND_MEMORY / 1024 / 1024))
    
    echo "   PID: $BACKEND_PID"
    echo "   Restarts: $BACKEND_RESTARTS"
    echo "   Memory: ${BACKEND_MEMORY_MB}MB"
else
    echo -e "${RED}❌ Backend PM2: $BACKEND_STATUS${NC}"
fi

echo ""
echo "2️⃣  Backend Port 3001 Check..."
BACKEND_PORT=$(lsof -ti:3001)
if [ -z "$BACKEND_PORT" ]; then
    echo -e "${RED}❌ Port 3001: Not listening${NC}"
else
    echo -e "${GREEN}✅ Port 3001: Listening (PID: $BACKEND_PORT)${NC}"
fi

echo ""
echo "3️⃣  Backend Health Check..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Health Check: SUCCESS (200)${NC}"
    echo "   Response: $HEALTH_BODY"
else
    echo -e "${RED}❌ Health Check: FAILED (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $HEALTH_BODY"
fi

echo ""
echo "4️⃣  Backend API Test (Properties)..."
PROPERTIES_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/properties)
PROPERTIES_CODE=$(echo "$PROPERTIES_RESPONSE" | tail -n1)
PROPERTIES_BODY=$(echo "$PROPERTIES_RESPONSE" | sed '$d')

if [ "$PROPERTIES_CODE" == "401" ]; then
    echo -e "${YELLOW}⚠️  Properties API: 401 (Auth required - Normal)${NC}"
elif [ "$PROPERTIES_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Properties API: 200 (Success)${NC}"
else
    echo -e "${RED}❌ Properties API: $PROPERTIES_CODE${NC}"
fi

echo ""
echo "5️⃣  Backend Swagger UI..."
SWAGGER_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/docs)
SWAGGER_CODE=$(echo "$SWAGGER_RESPONSE" | tail -n1)

if [ "$SWAGGER_CODE" == "200" ] || [ "$SWAGGER_CODE" == "301" ] || [ "$SWAGGER_CODE" == "302" ]; then
    echo -e "${GREEN}✅ Swagger UI: Accessible${NC}"
else
    echo -e "${RED}❌ Swagger UI: Not accessible (HTTP $SWAGGER_CODE)${NC}"
fi

echo ""
echo "6️⃣  Backend Logs (Last 10 lines)..."
echo "--- Out Log ---"
tail -10 /var/log/pm2/backend-out.log 2>/dev/null || echo "No out log"
echo ""
echo "--- Error Log ---"
tail -10 /var/log/pm2/backend-error.log 2>/dev/null || echo "No error log"

# ================================================
# PART 2: FRONTEND TESTING
# ================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🟠 FRONTEND TESTING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "1️⃣  Frontend PM2 Status..."
FRONTEND_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="frontend") | .pm2_env.status')
if [ "$FRONTEND_STATUS" == "online" ]; then
    echo -e "${GREEN}✅ Frontend PM2: Online${NC}"
    FRONTEND_PID=$(pm2 jlist | jq -r '.[] | select(.name=="frontend") | .pid')
    FRONTEND_UPTIME=$(pm2 jlist | jq -r '.[] | select(.name=="frontend") | .pm2_env.pm_uptime')
    FRONTEND_RESTARTS=$(pm2 jlist | jq -r '.[] | select(.name=="frontend") | .pm2_env.restart_time')
    FRONTEND_MEMORY=$(pm2 jlist | jq -r '.[] | select(.name=="frontend") | .monit.memory')
    FRONTEND_MEMORY_MB=$((FRONTEND_MEMORY / 1024 / 1024))
    
    echo "   PID: $FRONTEND_PID"
    echo "   Restarts: $FRONTEND_RESTARTS"
    echo "   Memory: ${FRONTEND_MEMORY_MB}MB"
    
    if [ "$FRONTEND_RESTARTS" -gt 5 ]; then
        echo -e "   ${RED}⚠️  High restart count!${NC}"
    fi
else
    echo -e "${RED}❌ Frontend PM2: $FRONTEND_STATUS${NC}"
fi

echo ""
echo "2️⃣  Frontend Port 3000 Check..."
FRONTEND_PORT=$(lsof -ti:3000)
if [ -z "$FRONTEND_PORT" ]; then
    echo -e "${RED}❌ Port 3000: Not listening${NC}"
else
    echo -e "${GREEN}✅ Port 3000: Listening (PID: $FRONTEND_PORT)${NC}"
fi

echo ""
echo "3️⃣  Frontend Connection Test..."
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" --connect-timeout 5 http://localhost:3000 2>&1)
FRONTEND_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n1)

if echo "$FRONTEND_RESPONSE" | grep -q "Connection refused"; then
    echo -e "${RED}❌ Connection: REFUSED${NC}"
elif echo "$FRONTEND_RESPONSE" | grep -q "Could not resolve"; then
    echo -e "${RED}❌ Connection: DNS Error${NC}"
elif [ "$FRONTEND_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Frontend: Responding (200)${NC}"
elif [ "$FRONTEND_CODE" == "404" ]; then
    echo -e "${YELLOW}⚠️  Frontend: 404 (Running but route not found)${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend: HTTP $FRONTEND_CODE${NC}"
fi

echo ""
echo "4️⃣  Frontend Environment (.env.local)..."
if [ -f /var/www/property-management/Web/.env.local ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    echo "   Content:"
    cat /var/www/property-management/Web/.env.local | sed 's/^/   /'
else
    echo -e "${RED}❌ .env.local missing${NC}"
fi

echo ""
echo "5️⃣  Frontend Dependencies..."
if [ -d /var/www/property-management/Web/node_modules ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
    NODE_MODULES_SIZE=$(du -sh /var/www/property-management/Web/node_modules | cut -f1)
    echo "   Size: $NODE_MODULES_SIZE"
else
    echo -e "${RED}❌ node_modules missing${NC}"
fi

echo ""
echo "6️⃣  Frontend Logs (Last 10 lines)..."
echo "--- Out Log ---"
tail -10 /var/log/pm2/frontend-out.log 2>/dev/null || echo "No out log"
echo ""
echo "--- Error Log ---"
tail -10 /var/log/pm2/frontend-error.log 2>/dev/null || echo "No error log"

# ================================================
# PART 3: SYSTEM RESOURCES
# ================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💻 SYSTEM RESOURCES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "1️⃣  Memory Status..."
free -h

echo ""
echo "2️⃣  Disk Usage..."
df -h /

echo ""
echo "3️⃣  System Load..."
uptime

# ================================================
# SUMMARY
# ================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Backend Summary
echo "🔵 Backend:"
if [ "$BACKEND_STATUS" == "online" ] && [ "$HTTP_CODE" == "200" ]; then
    echo -e "   ${GREEN}✅ Status: WORKING${NC}"
    echo "   ✓ PM2 online"
    echo "   ✓ Port 3001 listening"
    echo "   ✓ Health check passing"
    echo "   ✓ API responding"
elif [ "$BACKEND_STATUS" == "online" ]; then
    echo -e "   ${YELLOW}⚠️  Status: DEGRADED${NC}"
    echo "   ✓ PM2 online"
    [ -n "$BACKEND_PORT" ] && echo "   ✓ Port 3001 listening" || echo "   ✗ Port not listening"
    [ "$HTTP_CODE" == "200" ] && echo "   ✓ Health check passing" || echo "   ✗ Health check failing"
else
    echo -e "   ${RED}❌ Status: FAILED${NC}"
    echo "   ✗ PM2 not online"
fi

echo ""

# Frontend Summary
echo "🟠 Frontend:"
if [ "$FRONTEND_STATUS" == "online" ] && [ -n "$FRONTEND_PORT" ] && [ "$FRONTEND_CODE" == "200" ]; then
    echo -e "   ${GREEN}✅ Status: WORKING${NC}"
    echo "   ✓ PM2 online"
    echo "   ✓ Port 3000 listening"
    echo "   ✓ HTTP responding"
elif [ "$FRONTEND_STATUS" == "online" ]; then
    echo -e "   ${YELLOW}⚠️  Status: DEGRADED${NC}"
    echo "   ✓ PM2 online"
    [ -n "$FRONTEND_PORT" ] && echo "   ✓ Port 3000 listening" || echo "   ✗ Port not listening"
    echo "   ✗ Not responding to HTTP"
else
    echo -e "   ${RED}❌ Status: FAILED${NC}"
    echo "   ✗ PM2 not online"
fi

echo ""
echo "=================================================="
echo "🎯 RECOMMENDATIONS:"
echo "=================================================="
echo ""

if [ "$FRONTEND_STATUS" == "online" ] && [ -z "$FRONTEND_PORT" ]; then
    echo "⚠️  Frontend PM2 shows 'online' but port 3000 is not listening"
    echo ""
    echo "Suggested actions:"
    echo "1. Stop PM2 frontend and test manually:"
    echo "   pm2 stop frontend"
    echo "   cd /var/www/property-management/Web"
    echo "   npm run dev"
    echo ""
    echo "2. If manual test fails with memory error:"
    echo "   → Consider Vercel deployment (free, fast)"
    echo ""
    echo "3. If manual test fails with other errors:"
    echo "   → Check the error output"
    echo "   → May need to fix dependencies or config"
fi

if [ "$BACKEND_STATUS" != "online" ] || [ "$HTTP_CODE" != "200" ]; then
    echo "⚠️  Backend issues detected"
    echo ""
    echo "Suggested actions:"
    echo "1. Check backend logs:"
    echo "   pm2 logs backend --lines 50"
    echo ""
    echo "2. Restart backend:"
    echo "   pm2 restart backend"
    echo ""
    echo "3. Check .env file:"
    echo "   cat /var/www/property-management/api/.env"
fi

echo ""
echo "=================================================="
echo "✅ Testing Complete!"
echo "=================================================="
