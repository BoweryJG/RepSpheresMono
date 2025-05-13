#!/bin/bash

# Deploy to Netlify Script
# This script builds and deploys the Market Insights frontend to Netlify

echo "===== Market Insights Netlify Deployment ====="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Build the project
echo "Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

echo "✅ Build successful."

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
fi

echo "✅ Deployment successful."
echo "===== Deployment Complete ====="

# Reminder about testing
echo ""
echo "Don't forget to test the following endpoints:"
echo "1. Market Insights Data: https://osbackend-zl1h.onrender.com/api/data/market_insights"
echo "2. Module Access: https://osbackend-zl1h.onrender.com/api/modules/access"
echo ""
echo "You can use the test scripts to verify the backend integration:"
echo "node test-backend-connection.js"
echo "node test-render-backend.js"
