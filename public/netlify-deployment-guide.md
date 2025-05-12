# Market Insights - Netlify Deployment Guide

This guide explains how to deploy the Market Insights application to Netlify with proper Supabase integration.

## Prerequisites

- A Netlify account
- A Supabase account with a project set up
- The Market Insights codebase

## Deployment Steps

### 1. Preparing for Deployment

The project is already configured for Netlify deployment with the following:

- `netlify.toml` with build settings and environment variables
- Netlify Functions for API status checking and diagnostics
- Diagnostics components for troubleshooting

### 2. Environment Variables

All necessary environment variables are pre-configured in the `netlify.toml` file:

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous API key
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_BRAVE_SEARCH_API_KEY`: API key for Brave Search
- `VITE_GEMINI_API_KEY`: API key for Gemini services

### 3. Deploying to Netlify

There are two ways to deploy:

#### Option A: Deploy with Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login to Netlify: `netlify login`
3. Initialize Netlify site: `netlify init`
4. Deploy: `netlify deploy --prod`

#### Option B: Deploy via Netlify Dashboard

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to your repository
4. Use the following build settings:
   - Build command: `npm run setup-netlify && npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### 4. Troubleshooting Deployment Issues

If you encounter issues with your deployment, the Market Insights application includes several diagnostics tools:

1. **Diagnostics Panel**: Available at the bottom of the dashboard. It shows:
   - Supabase connection status
   - Environment variables status
   - API connectivity

2. **Netlify Function API**: Access `/.netlify/functions/api-status` for:
   - Connection health checks
   - Environment variable verification
   - Detailed diagnostics

### 5. Common Issues and Solutions

#### Supabase Connection Problems

If the diagnostics panel shows Supabase connectivity issues:

1. Verify your Supabase URL and API key in the Netlify dashboard
2. Check that your Supabase database is running
3. Ensure the required tables have been created with `npm run setup-schema`

#### Missing Environment Variables

If environment variables aren't available:

1. Check the Netlify dashboard: Site settings > Build & deploy > Environment
2. Verify variables match those in your local `.env` file
3. Redeploy after making changes

#### Netlify Function Errors

If the Netlify functions aren't working:

1. Check the Netlify function logs in your Netlify dashboard
2. Verify the `functions` directory is properly deployed
3. Test locally with `netlify dev`

### 6. Updating Your Deployment

To update your deployment:

1. Push changes to your repository
2. Netlify will automatically rebuild and deploy
3. Or manually trigger a redeploy in the Netlify dashboard

## Additional Resources

- Netlify Documentation: [https://docs.netlify.com/](https://docs.netlify.com/)
- Supabase Documentation: [https://supabase.io/docs](https://supabase.io/docs)
- Market Insights Repository: [https://github.com/BoweryJG/market_insights](https://github.com/BoweryJG/market_insights)

## Support

For additional help with Netlify deployment or Supabase integration, check the project documentation or open an issue in the repository.
