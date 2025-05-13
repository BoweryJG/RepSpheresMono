#!/bin/bash

# Deploy to Netlify Script
# This script builds and deploys the Market Insights frontend to Netlify
# with the updated Render backend URL configuration

echo "===== Market Insights Netlify Deployment ====="
echo "Building and deploying frontend with Render backend integration"
echo "Backend URL: https://osbackend-zl1h.onrender.com"

# Ensure we have the latest dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Deploy to Netlify (if Netlify CLI is installed)
if command -v netlify &> /dev/null; then
  echo "Deploying to Netlify..."
  netlify deploy --prod --dir=dist
else
  echo "Netlify CLI not found. Please install it with 'npm install -g netlify-cli'"
  echo "Then deploy manually with: netlify deploy --prod --dir=dist"
fi

echo "===== Deployment Process Complete ====="
echo "Please verify the following endpoints are working correctly:"
echo "- Market Insights API: https://osbackend-zl1h.onrender.com/api/data/market_insights"
echo "- Module Access API: https://osbackend-zl1h.onrender.com/api/modules/access"
