#!/bin/bash

# Supabase Data Repair Script
# 
# This script runs all the diagnostic and fix tools for Supabase data issues.
# Usage: ./fix-supabase-data.sh or npm run fix-supabase

# Set colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Print header
echo -e "${CYAN}=============================================${NC}"
echo -e "${CYAN}🔧 SUPABASE DATA REPAIR TOOLKIT${NC}"
echo -e "${CYAN}=============================================${NC}"
echo ""

# Check if colors package is installed
echo -e "${BLUE}Checking required packages...${NC}"
if ! npm list colors > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing colors package for diagnostic scripts...${NC}"
    npm install --no-save colors
    echo -e "${GREEN}✅ Installed colors package${NC}"
else
    echo -e "${GREEN}✅ colors package is installed${NC}"
fi

echo ""

# Step 1: Test the database connection
echo -e "${BLUE}STEP 1: Testing database connection${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
node src/services/supabase/testDatabaseConnection.js
CONNECTION_STATUS=$?

if [ $CONNECTION_STATUS -ne 0 ]; then
    echo -e "\n${RED}❌ Database connection test failed!${NC}"
    echo -e "${YELLOW}Please check your .env file and Supabase project status${NC}"
    echo -e "${GRAY}Fix your connection issues before continuing${NC}"
    echo -e "${CYAN}=============================================${NC}"
    exit 1
fi

echo ""

# Step 2: Setup diagnostics
echo -e "${BLUE}STEP 2: Setting up diagnostic helpers${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
node src/services/supabase/setupDiagnostics.js
SETUP_STATUS=$?

# Even if this fails, we continue as it's not critical

echo ""

# Step 3: Verify database
echo -e "${BLUE}STEP 3: Verifying database structure and data${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
node src/services/supabase/verifySupabaseData.js
VERIFY_STATUS=$?

echo ""

# Step 4: Fix issues
echo -e "${BLUE}STEP 4: Fixing identified issues${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
node src/services/supabase/fixDataIssues.js
FIX_STATUS=$?

echo ""

# Step 5: Final verification
echo -e "${BLUE}STEP 5: Final verification${NC}"
echo -e "${GRAY}----------------------------------------${NC}"
node src/services/supabase/verifySupabaseData.js
FINAL_STATUS=$?

echo ""
echo -e "${CYAN}=============================================${NC}"
echo -e "${CYAN}📋 REPAIR PROCESS SUMMARY${NC}"
echo -e "${CYAN}=============================================${NC}"

if [ $FINAL_STATUS -eq 0 ]; then
    echo -e "\n${GREEN}✅ Database repair was successful!${NC}"
    echo -e "${GREEN}Your database is now ready to use.${NC}"
    echo -e "\n${GRAY}Next steps:${NC}"
    echo -e "${GRAY}1. Restart your application: npm run dev${NC}"
    echo -e "${GRAY}2. Check that data is displaying in the UI${NC}"
else
    echo -e "\n${YELLOW}⚠️ Database has remaining issues${NC}"
    echo -e "${YELLOW}Some problems may require manual intervention.${NC}"
    echo -e "\n${GRAY}Suggested actions:${NC}"
    echo -e "${GRAY}1. Check the documentation: SUPABASE_TROUBLESHOOTING.md${NC}"
    echo -e "${GRAY}2. Verify your Supabase project settings${NC}"
    echo -e "${GRAY}3. Contact support if problems persist${NC}"
fi

echo -e "${CYAN}=============================================${NC}"
echo ""
