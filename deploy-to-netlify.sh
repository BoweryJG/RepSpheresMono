#!/bin/bash

# Deploy to Netlify Script
# This script builds and deploys the Market Insights frontend to Netlify
# It includes checks to prevent dual deployments and ensure Render backend is available

echo "===== Market Insights Netlify Deployment ====="

# Check if this is a manual deployment or an automatic one
# This helps prevent dual deployments
if [ -n "$NETLIFY" ]; then
    echo "⚠️ Detected running in Netlify CI environment."
    echo "This script is intended for manual deployments only."
    echo "Exiting to prevent dual deployment."
    exit 0
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Install required packages for the Render connection check
echo "Installing required packages for Render connection check..."
npm install --no-save node-fetch@2 abort-controller

# Check Render connection before deploying
echo "Checking Render backend connection..."
node check-render-before-deploy.js

# Build the project
echo "Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

echo "✅ Build successful."

# Ask for confirmation before deploying
read -p "Do you want to proceed with deployment to Netlify? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled by user."
    exit 0
fi

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
echo "node check-render-status.js"
