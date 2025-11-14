#!/bin/bash

###############################################################################
# EMERGENCY FIX: Rebuild Frontend and Restart Production
###############################################################################

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════"
echo "🚨 EMERGENCY FIX: Rebuilding Frontend with Correct API URL"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verify we're in the right directory
echo -e "${BLUE}Step 1: Verifying location...${NC}"
if [ ! -d "Web" ] || [ ! -d "api" ]; then
    echo -e "${RED}❌ Error: Must run from /var/www/Website directory${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Correct directory${NC}"
echo ""

# 2. Check environment file
echo -e "${BLUE}Step 2: Checking environment configuration...${NC}"
if grep -q "http://64.227.166.229:3001" Web/.env.production; then
    echo -e "${GREEN}✅ Frontend .env.production has correct API URL${NC}"
else
    echo -e "${YELLOW}⚠️  Updating frontend .env.production...${NC}"
    sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://64.227.166.229:3001/api|g' Web/.env.production
    sed -i 's|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=http://64.227.166.229:3001|g' Web/.env.production
    echo -e "${GREEN}✅ Updated${NC}"
fi
echo ""

# 3. Stop existing PM2 processes
echo -e "${BLUE}Step 3: Stopping PM2 processes...${NC}"
pm2 stop all || true
echo -e "${GREEN}✅ Stopped${NC}"
echo ""

# 4. Rebuild frontend
echo -e "${BLUE}Step 4: Rebuilding frontend (this will take 1-2 minutes)...${NC}"
cd Web
echo -e "${YELLOW}Building...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend rebuilt successfully${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
cd ..
echo ""

# 5. Restart PM2 with production environment
echo -e "${BLUE}Step 5: Starting production environment...${NC}"
pm2 start ecosystem.config.js --env production --only prod-api,prod-frontend
echo -e "${GREEN}✅ Started${NC}"
echo ""

# 6. Wait for startup
echo -e "${BLUE}Step 6: Waiting for services to start...${NC}"
sleep 5
echo -e "${GREEN}✅ Ready${NC}"
echo ""

# 7. Verify services
echo -e "${BLUE}Step 7: Verifying services...${NC}"
echo ""

# Check backend
echo -n "Backend (port 3001): "
if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ UP${NC}"
else
    echo -e "${RED}❌ DOWN${NC}"
fi

# Check frontend
echo -n "Frontend (port 3000): "
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ UP${NC}"
else
    echo -e "${RED}❌ DOWN${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ EMERGENCY FIX COMPLETE!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Check PM2 status: pm2 list"
echo "2. View logs: pm2 logs prod-frontend --lines 50"
echo "3. Test in browser: http://64.227.166.229:3000"
echo ""
echo "The frontend should now call: http://64.227.166.229:3001/api"
echo "(NOT localhost:3001)"
echo ""
