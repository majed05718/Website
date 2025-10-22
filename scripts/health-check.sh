#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Health Check Script
# التحقق من صحة جميع الخدمات
# ═══════════════════════════════════════════════════════════════

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo -e "${BLUE}${1}${NC}"
    echo "═══════════════════════════════════════════════════════════"
}

check_service() {
    local name=$1
    local url=$2
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "  ✅ ${GREEN}$name يعمل${NC}"
        return 0
    else
        echo -e "  ❌ ${RED}$name لا يستجيب${NC}"
        return 1
    fi
}

print_header "🏥 فحص صحة النظام"

# Backend Health
echo ""
echo "🔧 Backend:"
check_service "API Health" "http://localhost:3001/health"
check_service "API Endpoint" "http://localhost:3001/api/properties"

# Frontend Health
echo ""
echo "🎨 Frontend:"
check_service "Homepage" "http://localhost:3000"

# PM2 Status
echo ""
echo "📊 PM2 Processes:"
pm2_status=$(pm2 jlist 2>/dev/null)
if [ $? -eq 0 ]; then
    backend_status=$(echo $pm2_status | grep -o '"name":"backend"[^}]*"status":"[^"]*"' | grep -o 'status":"[^"]*"' | cut -d'"' -f3)
    frontend_status=$(echo $pm2_status | grep -o '"name":"frontend"[^}]*"status":"[^"]*"' | grep -o 'status":"[^"]*"' | cut -d'"' -f3)
    
    if [ "$backend_status" = "online" ]; then
        echo -e "  ✅ ${GREEN}Backend Process: online${NC}"
    else
        echo -e "  ❌ ${RED}Backend Process: $backend_status${NC}"
    fi
    
    if [ "$frontend_status" = "online" ]; then
        echo -e "  ✅ ${GREEN}Frontend Process: online${NC}"
    else
        echo -e "  ❌ ${RED}Frontend Process: $frontend_status${NC}"
    fi
else
    echo -e "  ❌ ${RED}PM2 غير مثبت أو لا يعمل${NC}"
fi

# Nginx Status
echo ""
echo "🌐 Nginx:"
if systemctl is-active --quiet nginx; then
    echo -e "  ✅ ${GREEN}Nginx يعمل${NC}"
else
    echo -e "  ❌ ${RED}Nginx متوقف${NC}"
fi

# Disk Usage
echo ""
echo "💾 استخدام القرص:"
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    echo -e "  ✅ ${GREEN}استخدام القرص: ${disk_usage}%${NC}"
elif [ "$disk_usage" -lt 90 ]; then
    echo -e "  ⚠️  ${YELLOW}استخدام القرص: ${disk_usage}%${NC}"
else
    echo -e "  ❌ ${RED}استخدام القرص: ${disk_usage}% - تحذير!${NC}"
fi

# Memory Usage
echo ""
echo "🧠 استخدام الذاكرة:"
mem_usage=$(free | awk 'NR==2 {printf "%.0f", $3/$2*100}')
if [ "$mem_usage" -lt 80 ]; then
    echo -e "  ✅ ${GREEN}استخدام الذاكرة: ${mem_usage}%${NC}"
elif [ "$mem_usage" -lt 90 ]; then
    echo -e "  ⚠️  ${YELLOW}استخدام الذاكرة: ${mem_usage}%${NC}"
else
    echo -e "  ❌ ${RED}استخدام الذاكرة: ${mem_usage}% - تحذير!${NC}"
fi

# Summary
echo ""
print_header "📋 ملخص الحالة"
echo ""
echo "🌐 URLs:"
echo -e "  Backend:  ${BLUE}http://localhost:3001${NC}"
echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "💡 أوامر مفيدة:"
echo -e "  Logs:     ${BLUE}./scripts/logs.sh${NC}"
echo -e "  Restart:  ${BLUE}pm2 restart all${NC}"
echo -e "  Status:   ${BLUE}pm2 status${NC}"
echo ""
