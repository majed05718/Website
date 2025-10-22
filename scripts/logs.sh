#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Logs Viewer Script
# عرض logs الخدمات بطريقة منظمة
# ═══════════════════════════════════════════════════════════════

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "═══════════════════════════════════════════════════════════"
echo -e "${BLUE}📋 عارض Logs - Property Management System${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "اختر الخدمة:"
echo ""
echo "  1) Backend logs"
echo "  2) Frontend logs"
echo "  3) Both (combined)"
echo "  4) PM2 status"
echo "  5) Backend errors only"
echo "  6) Frontend errors only"
echo "  7) Live tail (real-time)"
echo ""
read -p "اختيارك (1-7): " choice

echo ""

case $choice in
    1)
        echo -e "${GREEN}📄 Backend Logs:${NC}"
        echo "───────────────────────────────────────────────────────────"
        pm2 logs backend --lines 100 --nostream
        ;;
    2)
        echo -e "${GREEN}📄 Frontend Logs:${NC}"
        echo "───────────────────────────────────────────────────────────"
        pm2 logs frontend --lines 100 --nostream
        ;;
    3)
        echo -e "${GREEN}📄 All Logs:${NC}"
        echo "───────────────────────────────────────────────────────────"
        pm2 logs --lines 100 --nostream
        ;;
    4)
        echo -e "${GREEN}📊 PM2 Status:${NC}"
        echo "───────────────────────────────────────────────────────────"
        pm2 status
        echo ""
        pm2 info backend
        echo ""
        pm2 info frontend
        ;;
    5)
        echo -e "${GREEN}❌ Backend Errors:${NC}"
        echo "───────────────────────────────────────────────────────────"
        pm2 logs backend --err --lines 50 --nostream
        ;;
    6)
        echo -e "${GREEN}❌ Frontend Errors:${NC}"
        echo "───────────────────────────────────────────────────────────"
        pm2 logs frontend --err --lines 50 --nostream
        ;;
    7)
        echo -e "${GREEN}📡 Live Logs (Ctrl+C للخروج):${NC}"
        echo "───────────────────────────────────────────────────────────"
        pm2 logs
        ;;
    *)
        echo "❌ اختيار غير صحيح"
        exit 1
        ;;
esac
