#!/bin/bash

# This script refreshes all Supabase data to ensure the application
# is using live data from Supabase instead of mock data.
# It will populate all tables including dental procedures, aesthetic procedures,
# companies, and news articles.

echo "Starting full data refresh process..."
echo "This will clear existing data and reload everything from Supabase."
echo "It will also fetch recent news articles from external sources."
echo ""

# Run the refresh script
node refresh-supabase-data.js

echo ""
echo "Data refresh process complete!"
echo "The application will now use live data from Supabase for:"
echo "- Dental procedures"
echo "- Aesthetic procedures"
echo "- Dental companies"
echo "- Aesthetic companies"
echo "- Market growth data"
echo "- Demographics data"
echo "- Metropolitan markets"
echo "- News articles"
echo ""
echo "No mock data will be used."
