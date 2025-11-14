#!/bin/bash

###############################################################################
# Port Verification Script
# Checks if required ports are available before starting PM2 processes
###############################################################################

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 Port Availability Check"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ports to check
PORTS=(3000 3001 3002 8088)
PORT_NAMES=("Production Frontend" "Production API" "Staging API" "Staging Frontend")

ALL_CLEAR=true

# Check each port
for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}
    
    # Check if port is in use
    if sudo lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}❌ Port $PORT ($NAME) is IN USE${NC}"
        
        # Show what's using the port
        echo "   Process details:"
        sudo lsof -i :$PORT | grep LISTEN | awk '{print "   PID: "$2" | Command: "$1" | User: "$3}'
        echo ""
        
        ALL_CLEAR=false
    else
        echo -e "${GREEN}✅ Port $PORT ($NAME) is available${NC}"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"

if [ "$ALL_CLEAR" = true ]; then
    echo -e "${GREEN}✅ All ports are available!${NC}"
    echo "   You can safely start PM2 processes."
    exit 0
else
    echo -e "${RED}❌ Some ports are in use!${NC}"
    echo ""
    echo "To fix this, you have two options:"
    echo ""
    echo "1. Kill the processes using these ports:"
    echo "   ${YELLOW}# Find PIDs and kill them${NC}"
    echo "   sudo lsof -i :3000 -i :3001 -i :3002 -i :8088 | grep LISTEN"
    echo "   kill -9 <PID>"
    echo ""
    echo "2. Stop all PM2 processes:"
    echo "   ${YELLOW}pm2 stop all${NC}"
    echo "   ${YELLOW}pm2 delete all${NC}"
    echo ""
    exit 1
fi
