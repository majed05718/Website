#!/bin/bash

###############################################################################
# Health Check Script
# Verifies that all environments are running correctly
###############################################################################

echo "═══════════════════════════════════════════════════════════════"
echo "❤️  Environment Health Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_env=$3
    
    echo -e "${BLUE}Checking $name...${NC}"
    
    if response=$(curl -s -f "$url" 2>/dev/null); then
        # Extract environment from response if it's a health endpoint
        if echo "$response" | grep -q "environment"; then
            env=$(echo "$response" | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)
            port=$(echo "$response" | grep -o '"port":[0-9]*' | cut -d':' -f2)
            
            echo -e "${GREEN}✅ $name is UP${NC}"
            echo "   Environment: $env"
            echo "   Port: $port"
            
            if [ "$env" = "$expected_env" ]; then
                echo -e "   ${GREEN}✓ Environment matches expected: $expected_env${NC}"
            else
                echo -e "   ${YELLOW}⚠ Environment mismatch! Expected: $expected_env, Got: $env${NC}"
            fi
        else
            echo -e "${GREEN}✅ $name is UP${NC}"
            echo "   Endpoint is responding"
        fi
    else
        echo -e "${RED}❌ $name is DOWN${NC}"
        echo "   URL: $url"
        echo "   Could not connect to endpoint"
        return 1
    fi
    
    echo ""
    return 0
}

# Check Production Environment
echo "─────────────────────────────────────────────────────────────"
echo "🏢 Production Environment"
echo "─────────────────────────────────────────────────────────────"
echo ""

PROD_API_OK=false
PROD_FRONTEND_OK=false

if check_endpoint "Production API" "http://localhost:3001/health" "production"; then
    PROD_API_OK=true
fi

if check_endpoint "Production Frontend" "http://localhost:3000" ""; then
    PROD_FRONTEND_OK=true
fi

# Check Staging Environment
echo "─────────────────────────────────────────────────────────────"
echo "🧪 Staging Environment"
echo "─────────────────────────────────────────────────────────────"
echo ""

STAGING_API_OK=false
STAGING_FRONTEND_OK=false

if check_endpoint "Staging API" "http://localhost:3002/health" "development"; then
    STAGING_API_OK=true
fi

if check_endpoint "Staging Frontend" "http://localhost:8088" ""; then
    STAGING_FRONTEND_OK=true
fi

# Check PM2 Status
echo "─────────────────────────────────────────────────────────────"
echo "📊 PM2 Process Status"
echo "─────────────────────────────────────────────────────────────"
echo ""

if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo -e "${YELLOW}⚠ PM2 is not installed or not in PATH${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📋 Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Production Summary
if [ "$PROD_API_OK" = true ] && [ "$PROD_FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✅ Production: All services are healthy${NC}"
elif [ "$PROD_API_OK" = true ] || [ "$PROD_FRONTEND_OK" = true ]; then
    echo -e "${YELLOW}⚠ Production: Some services are down${NC}"
else
    echo -e "${RED}❌ Production: All services are down${NC}"
fi

# Staging Summary
if [ "$STAGING_API_OK" = true ] && [ "$STAGING_FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✅ Staging: All services are healthy${NC}"
elif [ "$STAGING_API_OK" = true ] || [ "$STAGING_FRONTEND_OK" = true ]; then
    echo -e "${YELLOW}⚠ Staging: Some services are down${NC}"
else
    echo -e "${RED}❌ Staging: All services are down${NC}"
fi

echo ""

# Exit with appropriate status
if [ "$PROD_API_OK" = true ] && [ "$PROD_FRONTEND_OK" = true ]; then
    exit 0
else
    exit 1
fi
